
"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Loading...",
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "luma-btn-primary",
    secondary: "luma-btn-secondary",
    danger: "btn btn-danger",
    outline: "btn btn-outline-secondary",
  };

  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  const buttonClasses = [
    variant === "primary" || variant === "secondary"
      ? "luma-btn"
      : "",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-100" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="me-2">{leftIcon}</span>
          )}

          {children}

          {rightIcon && (
            <span className="ms-2">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
}
