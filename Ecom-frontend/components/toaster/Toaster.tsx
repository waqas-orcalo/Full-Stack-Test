"use client";

import { Toaster as HotToaster } from "react-hot-toast";

/**
 * App-wide toast host (react-hot-toast), matching the COSMONYX-FE-001 setup.
 */
export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { fontSize: "14px", borderRadius: "10px" },
      }}
    />
  );
}
