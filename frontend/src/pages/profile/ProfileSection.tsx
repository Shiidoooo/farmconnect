import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";

const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Initialize form data with user data if available
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone_number: user?.phone_number || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(!user); // Only show loading if no user data
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Pre-populate form with user data from auth context and fetch latest data
  useEffect(() => {
    // First, pre-populate with existing user data from context
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        phone_number: user.phone_number || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
      setFetchingProfile(false); // If we have user data, we can show the form immediately
    }

    // Only fetch profile data from server if we don't have user data or on component mount
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          const userData = response.data.user;
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            address: userData.address || '',
            phone_number: userData.phone_number || '',
            gender: userData.gender || '',
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : ''
          });
          // Update auth context with latest data
          updateUser(userData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (!user) { // Only show error if we don't have any user data
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    // Only fetch if we don't have user data initially
    if (!user) {
      fetchUserProfile();
    }
  }, []); // Remove all dependencies to prevent infinite loop

  // Cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setProfileImageFile(file);
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', profileImageFile);

      const response = await authAPI.updateProfilePicture(formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
        updateUser(response.data.user);
        setProfileImageFile(null);
        setPreviewUrl(null);
        return response.data.user.profilePicture;
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      if (response.success) {
        updateUser(response.data.user);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading latest profile data...</div>
      </div>
    );
  }

  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Profile Information</CardTitle>
      </CardHeader>
      
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={previewUrl || user?.profilePicture?.url || "/placeholder.svg"} 
              alt={user?.name || "Profile"} 
            />
            <AvatarFallback className="bg-farm-red-600 text-white text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* Upload Button Overlay */}
          <div className="absolute -bottom-2 -right-2">
            <label htmlFor="profile-picture-upload" className="cursor-pointer">
              <div className="bg-farm-red-600 hover:bg-farm-red-700 text-white rounded-full p-2 shadow-lg transition-colors">
                <Camera className="w-4 h-4" />
              </div>
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
          <p className="text-sm text-gray-600">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}</p>
          <p className="text-sm text-gray-600">Wallet Balance: ₱{user?.defaultWallet || 0}</p>
          
          {/* Profile Picture Actions */}
          {profileImageFile && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                size="sm"
                onClick={uploadProfileImage}
                disabled={uploadingImage}
                className="bg-farm-red-600 hover:bg-farm-red-700 text-white"
              >
                {uploadingImage ? (
                  <>
                    <Upload className="w-3 h-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-1" />
                    Save Picture
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setProfileImageFile(null);
                  setPreviewUrl(null);
                }}
                disabled={uploadingImage}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <Input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <Input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input 
              type="tel" 
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="Enter your phone number" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <Input 
              type="date" 
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <Input 
              type="text" 
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your address" 
              required
            />
          </div>
        </div>
        <div className="mt-6">
          <Button 
            type="submit"
            disabled={loading}
            className="bg-farm-red-600 hover:bg-farm-red-700 text-white"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;
