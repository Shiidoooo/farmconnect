import { BarChart3, ShoppingBag, Package, TrendingUp, MessageSquare, HelpCircle, Settings, ChevronLeft, Sun, Moon, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Logo from "../Logo";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutDialog(false);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin panel",
    });
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const menuItems = [
    {
      section: "GENERAL",
      items: [
        { name: "Dashboard", path: "/admin", icon: BarChart3 },
        { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
        { name: "Products", path: "/admin/products", icon: Package },
        { name: "Analytics", path: "/admin/analytics", icon: TrendingUp },
        { name: "Messages", path: "/admin/messages", icon: MessageSquare },
      ]
    },
    {
      section: "HELP & SETTINGS",
      items: [
        { name: "Customer support", path: "/admin/support", icon: HelpCircle },
        { name: "Settings", path: "/admin/settings", icon: Settings },
      ]
    }
  ];

  return (
    <>
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 shadow-sm min-h-screen border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 flex-1">
          {/* Header with Logo and Collapse Button */}
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed && (
              <Logo to="/admin" />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Admin User Info */}
          {!isCollapsed && user && (
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div className={`${isCollapsed ? 'flex justify-center' : 'flex items-center justify-between'} mb-6 px-2`}>
            {!isCollapsed && <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-6">
            {menuItems.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    {section.section}
                  </h3>
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                        location.pathname === item.path
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  ))}
                </nav>
                {isCollapsed && sectionIndex < menuItems.length - 1 && (
                  <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>

          {/* Collapsed Logo */}
          {isCollapsed && (
            <div className="mt-8 flex justify-center">
              <Logo showText={false} clickable={false} />
            </div>
          )}
        </div>

        {/* Logout Button at Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleLogoutClick}
            className={`w-full ${isCollapsed ? 'px-2' : 'px-3'} py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-600" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to logout from the admin panel? You will need to login again to access admin features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleLogoutCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSidebar;
