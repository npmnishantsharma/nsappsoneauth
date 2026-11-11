"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  const { t } = useTranslation();
  return <Box className="portal-page-heading" component="header">
    <Box sx={{ minWidth: 0 }}>
      <Typography className="portal-eyebrow" component="p">{t(eyebrow)}</Typography>
      <Typography component="h1" variant="h1">{t(title)}</Typography>
      <Typography className="portal-description" component="p">{t(description)}</Typography>
    </Box>
    {actions ? <Box className="portal-heading-actions">{actions}</Box> : null}
  </Box>;
}

export function PortalIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8, width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true as const };
  const paths: Record<string, ReactNode> = {
    "shield-check": <><path d="M12 3 19 6v5c0 4.5-2.9 7.8-7 10-4.1-2.2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4"/>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/></>,
    "key-round": <><circle cx="8" cy="15" r="5"/><path d="m11.5 11.5 8-8 2 2-2 2 2 2-3 3-2-2-3.5 3.5"/></>,
    "app-window": <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>,
    "book-open": <><path d="M12 7v14m0-14C9 4.5 5.5 4 3 5v14c3-1 6.5-.5 9 2m0-14c3-2.5 6.5-3 9-2v14c-3-1-6.5-.5-9 2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.5a4 4 0 0 1 0 7.8m3 9.7v-2a4 4 0 0 0-3-3.87"/></>,
    "user-round": <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    "chevron-right": <path d="m9 18 6-6-6-6"/>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  };
  return <svg {...common}>{paths[name] ?? <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>}</svg>;
}

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: string }) {
  const { t } = useTranslation();
  return <Card className="portal-card portal-metric-card" variant="outlined"><CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
      <Typography className="portal-metric-label" component="span">{t(label)}</Typography>
      <Box className="portal-metric-icon"><PortalIcon name={icon}/></Box>
    </Stack>
    <Typography className="portal-metric-value" component="p">{value}</Typography>
    <Typography className="portal-metric-detail" component="p">{t(detail)}</Typography>
  </CardContent></Card>;
}

export function Panel({ title, action, children, id }: { title: string; action?: ReactNode; children: ReactNode; id?: string }) {
  const { t } = useTranslation();
  return <Card component="section" className="portal-card portal-panel" id={id} variant="outlined">
    <Stack className="portal-panel-heading" direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Typography component="h2" variant="h6">{t(title)}</Typography>{action}
    </Stack>
    <Divider sx={{ display: "none" }}/>{children}
  </Card>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  const { t } = useTranslation();
  return <Card className="portal-empty-state" variant="outlined"><CardContent>
    <Typography aria-hidden="true" variant="h3" color="primary.main" sx={{ mb: 1 }}>✳</Typography>
    <Typography component="h3" variant="h6">{t(title)}</Typography>
    <Typography component="p" variant="body2" color="text.secondary">{t(description)}</Typography>
  </CardContent></Card>;
}
