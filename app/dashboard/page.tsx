import Link from "next/link";
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { getDashboardData, getPortalHeaderUser } from "@/app/actions";
import { AuthenticatedShell } from "../components/AuthenticatedShell";

function OverviewMetric({ label, value, detail, icon: Icon, href }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof ShieldRoundedIcon;
  href: string;
}) {
  return (
    <Card component={Link} href={href} variant="outlined" className="oa-overview-metric">
      <CardContent>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography className="oa-overview-metric-label">{label}</Typography>
          <Box className="oa-overview-metric-icon"><Icon /></Box>
        </Stack>
        <Typography className="oa-overview-metric-value">{value}</Typography>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography className="oa-overview-metric-detail">{detail}</Typography>
          <ArrowOutwardRoundedIcon className="oa-overview-metric-arrow" />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const [data, portalUser] = await Promise.all([getDashboardData(), getPortalHeaderUser()]);
  const rawUser = data.user;
  const displayName = String(rawUser.displayName || rawUser.username || "there");
  const email = String(rawUser.email ?? "");
  const status = String(rawUser.status ?? "Unknown").split(/[ _-]+/).map((part) => part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part).join(" ");
  const metrics = {
    activeSessions: Number(data.metrics.activeSessions ?? 0),
    passkeys: Number(data.metrics.passkeys ?? 0),
    connectedApps: Number(data.metrics.connectedApps ?? 0),
    recentSecurityEvents: Number(data.metrics.recentSecurityEvents ?? 0),
  };

  return (
    <AuthenticatedShell activeLabel="Overview" activePath="/dashboard" user={portalUser}>
      <Box className="oa-dashboard">
        <Stack className="oa-dashboard-heading" direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { xs: "flex-start", md: "flex-end" }, justifyContent: "space-between" }}>
          <Box>
            <Typography className="oa-dashboard-kicker">YOUR IDENTITY, ONE PLACE</Typography>
            <Typography component="h1" className="oa-dashboard-title">Good to see you, {displayName.split(" ")[0]}.</Typography>
            <Typography className="oa-dashboard-subtitle">A clear view of your account, access and security.</Typography>
          </Box>
          <Button component={Link} href="/security" variant="contained" endIcon={<ArrowOutwardRoundedIcon />} className="oa-primary-action">Review security</Button>
        </Stack>

        <Card className="oa-identity-hero" variant="outlined">
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.2} sx={{ alignItems: { xs: "flex-start", sm: "center" } }}>
              <Avatar src={portalUser?.avatarUrl || undefined} className="oa-identity-avatar"><PersonRoundedIcon /></Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography className="oa-identity-label">SIGNED IN AS</Typography>
                <Typography className="oa-identity-name">{displayName}</Typography>
                <Typography className="oa-identity-email">{email}</Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} className="oa-identity-status">
                <Box className="oa-status-indicator" />
                <Box>
                  <Typography className="oa-identity-status-label">ACCOUNT STATUS</Typography>
                  <Typography className="oa-identity-status-value">{status}</Typography>
                </Box>
              </Stack>
              <Button component={Link} href="/profile" variant="outlined" className="oa-secondary-action" endIcon={<ArrowOutwardRoundedIcon />}>Edit profile</Button>
            </Stack>
          </CardContent>
        </Card>

        <Box className="oa-overview-grid">
          <OverviewMetric label="Passkeys" value={String(metrics.passkeys)} detail="Passwordless credentials" icon={KeyRoundedIcon} href="/passkeys" />
          <OverviewMetric label="Active sessions" value={String(metrics.activeSessions)} detail="Devices signed in" icon={DevicesRoundedIcon} href="/security#sessions" />
          <OverviewMetric label="Connected apps" value={String(metrics.connectedApps)} detail="Authorized integrations" icon={AppsRoundedIcon} href="/apps" />
          <OverviewMetric label="Security events" value={String(metrics.recentSecurityEvents)} detail="Events in the last 30 days" icon={TimelineRoundedIcon} href="/activity" />
        </Box>

        <Box className="oa-dashboard-lower-grid">
          <Card className="oa-dashboard-card" variant="outlined">
            <CardContent>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }} spacing={2}>
                <Box>
                  <Typography className="oa-card-kicker">ACCESS MANAGEMENT</Typography>
                  <Typography className="oa-card-title">Connected applications</Typography>
                </Box>
                <Box className="oa-card-icon"><AppsRoundedIcon /></Box>
              </Stack>
              <Divider className="oa-card-divider" />
              {metrics.connectedApps > 0 ? (
                <Box className="oa-card-empty-copy">
                  <Typography className="oa-card-body">You have {metrics.connectedApps} active application authorization{metrics.connectedApps === 1 ? "" : "s"}.</Typography>
                  <Button component={Link} href="/apps" variant="text" endIcon={<ArrowOutwardRoundedIcon />}>Manage app access</Button>
                </Box>
              ) : (
                <Box className="oa-empty-panel">
                  <Box className="oa-empty-icon"><AppsRoundedIcon /></Box>
                  <Typography className="oa-empty-title">No apps connected yet</Typography>
                  <Typography className="oa-empty-description">When you authorize an application, you’ll see and manage its access here.</Typography>
                  <Button component={Link} href="/apps" variant="outlined" startIcon={<AddRoundedIcon />} className="oa-secondary-action">Explore connected apps</Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="oa-security-card" variant="outlined">
            <CardContent>
              <Box className="oa-security-card-art"><ShieldRoundedIcon /></Box>
              <Typography className="oa-card-kicker">ACCOUNT PROTECTION</Typography>
              <Typography className="oa-security-card-title">Your security, your control.</Typography>
              <Typography className="oa-security-card-copy">Review sign-in methods, check active devices and keep your identity protected.</Typography>
              <Stack spacing={1.1} className="oa-security-links">
                <Button component={Link} href="/security" startIcon={<LockRoundedIcon />} endIcon={<ArrowOutwardRoundedIcon />}>Security settings</Button>
                <Button component={Link} href="/activity" startIcon={<TimelineRoundedIcon />} endIcon={<ArrowOutwardRoundedIcon />}>View security activity</Button>
              </Stack>
              <Chip label="SECURE IDENTITY" size="small" className="oa-security-chip" />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </AuthenticatedShell>
  );
}
