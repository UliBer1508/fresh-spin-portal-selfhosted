import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationSettingsTestProps {
  onBack: () => void;
}

const NotificationSettingsTest = ({ onBack }: NotificationSettingsTestProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Benachrichtigungseinstellungen
        </h1>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Putzkräfte</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Benachrichtigungseinstellungen für Amela</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center p-8">
            <p className="text-lg font-medium text-foreground mb-4">
              Test - Benachrichtigungseinstellungen werden geladen...
            </p>
            <p className="text-muted-foreground">
              Diese Seite wird derzeit entwickelt und zeigt bald alle Funktionen aus dem Bild.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => console.log('Reset clicked')}
              className="w-full"
            >
              Einstellungen zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettingsTest;