import Link from "next/link";
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export const dynamic = "force-dynamic";

export default async function OAuthTestCallbackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : "";
  const state = typeof params.state === "string" ? params.state : "";
  const issuer = typeof params.iss === "string" ? params.iss : "";
  const error = typeof params.error === "string" ? params.error : "";
  const heading = error ? "Authorization was not approved" : code ? "Authorization callback reached" : "No authorization response received";
  return <Box component="main" className="oauth-test-shell">
    <Paper component="section" className="oauth-test-card" elevation={0}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
          <Box className="oauth-test-mark">O</Box>
          <Box><Typography sx={{ fontWeight: 800 }}>OneAuth</Typography><Typography variant="caption" color="text.secondary">Developer callback inspector</Typography></Box>
        </Stack>
        <Chip icon={error ? <ErrorOutlineRoundedIcon/> : <CheckCircleRoundedIcon/>} color={error ? "error" : code ? "success" : "default"} label={error ? "Authorization denied" : code ? "Callback received" : "Waiting for response"} sx={{ alignSelf: "flex-start" }}/>
        <Box><Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: "-.05em" }}>{heading}</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>Development-only callback diagnostics. Treat all values below as sensitive.</Typography></Box>
        {error ? <Paper className="oauth-test-value" variant="outlined"><Typography variant="caption" color="text.secondary">OAuth error</Typography><Typography sx={{ fontWeight: 700 }}>{error}</Typography></Paper> : null}
        {code ? <>
          <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>Authorization code</Typography><TextField fullWidth multiline minRows={3} value={code} slotProps={{ input: { readOnly: true } }}/></Box>
          <Paper className="oauth-test-warning" variant="outlined"><Typography variant="body2" sx={{ fontWeight: 750 }}>Keep this code private</Typography><Typography variant="caption">The code is short-lived and can only be exchanged with the original PKCE verifier. Compare state with the value from the terminal before exchanging it.</Typography></Paper>
        </> : <Typography color="text.secondary" variant="body2">Start a fresh authorization request and approve it once. If an OAuth error appears, inspect the details above.</Typography>}
        <Box className="oauth-test-value"><Typography variant="caption" color="text.secondary">Returned state</Typography><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{state || "(missing)"}</Typography><Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>Issuer</Typography><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{issuer || "(missing)"}</Typography></Box>
        <Button component={Link} href="/developer/applications" variant="outlined" startIcon={<ArrowBackRoundedIcon/>} sx={{ alignSelf: "flex-start" }}>Back to Developer Portal</Button>
      </Stack>
    </Paper>
  </Box>;
}
