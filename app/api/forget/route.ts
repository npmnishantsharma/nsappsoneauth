import { NextResponse } from "next/server";
import { validateEmail } from "@/src/lib/identity/identity.validation";
import { createPasswordResetToken } from "@/src/lib/auth/password-reset";
import { BrevoEmailError, sendPasswordResetEmail } from "@/src/lib/email/brevo";
import { allowOAuthRequest } from "@/src/lib/oauth/rate-limit";

export async function POST(request: Request) {
  try {
    try {
      if (!(await allowOAuthRequest(request, "forget-password-ip", 10, 60))) {
        return NextResponse.json({ error: "Too many reset requests. Please try again later." }, { status: 429 });
      }
    } catch {
      // If rate limiter fails, allow the request to proceed safely
    }

    let email = "";
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      email = String(body.email ?? "").trim();
    } else {
      const formData = await request.formData();
      email = String(formData.get("email") ?? "").trim();
    }

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    let normalizedEmail: string;
    try {
      normalizedEmail = validateEmail(email);
    } catch {
      // Return ambiguous message to avoid leaking valid vs invalid email structures
      return NextResponse.json({
        ok: true,
        message: "If an account exists for that email, a password reset link is on its way.",
      });
    }

    const resetResult = await createPasswordResetToken(normalizedEmail);
    if (resetResult) {
      try {
        const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
        const baseUrl = configuredBaseUrl || new URL(request.url).origin;
        if (baseUrl) {
          const resetUrl = new URL("/forget/reset", baseUrl);
          resetUrl.searchParams.set("token", resetResult.token);

          await sendPasswordResetEmail({
            email: resetResult.email,
            displayName: resetResult.displayName,
            resetUrl: resetUrl.toString(),
            expiresInHours: 1,
          });
        }
      } catch (emailError) {
        const reason = emailError instanceof BrevoEmailError
          ? `Brevo status ${emailError.statusCode ?? "unavailable"}`
          : emailError instanceof Error
            ? emailError.message
            : "unknown error";
        console.error("OneAuth password reset email delivery failed:", reason);
      }
    }

    // Always return generic success response to prevent account enumeration
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a password reset link is on its way.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a password reset link is on its way.",
    });
  }
}
