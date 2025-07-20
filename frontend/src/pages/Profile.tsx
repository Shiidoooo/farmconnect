import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ProfileSection,
  WalletSection,
  MyProductsSection,
  AddressesSection,
  ChangePasswordSection,
  PurchaseSection,
  ProfileSidebar,
  Reports
} from "./profile/index";
import MySalesSection from "./profile/MySalesSection";

const Profile = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const location = useLocation();

  // Check for tab parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'purchase') {
      setActiveSection('purchase');
    } else if (tab === 'wallet') {
      setActiveSection('wallet');
    }
  }, [location]);

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'wallet':
        return <WalletSection />;
      case 'my-products':
        return <MyProductsSection />;
      case 'addresses':
        return <AddressesSection />;
      case 'change-password':
        return <ChangePasswordSection />;
      case 'purchase':
        return <PurchaseSection />;
      case 'my-sales':
        return <MySalesSection />;
      case 'reports':
        return <Reports />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <ProfileSidebar 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <Card>
              <CardContent className="p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;

