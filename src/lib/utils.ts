import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Liefert den Anzeigenamen für `status_changed_by` basierend auf der Email
 * des aktuell eingeloggten Users.
 */
export function getStatusChangerName(email?: string | null): string {
  const e = (email ?? "").toLowerCase().trim();
  if (!e) return "Unbekannt";
  if (e === "waescheoberpinzgau@gmail.com") return "Teuni";
  if (e === "uli.berresheim@hotmail.de") return "Admin";
  return e;
}
