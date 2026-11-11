import { NextResponse } from "next/server";
import { resetPasswordWithToken, verifyPasswordResetToken } from "@/src/lib/auth/password-reset";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ valid: false, error: "Reset token is required." }, { status: 400 });
  }

  const account = await verifyPasswordResetToken(token);
  if (!account) {
    return NextResponse.json({ valid: false, error: "This password reset link is invalid or expired." }, { status: 400 });
  }

  return NextResponse.json({ valid: true, email: account.email });
}

export async function POST(request: Request) {
  try {
    let token = "";
    let newPassword = "";

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      token = String(body.token ?? "").trim();
      newPassword = String(body.password ?? body.newPassword ?? "");
    } else {
      const formData = await request.formData();
      token = String(formData.get("token") ?? "").trim();
      newPassword = String(formData.get("password") ?? formData.get("newPassword") ?? "");
    }

    if (!token) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    await resetPasswordWithToken(token, newPassword, request.headers);

    return NextResponse.json({
      ok: true,
      message: "Your password has been reset successfully. Please sign in with your new password.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset password.";

    if (message === "INVALID_TOKEN") {
      return NextResponse.json({ error: "This password reset link is invalid or already used." }, { status: 400 });
    }
    if (message === "TOKEN_EXPIRED") {
      return NextResponse.json({ error: "This password reset link has expired. Please request a new link." }, { status: 410 });
    }
    if (message === "PASSWORD_TOO_SHORT") {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    console.error("Password reset execution error:", error);
    return NextResponse.json({ error: "Unable to reset password. Please try again." }, { status: 500 });
  }
}
