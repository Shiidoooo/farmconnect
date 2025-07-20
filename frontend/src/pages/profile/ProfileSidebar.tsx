import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Package2, 
  MapPin, 
  Lock, 
  Package,
  Wallet,
  BarChart3
} from "lucide-react";

interface ProfileSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileSidebar = ({ activeSection, setActiveSection }: ProfileSidebarProps) => {
  const { user } = useAuth();

  const menuItems = [
    {
      category: "My Account",
      items: [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'wallet', label: 'My Wallet', icon: Wallet },
        { id: 'my-products', label: 'My Products', icon: Package2 },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'change-password', label: 'Change Password', icon: Lock },
      ]
    },
    {
      category: "Reports",
      items: [
        { id: 'reports', label: 'Sales & Purchase Reports', icon: BarChart3 },
      ]
    },
    {
      category: "My Business",
      items: [
        { id: 'my-sales', label: 'My Sales', icon: Package },
      ]
    },
    {
      category: "My Purchase",
      items: [
        { id: 'purchase', label: 'My Purchase', icon: Package },
      ]
    }
  ];

  return (
    <Card className="sticky top-24">
      <CardContent className="p-0">
        <div className="p-4 border-b bg-farm-red-50">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.profilePicture?.url || "/placeholder.svg"} />
              <AvatarFallback className="bg-farm-red-600 text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-800">{user?.name || 'User'}</h3>
              <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          {menuItems.map((category) => (
            <div key={category.category} className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-farm-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
