"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Box, Button, Checkbox, Chip, CircularProgress, Divider, FormControlLabel, Paper, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

type Permission = { scope: string; label: string; optional: boolean };
type AuthorizePayload = {
  client: { name: string; clientId: string };
  account: { email: string };
  permissions: Permission[];
  request: { clientId: string; redirectUri: string; state: string; challenge: string; nonce: string; resource: string; scopes: string; csrf: string };
};

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const query = useMemo(() => searchParams.toString(), [searchParams]);
  const [data, setData] = useState<AuthorizePayload | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/oauth/authorize?${query}`, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async response => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Unable to load the authorization request.");
        return payload as AuthorizePayload;
      })
      .then(payload => { setData(payload); setSelected(payload.permissions.filter(permission => permission.optional).map(permission => permission.scope)); })
      .catch(reason => { if (reason.name !== "AbortError") setError(reason.message || "Unable to load the authorization request."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query]);

  async function decide(decision: "approve" | "deny") {
    if (!data || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const form = new URLSearchParams({ ...data.request, decision });
      for (const scope of selected) form.append("field_scope", scope);
      const response = await fetch("/api/oauth/authorize", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: form.toString(),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "OneAuth could not process your decision.");
      if (typeof payload.redirect !== "string") throw new Error("OneAuth returned an invalid authorization response.");
      window.location.assign(payload.redirect);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "OneAuth could not process your decision.");
      setSubmitting(false);
    }
  }

  return <Box component="main" className="oauth-shell">
    <Box className="oauth-brand"><Box className="oauth-mark">O</Box><Box><Typography component="span" sx={{ fontWeight: 800 }}>OneAuth</Typography><Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: 12 }}>Secure authorization</Typography></Box></Box>
    <Paper component="section" className="oauth-card" elevation={0} aria-labelledby="oauth-title">
      {loading ? <Stack className="oauth-loading" sx={{ alignItems: "center" }} spacing={2}><CircularProgress size={30}/><Typography color="text.secondary" variant="body2">Verifying authorization request…</Typography></Stack> : error && !data ? <Stack className="oauth-content" spacing={2}>
        <Chip icon={<SecurityRoundedIcon/>} label="Permission request" color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }}/>
        <Typography id="oauth-title" variant="h4" component="h1">Unable to authorize</Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button component={Link} href="/" variant="outlined" startIcon={<ArrowBackRoundedIcon/>}>Return to OneAuth</Button>
      </Stack> : data ? <Stack className="oauth-content" spacing={2.5}>
        <Stack spacing={1}>
          <Chip icon={<SecurityRoundedIcon/>} label="Permission request" color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }}/>
          <Typography id="oauth-title" variant="h4" component="h1">Authorize this application</Typography>
          <Typography color="text.secondary" variant="body2">Review what this application can access before continuing. You stay in control of your account.</Typography>
        </Stack>
        <Paper className="oauth-app" variant="outlined">
          <Box className="oauth-app-icon">{data.client.name.slice(0, 1).toUpperCase()}</Box>
          <Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 750 }}>{data.client.name}</Typography><Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>Client ID · {data.client.clientId}</Typography></Box>
        </Paper>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.2 }}>Requested permissions</Typography>
          <Stack className="oauth-permissions" spacing={1}>
            {data.permissions.map(permission => <Paper key={permission.scope} variant="outlined" className="oauth-permission-row">
              {permission.optional ? <FormControlLabel control={<Checkbox size="small" checked={selected.includes(permission.scope)} onChange={event => setSelected(current => event.target.checked ? [...current, permission.scope] : current.filter(scope => scope !== permission.scope))}/>} label={permission.label}/> : <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}><CheckRoundedIcon color="success" fontSize="small"/><Typography variant="body2">{permission.label}</Typography></Stack>}
            </Paper>)}
          </Stack>
          {data.permissions.some(permission => permission.optional) ? <Typography className="oauth-field-note" variant="caption">Uncheck any custom-data fields you do not want to share. Only selected fields will be granted.</Typography> : null}
        </Box>
        <Box className="oauth-account"><Typography variant="caption" color="text.secondary">Signed in as</Typography><Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{data.account.email}</Typography></Box>
        {error ? <Typography role="alert" className="oauth-error" variant="body2">{error}</Typography> : null}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
          <Button fullWidth variant="contained" onClick={() => decide("approve")} disabled={submitting}>{submitting ? "Processing…" : "Allow access"}</Button>
          <Button fullWidth variant="outlined" color="inherit" onClick={() => decide("deny")} disabled={submitting}>Deny</Button>
        </Stack>
      </Stack> : null}
      <Divider/>
      <Typography className="oauth-footer" variant="caption">Only grant access to applications you trust. You can revoke access in OneAuth settings.</Typography>
    </Paper>
  </Box>;
}

export default function AuthorizePage() {
  return <Suspense fallback={<Box className="oauth-shell"><CircularProgress/></Box>}><AuthorizeContent/></Suspense>;
}
