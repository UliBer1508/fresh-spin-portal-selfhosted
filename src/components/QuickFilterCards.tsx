// Quick filter cards: houses + this/next week
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Home, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Booking } from "@/hooks/useBookings";

export type QuickFilter =
  | { type: "house"; value: string }
  | { type: "thisWeek" }
  | { type: "nextWeek" }
  | null;

interface QuickFilterCardsProps {
  bookings: Booking[];
  value: QuickFilter;
  onChange: (filter: QuickFilter) => void;
}

const QuickFilterCards = ({
  bookings,
  value,
  onChange,
}: QuickFilterCardsProps) => {
  const { t } = useTranslation("common");

  const houses = useMemo(() => {
    const names = new Set<string>();
    bookings.forEach((b) => b.houses?.name && names.add(b.houses.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  const isActive = (f: QuickFilter): boolean => {
    if (!value || !f) return false;
    if (value.type !== f.type) return false;
    if (value.type === "house" && f.type === "house") {
      return value.value === f.value;
    }
    return true;
  };

  const handleClick = (f: QuickFilter) => {
    onChange(isActive(f) ? null : f);
  };

  const cardBase =
    "flex items-center gap-3 rounded-2xl border-2 bg-card px-5 py-4 min-h-[64px] text-left transition-all active:scale-[0.98] hover:bg-accent/40";
  const inactive = "border-primary/40";
  const active = "border-primary ring-2 ring-primary/30 bg-accent/40";

  return (
    <div className="grid grid-cols-2 gap-2">
      {houses.map((name) => {
        const filter: QuickFilter = { type: "house", value: name };
        const a = isActive(filter);
        return (
          <button
            key={name}
            type="button"
            onClick={() => handleClick(filter)}
            className={cn(cardBase, a ? active : inactive)}
          >
            <Home className="w-5 h-5 shrink-0 text-foreground" />
            <span className="font-semibold text-foreground truncate">
              {name}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => handleClick({ type: "thisWeek" })}
        className={cn(
          cardBase,
          isActive({ type: "thisWeek" }) ? active : inactive,
        )}
      >
        <Calendar className="w-5 h-5 shrink-0 text-foreground" />
        <span className="font-semibold text-foreground truncate">
          {t("quickFilter.thisWeek", { defaultValue: "Diese Woche" })}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleClick({ type: "nextWeek" })}
        className={cn(
          cardBase,
          isActive({ type: "nextWeek" }) ? active : inactive,
        )}
      >
        <Calendar className="w-5 h-5 shrink-0 text-foreground" />
        <span className="font-semibold text-foreground truncate">
          {t("quickFilter.nextWeek", { defaultValue: "Nächste Woche" })}
        </span>
      </button>
    </div>
  );
};

export default QuickFilterCards;
