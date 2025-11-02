// v9.0 - Separate Desktop/Mobile ViewSettings
import { useState, useEffect } from "react";
import { Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  desktopSettings: ViewSettings;
  mobileSettings: ViewSettings;
  onDesktopSettingsChange: (settings: ViewSettings) => void;
  onMobileSettingsChange: (settings: ViewSettings) => void;
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
  desktopSettings, 
  mobileSettings, 
  onDesktopSettingsChange, 
  onMobileSettingsChange,
  isMobileDevice 
}: ViewSettingsDialogProps) => {
  const [localDesktopSettings, setLocalDesktopSettings] = useState<ViewSettings>(desktopSettings);
  const [localMobileSettings, setLocalMobileSettings] = useState<ViewSettings>(mobileSettings);
  const [open, setOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [showButtonOnMobile, setShowButtonOnMobile] = useState(() => {
    const saved = localStorage.getItem('showViewSettingsButtonOnMobile');
    return saved === null ? true : saved === 'true';
  });

  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleSettingChange = (
    key: keyof ViewSettings, 
    value: boolean, 
    profile: 'desktop' | 'mobile'
  ) => {
    console.log(`[ViewSettings] Changing ${profile} setting "${key}" to ${value}`);
    if (profile === 'desktop') {
      const newSettings = { ...localDesktopSettings, [key]: value };
      setLocalDesktopSettings(newSettings);
      console.log('[ViewSettings] Calling onDesktopSettingsChange with:', newSettings);
      onDesktopSettingsChange(newSettings);
      localStorage.setItem('viewSettings-desktop', JSON.stringify(newSettings));
    } else {
      const newSettings = { ...localMobileSettings, [key]: value };
      setLocalMobileSettings(newSettings);
      console.log('[ViewSettings] Calling onMobileSettingsChange with:', newSettings);
      onMobileSettingsChange(newSettings);
      localStorage.setItem('viewSettings-mobile', JSON.stringify(newSettings));
    }
  };

  const resetToDefault = (profile: 'desktop' | 'mobile') => {
    if (profile === 'desktop') {
      setLocalDesktopSettings(defaultSettings);
      onDesktopSettingsChange(defaultSettings);
      localStorage.setItem('viewSettings-desktop', JSON.stringify(defaultSettings));
    } else {
      setLocalMobileSettings(defaultSettings);
      onMobileSettingsChange(defaultSettings);
      localStorage.setItem('viewSettings-mobile', JSON.stringify(defaultSettings));
    }
  };

  const toggleAll = (enabled: boolean, profile: 'desktop' | 'mobile') => {
    const allEnabled = Object.keys(defaultSettings).reduce((acc, key) => {
      acc[key as keyof ViewSettings] = enabled;
      return acc;
    }, {} as ViewSettings);
    
    if (profile === 'desktop') {
      setLocalDesktopSettings(allEnabled);
      onDesktopSettingsChange(allEnabled);
      localStorage.setItem('viewSettings-desktop', JSON.stringify(allEnabled));
    } else {
      setLocalMobileSettings(allEnabled);
      onMobileSettingsChange(allEnabled);
      localStorage.setItem('viewSettings-mobile', JSON.stringify(allEnabled));
    }
  };

  useEffect(() => {
    setLocalDesktopSettings(desktopSettings);
  }, [desktopSettings]);

  useEffect(() => {
    setLocalMobileSettings(mobileSettings);
  }, [mobileSettings]);

  // Sync localStorage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showViewSettingsButtonOnMobile') {
        setShowButtonOnMobile(e.newValue === 'true');
      }
      if (e.key === 'viewSettings-desktop' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLocalDesktopSettings(parsed);
        } catch (error) {
          console.warn('Failed to parse desktop viewSettings from storage event:', error);
        }
      }
      if (e.key === 'viewSettings-mobile' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLocalMobileSettings(parsed);
        } catch (error) {
          console.warn('Failed to parse mobile viewSettings from storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const SettingRow = ({ 
    label, 
    description, 
    settingKey,
    profile 
  }: { 
    label: string; 
    description: string; 
    settingKey: keyof ViewSettings;
    profile: 'desktop' | 'mobile';
  }) => {
    const settings = profile === 'desktop' ? localDesktopSettings : localMobileSettings;
    
    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
        <div className="flex-1">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Switch
          checked={settings[settingKey]}
          onCheckedChange={(checked) => handleSettingChange(settingKey, checked, profile)}
        />
      </div>
    );
  };

  const SettingsContentForProfile = ({ profile }: { profile: 'desktop' | 'mobile' }) => (
    <div className="space-y-6">
      {/* Schnellaktionen */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => toggleAll(true, profile)} className="gap-2">
          <Eye className="w-4 h-4" />
          Alle anzeigen
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false, profile)} className="gap-2">
          <EyeOff className="w-4 h-4" />
          Alle ausblenden
        </Button>
        <Button variant="outline" size="sm" onClick={() => resetToDefault(profile)}>
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
            profile={profile}
          />
          <SettingRow
            label="Unterkunftsadresse"
            description="Vollständige Adresse der Unterkunft anzeigen"
            settingKey="showAccommodationAddress"
            profile={profile}
          />
          <SettingRow
            label="Buchungsstatus"
            description="Status der Buchung (Bestätigt, Storniert, etc.)"
            settingKey="showBookingStatus"
            profile={profile}
          />
          <SettingRow
            label="Gastname"
            description="Name des Gastes anzeigen"
            settingKey="showGuestName"
            profile={profile}
          />
          <SettingRow
            label="Gästeanzahl"
            description="Anzahl der Personen in der Buchung"
            settingKey="showGuestCount"
            profile={profile}
          />
          <SettingRow
            label="Check-in Datum"
            description="Anreisedatum anzeigen"
            settingKey="showCheckInDate"
            profile={profile}
          />
          <SettingRow
            label="Check-out Datum"
            description="Abreisedatum anzeigen"
            settingKey="showCheckOutDate"
            profile={profile}
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
            profile={profile}
          />
          <SettingRow
            label="Bestellstatus"
            description="Status der Wäschebestellung (Ausstehend, Geliefert, etc.)"
            settingKey="showOrderStatus"
            profile={profile}
          />
          <SettingRow
            label="Lieferdatum"
            description="Geplantes oder tatsächliches Lieferdatum"
            settingKey="showDeliveryDate"
            profile={profile}
          />
          <SettingRow
            label="Lieferzeit"
            description="Geplante Lieferzeit anzeigen"
            settingKey="showDeliveryTime"
            profile={profile}
          />
          <SettingRow
            label="Lieferart"
            description="Lieferung oder Abholung anzeigen"
            settingKey="showDeliveryType"
            profile={profile}
          />
          <SettingRow
            label="Zugewiesene Wäschekraft"
            description="Name der zugewiesenen Wäschekraft"
            settingKey="showAssignedStaff"
            profile={profile}
          />
          <SettingRow
            label="Bestellte Artikel"
            description="Detailliste aller bestellten Wäscheartikel"
            settingKey="showOrderItems"
            profile={profile}
          />
          <SettingRow
            label="Bestellnotizen"
            description="Zusätzliche Notizen zur Bestellung"
            settingKey="showOrderNotes"
            profile={profile}
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

  // Mobile: Show only mobile settings
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
              <Smartphone className="w-5 h-5" />
              Mobile Anzeigeeinstellungen
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Ihre persönlichen Einstellungen für die Mobile-Ansicht
            </p>
          </DialogHeader>
          <SettingsContentForProfile profile="mobile" />
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop: Show tabs for both desktop and mobile settings
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
            Verwalten Sie separate Einstellungen für Desktop und Mobile-Ansicht
          </p>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'desktop' | 'mobile')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desktop" className="gap-2">
              <Monitor className="w-4 h-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Ansicht
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="desktop" className="mt-4">
            <SettingsContentForProfile profile="desktop" />
          </TabsContent>
          
          <TabsContent value="mobile" className="mt-4">
            <div className="space-y-6">
              {/* Button visibility control */}
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
              
              <SettingsContentForProfile profile="mobile" />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSettingsDialog;
export { defaultSettings };
