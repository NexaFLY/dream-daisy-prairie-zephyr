import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddr(value: string, left = 4, right = 4) {
  if (value.length <= left + right + 1) return value;
  return `${value.slice(0, left)}…${value.slice(-right)}`;
}

export function formatUsd(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}

export function formatPrice(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 0.95 && n <= 1.05) return `$${n.toFixed(4)}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(5)}`;
}

export function formatPct(n: number) {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function formatAmt(n: number, digits = 4) {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  if (n > 0 && n < 1 / 10 ** digits) return `<${1 / 10 ** digits}`;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function formatWhen(value: string, lang: "fr" | "en") {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "A";
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export const fieldClass =
  "mt-2 h-11 w-full rounded-md bg-bg px-3 text-sm text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]";

export const areaClass =
  "mt-2 w-full rounded-md bg-bg px-3 py-3 text-sm text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.1)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_rgba(255,128,0,0.55)]";
