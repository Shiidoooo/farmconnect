import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { walletAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, 
  Plus,
  CreditCard,
  Shield,
  Info
} from "lucide-react";

const CreateWallet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  // Create Account form state
  const [createForm, setCreateForm] = useState({
    AccountNumer: '',
    AccountHolderName: '',
    EwalletType: '',
    pin: '',
    AccountBalance: 1000
  });

  const handleCreateAccount = async () => {
    if (!createForm.AccountNumer || !createForm.AccountHolderName || !createForm.EwalletType || !createForm.pin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (createForm.pin.length < 4 || createForm.pin.length > 6) {
      toast({
        title: "Error",
        description: "PIN must be 4-6 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.createEwalletAccount(createForm);
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        
        // Reset form
        setCreateForm({
          AccountNumer: '',
          AccountHolderName: '',
          EwalletType: '',
          pin: '',
          AccountBalance: 1000
        });
      }
    } catch (error: any) {
      console.error('Error creating e-wallet account:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create e-wallet account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEwalletTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gcash':
        return '💙';
      case 'paymaya':
        return '💚';
      case 'paypal':
        return '💛';
      case 'bdo':
      case 'bpi':
      case 'unionbank':
        return '🏦';
      default:
        return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-farm-red-600" />
            Create E-wallet Account
          </h1>
          <p className="text-gray-600">
            Create new e-wallet accounts for testing and demo purposes. This is typically used for administrative tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New E-wallet Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <Input
                      placeholder="Enter unique account number"
                      value={createForm.AccountNumer}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, AccountNumer: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be unique across all e-wallets
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                    <Input
                      placeholder="Enter account holder name"
                      value={createForm.AccountHolderName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, AccountHolderName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">E-wallet Type</label>
                    <Select 
                      value={createForm.EwalletType} 
                      onValueChange={(value) => setCreateForm(prev => ({ ...prev, EwalletType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select e-wallet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gcash">
                          <span className="flex items-center gap-2">
                            💙 GCash
                          </span>
                        </SelectItem>
                        <SelectItem value="paymaya">
                          <span className="flex items-center gap-2">
                            💚 PayMaya
                          </span>
                        </SelectItem>
                        <SelectItem value="paypal">
                          <span className="flex items-center gap-2">
                            💛 PayPal
                          </span>
                        </SelectItem>
                        <SelectItem value="bdo">
                          <span className="flex items-center gap-2">
                            🏦 BDO
                          </span>
                        </SelectItem>
                        <SelectItem value="bpi">
                          <span className="flex items-center gap-2">
                            🏦 BPI
                          </span>
                        </SelectItem>
                        <SelectItem value="unionbank">
                          <span className="flex items-center gap-2">
                            🏦 UnionBank
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">PIN (4-6 digits)</label>
                    <Input
                      type="password"
                      placeholder="Enter 4-6 digit PIN"
                      value={createForm.pin}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, pin: e.target.value }))}
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for account verification
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Initial Balance</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={createForm.AccountBalance}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, AccountBalance: parseFloat(e.target.value) || 1000 }))}
                    min="0"
                    step="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Starting balance for the new account
                  </p>
                </div>

                <div>
                  <Button 
                    onClick={handleCreateAccount} 
                    disabled={loading}
                    className="bg-farm-red-600 hover:bg-farm-red-700"
                  >
                    {loading ? 'Creating...' : 'Create E-wallet Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Info className="w-5 h-5" />
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Purpose</h4>
                  <p className="text-sm text-gray-600">
                    This page is for creating new e-wallet accounts that users can later connect to their profiles.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">How it Works</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Create an e-wallet account here</li>
                    <li>Users can connect to it using account number + PIN</li>
                    <li>Multiple users can connect to the same account</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">PIN Requirements</h4>
                  <p className="text-sm text-gray-600">4-6 digits, stored securely</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Account Numbers</h4>
                  <p className="text-sm text-gray-600">Must be unique across all e-wallets</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Access Control</h4>
                  <p className="text-sm text-gray-600">Only verified users can connect</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <CreditCard className="w-5 h-5" />
                  Supported E-wallets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['gcash', 'paymaya', 'paypal', 'bdo', 'bpi', 'unionbank'].map((type) => (
                    <div key={type} className="flex items-center gap-2 text-sm">
                      <span>{getEwalletTypeIcon(type)}</span>
                      <span className="capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateWallet;
