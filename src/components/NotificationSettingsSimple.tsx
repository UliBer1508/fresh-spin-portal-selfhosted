import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationSettingsSimpleProps {
  onBack: () => void;
}

const NotificationSettingsSimple = ({ onBack }: NotificationSettingsSimpleProps) => {
  console.log("NotificationSettingsSimple component rendered");
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
      
      <div className="bg-card p-6 rounded-lg border">
        <p className="text-foreground">Test - Notification Settings Page is working!</p>
      </div>
    </div>
  );
};

export default NotificationSettingsSimple;