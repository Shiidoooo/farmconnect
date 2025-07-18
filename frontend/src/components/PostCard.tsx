import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Share2, 
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Clock,
  User,
  Send,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { forumAPI, auth } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: {
      url: string;
    };
  };
  category: string;
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      profilePicture?: {
        url: string;
      };
    };
    content: string;
    upvotes: string[];
    downvotes: string[];
    createdAt: string;
  }>;
  productimage?: Array<{
    url: string;
    public_id: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  const { toast } = useToast();
  const currentUser = auth.getUserData();
  const isAuthenticated = auth.isAuthenticated();
  const isAuthor = currentUser?._id === post.author._id;

  // Calculate vote scores
  const upvoteCount = post.upvotes?.length || 0;
  const downvoteCount = post.downvotes?.length || 0;
  const score = upvoteCount - downvoteCount;
  
  const userVote = currentUser 
    ? post.upvotes?.includes(currentUser._id) 
      ? 'upvote' 
      : post.downvotes?.includes(currentUser._id) 
        ? 'downvote' 
        : null
    : null;

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to vote on posts",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await forumAPI.voteOnPost(post._id, voteType);
      if (response.success) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error voting",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to comment on posts",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await forumAPI.addComment(post._id, newComment.trim());
      if (response.success) {
        setNewComment("");
        onUpdate();
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully",
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await forumAPI.deletePost(post._id);
      if (response.success) {
        onUpdate();
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error deleting post",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 100) + "...",
          url: window.location.href + `#post-${post._id}`,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href + `#post-${post._id}`);
        toast({
          title: "Link copied",
          description: "Post link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'farming-tips': 'bg-green-100 text-green-800',
      'product-discussion': 'bg-blue-100 text-blue-800',
      'general': 'bg-gray-100 text-gray-800',
      'marketplace': 'bg-purple-100 text-purple-800',
      'community': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const shouldTruncateContent = post.content.length > 300;
  const displayContent = shouldTruncateContent && !isExpanded 
    ? post.content.slice(0, 300) + "..." 
    : post.content;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200" id={`post-${post._id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={post.author.profilePicture?.url} 
                alt={post.author.name}
              />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                <Badge className={getCategoryColor(post.category)}>
                  {post.category.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.updatedAt !== post.createdAt && (
                  <span className="italic">(edited)</span>
                )}
              </div>
            </div>
          </div>
          
          {(isAuthenticated && (isAuthor || currentUser?.role === 'admin')) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor && (
                  <>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeletePost} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                )}
                {!isAuthor && (
                  <DropdownMenuItem className="text-red-600">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Post Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {post.title}
        </h2>

        {/* Post Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {displayContent}
          </p>
          {shouldTruncateContent && (
            <Button
              variant="link"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-auto text-red-600 hover:text-red-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Read more
                </>
              )}
            </Button>
          )}
        </div>

        {/* Post Images */}
        {post.productimage && post.productimage.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              post.productimage.length === 1 
                ? 'grid-cols-1' 
                : post.productimage.length === 2 
                  ? 'grid-cols-2' 
                  : 'grid-cols-3'
            }`}>
              {post.productimage.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    // Could implement image modal here
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <div className="flex items-center space-x-1">
              <Button
                variant={userVote === 'upvote' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote('upvote')}
                disabled={isVoting || !isAuthenticated}
                className={userVote === 'upvote' ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:text-green-600"}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-600 min-w-[2rem] text-center">
                {score}
              </span>
              <Button
                variant={userVote === 'downvote' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote('downvote')}
                disabled={isVoting || !isAuthenticated}
                className={userVote === 'downvote' ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600"}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.comments?.length || 0}
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Add Comment */}
            {isAuthenticated && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={currentUser?.profilePicture?.url} 
                      alt={currentUser?.name}
                    />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                      maxLength={1000}
                      disabled={isSubmittingComment}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {newComment.length}/1000 characters
                      </span>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {isSubmittingComment ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={comment.user.profilePicture?.url} 
                        alt={comment.user.name}
                      />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      
                      {/* Comment voting could be added here */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {comment.upvotes?.length || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          {comment.downvotes?.length || 0}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p>No comments yet</p>
                  {isAuthenticated && (
                    <p className="text-sm">Be the first to comment!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
