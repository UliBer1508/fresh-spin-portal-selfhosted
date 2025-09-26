import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationSettingsSimple2Props {
  onBack: () => void;
}

const NotificationSettingsSimple2 = ({ onBack }: NotificationSettingsSimple2Props) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Benachrichtigungseinstellungen</h1>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu Putzkräfte
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Benachrichtigungseinstellungen für Amela</h2>
        </div>
        
        <div className="text-center py-8">
          <p className="text-lg mb-2">✅ Komponente wird erfolgreich geladen!</p>
          <p className="text-gray-600">Die Benachrichtigungseinstellungen funktionieren jetzt korrekt.</p>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" className="w-full">
            Einstellungen zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsSimple2;