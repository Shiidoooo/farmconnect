import { CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const NotificationSettingsSection = () => {
  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Notification Settings</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive important updates via email.</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Push Notifications</h4>
            <p className="text-sm text-gray-600">Receive real-time updates on your device.</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsSection;
