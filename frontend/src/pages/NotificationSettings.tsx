
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Smartphone, Package, Star, MessageCircle } from "lucide-react";
import { useState } from "react";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    priceDrops: true,
    reviews: false,
    messages: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="w-6 h-6 text-farm-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Notification Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Order Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Order Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-gray-600">Get notified about order status changes</p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => updateNotification('orderUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product Reviews</p>
                  <p className="text-sm text-gray-600">Reminders to review purchased products</p>
                </div>
                <Switch
                  checked={notifications.reviews}
                  onCheckedChange={(checked) => updateNotification('reviews', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span>Product Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Products</p>
                  <p className="text-sm text-gray-600">Alerts about new garden products</p>
                </div>
                <Switch
                  checked={notifications.newProducts}
                  onCheckedChange={(checked) => updateNotification('newProducts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Drops</p>
                  <p className="text-sm text-gray-600">Notifications when prices drop on watched items</p>
                </div>
                <Switch
                  checked={notifications.priceDrops}
                  onCheckedChange={(checked) => updateNotification('priceDrops', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions</p>
                  <p className="text-sm text-gray-600">Special offers and discount notifications</p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(checked) => updateNotification('promotions', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>Messages</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Direct Messages</p>
                  <p className="text-sm text-gray-600">Notifications for messages from sellers</p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => updateNotification('messages', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">juan.delacruz@email.com</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => updateNotification('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Browser and app notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => updateNotification('pushNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">+63 917 ***-**67</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => updateNotification('smsNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button className="bg-farm-green-600 hover:bg-farm-green-700">
              Save Settings
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

export default NotificationSettings;
