"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  AppBar, Avatar, Box, Chip, IconButton, InputBase, Stack,
  Toolbar, Tooltip, Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { getPortalHeaderUser } from "@/app/actions";
import type { PortalUser } from "./AuthenticatedShell";
import { LanguagePicker } from "./LanguagePicker";

type PortalHeaderProps = {
  initialUser?: PortalUser | null;
  onMenuClick: () => void;
};

export function PortalHeader({ initialUser = null, onMenuClick }: PortalHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (initialUser?.role) return;
    let cancelled = false;
    getPortalHeaderUser().then((currentUser) => {
      if (!cancelled && currentUser) setUser(currentUser);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [initialUser]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  const displayName = user?.displayName || user?.username || user?.email || t("Account");
  const initials = displayName.trim().slice(0, 1).toUpperCase() || "U";

  return (
    <AppBar position="fixed" elevation={0} color="inherit" className="oa-appbar">
      <Toolbar className="oa-toolbar" disableGutters>
        <IconButton className="oa-menu-button" onClick={onMenuClick} aria-label={t("Open navigation")}>
          <MenuRoundedIcon />
        </IconButton>
        <Link href="/dashboard" className="oa-wordmark" aria-label={t("OneAuth overview")}>
          <Box className="oa-wordmark-symbol"><span /></Box>
          <Box>
            <Typography component="span" className="oa-wordmark-name">OneAuth</Typography>
            <Typography component="span" className="oa-wordmark-caption">IDENTITY CLOUD</Typography>
          </Box>
        </Link>
        <Box className="oa-search">
          <SearchRoundedIcon fontSize="small" />
          <InputBase placeholder={t("Search OneAuth")} inputProps={{ "aria-label": t("Search OneAuth") }} />
          <Box component="kbd">⌘ K</Box>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} className="oa-toolbar-actions">
          <LanguagePicker className="oa-language-picker" />
          <Tooltip title={t("Notifications")}>
            <IconButton component={Link} href="/notifications" aria-label={t("Notifications")} className="oa-notification-button">
              <NotificationsNoneRoundedIcon />
            </IconButton>
          </Tooltip>
          {user?.role === "ADMIN" ? <Chip component={Link} clickable href="/admin" label={t("Admin")} size="small" className="oa-admin-chip" /> : null}
          <Box className="oa-account">
            <Avatar src={user?.avatarUrl || undefined} alt={displayName} className="oa-account-avatar">{initials}</Avatar>
            <Box className="oa-account-copy">
              <Typography component="span" className="oa-account-name">{displayName}</Typography>
              <Typography component="span" className="oa-account-email">{user?.email || t("Identity account")}</Typography>
            </Box>
          </Box>
          <Tooltip title={t("Sign out")}>
            <span>
              <IconButton onClick={handleLogout} disabled={isLoggingOut} aria-label={t("Sign out")} className="oa-logout-button">
                <LogoutRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
