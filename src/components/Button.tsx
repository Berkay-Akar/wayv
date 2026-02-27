"use client";

import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-600/60 border-transparent",
  secondary:
    "border border-gray-600 bg-gray-800/60 text-gray-200 hover:border-gray-500 hover:bg-gray-700/60",
  ghost: "text-gray-300 hover:bg-gray-800/60",
};

export function Button({
  variant = "primary",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  children,
  className = "",
}: {
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading && <Spinner className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}
