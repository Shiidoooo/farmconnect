import { CardHeader, CardTitle, Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, MapPin, Plus, Trash2, Home, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AddressMapSelector from "@/components/AddressMapSelector";
import { Badge } from "@/components/ui/badge";

const AddressesSection = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
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
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
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
        toast({
          title: "Error",
          description: "Please log in to manage addresses",
          variant: "destructive",
        });
        return;
      }

      if (!formData.fullName || !formData.phone || !formData.city || !formData.barangay) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

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
        toast({
          title: "Success",
          description: editingAddress ? 'Address updated successfully!' : 'Address added successfully!',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || 'Failed to save address',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: 'Error saving address. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      landmark: address.landmark,
      coordinates: address.coordinates || { lat: 14.5995, lng: 120.9842 },
      locationComment: address.locationComment || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadUserAddresses();
        toast({
          title: "Success",
          description: 'Address deleted successfully!',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || 'Failed to delete address',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: 'Error deleting address. Please try again.',
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Home',
      fullName: user?.name || '',
      phone: user?.phone_number || '',
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
    <div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">My Addresses</CardTitle>
            <p className="text-sm text-gray-600">Manage your delivery addresses with map pinning</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-farm-green-600 hover:bg-farm-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {/* Existing Addresses */}
        {addresses.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No addresses yet</h3>
              <p className="text-gray-500 mb-4">Add your first address with map pinning to start shopping with us</p>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="bg-farm-green-600 hover:bg-farm-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className="border border-gray-200">
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

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <Card className="border border-gray-200">
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
                <label className="block text-sm font-medium mb-3">📍 Location & Address</label>
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
                  disabled={loading || !formData.fullName || !formData.phone || !formData.city || !formData.barangay}
                  className="bg-farm-green-600 hover:bg-farm-green-700"
                >
                  {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Address Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">📍 Address Tips</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use the map to pin your exact location for accurate delivery</li>
            <li>• Search for your city/barangay to quickly find your area</li>
            <li>• Include landmarks to help delivery drivers find you easily</li>
            <li>• Add special delivery instructions in the location comment</li>
            <li>• Make sure your contact information is up to date</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddressesSection;
