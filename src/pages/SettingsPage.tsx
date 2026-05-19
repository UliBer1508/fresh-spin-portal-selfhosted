import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceList from "@/components/InvoiceList";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import NotificationSettings from "@/components/NotificationSettings";

const SettingsPage = () => (
  <div className="space-y-4">
    <Tabs defaultValue="notifications" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="notifications">🔔 Benachrichtigungen</TabsTrigger>
        <TabsTrigger value="staff">👥 Personal</TabsTrigger>
        <TabsTrigger value="invoices">🧾 Rechnungen</TabsTrigger>
      </TabsList>
      <TabsContent value="notifications" className="mt-4">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="staff" className="mt-4">
        <LaundryStaffManagement />
      </TabsContent>
      <TabsContent value="invoices" className="mt-4">
        <InvoiceList />
      </TabsContent>
    </Tabs>
  </div>
);

export default SettingsPage;
