"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({
  className = "btn btn-link text-body p-2 luma-theme-toggle",
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Same className before mount, so the button doesn't change size
  if (!mounted) {
    return (
      <button type="button" className={className} disabled aria-label="Change theme">
        <FiSun size={19} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
    >
      {isDark ? <FiSun size={19} /> : <FiMoon size={19} />}
    </button>
  );
}