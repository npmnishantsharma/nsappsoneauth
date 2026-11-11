"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguagePicker } from "../../components/LanguagePicker";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { t } = useTranslation();

  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(token));
  const [validToken, setValidToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(token ? "" : t("Missing password reset token."));
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) return;

    async function checkToken() {
      try {
        const response = await fetch(`/api/forget/reset?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        if (response.ok && data.valid) {
          setValidToken(true);
          setEmail(data.email || "");
        } else {
          setValidToken(false);
          setErrorMsg(data.error || t("This reset link is invalid or expired."));
        }
      } catch {
        setValidToken(false);
        setErrorMsg(t("Unable to verify reset link. Please try again."));
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token, t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setErrorMsg(t("Password must be at least 8 characters long."));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t("Passwords do not match."));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/forget/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || t("Failed to reset password."));
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg(t("Network error. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`auth-screen${isDark ? " auth-screen-dark" : ""}`}>
      <section aria-labelledby="reset-heading" className="auth-card recovery-card">
        <header className="auth-header">
          <div aria-label="OneAuth" className="brand-mark">
            <svg aria-hidden="true" viewBox="0 0 32 32">
              <rect fill="currentColor" height="32" rx="8" width="32" />
              <path
                d="M16 7.5 23 11v5.2c0 4.1-2.8 7-7 8.3-4.2-1.3-7-4.2-7-8.3V11l7-3.5Z"
                fill="none"
                stroke="var(--brand-mark-stroke)"
                strokeWidth="1.8"
              />
              <path
                d="m12.8 16.2 2.1 2.1 4.5-4.8"
                fill="none"
                stroke="var(--brand-mark-stroke)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <h1 id="reset-heading">{t("Set new password")}</h1>
          <p className="intro-copy">
            {email
              ? t("Enter a new password for {{email}}", { email })
              : t("Choose a strong new password for your account.")}
          </p>
        </header>

        {verifying ? (
          <p className="recovery-message">{t("Verifying reset link...")}</p>
        ) : success ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p className="recovery-message" style={{ color: "#10b981", fontWeight: "bold" }}>
              {t("Your password has been reset successfully!")}
            </p>
            <p style={{ marginTop: "1.5rem" }}>
              <Link href="/" className="continue-button" style={{ display: "inline-block", textDecoration: "none" }}>
                <span>{t("Sign in with new password")}</span>
              </Link>
            </p>
          </div>
        ) : !validToken ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <p className="error-banner" style={{ color: "#ef4444", marginBottom: "1.5rem" }}>
              {errorMsg || t("This reset link is invalid or expired.")}
            </p>
            <Link href="/forget" style={{ textDecoration: "underline" }}>
              {t("Request a new reset link")}
            </Link>
          </div>
        ) : (
          <form className="sign-in-form" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="error-banner" style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.875rem" }}>
                {errorMsg}
              </div>
            )}
            <div className="field-group">
              <label htmlFor="password">{t("New password")}</label>
              <div className="input-wrap">
                <input
                  autoComplete="new-password"
                  id="password"
                  name="password"
                  minLength={8}
                  placeholder="••••••••"
                  required
                  type="password"
                />
              </div>
            </div>
            <div className="field-group" style={{ marginTop: "1rem" }}>
              <label htmlFor="confirmPassword">{t("Confirm new password")}</label>
              <div className="input-wrap">
                <input
                  autoComplete="new-password"
                  id="confirmPassword"
                  name="confirmPassword"
                  minLength={8}
                  placeholder="••••••••"
                  required
                  type="password"
                />
              </div>
            </div>
            <button className="continue-button" disabled={loading} type="submit" style={{ marginTop: "1.5rem" }}>
              <span>{loading ? t("Resetting...") : t("Reset password")}</span>
            </button>
          </form>
        )}

        <footer className="auth-footer">
          <p className="create-account">
            <Link href="/">{t("Back to sign in")}</Link>
          </p>
          <div className="footer-meta">
            <div className="language-choice">
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
              <LanguagePicker className="language-button" />
            </div>
            <button
              aria-label={t("Toggle color theme")}
              aria-pressed={isDark}
              className="theme-button"
              onClick={() => setIsDark((dark) => !dark)}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
