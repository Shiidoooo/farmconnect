
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Plus, Minus, Calendar, Gift, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

const HarvestConnectCoins = () => {
  const currentBalance = 1250;
  const [transactions] = useState([
    {
      id: 1,
      type: 'earned',
      amount: 50,
      description: 'Purchase reward - Order ORD-001',
      date: '2024-12-20',
      icon: ShoppingCart
    },
    {
      id: 2,
      type: 'earned',
      amount: 25,
      description: 'Product review bonus',
      date: '2024-12-18',
      icon: Star
    },
    {
      id: 3,
      type: 'spent',
      amount: -100,
      description: 'Discount on Order ORD-002',
      date: '2024-12-15',
      icon: Minus
    },
    {
      id: 4,
      type: 'earned',
      amount: 200,
      description: 'Welcome bonus',
      date: '2024-12-10',
      icon: Gift
    },
    {
      id: 5,
      type: 'earned',
      amount: 75,
      description: 'Purchase reward - Order ORD-003',
      date: '2024-12-08',
      icon: ShoppingCart
    }
  ]);

  const earnCoinsWays = [
    {
      title: 'Make a Purchase',
      description: 'Earn 1 coin for every ₱10 spent',
      coins: '1 coin / ₱10',
      icon: ShoppingCart
    },
    {
      title: 'Write Reviews',
      description: 'Get coins for reviewing products',
      coins: '25 coins',
      icon: Star
    },
    {
      title: 'Daily Check-in',
      description: 'Log in daily to earn bonus coins',
      coins: '5-10 coins',
      icon: Calendar
    },
    {
      title: 'Refer Friends',
      description: 'Invite friends and earn when they shop',
      coins: '100 coins',
      icon: Gift
    }
  ];

  const rewardTiers = [
    { coins: 100, discount: '₱10 OFF', available: true },
    { coins: 250, discount: '₱25 OFF', available: true },
    { coins: 500, discount: '₱50 OFF', available: true },
    { coins: 1000, discount: '₱100 OFF', available: true },
    { coins: 2000, discount: '₱200 OFF', available: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Coins className="w-6 h-6 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-800">HarvestConnect Coins</h1>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-2">Current Balance</p>
                <div className="flex items-center space-x-2">
                  <Coins className="w-8 h-8" />
                  <span className="text-3xl font-bold">{currentBalance.toLocaleString()}</span>
                  <span className="text-lg">coins</span>
                </div>
                <p className="text-yellow-100 text-sm mt-2">
                  Equivalent to ₱{(currentBalance * 0.1).toFixed(2)} in discounts
                </p>
              </div>
              <div className="text-right">
                <Button className="bg-white text-yellow-600 hover:bg-yellow-50">
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem Coins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Transaction History</TabsTrigger>
            <TabsTrigger value="earn">Ways to Earn</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'earned' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <transaction.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earnCoinsWays.map((way, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <way.icon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-2">{way.title}</h3>
                        <p className="text-gray-600 mb-3">{way.description}</p>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Coins className="w-3 h-3 mr-1" />
                          {way.coins}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="redeem">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardTiers.map((tier, index) => (
                <Card key={index} className={!tier.available ? 'opacity-50' : ''}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{tier.discount}</h3>
                    <p className="text-gray-600 mb-4">
                      <Coins className="w-4 h-4 inline mr-1" />
                      {tier.coins.toLocaleString()} coins
                    </p>
                    <Button 
                      className={`w-full ${
                        tier.available && currentBalance >= tier.coins
                          ? 'bg-farm-green-600 hover:bg-farm-green-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!tier.available || currentBalance < tier.coins}
                    >
                      {currentBalance >= tier.coins ? 'Redeem Now' : 'Insufficient Coins'}
                    </Button>
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

export default HarvestConnectCoins;
