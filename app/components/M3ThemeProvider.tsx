"use client";

import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const oneAuthTheme = createTheme({
  cssVariables: true,
  shape: { borderRadius: 16 },
  palette: {
    mode: "light",
    primary: { main: "#5b43a8", light: "#e9e1ff", dark: "#402486", contrastText: "#ffffff" },
    secondary: { main: "#006b62", light: "#d5f2e9", dark: "#004f49", contrastText: "#ffffff" },
    success: { main: "#286a4d" },
    warning: { main: "#8b5100" },
    error: { main: "#b3261e" },
    background: { default: "#f7f5f1", paper: "#fffefa" },
    text: { primary: "#211f24", secondary: "#706b73" },
    divider: "#ded8df",
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 780, letterSpacing: "-0.055em" },
    h2: { fontWeight: 760, letterSpacing: "-0.04em" },
    h3: { fontWeight: 740, letterSpacing: "-0.03em" },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: "0.005em" },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: "#f7f5f1" } } },
    MuiButton: { styleOverrides: { root: { minHeight: 42, borderRadius: 999, paddingInline: 20, boxShadow: "none" }, contained: { boxShadow: "none" } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 24, borderColor: "#e4dee5", boxShadow: "0 1px 2px rgb(38 30 46 / 5%), 0 8px 26px rgb(38 30 46 / 4%)" } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 24 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 650 } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 750, color: "#615967", backgroundColor: "#f1eee8" } } },
  },
});

export function M3ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={oneAuthTheme}><CssBaseline />{children}</ThemeProvider>;
}
