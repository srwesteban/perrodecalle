import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#ff5722", contrastText: "#fff" },   // NARANJA VIBRANTE
    secondary: { main: "#3B82F6" },                       // azul confianza
    success: { main: "#22C55E" },                         // éxito
    background: { default: "#F9FAFB", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#4B5563" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      "-apple-system","BlinkMacSystemFont","Segoe UI","Roboto","Helvetica Neue",
      "Arial","Noto Sans","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",
    ].join(","),
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: {
          paddingInline: 20,
          paddingBlock: 12,
          boxShadow: "0 6px 14px rgba(255,87,34,.18)",
          "&:hover": { boxShadow: "0 8px 18px rgba(255,87,34,.28)" },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Scrollbars globales
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255,255,255,0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(180deg, #4ade80, #16a34a)",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#22c55e",
          },
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#22c55e rgba(255,255,255,0.05)", // Firefox
        },
      },
    },
  },
});
