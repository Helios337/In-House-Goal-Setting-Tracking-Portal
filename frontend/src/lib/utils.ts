import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats dates for UI display (e.g., "Oct 15, 2026")
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Converts generic string to Input Date format (YYYY-MM-DD)
export function toInputDate(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}
