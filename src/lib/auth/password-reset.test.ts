import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from "./password-reset.ts";
import { createAccount, createSessionForUser, getUserFromSession } from "./account-store.ts";

test("password reset token creation and verification without requiring redis", async (t) => {
  if (!process.env["DATABASE_URL"]) {
    t.skip("Database environment not configured for integration test");
    return;
  }

  const email = `pwd-test-${Date.now()}@example.com`;
  const account = await createAccount(
    {
      email,
      password: "Password123!",
    },
    { requireVerification: false },
  );

  assert.ok(account.id, "Account created successfully");

  // Create session
  const session = await createSessionForUser(account.id);
  let activeUser = await getUserFromSession(session.id);
  assert.ok(activeUser, "Session should initially be active");

  // Request password reset token
  const resetResult = await createPasswordResetToken(email);
  assert.ok(resetResult, "Reset token should be generated");
  assert.equal(resetResult.email, email);

  // Verify token
  const verifiedAccount = await verifyPasswordResetToken(resetResult.token);
  assert.ok(verifiedAccount, "Token should verify successfully");
  assert.equal(verifiedAccount.id, account.id);

  // Reset password
  const res = await resetPasswordWithToken(resetResult.token, "NewPassword456!");
  assert.equal(res.success, true);

  // Attempt to reuse consumed token
  const reusedToken = await verifyPasswordResetToken(resetResult.token);
  assert.equal(reusedToken, null, "Consumed token must not verify");

  // Session should be revoked immediately in real time
  activeUser = await getUserFromSession(session.id);
  assert.equal(activeUser, null, "Session must be revoked after password reset");
});
