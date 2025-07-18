import { CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const PrivacySettingsSection = () => {
  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Privacy Settings</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Show Profile to Public</h4>
            <p className="text-sm text-gray-600">Allow anyone to view your profile.</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Share Activity</h4>
            <p className="text-sm text-gray-600">Share your activity with your followers.</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsSection;
