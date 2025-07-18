
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Upload } from "lucide-react";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your platform settings and configurations</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Name</label>
                  <Input defaultValue="HarvestConnect" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                  <Input defaultValue="admin@harvestconnect.com" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Description</label>
                <Textarea 
                  defaultValue="Your trusted marketplace for urban backyard farming supplies, connecting local farmers with gardening enthusiasts."
                  rows={3}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Mode
                </label>
              </div>
            </CardContent>
          </Card>

          {/* E-commerce Settings */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">E-commerce Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Currency</label>
                  <Input defaultValue="PHP (₱)" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax Rate (%)</label>
                  <Input defaultValue="12" type="number" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Order Amount</label>
                  <Input defaultValue="50" type="number" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Free Shipping Threshold</label>
                  <Input defaultValue="500" type="number" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="guest-checkout" defaultChecked />
                  <label htmlFor="guest-checkout" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow Guest Checkout
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="inventory-tracking" defaultChecked />
                  <label htmlFor="inventory-tracking" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Inventory Tracking
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="reviews-enabled" defaultChecked />
                  <label htmlFor="reviews-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Product Reviews
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">H</span>
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Logo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                  <Input defaultValue="30" type="number" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Upload Size (MB)</label>
                  <Input defaultValue="10" type="number" className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-backup" defaultChecked />
                  <label htmlFor="auto-backup" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Automatic Backups
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="error-logging" defaultChecked />
                  <label htmlFor="error-logging" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Error Logging
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
