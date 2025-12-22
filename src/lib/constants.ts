// Zentrale Konstanten für die gesamte App

// Provider-IDs
export const PROVIDER_IDS = {
  TEUNI: 'd8110105-8ac9-45e3-ad32-aaf42393744c',
} as const;

// Status-Werte für Bestellungen
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  ASSIGNED: 'assigned',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
} as const;

// Status-Werte für Buchungen
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
} as const;

// Wochentage (deutsch)
export const WEEKDAY_LABELS = {
  monday: 'Mo',
  tuesday: 'Di',
  wednesday: 'Mi',
  thursday: 'Do',
  friday: 'Fr',
  saturday: 'Sa',
  sunday: 'So',
} as const;

// Haus-Farben für visuelle Unterscheidung
export const HOUSE_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white', hex: '#3b82f6' },
  { bg: 'bg-purple-500', text: 'text-white', hex: '#a855f7' },
  { bg: 'bg-pink-500', text: 'text-white', hex: '#ec4899' },
  { bg: 'bg-green-500', text: 'text-white', hex: '#22c55e' },
  { bg: 'bg-orange-500', text: 'text-white', hex: '#f97316' },
  { bg: 'bg-teal-500', text: 'text-white', hex: '#14b8a6' },
  { bg: 'bg-indigo-500', text: 'text-white', hex: '#6366f1' },
  { bg: 'bg-rose-500', text: 'text-white', hex: '#f43f5e' },
  { bg: 'bg-cyan-500', text: 'text-white', hex: '#06b6d4' },
  { bg: 'bg-amber-500', text: 'text-white', hex: '#f59e0b' },
  { bg: 'bg-emerald-500', text: 'text-white', hex: '#10b981' },
  { bg: 'bg-violet-500', text: 'text-white', hex: '#8b5cf6' },
] as const;

// Buchungs-Farben für visuelle Unterscheidung
export const BOOKING_COLORS = [
  "border-l-blue-500",
  "border-l-purple-500", 
  "border-l-pink-500",
  "border-l-green-500",
  "border-l-orange-500",
  "border-l-teal-500",
  "border-l-indigo-500",
  "border-l-rose-500",
  "border-l-cyan-500",
  "border-l-amber-500",
  "border-l-emerald-500",
  "border-l-violet-500",
] as const;

// Helper-Funktion für konsistente Farbzuweisung
export const getColorByHash = <T>(colors: readonly T[], id: string): T => {
  if (!id) return colors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Type-Helper
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
