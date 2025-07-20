import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AddressMapSelector from "@/components/AddressMapSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Home, Building, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Addresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    city: '',
    barangay: '',
    street: '',
    landmark: '',
    coordinates: { lat: 14.5995, lng: 120.9842 }, // Default to Manila
    locationComment: ''
  });

  // Load user addresses on component mount
  useEffect(() => {
    if (user) {
      loadUserAddresses();
    }
  }, [user]);

  const loadUserAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      } else {
        console.error('Failed to load addresses:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      city: addressData.city,
      barangay: addressData.barangay,
      street: addressData.street,
      landmark: addressData.landmark,
      coordinates: { lat: addressData.latitude, lng: addressData.longitude },
      locationComment: addressData.locationComment
    }));
  };

  const handleSaveAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to manage addresses');
        return;
      }

      const addressData = {
        type: formData.type,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        barangay: formData.barangay,
        street: formData.street,
        landmark: formData.landmark,
        coordinates: formData.coordinates,
        locationComment: formData.locationComment
      };

      const url = editingAddress 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/users/addresses/${editingAddress.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/users/addresses`;
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        await loadUserAddresses();
        setShowAddForm(false);
        setEditingAddress(null);
        resetForm();
        alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please try again.');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      barangay: address.barangay,
      street: address.street,
      landmark: address.landmark || '',
      coordinates: address.coordinates || { lat: 14.5995, lng: 120.9842 },
      locationComment: address.locationComment || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please log in to manage addresses');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await loadUserAddresses();
          alert('Address deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete address');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Error deleting address. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Home',
      fullName: '',
      phone: '',
      city: '',
      barangay: '',
      street: '',
      landmark: '',
      coordinates: { lat: 14.5995, lng: 120.9842 },
      locationComment: ''
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    resetForm();
  };

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
          {addresses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No addresses yet</h3>
                <p className="text-gray-500 mb-4">Add your first address to start shopping with us</p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-farm-green-600 hover:bg-farm-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </CardContent>
            </Card>
          ) : (
            addresses.map((address) => (
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
                      <p className="font-medium text-gray-700">{address.fullName}</p>
                      <p className="text-gray-600">{address.phone}</p>
                      <p className="text-gray-600 mt-1">
                        {address.street}, {address.barangay}, {address.city}
                        {address.landmark && ` (${address.landmark})`}
                      </p>
                      {address.locationComment && (
                        <p className="text-sm text-gray-500 mt-1">{address.locationComment}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                    placeholder="Juan Dela Cruz" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="+63 917 123 4567" 
                  />
                </div>
              </div>

              {/* Address Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Address Type</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="addressType" 
                      value="Home" 
                      checked={formData.type === 'Home'}
                      onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                      className="text-farm-green-600 focus:ring-farm-green-500" 
                    />
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="addressType" 
                      value="Office" 
                      checked={formData.type === 'Office'}
                      onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                      className="text-farm-green-600 focus:ring-farm-green-500" 
                    />
                    <Building className="w-4 h-4" />
                    <span>Office</span>
                  </label>
                </div>
              </div>

              {/* Address Selection with Map */}
              <div>
                <label className="block text-sm font-medium mb-3">Location & Address</label>
                <AddressMapSelector
                  onAddressChange={handleAddressSelect}
                  initialAddress={{
                    city: formData.city,
                    barangay: formData.barangay,
                    street: formData.street,
                    landmark: formData.landmark,
                    latitude: formData.coordinates.lat,
                    longitude: formData.coordinates.lng,
                    locationComment: formData.locationComment
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button 
                  onClick={handleSaveAddress}
                  className="bg-farm-green-600 hover:bg-farm-green-700"
                  disabled={!formData.fullName || !formData.phone || !formData.city || !formData.barangay}
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
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
