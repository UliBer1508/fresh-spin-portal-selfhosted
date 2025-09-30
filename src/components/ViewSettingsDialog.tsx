import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ViewSettings {
  showAccommodationName: boolean;
  showAccommodationAddress: boolean;
  showBookingStatus: boolean;
  showGuestName: boolean;
  showGuestCount: boolean;
  showCheckInDate: boolean;
  showCheckOutDate: boolean;
  showLinenOrders: boolean;
  showOrderStatus: boolean;
  showDeliveryDate: boolean;
  showDeliveryTime: boolean;
  showDeliveryType: boolean;
  showAssignedStaff: boolean;
  showOrderItems: boolean;
  showOrderNotes: boolean;
}

interface ViewSettingsDialogProps {
  settings: ViewSettings;
  onSettingsChange: (settings: ViewSettings) => void;
}

const defaultSettings: ViewSettings = {
  showAccommodationName: true,
  showAccommodationAddress: true,
  showBookingStatus: true,
  showGuestName: true,
  showGuestCount: true,
  showCheckInDate: true,
  showCheckOutDate: true,
  showLinenOrders: true,
  showOrderStatus: true,
  showDeliveryDate: true,
  showDeliveryTime: true,
  showDeliveryType: true,
  showAssignedStaff: true,
  showOrderItems: true,
  showOrderNotes: true,
};

const ViewSettingsDialog = ({ settings, onSettingsChange }: ViewSettingsDialogProps) => {
  const [localSettings, setLocalSettings] = useState<ViewSettings>(settings);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSettingChange = (key: keyof ViewSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    
    localStorage.setItem('viewSettings', JSON.stringify(newSettings));
  };

  const resetToDefault = () => {
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    localStorage.setItem('viewSettings', JSON.stringify(defaultSettings));
  };

  const toggleAll = (enabled: boolean) => {
    const allEnabled = Object.keys(defaultSettings).reduce((acc, key) => {
      acc[key as keyof ViewSettings] = enabled;
      return acc;
    }, {} as ViewSettings);
    
    setLocalSettings(allEnabled);
    onSettingsChange(allEnabled);
    localStorage.setItem('viewSettings', JSON.stringify(allEnabled));
  };

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const SettingRow = ({ 
    label, 
    description, 
    settingKey 
  }: { 
    label: string; 
    description: string; 
    settingKey: keyof ViewSettings 
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <Switch
        checked={localSettings[settingKey]}
        onCheckedChange={(checked) => handleSettingChange(settingKey, checked)}
      />
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Schnellaktionen */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="gap-2">
          <Eye className="w-4 h-4" />
          Alle anzeigen
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="gap-2">
          <EyeOff className="w-4 h-4" />
          Alle ausblenden
        </Button>
        <Button variant="outline" size="sm" onClick={resetToDefault}>
          Zurücksetzen
        </Button>
      </div>

      {/* Buchungsdetails */}
      <div className="space-y-2">
        <h3 className="font-medium text-base">Buchungsdetails</h3>
        <div className="bg-muted/30 rounded-lg p-4 space-y-1">
          <SettingRow
            label="Unterkunftsname"
            description="Name der gebuchten Unterkunft anzeigen"
            settingKey="showAccommodationName"
          />
          <SettingRow
            label="Unterkunftsadresse"
            description="Vollständige Adresse der Unterkunft anzeigen"
            settingKey="showAccommodationAddress"
          />
          <SettingRow
            label="Buchungsstatus"
            description="Status der Buchung (Bestätigt, Storniert, etc.)"
            settingKey="showBookingStatus"
          />
          <SettingRow
            label="Gastname"
            description="Name des Gastes anzeigen"
            settingKey="showGuestName"
          />
          <SettingRow
            label="Gästeanzahl"
            description="Anzahl der Personen in der Buchung"
            settingKey="showGuestCount"
          />
          <SettingRow
            label="Check-in Datum"
            description="Anreisedatum anzeigen"
            settingKey="showCheckInDate"
          />
          <SettingRow
            label="Check-out Datum"
            description="Abreisedatum anzeigen"
            settingKey="showCheckOutDate"
          />
        </div>
      </div>

      {/* Wäschebestellungen */}
      <div className="space-y-2">
        <h3 className="font-medium text-base">Wäschebestellungen</h3>
        <div className="bg-muted/30 rounded-lg p-4 space-y-1">
          <SettingRow
            label="Wäschebestellungen"
            description="Gesamten Wäschebestellungsbereich anzeigen"
            settingKey="showLinenOrders"
          />
          <SettingRow
            label="Bestellstatus"
            description="Status der Wäschebestellung (Ausstehend, Geliefert, etc.)"
            settingKey="showOrderStatus"
          />
          <SettingRow
            label="Lieferdatum"
            description="Geplantes oder tatsächliches Lieferdatum"
            settingKey="showDeliveryDate"
          />
          <SettingRow
            label="Lieferzeit"
            description="Geplante Lieferzeit anzeigen"
            settingKey="showDeliveryTime"
          />
          <SettingRow
            label="Lieferart"
            description="Lieferung oder Abholung anzeigen"
            settingKey="showDeliveryType"
          />
          <SettingRow
            label="Zugewiesene Wäschekraft"
            description="Name der zugewiesenen Wäschekraft"
            settingKey="showAssignedStaff"
          />
          <SettingRow
            label="Bestellte Artikel"
            description="Detailliste aller bestellten Wäscheartikel"
            settingKey="showOrderItems"
          />
          <SettingRow
            label="Bestellnotizen"
            description="Zusätzliche Notizen zur Bestellung"
            settingKey="showOrderNotes"
          />
        </div>
      </div>
    </div>
  );

  // Mobile: Hidden, only shows as Dialog when button is clicked
  // Desktop: Always visible as Sheet (drawer)
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="text-base">⚙️</span>
            <span className="hidden sm:inline">Ansicht anpassen</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              Anzeigeeinstellungen anpassen
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Wählen Sie aus, welche Informationen in den Wäschebestellungen angezeigt werden sollen
            </p>
          </DialogHeader>
          <SettingsContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop: Sheet (side panel)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-base">⚙️</span>
          Ansicht anpassen
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Anzeigeeinstellungen anpassen
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Wählen Sie aus, welche Informationen in den Wäschebestellungen angezeigt werden sollen
          </p>
        </SheetHeader>
        <div className="mt-6">
          <SettingsContent />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewSettingsDialog;
export { defaultSettings };
