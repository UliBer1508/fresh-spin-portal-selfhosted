// v12.0 - Unified ViewSettings with Mobile Button Toggle
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  isMobileDevice: boolean;
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

const ViewSettingsDialog = ({ 
  settings, 
  onSettingsChange,
  isMobileDevice 
}: ViewSettingsDialogProps) => {
  const [localSettings, setLocalSettings] = useState<ViewSettings>(settings);
  const [open, setOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showButtonOnMobile, setShowButtonOnMobile] = useState(() => {
    const saved = localStorage.getItem('showViewSettingsButtonOnMobile');
    // Default to false (hidden on mobile)
    const initialValue = saved === null ? false : saved === 'true';
    // Save the default value if nothing was saved before
    if (saved === null) {
      localStorage.setItem('showViewSettingsButtonOnMobile', 'false');
    }
    return initialValue;
  });

  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleSettingChange = (key: keyof ViewSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    localStorage.setItem('viewSettings', JSON.stringify(localSettings));
    setHasUnsavedChanges(false);
    
    // Toast-Benachrichtigung
    const event = new CustomEvent('show-toast', {
      detail: {
        title: '✓ Gespeichert',
        description: 'Ihre Anzeigeeinstellungen wurden erfolgreich gespeichert',
      }
    });
    window.dispatchEvent(event);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
    setOpen(false);
  };

  const resetToDefault = () => {
    setLocalSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  const toggleAll = (enabled: boolean) => {
    const allEnabled = Object.keys(defaultSettings).reduce((acc, key) => {
      acc[key as keyof ViewSettings] = enabled;
      return acc;
    }, {} as ViewSettings);
    
    setLocalSettings(allEnabled);
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Sync localStorage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showViewSettingsButtonOnMobile') {
        setShowButtonOnMobile(e.newValue === 'true');
      }
      if (e.key === 'viewSettings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLocalSettings(parsed);
        } catch (error) {
          console.warn('Failed to parse viewSettings from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const SettingRow = ({ 
    label, 
    description, 
    settingKey
  }: { 
    label: string; 
    description: string; 
    settingKey: keyof ViewSettings;
  }) => {
    return (
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
  };

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
        <Button variant="outline" size="sm" onClick={() => resetToDefault()}>
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

  // Don't render anything until we've initialized
  if (!isInitialized) {
    return null;
  }
  
  // Hide button on mobile if setting is disabled
  if (isMobileDevice && !showButtonOnMobile) {
    return null;
  }

  // Mobile: Simplified settings view
  if (isMobileDevice) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="text-base">⚙️</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              Anzeigeeinstellungen
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Ihre persönlichen Anzeigeeinstellungen
            </p>
          </DialogHeader>
          <SettingsContent />
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button 
              variant="default" 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="flex-1"
            >
              Speichern
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
            >
              Abbrechen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop: Settings with mobile button toggle
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-base">⚙️</span>
          <span className="hidden sm:inline">Ansicht anpassen</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Anzeigeeinstellungen anpassen
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Passen Sie an, welche Informationen angezeigt werden
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Button visibility control for mobile */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium">Einstellungsbutton auf Handy anzeigen</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Zeige den ⚙️ Button auf Mobilgeräten, um Einstellungen dort anzupassen
                </p>
              </div>
              <Switch
                checked={showButtonOnMobile}
                onCheckedChange={(checked) => {
                  setShowButtonOnMobile(checked);
                  localStorage.setItem('showViewSettingsButtonOnMobile', String(checked));
                }}
              />
            </div>
          </div>
          
          <SettingsContent />
          
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button 
              variant="default" 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="flex-1"
            >
              Änderungen speichern
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSettingsDialog;
export { defaultSettings };
