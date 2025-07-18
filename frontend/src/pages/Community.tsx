import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CreatePostDialog from "../components/CreatePostDialog";
import PostCard from "../components/PostCard";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Star,
  MessageCircle,
  Users,
  Filter
} from "lucide-react";
import { forumAPI, auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [communityStats, setCommunityStats] = useState({
    totalPosts: 0,
    totalUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { toast } = useToast();
  const isAuthenticated = auth.isAuthenticated();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "farming-tips", label: "Farming Tips" },
    { value: "product-discussion", label: "Product Discussion" },
    { value: "general", label: "General" },
    { value: "marketplace", label: "Marketplace" },
    { value: "community", label: "Community" },
  ];

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
    { value: "popular", label: "Most Popular" },
    { value: "comments", label: "Most Comments" },
  ];

  // Fetch posts with filters
  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        category: selectedCategory,
        search: searchQuery,
        sortBy
      };

      const response = await forumAPI.getAllPosts(params);
      if (response.success) {
        setPosts(response.data.posts);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended posts
  const fetchRecommendedPosts = async () => {
    try {
      const response = await forumAPI.getRecommendedPosts(5);
      if (response.success) {
        setRecommendedPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
    }
  };

  // Fetch trending posts
  const fetchTrendingPosts = async () => {
    try {
      const response = await forumAPI.getTrendingPosts(5);
      if (response.success) {
        setTrendingPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  // Fetch community statistics
  const fetchCommunityStats = async () => {
    try {
      console.log('Fetching community stats...');
      setStatsLoading(true);
      
      const response = await forumAPI.getCommunityStats();
      console.log('Community stats response:', response);
      
      if (response.success) {
        setCommunityStats({
          totalPosts: response.data.totalPosts,
          totalUsers: response.data.totalUsers
        });
        console.log('Stats set:', response.data);
      } else {
        console.error('Failed to fetch community stats:', response);
        setCommunityStats({
          totalPosts: 0,
          totalUsers: 0
        });
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
      setCommunityStats({
        totalPosts: 0,
        totalUsers: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchRecommendedPosts();
    fetchTrendingPosts();
    fetchCommunityStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchPosts(1);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to create a post",
        variant: "destructive",
      });
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handlePostCreated = () => {
    setIsCreateDialogOpen(false);
    fetchPosts();
    fetchTrendingPosts();
    fetchCommunityStats(); // Refresh stats when new post is created
    toast({
      title: "Success",
      description: "Your post has been created successfully!",
    });
  };

  const handlePostUpdate = () => {
    fetchPosts();
    fetchTrendingPosts();
    fetchCommunityStats(); // Refresh stats when posts are updated
  };

  const handlePageChange = (page) => {
    fetchPosts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Community Forum
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with fellow farmers, share knowledge, ask questions, and build a stronger agricultural community together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Create Post Button */}
              <Card>
                <CardContent className="p-4">
                  <Button 
                    onClick={handleCreatePost}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Login required to create posts
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-600" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Posts</span>
                      <span className="font-medium">
                        {statsLoading ? (
                          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          communityStats.totalPosts
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Users</span>
                      <span className="font-medium">
                        {statsLoading ? (
                          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          communityStats.totalUsers
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Posts */}
              {trendingPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                      Trending This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      {trendingPosts.slice(0, 3).map((post) => (
                        <div key={post._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {post.score}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {post.commentCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Posts */}
              {recommendedPosts.length > 0 && isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Star className="w-5 h-5 mr-2 text-red-600" />
                      Recommended for You
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      {recommendedPosts.slice(0, 3).map((post) => (
                        <div key={post._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || selectedCategory !== 'all' 
                      ? "Try adjusting your search or filters"
                      : "Be the first to start a conversation!"
                    }
                  </p>
                  {isAuthenticated && (
                    <Button onClick={handleCreatePost} className="bg-red-600 hover:bg-red-700">
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onUpdate={handlePostUpdate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <CreatePostDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <Footer />
    </div>
  );
};

export default Community;
