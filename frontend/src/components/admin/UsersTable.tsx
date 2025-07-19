import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { adminApiService } from "../../services/adminApi";
import { 
  Search, 
  Eye, 
  Ban, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  Loader,
  Trash2,
  Edit,
  Store,
  User as UserIcon
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  accountStatus: 'active' | 'suspended' | 'deleted';
  userType: 'Customer' | 'Seller';
  productCount: number;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastLogin?: string;
  createdAt: string;
  products?: any[];
  recentOrders?: any[];
  statistics?: {
    totalOrders: number;
    totalSpent: number;
    completedOrders: number;
    averageOrderValue: number;
  };
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter, typeFilter]);

  // Listen for refresh events from parent component
  useEffect(() => {
    const handleRefreshEvent = () => {
      fetchUsers();
    };

    window.addEventListener('refreshUsersTable', handleRefreshEvent);
    return () => window.removeEventListener('refreshUsersTable', handleRefreshEvent);
  }, []);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApiService.getAllUsers({
        page,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        // Ensure all users have required properties with default values
        const sanitizedUsers = response.data.map((user: any) => ({
          ...user,
          name: user.name || 'Unknown User',
          email: user.email || 'No email',
          accountStatus: user.accountStatus || 'active',
          userType: user.userType || 'Customer',
          totalOrders: user.totalOrders || 0,
          totalSpent: user.totalSpent || 0,
          productCount: user.productCount || 0,
          joinDate: user.joinDate || user.createdAt,
        }));
        
        setUsers(sanitizedUsers);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = searchQuery === "" || 
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.phone && user.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || (user.accountStatus && user.accountStatus === statusFilter);
      const matchesType = typeFilter === "all" || (user.userType && user.userType.toLowerCase() === typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });

    setFilteredUsers(filtered);
  };

  const handleViewUser = async (user: User) => {
    try {
      setActionLoading(true);
      const response = await adminApiService.getUserById(user._id);
      
      if (response.success) {
        setSelectedUser(response.data);
        setShowUserDialog(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      setActionLoading(true);
      const response = await adminApiService.updateUserStatus(userId, newStatus);
      
      if (response.success) {
        // Update user in the list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, accountStatus: newStatus }
              : user
          )
        );

        toast({
          title: "Success",
          description: `User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`,
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setActionLoading(true);
      const response = await adminApiService.deleteUser(userToDelete._id);
      
      if (response.success) {
        // Remove user from the list
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
        
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Customer": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Seller": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₱0.00';
    }
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">
            Users ({filteredUsers.length} of {pagination.totalUsers})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">User</TableHead>
                  <TableHead className="dark:text-gray-300">Type</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="dark:text-gray-300">Join Date</TableHead>
                  <TableHead className="dark:text-gray-300">Orders</TableHead>
                  <TableHead className="dark:text-gray-300">Total Spent</TableHead>
                  <TableHead className="dark:text-gray-300">Products</TableHead>
                  <TableHead className="dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="dark:border-gray-700">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">{user.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(user.userType)}>
                        {user.userType || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.accountStatus)}>
                        {user.accountStatus 
                          ? user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)
                          : 'Unknown'
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {formatDate(user.joinDate)}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {user.totalOrders || 0}
                    </TableCell>
                    <TableCell className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(user.totalSpent)}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {user.userType === 'Seller' ? (user.productCount || 0) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewUser(user)}
                          disabled={actionLoading}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {user.accountStatus === "active" ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleStatusChange(user._id, "suspended")}
                            disabled={actionLoading}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            onClick={() => handleStatusChange(user._id, "active")}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteDialog(true);
                          }}
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No users found</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span>User Details</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>Basic Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  
                  {selectedUser.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{selectedUser.phone}</span>
                    </div>
                  )}
                  
                  {selectedUser.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{selectedUser.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Joined: {formatDate(selectedUser.joinDate)}</span>
                  </div>
                  
                  {selectedUser.lastLogin && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Last Login: {formatDate(selectedUser.lastLogin)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Account Statistics</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Type:</span>
                    <Badge className={getTypeColor(selectedUser.userType)}>
                      {selectedUser.userType}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(selectedUser.accountStatus)}>
                      {selectedUser.accountStatus 
                        ? selectedUser.accountStatus.charAt(0).toUpperCase() + selectedUser.accountStatus.slice(1)
                        : 'Unknown'
                      }
                    </Badge>
                  </div>
                  
                  {selectedUser.statistics && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Orders:</span>
                        <span className="text-sm font-medium">{selectedUser.statistics.totalOrders}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completed Orders:</span>
                        <span className="text-sm font-medium">{selectedUser.statistics.completedOrders}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent:</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(selectedUser.statistics.totalSpent)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Order:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(selectedUser.statistics.averageOrderValue)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Seller Information */}
              {selectedUser.userType === "Seller" && selectedUser.products && (
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center space-x-2">
                    <Store className="w-5 h-5" />
                    <span>Seller Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Products Listed:</span>
                      <span className="text-sm font-medium">{selectedUser.productCount}</span>
                    </div>
                  </div>

                  {selectedUser.products.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Recent Products</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedUser.products.slice(0, 5).map((product: any) => (
                          <div key={product._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm">{product.name}</span>
                            <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Orders */}
              {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 && (
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Recent Orders</span>
                  </h3>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUser.recentOrders.slice(0, 5).map((order: any) => (
                      <div key={order._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <span className="text-sm font-medium">{order.orderNumber}</span>
                          <span className="text-xs text-gray-600 ml-2">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(order.totalAmount)}</div>
                          <Badge className="text-xs">
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Close
            </Button>
            {selectedUser && (
              <Button 
                variant={selectedUser.accountStatus === "active" ? "destructive" : "default"}
                onClick={() => {
                  handleStatusChange(
                    selectedUser._id, 
                    selectedUser.accountStatus === "active" ? "suspended" : "active"
                  );
                  setShowUserDialog(false);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {selectedUser.accountStatus === "active" ? "Suspend User" : "Activate User"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
              The user's account will be deactivated and their products will be removed from listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTable;
