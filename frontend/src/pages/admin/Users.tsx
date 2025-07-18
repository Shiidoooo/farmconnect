
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Eye, Ban, CheckCircle, UserPlus } from "lucide-react";
import { useState } from "react";

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const users = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      type: "Customer",
      status: "Active",
      joinDate: "2024-01-15",
      orders: 12,
      spent: "₱2,340"
    },
    {
      id: 2,
      name: "Sarah's Garden",
      email: "sarah@garden.com",
      type: "Seller",
      status: "Active",
      joinDate: "2023-12-20",
      orders: 156,
      spent: "₱15,240"
    },
    {
      id: 3,
      name: "Maria Santos",
      email: "maria@example.com",
      type: "Customer",
      status: "Active",
      joinDate: "2024-01-10",
      orders: 8,
      spent: "₱1,890"
    },
    {
      id: 4,
      name: "Green Thumb Co.",
      email: "info@greenthumb.com",
      type: "Seller",
      status: "Pending",
      joinDate: "2024-01-14",
      orders: 0,
      spent: "₱0"
    },
    {
      id: 5,
      name: "Pedro Garcia",
      email: "pedro@example.com",
      type: "Customer",
      status: "Suspended",
      joinDate: "2023-11-25",
      orders: 23,
      spent: "₱4,567"
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === "all" || 
                         user.type.toLowerCase() === userFilter ||
                         user.status.toLowerCase() === userFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Customer": return "bg-blue-100 text-blue-800";
      case "Seller": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customers and sellers</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 mt-4 sm:mt-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600">
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="seller">Sellers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Users ({filteredUsers.length})</CardTitle>
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
                    <TableHead className="dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="dark:border-gray-700">
                      <TableCell>
                        <div>
                          <p className="font-medium dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(user.type)}>
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{user.joinDate}</TableCell>
                      <TableCell className="dark:text-gray-300">{user.orders}</TableCell>
                      <TableCell className="font-medium text-red-600 dark:text-red-400">{user.spent}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === "Active" ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : user.status === "Suspended" ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No users found</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setUserFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
