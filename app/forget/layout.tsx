import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reset password | OneAuth",
  description: "Reset your OneAuth account password.",
};

export default function ForgetLayout({ children }: { children: ReactNode }) {
  return children;
}
