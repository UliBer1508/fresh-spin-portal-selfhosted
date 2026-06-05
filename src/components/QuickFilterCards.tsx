// Quick filter cards: houses + this/next week (kombinierbar)
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Home, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Booking } from "@/hooks/useBookings";

export type QuickFilter = {
  house: string | null;
  week: "thisWeek" | "nextWeek" | "thisMonth" | "nextMonth" | null;
};

export const emptyQuickFilter: QuickFilter = { house: null, week: null };

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

  const toggleHouse = (name: string) => {
    onChange({ ...value, house: value.house === name ? null : name });
  };

  const toggleWeek = (week: "thisWeek" | "nextWeek") => {
    onChange({ ...value, week: value.week === week ? null : week });
  };

  const cardBase =
    "flex items-center gap-3 rounded-2xl border-2 bg-green-50 px-5 py-4 min-h-[64px] text-left transition-all active:scale-[0.98] hover:bg-green-100";
  const inactive = "border-green-300";
  const active = "border-green-600 ring-2 ring-green-500/30 bg-green-100";

  return (
    <div className="grid grid-cols-2 gap-2">
      {houses.map((name) => {
        const a = value.house === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => toggleHouse(name)}
            className={cn(cardBase, a ? active : inactive)}
          >
            <Home className="w-6 h-6 shrink-0 text-foreground" />
            <span className="font-bold text-foreground truncate text-sm">
              {name}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => toggleWeek("thisWeek")}
        className={cn(cardBase, value.week === "thisWeek" ? active : inactive)}
      >
        <Calendar className="w-6 h-6 shrink-0 text-foreground" />
        <span className="font-bold text-foreground truncate text-sm">
          {t("quickFilter.thisWeek", { defaultValue: "Diese Woche" })}
        </span>
      </button>

      <button
        type="button"
        onClick={() => toggleWeek("nextWeek")}
        className={cn(cardBase, value.week === "nextWeek" ? active : inactive)}
      >
        <Calendar className="w-6 h-6 shrink-0 text-foreground" />
        <span className="font-bold text-foreground truncate text-sm">
          {t("quickFilter.nextWeek", { defaultValue: "Nächste Woche" })}
        </span>
      </button>
    </div>
  );
};

export default QuickFilterCards;
