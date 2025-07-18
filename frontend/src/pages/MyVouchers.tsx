
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Calendar, Percent, Coins, Clock } from "lucide-react";
import { useState } from "react";

const MyVouchers = () => {
  const [vouchers] = useState({
    available: [
      {
        id: 1,
        title: 'Fresh Harvest Discount',
        description: '₱50 off on orders above ₱300',
        discount: '₱50 OFF',
        minSpend: '₱300',
        validUntil: '2024-12-31',
        code: 'HARVEST50',
        type: 'discount'
      },
      {
        id: 2,
        title: 'Free Shipping Voucher',
        description: 'Free delivery on any order',
        discount: 'FREE SHIPPING',
        minSpend: '₱0',
        validUntil: '2024-12-25',
        code: 'FREESHIP',
        type: 'shipping'
      },
      {
        id: 3,
        title: 'Weekend Special',
        description: '20% off on vegetables',
        discount: '20% OFF',
        minSpend: '₱200',
        validUntil: '2024-12-29',
        code: 'WEEKEND20',
        type: 'percentage'
      }
    ],
    used: [
      {
        id: 4,
        title: 'New Customer Bonus',
        description: '₱100 off first order',
        discount: '₱100 OFF',
        usedOn: '2024-12-15',
        savedAmount: '₱100'
      }
    ],
    expired: [
      {
        id: 5,
        title: 'Black Friday Deal',
        description: '30% off everything',
        discount: '30% OFF',
        expiredOn: '2024-11-30'
      }
    ]
  });

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'shipping':
        return <Gift className="w-5 h-5" />;
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      default:
        return <Coins className="w-5 h-5" />;
    }
  };

  const getVoucherColor = (type: string) => {
    switch (type) {
      case 'shipping':
        return 'from-blue-500 to-blue-600';
      case 'percentage':
        return 'from-green-500 to-green-600';
      default:
        return 'from-purple-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Gift className="w-6 h-6 text-farm-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">My Vouchers</h1>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Available ({vouchers.available.length})
            </TabsTrigger>
            <TabsTrigger value="used">
              Used ({vouchers.used.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({vouchers.expired.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.available.map((voucher) => (
                <Card key={voucher.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getVoucherColor(voucher.type)}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getVoucherColor(voucher.type)} flex items-center justify-center text-white`}>
                        {getVoucherIcon(voucher.type)}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Valid
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{voucher.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${getVoucherColor(voucher.type)} bg-clip-text text-transparent`}>
                        {voucher.discount}
                      </div>
                      <p className="text-sm text-gray-600">{voucher.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Min. spend: {voucher.minSpend}</p>
                        <p>Valid until: {new Date(voucher.validUntil).toLocaleDateString()}</p>
                        <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                          Code: {voucher.code}
                        </p>
                      </div>
                      <Button className="w-full bg-farm-green-600 hover:bg-farm-green-700">
                        Use Voucher
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="used">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.used.map((voucher) => (
                <Card key={voucher.id} className="relative opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white">
                        <Gift className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Used
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-600">{voucher.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-gray-500">
                        {voucher.discount}
                      </div>
                      <p className="text-sm text-gray-500">{voucher.description}</p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Used on: {new Date(voucher.usedOn).toLocaleDateString()}</p>
                        <p>You saved: {voucher.savedAmount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expired">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.expired.map((voucher) => (
                <Card key={voucher.id} className="relative opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <Badge variant="destructive">
                        Expired
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-500">{voucher.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-gray-400">
                        {voucher.discount}
                      </div>
                      <p className="text-sm text-gray-400">{voucher.description}</p>
                      <div className="text-xs text-gray-400">
                        <p>Expired on: {new Date(voucher.expiredOn).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default MyVouchers;
