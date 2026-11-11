"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box, Chip, Divider, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Stack, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import BookRoundedIcon from "@mui/icons-material/BookRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import { PortalHeader } from "./PortalHeader";

const DRAWER_WIDTH = 288;

const userNavigation = [
  { label: "Overview", href: "/dashboard", icon: DashboardRoundedIcon },
  { label: "Profile", href: "/profile", icon: PersonRoundedIcon },
  { label: "Security & 2FA", href: "/security", icon: SecurityRoundedIcon },
  { label: "Passkeys", href: "/passkeys", icon: KeyRoundedIcon },
  { label: "Active Sessions", href: "/security#sessions", match: "/security", icon: DevicesRoundedIcon },
  { label: "Connected Apps", href: "/apps", icon: AppsRoundedIcon },
  { label: "Security Activity", href: "/activity", icon: TimelineRoundedIcon },
  { label: "Notifications", href: "/notifications", icon: NotificationsNoneRoundedIcon },
];

const developerNavigation = [
  { label: "Overview", href: "/developer", icon: DashboardRoundedIcon },
  { label: "Applications", href: "/developer/applications", icon: AppsRoundedIcon },
  { label: "OAuth Clients", href: "/developer/oauth-clients", icon: KeyRoundedIcon },
  { label: "API Keys", href: "/developer/api-keys", icon: ApiRoundedIcon },
  { label: "Documentation", href: "/developer/docs", icon: BookRoundedIcon },
  { label: "Audit Logs", href: "/developer/logs", icon: TimelineRoundedIcon },
  { label: "Organizations & Team", href: "/developer/organizations", icon: GroupsRoundedIcon },
];

const adminNavigation = [
  { label: "Admin Overview", href: "/admin", icon: DashboardRoundedIcon },
  { label: "User Management", href: "/admin/users", icon: ManageAccountsRoundedIcon },
  { label: "Roles & Permissions", href: "/admin/roles", icon: SecurityRoundedIcon },
  { label: "OAuth Clients", href: "/admin/clients", icon: KeyRoundedIcon },
  { label: "Active Sessions", href: "/admin/sessions", icon: DevicesRoundedIcon },
  { label: "Security Events", href: "/admin/events", icon: EventNoteRoundedIcon },
  { label: "Notifications", href: "/admin/notifications", icon: NotificationsNoneRoundedIcon },
  { label: "MCP URLs", href: "/admin/mcp-urls", icon: ApiRoundedIcon },
];

export type PortalUser = {
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  role?: "ADMIN" | "USER";
};

type AuthenticatedShellProps = {
  activePath: string;
  activeLabel: string;
  children: ReactNode;
  user?: PortalUser | null;
};

function NavigationSection({ title, items, pathname, onNavigate }: {
  title: string;
  items: typeof userNavigation;
  pathname: string;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box className="oa-nav-section">
      <Typography className="oa-nav-section-title">{t(title)}</Typography>
      <List disablePadding>
        {items.map((item) => {
          const selected = pathname === (item.match || item.href) || (item.href !== "/developer" && item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={onNavigate}
              className="oa-nav-item"
              aria-current={selected ? "page" : undefined}
            >
              <ListItemIcon><Icon /></ListItemIcon>
              <ListItemText primary={t(item.label)} />
              {selected ? <Box className="oa-nav-active-dot" /> : null}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export function AuthenticatedShell({ activePath, activeLabel, children, user = null }: AuthenticatedShellProps) {
  const { t } = useTranslation();
  const pathname = usePathname() || activePath;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdminArea = pathname.startsWith("/admin");
  const isDeveloperArea = pathname.startsWith("/developer");

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const drawerContent = useMemo(() => (
    <Box className="oa-drawer-content">
      <Box className="oa-workspace-switcher">
        <Box className="oa-workspace-icon"><span>O</span></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography className="oa-workspace-name">{isAdminArea ? t("Platform administration") : isDeveloperArea ? t("Developer workspace") : t("Personal workspace")}</Typography>
          <Typography className="oa-workspace-caption">{t("ONEAUTH CLOUD")}</Typography>
        </Box>
        <Chip size="small" label={isAdminArea ? "ADMIN" : isDeveloperArea ? "DEV" : "FREE"} className="oa-workspace-chip" />
      </Box>
      <Divider className="oa-drawer-divider" />
      {isAdminArea ? (
        <NavigationSection title="PLATFORM" items={adminNavigation} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      ) : (
        <>
          <NavigationSection title="YOUR IDENTITY" items={userNavigation} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <NavigationSection title="BUILD & INTEGRATE" items={developerNavigation} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </>
      )}
      <Box className="oa-drawer-spacer" />
      <Box className="oa-security-status">
        <Box className="oa-security-status-icon"><SecurityRoundedIcon /></Box>
        <Box>
          <Typography className="oa-security-status-title">{t("Protected by OneAuth")}</Typography>
          <Typography className="oa-security-status-caption">{t("Your identity, under control")}</Typography>
        </Box>
        <Box className="oa-status-indicator" />
      </Box>
      <Box className="oa-drawer-footer">
        <Typography>ONEAUTH · 2026</Typography>
        <Typography>{t("Identity infrastructure")}</Typography>
      </Box>
    </Box>
  ), [isAdminArea, isDeveloperArea, pathname, t]);

  return (
    <Box className="oa-app-shell">
      <PortalHeader initialUser={user} onMenuClick={() => setMobileOpen(true)} />
      <Box component="nav" aria-label={t("Main navigation")}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={!isMobile || mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          className="oa-drawer"
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box component="main" className="oa-main" sx={{ ml: { lg: `${DRAWER_WIDTH}px` } }}>
        <Box className="oa-page-container">
          <Stack className="oa-breadcrumb" direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography component={Link} href="/dashboard" className="oa-breadcrumb-root">OneAuth</Typography>
            <Typography className="oa-breadcrumb-separator">/</Typography>
            <Typography className="oa-breadcrumb-current">{t(activeLabel)}</Typography>
          </Stack>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
