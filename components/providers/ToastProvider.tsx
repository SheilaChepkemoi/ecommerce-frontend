"use client";

import type { CSSProperties } from "react";
import { Toaster } from "react-hot-toast";

// Shared look for every toast. The colours come from globals.css,
// so they also work in dark mode.
const baseStyle: CSSProperties = {
  minWidth: 320,
  maxWidth: 440,
  padding: "14px 18px",
  fontSize: "0.95rem",
  fontWeight: 500,
  color: "var(--luma-text)",
  background: "var(--luma-surface)",
  border: "1px solid var(--luma-border)",
  borderLeft: "6px solid var(--luma-primary)",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(60, 30, 30, 0.18)",
};

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      // Sit below the admin header instead of on top of it.
      containerStyle={{ top: 84, right: 24 }}
      toastOptions={{
        duration: 4000,
        style: baseStyle,

        success: {
          style: {
            ...baseStyle,
            background: "var(--luma-toast-success-bg)",
            borderLeftColor: "var(--luma-toast-success)",
          },
          iconTheme: {
            primary: "var(--luma-toast-success)",
            secondary: "#ffffff",
          },
        },

        error: {
          // Errors stay longer so there is time to read them.
          duration: 6000,
          style: {
            ...baseStyle,
            background: "var(--luma-toast-error-bg)",
            borderLeftColor: "var(--luma-toast-error)",
          },
          iconTheme: {
            primary: "var(--luma-toast-error)",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
