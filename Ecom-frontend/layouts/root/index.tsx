"use client";

import { useMemo, type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { createTheme } from "@theme/index";
import { Persistor, Store, useSelector } from "@store/index";
import { getPreset } from "@theme/presets";
import { CartProvider } from "@root/contexts/cart-context";
import { Toaster } from "@components/toaster";

/**
 * Builds the MUI theme from the persisted theme preset and rebuilds it whenever
 * the user changes the theme in admin settings.
 */
function ThemedApp({ children }: { children: ReactNode }) {
  const presetId = useSelector((s) => s.ui.themePreset);
  const theme = useMemo(() => createTheme(getPreset(presetId)), [presetId]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>{children}</CartProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
      <ReduxProvider store={Store}>
        <PersistGate loading={null} persistor={Persistor}>
          <ThemedApp>{children}</ThemedApp>
        </PersistGate>
      </ReduxProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
