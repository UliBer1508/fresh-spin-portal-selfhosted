import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Invoice {
  id: string;
  rechnungsnummer: string;
  rechnungsdatum: string;
  faelligkeitsdatum: string | null;
  bruttobetrag: number;
  nettobetrag: number | null;
  mwst_betrag: number | null;
  status: string;
  positionen: any;
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "–";
  const d = dateStr.split("T")[0];
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

const statusColor = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "bezahlt" || s === "paid") return "bg-green-100 text-green-800 border-green-200";
  if (s === "überfällig" || s === "overdue") return "bg-red-100 text-red-800 border-red-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
};

const InvoiceList = () => {
  const { t } = useTranslation("navigation");
  const isMobile = useIsMobile();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error, count } = await supabase
        .from("laundry_invoices")
        .select("*", { count: "exact" })
        .order("rechnungsdatum", { ascending: false })
        .limit(5000);

      console.log("[InvoiceList] fetched rows:", data?.length, "total in DB:", count, "error:", error);

      if (!error && data) {
        const filtered = (data as Invoice[]).filter(
          inv => !inv.rechnungsnummer?.toLowerCase().startsWith("entwurf-")
        );
        console.log("[InvoiceList] after filter:", filtered.length, "invoices");
        setInvoices(filtered);
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  const positions = selectedInvoice?.positionen
    ? (Array.isArray(selectedInvoice.positionen)
        ? selectedInvoice.positionen
        : [])
    : [];

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Lade Rechnungen...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Keine Rechnungen vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {t("tabs.invoices")} ({invoices.length})
      </h2>

      {/* Desktop Table */}
      {!isMobile ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnungsnr.</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Fällig</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.rechnungsnummer}</TableCell>
                  <TableCell>{formatDate(inv.rechnungsdatum)}</TableCell>
                  <TableCell>{formatDate(inv.faelligkeitsdatum)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.bruttobetrag)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor(inv.status)} variant="outline">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Mobile Cards */
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="border rounded-lg p-4 bg-card space-y-2"
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{inv.rechnungsnummer}</span>
                <Badge className={statusColor(inv.status)} variant="outline">
                  {inv.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(inv.rechnungsdatum)}
                {inv.faelligkeitsdatum && ` · Fällig: ${formatDate(inv.faelligkeitsdatum)}`}
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(inv.bruttobetrag)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rechnung {selectedInvoice?.rechnungsnummer}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Datum:</div>
              <div>{formatDate(selectedInvoice?.rechnungsdatum ?? null)}</div>
              <div className="text-muted-foreground">Fällig:</div>
              <div>{formatDate(selectedInvoice?.faelligkeitsdatum ?? null)}</div>
              <div className="text-muted-foreground">Status:</div>
              <div>
                <Badge className={statusColor(selectedInvoice?.status ?? "")} variant="outline">
                  {selectedInvoice?.status}
                </Badge>
              </div>
            </div>

            {positions.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel</TableHead>
                      <TableHead className="text-right">Menge</TableHead>
                      <TableHead className="text-right">Preis</TableHead>
                      <TableHead className="text-right">Gesamt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((pos: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">
                          {pos.artikelbezeichnung || pos.bezeichnung || pos.name || "–"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {pos.menge ?? "–"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {pos.einzelpreis != null ? formatCurrency(pos.einzelpreis) : "–"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {pos.gesamtpreis != null ? formatCurrency(pos.gesamtpreis) : "–"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="border-t pt-3 space-y-1 text-sm">
              {selectedInvoice?.nettobetrag != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Netto:</span>
                  <span>{formatCurrency(selectedInvoice.nettobetrag)}</span>
                </div>
              )}
              {selectedInvoice?.mwst_betrag != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MwSt:</span>
                  <span>{formatCurrency(selectedInvoice.mwst_betrag)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base">
                <span>Brutto:</span>
                <span>{selectedInvoice ? formatCurrency(selectedInvoice.bruttobetrag) : ""}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceList;
