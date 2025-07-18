
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Send, MessageSquare } from "lucide-react";
import { useState } from "react";

const AdminMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  const messages = [
    {
      id: 1,
      sender: "Maria Santos",
      email: "maria@email.com",
      subject: "Question about organic fertilizers",
      message: "Hi, I'm interested in your organic fertilizer products. Can you tell me more about the composition and application methods?",
      time: "2 hours ago",
      status: "unread",
      priority: "high"
    },
    {
      id: 2,
      sender: "Juan Dela Cruz",
      email: "juan@email.com",
      subject: "Order delivery issue",
      message: "I placed an order last week but haven't received any tracking information. Order #HC001234",
      time: "4 hours ago",
      status: "unread",
      priority: "urgent"
    },
    {
      id: 3,
      sender: "Ana Reyes",
      email: "ana@email.com",
      subject: "Bulk pricing inquiry",
      message: "I'm a school teacher planning to start a garden project with my students. Do you offer bulk pricing for seed packages?",
      time: "1 day ago",
      status: "read",
      priority: "medium"
    },
    {
      id: 4,
      sender: "Pedro Garcia",
      email: "pedro@email.com",
      subject: "Product recommendation",
      message: "I'm new to gardening and have a small balcony space. What products would you recommend for container gardening?",
      time: "2 days ago",
      status: "read",
      priority: "low"
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Customer inquiries and support requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg dark:text-white">Inbox</CardTitle>
                  <Badge className="bg-red-100 text-red-700">
                    {messages.filter(m => m.status === 'unread').length} new
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search messages..." className="pl-10" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 ${
                        message.status === 'unread' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-transparent'
                      } ${selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm dark:text-white">{message.sender}</div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">{message.subject}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{message.message}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">{message.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg dark:text-white">{selectedMessage.subject}</CardTitle>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        From: {selectedMessage.sender} ({selectedMessage.email})
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{selectedMessage.time}</div>
                    </div>
                    <Badge className={getPriorityColor(selectedMessage.priority)}>
                      {selectedMessage.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                    <p className="dark:text-gray-200">{selectedMessage.message}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reply</label>
                      <Textarea
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={6}
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                      <Button variant="outline">Save Draft</Button>
                      <Button variant="outline">Mark as Resolved</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a message</h3>
                    <p className="text-gray-600 dark:text-gray-400">Choose a message from the inbox to view and reply</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
