import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { de, enUS, nl } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, ArrowRight, Clock, Truck, Users } from "lucide-react";
import { useBookingsContext } from "@/context/BookingsContext";
import type { LinenOrder } from "@/hooks/useBookings";

const localeMap: Record<string, typeof de> = { de, en: enUS, nl };

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = localeMap[i18n.language] ?? de;
  const { bookings, standaloneOrders, loading } = useBookingsContext();

  const stats = useMemo(() => {
    const allOrders: LinenOrder[] = [
      ...bookings.flatMap((b) => b.linen_orders ?? []),
      ...standaloneOrders,
    ];
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    const notCancelled = allOrders.filter((o) => o.status !== "cancelled");
    const open = notCancelled.filter((o) => o.status === "offen").length;
    const inProgress = notCancelled.filter((o) => o.status === "ausstehend").length;
    const todayDeliver = notCancelled.filter((o) => o.delivery_date === todayStr).length;

    const checkedIn = bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const ci = b.check_in?.split("T")[0];
      const co = b.check_out?.split("T")[0];
      return ci && co && ci <= todayStr && co > todayStr;
    }).length;

    const upcoming = notCancelled
      .filter((o) => o.delivery_date && o.delivery_date >= todayStr)
      .sort((a, b) => (a.delivery_date ?? "").localeCompare(b.delivery_date ?? ""))
      .slice(0, 5);

    return { open, inProgress, todayDeliver, checkedIn, upcoming };
  }, [bookings, standaloneOrders]);

  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  const tiles = [
    { label: "Offen", value: stats.open, icon: Package, color: "text-info", to: "/orders?status=offen" },
    { label: "In Bearbeitung", value: stats.inProgress, icon: Clock, color: "text-warning", to: "/orders?status=ausstehend" },
    { label: "Heute zu liefern", value: stats.todayDeliver, icon: Truck, color: "text-primary", to: "/orders" },
    { label: "Eingecheckte Gäste", value: stats.checkedIn, icon: Users, color: "text-success", to: "/calendar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{greeting}</h2>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d. MMMM yyyy", { locale: dateLocale })}
        </p>
      </div>

      {stats.checkedIn > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning bg-warning/10 p-4">
          <AlertTriangle className="w-5 h-5 text-warning-foreground/80 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">
              {stats.checkedIn} eingecheckte{stats.checkedIn === 1 ? "r Gast" : " Gäste"}
            </p>
            <p className="text-muted-foreground">Aktive Belegungen vor Ort.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to} className="block">
            <Card className="p-4 hover:shadow-md transition-shadow min-h-[44px]">
              <div className="flex items-center justify-between">
                <tile.icon className={`w-5 h-5 ${tile.color}`} />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-foreground">{loading ? "—" : tile.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{tile.label}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Nächste Bestellungen</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/orders" className="flex items-center gap-1">
              Alle anzeigen <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : stats.upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine anstehenden Bestellungen.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.upcoming.map((o) => (
              <li key={o.id} className="py-3 flex items-center gap-3">
                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-foreground">
                    {o.houses?.name ?? o.bookings?.guest_name ?? "Wäschebestellung"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.delivery_date
                      ? format(new Date(o.delivery_date), "d. MMM yyyy", { locale: dateLocale })
                      : "—"}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {t(`orders:status.${o.status}`, { defaultValue: o.status })}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
