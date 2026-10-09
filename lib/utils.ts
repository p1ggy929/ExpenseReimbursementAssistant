import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function nowIso() {
  return new Date().toISOString();
}

export function nextReimbursementId(existingIds: string[]) {
  const max = existingIds.reduce((acc, id) => {
    const match = id.match(/^R-(\d+)$/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `R-${String(max + 1).padStart(4, "0")}`;
}
