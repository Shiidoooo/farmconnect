
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Eye, Users, MessageSquare, Bell } from "lucide-react";
import { useState } from "react";

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showActivity: false,
    allowMessages: true,
    showPurchaseHistory: false,
    dataCollection: true,
    marketingEmails: false,
    productRecommendations: true,
    shareWithPartners: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-6 h-6 text-farm-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Privacy Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Profile Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Profile</p>
                  <p className="text-sm text-gray-600">Allow others to view your profile information</p>
                </div>
                <Switch
                  checked={settings.profileVisibility}
                  onCheckedChange={(checked) => updateSetting('profileVisibility', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Activity Status</p>
                  <p className="text-sm text-gray-600">Let others see when you're active</p>
                </div>
                <Switch
                  checked={settings.showActivity}
                  onCheckedChange={(checked) => updateSetting('showActivity', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Purchase History</p>
                  <p className="text-sm text-gray-600">Display your purchase activity to others</p>
                </div>
                <Switch
                  checked={settings.showPurchaseHistory}
                  onCheckedChange={(checked) => updateSetting('showPurchaseHistory', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Communication Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>Communication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Messages</p>
                  <p className="text-sm text-gray-600">Let other users send you messages</p>
                </div>
                <Switch
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) => updateSetting('allowMessages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-gray-600">Receive promotional emails from HarvestConnect</p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Data Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Collection</p>
                  <p className="text-sm text-gray-600">Allow collection of usage data to improve service</p>
                </div>
                <Switch
                  checked={settings.dataCollection}
                  onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product Recommendations</p>
                  <p className="text-sm text-gray-600">Use your data to suggest relevant products</p>
                </div>
                <Switch
                  checked={settings.productRecommendations}
                  onCheckedChange={(checked) => updateSetting('productRecommendations', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share with Partners</p>
                  <p className="text-sm text-gray-600">Share anonymized data with trusted partners</p>
                </div>
                <Switch
                  checked={settings.shareWithPartners}
                  onCheckedChange={(checked) => updateSetting('shareWithPartners', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button className="bg-farm-green-600 hover:bg-farm-green-700">
              Save Changes
            </Button>
            <Button variant="outline">
              Reset to Default
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacySettings;
