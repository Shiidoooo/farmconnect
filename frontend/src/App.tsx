import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRoute from "@/components/admin/AdminRoute";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Store from "./pages/Store";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import BanksCards from "./pages/BanksCards";
import Addresses from "./pages/Addresses";
import ChangePassword from "./pages/ChangePassword";
import PrivacySettings from "./pages/PrivacySettings";
import NotificationSettings from "./pages/NotificationSettings";
import Notifications from "./pages/Notifications";
import MyVouchers from "./pages/MyVouchers";
import HarvestConnectCoins from "./pages/HarvestConnectCoins";
import CreateWallet from "./pages/CreateWallet";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Community from "./pages/Community";
import Weather from "./pages/Weather";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminSupport from "./pages/admin/Support";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/store/:sellerId" element={<Store />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/community" element={<Community />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/banks-cards" element={<BanksCards />} />
            <Route path="/profile/addresses" element={<Addresses />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/profile/privacy-settings" element={<PrivacySettings />} />
            <Route path="/profile/notification-settings" element={<NotificationSettings />} />
            <Route path="/profile/notifications" element={<Notifications />} />
            <Route path="/profile/vouchers" element={<MyVouchers />} />
            <Route path="/profile/coins" element={<HarvestConnectCoins />} />
            <Route path="/create-wallet" element={<CreateWallet />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
