import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { walletAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Trash2,
  DollarSign
} from "lucide-react";

interface EWallet {
  _id: string;
  AccountNumer: string;
  AccountHolderName: string;
  AccountBalance: number;
  EwalletType: string;
}

interface WalletData {
  defaultWallet: number;
  ewallets: EWallet[];
}

const WalletSection = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [walletData, setWalletData] = useState<WalletData>({
    defaultWallet: 0,
    ewallets: []
  });
  const [loading, setLoading] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(true);
  
  // Transaction states
  const [cashInDialog, setCashInDialog] = useState(false);
  const [cashOutDialog, setCashOutDialog] = useState(false);
  const [connectEwalletDialog, setConnectEwalletDialog] = useState(false);
  
  const [transactionAmount, setTransactionAmount] = useState('');
  const [selectedEwallet, setSelectedEwallet] = useState('');
  
  // Connect E-wallet form state
  const [connectStep, setConnectStep] = useState(1); // 1: Select Type, 2: Enter Account Number and PIN
  const [selectedEwalletType, setSelectedEwalletType] = useState('');
  const [connectForm, setConnectForm] = useState({
    AccountNumer: '',
    pin: ''
  });

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await walletAPI.getWallet();
        if (response.success) {
          setWalletData(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching wallet:', error);
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive",
        });
      } finally {
        setFetchingWallet(false);
      }
    };

    fetchWalletData();
  }, [toast]);

  // Handle e-wallet type selection
  const handleEwalletTypeSelect = (type: string) => {
    setSelectedEwalletType(type);
    setConnectStep(2); // Go directly to account number and PIN entry
  };

  // Reset connect dialog
  const resetConnectDialog = () => {
    setConnectStep(1);
    setSelectedEwalletType('');
    setConnectForm({ AccountNumer: '', pin: '' });
    setConnectEwalletDialog(false);
  };

  const handleCashIn = async () => {
    if (!transactionAmount || !selectedEwallet) {
      toast({
        title: "Error",
        description: "Please enter amount and select an e-wallet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.cashIn(parseFloat(transactionAmount), selectedEwallet);
      if (response.success) {
        setWalletData(prev => ({
          ...prev,
          defaultWallet: response.data.defaultWallet,
          ewallets: prev.ewallets.map(ewallet => 
            ewallet._id === selectedEwallet 
              ? { ...ewallet, AccountBalance: response.data.ewalletBalance }
              : ewallet
          )
        }));
        
        // Update user context with new wallet balance
        updateUser({ ...user, defaultWallet: response.data.defaultWallet });
        
        toast({
          title: "Success",
          description: response.message,
        });
        
        setCashInDialog(false);
        setTransactionAmount('');
        setSelectedEwallet('');
      }
    } catch (error: any) {
      console.error('Error cashing in:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cash in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = async () => {
    if (!transactionAmount || !selectedEwallet) {
      toast({
        title: "Error",
        description: "Please enter amount and select an e-wallet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.cashOut(parseFloat(transactionAmount), selectedEwallet);
      if (response.success) {
        setWalletData(prev => ({
          ...prev,
          defaultWallet: response.data.defaultWallet,
          ewallets: prev.ewallets.map(ewallet => 
            ewallet._id === selectedEwallet 
              ? { ...ewallet, AccountBalance: response.data.ewalletBalance }
              : ewallet
          )
        }));
        
        // Update user context with new wallet balance
        updateUser({ ...user, defaultWallet: response.data.defaultWallet });
        
        toast({
          title: "Success",
          description: response.message,
        });
        
        setCashOutDialog(false);
        setTransactionAmount('');
        setSelectedEwallet('');
      }
    } catch (error: any) {
      console.error('Error cashing out:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cash out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectEwallet = async () => {
    if (!connectForm.AccountNumer || !connectForm.pin) {
      toast({
        title: "Error",
        description: "Please enter account number and PIN",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.connectEwallet(connectForm);
      if (response.success) {
        setWalletData(prev => ({
          ...prev,
          ewallets: [...prev.ewallets, response.data.ewallet]
        }));
        
        toast({
          title: "Success",
          description: response.message,
        });
        
        resetConnectDialog();
      }
    } catch (error: any) {
      console.error('Error connecting e-wallet:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to connect e-wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectEwallet = async (ewalletId: string) => {
    setLoading(true);
    try {
      const response = await walletAPI.disconnectEwallet(ewalletId);
      if (response.success) {
        setWalletData(prev => ({
          ...prev,
          ewallets: prev.ewallets.filter(ewallet => ewallet._id !== ewalletId)
        }));
        
        toast({
          title: "Success",
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error('Error disconnecting e-wallet:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to disconnect e-wallet",
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

  if (fetchingWallet) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          My Wallet
        </CardTitle>
      </CardHeader>
      
      {/* Wallet Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-farm-red-600 to-farm-red-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-farm-red-100 text-sm">Default Wallet Balance</p>
              <h2 className="text-3xl font-bold">₱{walletData.defaultWallet.toFixed(2)}</h2>
            </div>
            <div className="text-4xl opacity-50">
              <DollarSign className="w-12 h-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Dialog open={cashInDialog} onOpenChange={setCashInDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={walletData.ewallets.length === 0}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Cash In
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cash In to Wallet</DialogTitle>
              <DialogDescription>
                Transfer money from your e-wallet to your default wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select E-wallet</label>
                <Select value={selectedEwallet} onValueChange={setSelectedEwallet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose e-wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletData.ewallets.map((ewallet) => (
                      <SelectItem key={ewallet._id} value={ewallet._id}>
                        {getEwalletTypeIcon(ewallet.EwalletType)} {ewallet.EwalletType.toUpperCase()} - ${ewallet.AccountBalance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCashInDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCashIn} disabled={loading}>
                {loading ? 'Processing...' : 'Cash In'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cashOutDialog} onOpenChange={setCashOutDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="border-red-600 text-red-600 hover:bg-red-50" 
              disabled={walletData.ewallets.length === 0 || walletData.defaultWallet <= 0}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Cash Out
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cash Out from Wallet</DialogTitle>
              <DialogDescription>
                Transfer money from your default wallet to your e-wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  min="0"
                  max={walletData.defaultWallet}
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${walletData.defaultWallet.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select E-wallet</label>
                <Select value={selectedEwallet} onValueChange={setSelectedEwallet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose e-wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletData.ewallets.map((ewallet) => (
                      <SelectItem key={ewallet._id} value={ewallet._id}>
                        {getEwalletTypeIcon(ewallet.EwalletType)} {ewallet.EwalletType.toUpperCase()} - {ewallet.AccountNumer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCashOutDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCashOut} disabled={loading}>
                {loading ? 'Processing...' : 'Cash Out'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* E-wallets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Connected E-wallets</h3>
          <div className="flex gap-2">
            <Dialog open={connectEwalletDialog} onOpenChange={(open) => open ? setConnectEwalletDialog(true) : resetConnectDialog()}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect E-wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {connectStep === 1 && "Select E-wallet Type"}
                    {connectStep === 2 && "Enter Account Details"}
                  </DialogTitle>
                  <DialogDescription>
                    {connectStep === 1 && "Choose the type of e-wallet you want to connect"}
                    {connectStep === 2 && "Enter your account number and PIN to verify ownership"}
                  </DialogDescription>
                </DialogHeader>

                {/* Step 1: Select E-wallet Type */}
                {connectStep === 1 && (
                  <div className="space-y-3">
                    {['gcash', 'paymaya', 'paypal', 'bdo', 'bpi', 'unionbank'].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="w-full justify-start h-12"
                        onClick={() => handleEwalletTypeSelect(type)}
                        disabled={loading}
                      >
                        <span className="text-xl mr-3">{getEwalletTypeIcon(type)}</span>
                        <span className="capitalize font-medium">{type}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Step 2: Enter Account Number and PIN */}
                {connectStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Connecting to:</p>
                      <p className="font-medium">{selectedEwalletType.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Number</label>
                      <Input
                        type="text"
                        placeholder="Enter your account number"
                        value={connectForm.AccountNumer}
                        onChange={(e) => setConnectForm(prev => ({ ...prev, AccountNumer: e.target.value }))}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your existing {selectedEwalletType.toUpperCase()} account number
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">PIN</label>
                      <Input
                        type="password"
                        placeholder="Enter your 4-6 digit PIN"
                        value={connectForm.pin}
                        onChange={(e) => setConnectForm(prev => ({ ...prev, pin: e.target.value }))}
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This verifies that you own this account
                      </p>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {connectStep > 1 && (
                    <Button variant="outline" onClick={() => setConnectStep(connectStep - 1)}>
                      Back
                    </Button>
                  )}
                  <Button variant="outline" onClick={resetConnectDialog}>
                    Cancel
                  </Button>
                  {connectStep === 2 && (
                    <Button onClick={handleConnectEwallet} disabled={loading || !connectForm.AccountNumer || !connectForm.pin}>
                      {loading ? 'Connecting...' : 'Connect Account'}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>


          </div>
        </div>

        {walletData.ewallets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No E-wallets Connected</h4>
              <p className="text-gray-500 mb-4">
                Connect an existing e-wallet account to enable cash in and cash out operations
              </p>
              <div className="flex justify-center">
                <Button onClick={() => setConnectEwalletDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect E-wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {walletData.ewallets.map((ewallet) => (
              <Card key={ewallet._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getEwalletTypeIcon(ewallet.EwalletType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">
                            {ewallet.EwalletType.toUpperCase()}
                          </h4>
                          <Badge variant="secondary">
                            {ewallet.AccountNumer}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{ewallet.AccountHolderName}</p>
                        <p className="text-sm font-medium text-green-600">
                          Balance: ₱{ewallet.AccountBalance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectEwallet(ewallet._id)}
                      disabled={loading}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSection;
