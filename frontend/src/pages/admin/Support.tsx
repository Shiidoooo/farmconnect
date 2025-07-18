
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { Phone, Mail, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const AdminSupport = () => {
  const supportTickets = [
    {
      id: "TKT001",
      customer: "Maria Santos",
      email: "maria@email.com",
      subject: "Refund Request",
      priority: "High",
      status: "Open",
      created: "2 hours ago",
      category: "Billing"
    },
    {
      id: "TKT002",
      customer: "Juan Dela Cruz",
      email: "juan@email.com",
      subject: "Product Quality Issue",
      priority: "Medium",
      status: "In Progress",
      created: "4 hours ago",
      category: "Product"
    },
    {
      id: "TKT003",
      customer: "Ana Reyes",
      email: "ana@email.com",
      subject: "Shipping Delay",
      priority: "Low",
      status: "Resolved",
      created: "1 day ago",
      category: "Shipping"
    },
  ];

  const supportStats = [
    { title: "Open Tickets", value: "24", color: "text-red-600", icon: AlertTriangle },
    { title: "Resolved Today", value: "18", color: "text-green-600", icon: CheckCircle },
    { title: "Avg Response Time", value: "2.5h", color: "text-blue-600", icon: Clock },
    { title: "Customer Satisfaction", value: "94%", color: "text-purple-600", icon: CheckCircle },
  ];

  const faqItems = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'Order Tracking' section.",
      category: "Orders"
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all products in original condition.",
      category: "Returns"
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we offer bulk discounts for orders over ₱5,000. Contact our sales team for details.",
      category: "Pricing"
    },
  ];

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Support</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage support tickets and customer inquiries</p>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {supportStats.map((stat, index) => (
            <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</div>
                    <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Tickets */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium dark:text-white">{ticket.subject}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{ticket.customer}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{ticket.email}</div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={
                          ticket.priority === "High" ? "bg-red-100 text-red-700" :
                          ticket.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={ticket.status === "Resolved" ? "default" : "secondary"}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                      <span>#{ticket.id} • {ticket.category}</span>
                      <span>{ticket.created}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Tickets
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-red-600 hover:bg-red-700 h-20 flex flex-col">
                  <Phone className="w-6 h-6 mb-2" />
                  <span>Call Support</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Mail className="w-6 h-6 mb-2" />
                  <span>Send Email</span>
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Response</label>
                  <Textarea placeholder="Type a quick response template..." rows={3} className="dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">Send to Customer</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Management */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="dark:text-white">FAQ Management</CardTitle>
            <Button className="bg-red-600 hover:bg-red-700">Add New FAQ</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 dark:text-white">{faq.question}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{faq.answer}</p>
                      <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                    </div>
                    <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-4">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
