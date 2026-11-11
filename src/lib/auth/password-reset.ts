import { createHash, randomBytes, randomUUID } from "node:crypto";
import argon2 from "argon2";
import { db } from "../../prisma/db.ts";
import { findAccountByEmail, findAccountById, type StoredAccount } from "./account-store.ts";
import { writeSecurityEvent } from "./security-events.ts";

const RESET_TOKEN_TTL_HOURS = 1;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type PasswordResetTokenResult = {
  token: string;
  userId: string;
  email: string;
  displayName: string | null;
  expiresAt: string;
};

export async function createPasswordResetToken(email: string): Promise<PasswordResetTokenResult | null> {
  const account = await findAccountByEmail(email);
  if (!account || account.status !== "ACTIVE" || !account.verifiedAt) {
    return null;
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const expiresAtDate = new Date(now.getTime() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);
  const expiresAt = expiresAtDate.toISOString();
  const id = randomUUID();

  await db.runtime().query(
    db.raw.sql`INSERT INTO public.password_resets (id, token_hash, user_id, created_at, expires_at, consumed_at)
      VALUES (${id}::uuid, ${tokenHash}, ${account.id}::uuid, ${now.toISOString()}::timestamptz, ${expiresAt}::timestamptz, NULL)
      RETURNING id`
      .returnsRow({ id: "pg/uuid@1" })
      .build(),
  );

  await writeSecurityEvent({
    userId: account.id,
    eventType: "ACCOUNT_RECOVERY_STARTED",
    metadata: { method: "PASSWORD_RESET_REQUEST" },
  });

  return {
    token: rawToken,
    userId: account.id,
    email: account.email,
    displayName: account.displayName,
    expiresAt,
  };
}

export async function verifyPasswordResetToken(token: string): Promise<StoredAccount | null> {
  if (!token || token.length < 16) return null;
  const tokenHash = hashToken(token);

  const rows = await db.runtime().query(
    db.raw.sql`SELECT user_id AS "userId", expires_at AS "expiresAt", consumed_at AS "consumedAt"
      FROM public.password_resets
      WHERE token_hash = ${tokenHash}
      LIMIT 1`
      .returnsRow({
        userId: "pg/uuid@1",
        expiresAt: "pg/timestamptz-string@1",
        consumedAt: "pg/timestamptz-string@1",
      })
      .build(),
  );

  const reset = rows[0];
  if (!reset || reset.consumedAt) return null;
  if (new Date(reset.expiresAt).getTime() <= Date.now()) return null;

  const account = await findAccountById(reset.userId);
  if (!account || account.status !== "ACTIVE" || !account.verifiedAt) return null;

  return account;
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
  headers?: Headers,
): Promise<{ success: boolean; userId: string }> {
  if (!token || token.length < 16) throw new Error("INVALID_TOKEN");
  if (!newPassword || newPassword.length < 8) throw new Error("PASSWORD_TOO_SHORT");

  const tokenHash = hashToken(token);
  const rows = await db.runtime().query(
    db.raw.sql`SELECT id, user_id AS "userId", expires_at AS "expiresAt", consumed_at AS "consumedAt"
      FROM public.password_resets
      WHERE token_hash = ${tokenHash}
      LIMIT 1`
      .returnsRow({
        id: "pg/uuid@1",
        userId: "pg/uuid@1",
        expiresAt: "pg/timestamptz-string@1",
        consumedAt: "pg/timestamptz-string@1",
      })
      .build(),
  );

  const reset = rows[0];
  if (!reset || reset.consumedAt) throw new Error("INVALID_TOKEN");
  if (new Date(reset.expiresAt).getTime() <= Date.now()) throw new Error("TOKEN_EXPIRED");

  const account = await findAccountById(reset.userId);
  if (!account || account.status !== "ACTIVE" || !account.verifiedAt) throw new Error("ACCOUNT_UNAVAILABLE");

  const now = new Date().toISOString();
  const newHash = await argon2.hash(newPassword);

  // Consume the password reset token
  await db.runtime().query(
    db.raw.sql`UPDATE public.password_resets
      SET consumed_at = ${now}::timestamptz
      WHERE id = ${reset.id}::uuid AND consumed_at IS NULL
      RETURNING id`
      .returnsRow({ id: "pg/uuid@1" })
      .build(),
  );

  // Update password credential
  await db.runtime().query(
    db.raw.sql`UPDATE public.password_credentials
      SET password_hash = ${newHash}, changed_at = ${now}::timestamptz
      WHERE user_id = ${account.id}::uuid
      RETURNING id`
      .returnsRow({ id: "pg/uuid@1" })
      .build(),
  );

  // Revoke ALL active sessions, access tokens, refresh tokens immediately (Real-Time Invalidation)
  await db.runtime().query(
    db.raw.sql`UPDATE public.sessions
      SET revoked_at = ${now}::timestamptz
      WHERE user_id = ${account.id}::uuid AND revoked_at IS NULL
      RETURNING id`
      .returnsRow({ id: "pg/uuid@1" })
      .build(),
  );

  await db.runtime().query(
    db.raw.sql`UPDATE public.access_tokens
      SET revoked_at = ${now}::timestamptz
      WHERE user_id = ${account.id}::uuid AND revoked_at IS NULL
      RETURNING id`
      .returnsRow({ id: "pg/uuid@1" })
      .build(),
  );

  await db.runtime().query(
    db.raw.sql`UPDATE public.refresh_tokens
      SET revoked_at = ${now}::timestamptz
      WHERE user_id = ${account.id}::uuid AND revoked_at IS NULL
      RETURNING id`
      .returnsRow({ id: "pg/uuid@1" })
      .build(),
  );

  await writeSecurityEvent({
    userId: account.id,
    eventType: "PASSWORD_RESET",
    headers,
    metadata: { method: "TOKEN" },
  });

  return { success: true, userId: account.id };
}
