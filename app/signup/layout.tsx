import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { isSupportedLocale, translate } from "@/src/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("oneauth-locale")?.value;
  const locale = isSupportedLocale(localeCookie) ? localeCookie : "en";

  return {
    title: translate(locale, "Create account | OneAuth"),
    description: translate(
      locale,
      "Create a OneAuth account to access your interconnected workspace.",
    ),
  };
}

export default function SignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
