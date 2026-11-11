"use client";

import Link from "next/link";
import { Button, Card, Typography, type ButtonProps, type CardProps, type TypographyProps } from "@mui/material";
import type { ComponentType } from "react";

/** Keep Next.js Link inside a client boundary when used as an MUI polymorphic component. */
type LinkButtonProps = Omit<ButtonProps, "component"> & { href: string };
type LinkCardProps = Omit<CardProps, "component"> & { href: string };
type LinkTypographyProps = Omit<TypographyProps, "component"> & { href: string };

const ClientButton = Button as ComponentType<Record<string, unknown>>;
const ClientCard = Card as ComponentType<Record<string, unknown>>;
const ClientTypography = Typography as ComponentType<Record<string, unknown>>;

export function PortalLinkButton({ href, ...props }: LinkButtonProps) {
  return <ClientButton {...(props as Record<string, unknown>)} component={Link} href={href} />;
}

export function PortalLinkCard({ href, ...props }: LinkCardProps) {
  return <ClientCard {...(props as Record<string, unknown>)} component={Link} href={href} />;
}

export function PortalLinkTypography({ href, ...props }: LinkTypographyProps) {
  return <ClientTypography {...(props as Record<string, unknown>)} component={Link} href={href} />;
}
