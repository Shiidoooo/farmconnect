import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";

const BanksCards = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      type: 'Credit Card',
      bank: 'BPI',
      number: '**** **** **** 1234',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: 2,
      type: 'Debit Card',
      bank: 'BDO',
      number: '**** **** **** 5678',
      expiry: '08/25',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Cards</h1>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-farm-green-600 hover:bg-farm-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Button>
        </div>

        {/* Existing Cards */}
        <div className="space-y-4 mb-6">
          {cards.map((card) => (
            <Card key={card.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">{card.bank} {card.type}</h3>
                        {card.isDefault && (
                          <Badge variant="secondary" className="bg-farm-green-100 text-farm-green-700">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{card.number}</p>
                      <p className="text-sm text-gray-500">Expires {card.expiry}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Card Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                  <Input placeholder="Juan Dela Cruz" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <Input placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <Input placeholder="123" type="password" />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button className="bg-farm-green-600 hover:bg-farm-green-700">
                  Add Card
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BanksCards;
