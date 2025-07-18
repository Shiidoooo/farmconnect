import { CardHeader, CardTitle, Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AddressesSection = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize address from user data
  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleSave = async () => {
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Address cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfile({ address });
      if (response.success) {
        updateUser(response.data.user);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      }
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAddress(user?.address || '');
    setIsEditing(false);
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Addresses</CardTitle>
        <p className="text-sm text-gray-600">Manage your delivery addresses</p>
      </CardHeader>
      <div className="space-y-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-2">Primary Address</h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full address"
                        rows={3}
                        className="w-full"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          size="sm"
                          className="bg-farm-red-600 hover:bg-farm-red-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {user?.address || 'No address set'}
                      </p>
                      {!user?.address && (
                        <p className="text-xs text-gray-500 mt-1">
                          Please add your address for delivery purposes
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {user?.address ? 'Edit' : 'Add'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Address Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">📍 Address Tips</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include your full street address with house/apartment number</li>
            <li>• Add city, state/province, and postal code</li>
            <li>• Include any special delivery instructions</li>
            <li>• Make sure the address is complete and accurate for delivery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddressesSection;
