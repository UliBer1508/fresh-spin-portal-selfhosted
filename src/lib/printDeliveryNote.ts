import { LinenOrder } from "@/hooks/useBookings";
import { getLinenLabel, getLinenColorLabel, LINEN_ORDER } from "@/lib/linenLabels";

const isMobile = (): boolean =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);

const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") return false;
  // iOS Safari
  // @ts-ignore
  if (window.navigator.standalone === true) return true;
  // Other browsers
  return window.matchMedia?.("(display-mode: standalone)").matches ?? false;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (timeString?: string) =>
  timeString ? ` um ${timeString} Uhr` : "";

const getDeliveryTypeText = (deliveryType?: string) => {
  const t = (deliveryType || "delivery").toLowerCase();
  if (t === "pickup" || t === "abholung") return "Abholung";
  return "Lieferung";
};

const getItemColor = (order: LinenOrder, itemKey: string): string => {
  const itemVariants = order.item_variants as Record<string, string> | null;
  if (itemVariants && itemVariants[itemKey]) {
    return getLinenColorLabel(itemVariants[itemKey]);
  }
  if (order.linen_color) return getLinenColorLabel(order.linen_color);
  return "-";
};

export const generatePrintHtml = (order: LinenOrder): string => {
  const items = order.items as Record<string, number>;
  const totalItems = Object.values(items).reduce((s, q) => s + q, 0);

  const itemRows = LINEN_ORDER.filter((key) => items[key] && items[key] > 0)
    .map(
      (key) => `
      <tr>
        <td style="padding:8px;border:1px solid #333;font-family:Arial,sans-serif;">${getLinenLabel(key)}</td>
        <td style="padding:8px;border:1px solid #333;font-family:Arial,sans-serif;">${getItemColor(order, key)}</td>
        <td style="padding:8px;border:1px solid #333;text-align:right;font-weight:500;font-family:Arial,sans-serif;">${items[key]}</td>
      </tr>`
    )
    .join("");

  const body = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#000;padding:10mm;background:#fff;width:100%;box-sizing:border-box;">
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:16px;">
        <h1 style="font-size:24px;font-weight:bold;letter-spacing:2px;margin:0;">LIEFERSCHEIN</h1>
        <p style="font-size:16px;color:#666;margin:4px 0 0 0;">Wäsche Pinzgau</p>
        <p style="margin-top:8px;font-size:14px;font-weight:600;">Bestell-Nr: #${order.id.substring(0, 8).toUpperCase()}</p>
      </div>
      <div style="margin-bottom:16px;padding:12px;border:1px solid #ddd;background:#f5f5f5;">
        <p style="font-weight:600;margin:0 0 4px 0;">Lieferadresse:</p>
        <p style="font-size:18px;font-weight:600;margin:0;">${order.houses?.name || "Unbekanntes Haus"}</p>
        ${order.houses?.address ? `<p style="font-size:14px;color:#666;margin:4px 0 0 0;">${order.houses.address}</p>` : ""}
      </div>
      ${
        order.bookings
          ? `
        <div style="margin-bottom:16px;padding:12px;border:1px solid #ddd;">
          <p style="font-weight:600;margin:0 0 8px 0;">Buchungsdetails:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;width:50%;"><strong>Gast:</strong> ${order.bookings.guest_name}</td>
              <td style="padding:4px 0;width:50%;"><strong>Gäste:</strong> ${order.bookings.number_of_guests} Personen</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Check-in:</strong> ${formatDate(order.bookings.check_in)}</td>
              <td style="padding:4px 0;"><strong>Check-out:</strong> ${formatDate(order.bookings.check_out)}</td>
            </tr>
          </table>
        </div>`
          : ""
      }
      <table style="width:100%;margin-bottom:16px;border-collapse:separate;border-spacing:8px 0;">
        <tr>
          <td style="width:50%;padding:12px;border:1px solid #ddd;vertical-align:top;">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px 0;">Lieferdatum:</p>
            <p style="font-size:13px;margin:0;">${formatDate(order.delivery_date)}${formatTime(order.delivery_time)}</p>
          </td>
          <td style="width:50%;padding:12px;border:1px solid #ddd;vertical-align:top;">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px 0;">Lieferart:</p>
            <p style="font-size:13px;margin:0;">${getDeliveryTypeText(order.delivery_type)}</p>
          </td>
        </tr>
      </table>
      <div style="margin-bottom:16px;">
        <table style="width:100%;margin-bottom:8px;">
          <tr>
            <td style="font-weight:600;">Artikel:</td>
            <td style="text-align:right;"><span style="font-size:12px;background:#e0e7ff;color:#3730a3;padding:4px 8px;">${totalItems} Stück gesamt</span></td>
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #333;background:#f0f0f0;font-weight:bold;text-align:left;">Artikel</th>
              <th style="padding:8px;border:1px solid #333;background:#f0f0f0;font-weight:bold;text-align:left;">Farbe</th>
              <th style="padding:8px;border:1px solid #333;background:#f0f0f0;font-weight:bold;text-align:right;">Anzahl</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <tr>
              <td style="padding:8px;border:1px solid #333;border-top:2px solid #000;font-weight:bold;" colspan="2">GESAMT</td>
              <td style="padding:8px;border:1px solid #333;border-top:2px solid #000;text-align:right;font-weight:bold;">${totalItems}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin-bottom:16px;">
        <p style="font-weight:600;margin:0 0 8px 0;">Notizen:</p>
        <div style="padding:12px;border:1px solid #ddd;min-height:60px;background:#fafafa;">${order.notes || "Keine Notizen"}</div>
      </div>
      <div style="border-top:1px solid #ddd;padding-top:12px;margin-top:16px;font-size:12px;color:#666;">
        <span>Erstellt: ${new Date().toLocaleDateString("de-DE")}</span>
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lieferschein #${order.id.substring(0, 8).toUpperCase()}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  </style>
</head>
<body>${body}</body>
</html>`;
};

const printViaIframe = (html: string): Promise<void> =>
  new Promise((resolve) => {
    const existing = document.getElementById("print-iframe");
    if (existing) existing.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-iframe";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      resolve();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const trigger = () => {
      try {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print failed:", err);
      }
      setTimeout(() => {
        iframe.remove();
        resolve();
      }, 1000);
    };

    if (iframe.contentDocument?.readyState === "complete") {
      setTimeout(trigger, 100);
    } else {
      iframe.onload = () => setTimeout(trigger, 100);
    }
  });

/**
 * Mobile: opens a new tab/window with the print HTML and triggers
 * window.print() inside it, which displays the native AirPrint sheet
 * (iOS) or Android print dialog. The window reference MUST be opened
 * synchronously in the user gesture — do not await anything before.
 */
const printViaNewWindow = (win: Window, html: string): void => {
  const printScript = `
    <script>
      window.addEventListener('load', function() {
        setTimeout(function() {
          try { window.focus(); window.print(); } catch (e) { console.error(e); }
        }, 350);
      });
    <\/script>
  `;
  const fullHtml = html.replace("</body>", `${printScript}</body>`);
  win.document.open();
  win.document.write(fullHtml);
  win.document.close();
};

/**
 * Entry point. Must be called directly inside a user click handler
 * (no awaits before) so that window.open() is allowed by Safari/iOS.
 */
export const printDeliveryNote = (order: LinenOrder): { ok: boolean; reason?: string } => {
  const html = generatePrintHtml(order);

  if (isMobile()) {
    // Open synchronously – required by iOS Safari popup policy
    const win = window.open("", "_blank");
    if (win) {
      printViaNewWindow(win, html);
      return { ok: true };
    }
    // Standalone PWA: window.open is blocked. Fallback to iframe.
    if (isStandalonePWA()) {
      void printViaIframe(html);
      return { ok: true, reason: "pwa-iframe-fallback" };
    }
    return { ok: false, reason: "popup-blocked" };
  }

  // Desktop: isolated iframe print (unchanged behavior)
  void printViaIframe(html);
  return { ok: true };
};
