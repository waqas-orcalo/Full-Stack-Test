"use client";

import type { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { createTheme } from "@theme/index";
import { Persistor, Store } from "@store/index";
import { Toaster } from "@components/toaster";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Root providers, mirroring COSMONYX-FE-001 layouts/root:
 * Emotion cache -> Redux -> PersistGate -> MUI Theme -> app, plus the toaster.
 */
export function Layout({ children }: LayoutProps) {
  const theme = createTheme();

  return (
    <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
      <ReduxProvider store={Store}>
        <PersistGate loading={null} persistor={Persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <Toaster />
          </ThemeProvider>
        </PersistGate>
      </ReduxProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
