import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const MessagesPage = () => (
  <Card className="p-6 text-center">
    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
    <h2 className="font-semibold text-foreground mb-1">Nachrichten</h2>
    <p className="text-sm text-muted-foreground">
      Öffnen Sie den Chat über das Symbol unten rechts.
    </p>
  </Card>
);

export default MessagesPage;
