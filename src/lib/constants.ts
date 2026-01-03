// Zentrale Konstanten für die gesamte App
// ============================================
// Diese Datei enthält alle systemweiten Konstanten und Konfigurationen.
// Status-Definitionen werden auch in der Datenbank-Tabelle 'system_status_config' persistiert.

// Provider-IDs
export const PROVIDER_IDS = {
  TEUNI: 'd8110105-8ac9-45e3-ad32-aaf42393744c',
} as const;

// ============================================
// ORDER STATUS KONFIGURATION
// ============================================
// Zentrale Status-Definitionen für Wäschebestellungen (linen_orders)
// Diese Konfiguration ist die Single Source of Truth für das gesamte System.
// 
// Status-Workflow:
// 1. offen     → Bestellung wurde erstellt, muss vom Benutzer bestätigt werden
// 2. ausstehend → Bestellung wurde bestätigt, wartet auf Lieferung (DEFAULT)
// 3. delivered  → Bestellung wurde geliefert
// 4. cancelled  → Bestellung wurde storniert
//
// Persistenz: Diese Werte sind auch in der Datenbank-Tabelle 'system_status_config' gespeichert.

export interface OrderStatusConfig {
  value: string;
  label: string;
  emoji: string;
  color: {
    bg: string;
    text: string;
    border: string;
    hex: string;
  };
  description: string;
  sortOrder: number;
  isDefault: boolean;
}

export const ORDER_STATUS_CONFIG: Record<string, OrderStatusConfig> = {
  OFFEN: {
    value: 'offen',
    label: 'Offen',
    emoji: '🟠',
    color: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      hex: '#f59e0b'
    },
    description: 'Muss vom Benutzer bestätigt werden',
    sortOrder: 1,
    isDefault: false
  },
  AUSSTEHEND: {
    value: 'ausstehend',
    label: 'Ausstehend',
    emoji: '🟡',
    color: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      hex: '#eab308'
    },
    description: 'Bestätigt, wartet auf Lieferung',
    sortOrder: 2,
    isDefault: true
  },
  DELIVERED: {
    value: 'delivered',
    label: 'Geliefert',
    emoji: '🟢',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      hex: '#22c55e'
    },
    description: 'Wurde geliefert',
    sortOrder: 3,
    isDefault: false
  },
  CANCELLED: {
    value: 'cancelled',
    label: 'Storniert',
    emoji: '🔴',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      hex: '#ef4444'
    },
    description: 'Storniert',
    sortOrder: 4,
    isDefault: false
  }
} as const;

// Legacy-Kompatibilität: Einfache Status-Werte
export const ORDER_STATUS = {
  OFFEN: ORDER_STATUS_CONFIG.OFFEN.value,
  AUSSTEHEND: ORDER_STATUS_CONFIG.AUSSTEHEND.value,
  DELIVERED: ORDER_STATUS_CONFIG.DELIVERED.value,
  CANCELLED: ORDER_STATUS_CONFIG.CANCELLED.value,
} as const;

// Default-Status für neue Bestellungen
export const DEFAULT_ORDER_STATUS = ORDER_STATUS.AUSSTEHEND;

// ============================================
// HELPER-FUNKTIONEN FÜR STATUS-ZUGRIFF
// ============================================

/**
 * Findet die Status-Konfiguration anhand des Status-Wertes
 * Unterstützt auch Legacy-Werte (pending, geliefert)
 */
export const getOrderStatusConfig = (status?: string): OrderStatusConfig => {
  if (!status) return ORDER_STATUS_CONFIG.AUSSTEHEND;
  
  const normalized = status.toLowerCase();
  
  // Legacy-Mapping für Rückwärtskompatibilität
  const legacyMap: Record<string, string> = {
    'pending': 'ausstehend',
    'geliefert': 'delivered',
  };
  
  const mappedStatus = legacyMap[normalized] || normalized;
  
  const config = Object.values(ORDER_STATUS_CONFIG).find(
    c => c.value === mappedStatus
  );
  
  return config || ORDER_STATUS_CONFIG.AUSSTEHEND;
};

/**
 * Gibt die Tailwind-Klassen für die Status-Farben zurück
 */
export const getOrderStatusColorClasses = (status?: string): string => {
  const config = getOrderStatusConfig(status);
  return `${config.color.bg} ${config.color.text} ${config.color.border}`;
};

/**
 * Gibt das Label mit Emoji zurück
 */
export const getOrderStatusLabel = (status?: string): string => {
  const config = getOrderStatusConfig(status);
  return `${config.emoji} ${config.label}`;
};

/**
 * Gibt alle Status-Optionen für Select-Komponenten zurück
 */
export const getOrderStatusOptions = () => {
  return Object.values(ORDER_STATUS_CONFIG)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(config => ({
      value: config.value,
      label: `${config.emoji} ${config.label}`,
      description: config.description
    }));
};

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
