import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import { useState } from "react";

const Addresses = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'Juan Dela Cruz',
      phone: '+63 917 123 4567',
      address: '123 Main Street, Barangay San Roque, Quezon City, Metro Manila 1100',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      name: 'Juan Dela Cruz',
      phone: '+63 917 123 4567',
      address: '456 Business District, Makati City, Metro Manila 1200',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-farm-green-600 hover:bg-farm-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </div>

        {/* Existing Addresses */}
        <div className="space-y-4 mb-6">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-farm-green-100 rounded-full flex items-center justify-center">
                    {address.type === 'Home' ? (
                      <Home className="w-5 h-5 text-farm-green-600" />
                    ) : (
                      <Building className="w-5 h-5 text-farm-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-800">{address.type}</h3>
                      {address.isDefault && (
                        <Badge className="bg-red-500 text-white">Default</Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-700">{address.name}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600 mt-1">{address.address}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
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

        {/* Add New Address Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input placeholder="Juan Dela Cruz" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input placeholder="+63 917 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Region</label>
                  <Input placeholder="Metro Manila" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input placeholder="Quezon City" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Barangay</label>
                  <Input placeholder="San Roque" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code</label>
                  <Input placeholder="1100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <Textarea placeholder="House number, street name, building, etc." />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="addressType" value="home" className="text-farm-green-600" />
                  <span>Home</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="addressType" value="office" className="text-farm-green-600" />
                  <span>Office</span>
                </label>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button className="bg-farm-green-600 hover:bg-farm-green-700">
                  Save Address
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

export default Addresses;
