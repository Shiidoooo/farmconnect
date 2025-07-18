const ForumPost = require('../models/ForumModel');
const User = require('../models/UserModel');
const cloudinary = require('../config/cloudinary');

// Get all forum posts with pagination and filtering
const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, sortBy = 'latest' } = req.query;
        
        let matchStage = {};
        
        // Filter by category
        if (category && category !== 'all') {
            matchStage.category = category;
        }
        
        // Search in title and content
        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Sorting options
        let sortOptions = {};
        switch (sortBy) {
            case 'latest':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'popular':
                sortOptions = { upvoteCount: -1, createdAt: -1 };
                break;
            case 'comments':
                sortOptions = { commentCount: -1, createdAt: -1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Use aggregation for complex sorting
        const pipeline = [
            { $match: matchStage },
            {
                $addFields: {
                    upvoteCount: { $size: '$upvotes' },
                    downvoteCount: { $size: '$downvotes' },
                    commentCount: { $size: '$comments' },
                    score: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
                }
            },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                profilePicture: 1
                            }
                        }
                    ]
                }
            },
            { $unwind: '$author' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.user',
                    foreignField: '_id',
                    as: 'commentUsers'
                }
            },
            {
                $addFields: {
                    comments: {
                        $map: {
                            input: '$comments',
                            as: 'comment',
                            in: {
                                $mergeObjects: [
                                    '$$comment',
                                    {
                                        user: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$commentUsers',
                                                        cond: { $eq: ['$$this._id', '$$comment.user'] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    commentUsers: 0
                }
            }
        ];
        
        const posts = await ForumPost.aggregate(pipeline);
        
        const totalPosts = await ForumPost.countDocuments(matchStage);
        const totalPages = Math.ceil(totalPosts / parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPosts,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching forum posts'
        });
    }
};

// Get single forum post by ID
const getPostById = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('author', 'name profilePicture createdAt')
            .populate('comments.user', 'name profilePicture');
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }
        
        // Add calculated fields
        const postObj = post.toObject();
        postObj.upvoteCount = post.upvotes.length;
        postObj.downvoteCount = post.downvotes.length;
        postObj.commentCount = post.comments.length;
        postObj.score = post.upvotes.length - post.downvotes.length;
        
        res.status(200).json({
            success: true,
            data: postObj
        });
    } catch (error) {
        console.error('Error fetching forum post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching forum post'
        });
    }
};

// Create new forum post
const createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        
        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }
        
        const postData = {
            title,
            content,
            author: req.user._id,
            category: category || 'general',
            tags: tags ? JSON.parse(tags) : []
        };
        
        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const imageUploads = req.files.map(file => ({
                public_id: file.filename,
                url: file.path
            }));
            postData.productimage = imageUploads;
        }
        
        const newPost = await ForumPost.create(postData);
        
        // Populate author data for response
        const populatedPost = await ForumPost.findById(newPost._id)
            .populate('author', 'name profilePicture');
        
        res.status(201).json({
            success: true,
            data: populatedPost,
            message: 'Forum post created successfully'
        });
    } catch (error) {
        console.error('Error creating forum post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating forum post'
        });
    }
};

// Update forum post
const updatePost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const postId = req.params.id;
        
        const post = await ForumPost.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }
        
        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own posts'
            });
        }
        
        const updateData = {
            title: title || post.title,
            content: content || post.content,
            category: category || post.category,
            tags: tags ? JSON.parse(tags) : post.tags,
            updatedAt: new Date()
        };
        
        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            // Delete old images from cloudinary
            if (post.productimage && post.productimage.length > 0) {
                for (const image of post.productimage) {
                    if (image.public_id) {
                        await cloudinary.uploader.destroy(image.public_id);
                    }
                }
            }
            
            const imageUploads = req.files.map(file => ({
                public_id: file.filename,
                url: file.path
            }));
            updateData.productimage = imageUploads;
        }
        
        const updatedPost = await ForumPost.findByIdAndUpdate(
            postId,
            updateData,
            { new: true }
        ).populate('author', 'name profilePicture');
        
        res.status(200).json({
            success: true,
            data: updatedPost,
            message: 'Forum post updated successfully'
        });
    } catch (error) {
        console.error('Error updating forum post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating forum post'
        });
    }
};

// Delete forum post
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        
        const post = await ForumPost.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }
        
        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own posts'
            });
        }
        
        // Delete images from cloudinary
        if (post.productimage && post.productimage.length > 0) {
            for (const image of post.productimage) {
                if (image.public_id) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
        }
        
        await ForumPost.findByIdAndDelete(postId);
        
        res.status(200).json({
            success: true,
            message: 'Forum post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting forum post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting forum post'
        });
    }
};

// Vote on a post (upvote/downvote)
const voteOnPost = async (req, res) => {
    try {
        const { type } = req.body; // 'upvote' or 'downvote'
        const postId = req.params.id;
        const userId = req.user._id;
        
        const post = await ForumPost.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }
        
        // Remove user from both arrays first
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
        
        // Add to appropriate array based on vote type
        if (type === 'upvote') {
            post.upvotes.push(userId);
        } else if (type === 'downvote') {
            post.downvotes.push(userId);
        }
        
        await post.save();
        
        res.status(200).json({
            success: true,
            data: {
                upvoteCount: post.upvotes.length,
                downvoteCount: post.downvotes.length,
                score: post.upvotes.length - post.downvotes.length,
                userVote: type
            },
            message: 'Vote recorded successfully'
        });
    } catch (error) {
        console.error('Error voting on post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while voting on post'
        });
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }
        
        const post = await ForumPost.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }
        
        const newComment = {
            user: req.user._id,
            content,
            createdAt: new Date()
        };
        
        post.comments.push(newComment);
        await post.save();
        
        // Populate the new comment
        const updatedPost = await ForumPost.findById(postId)
            .populate('comments.user', 'name profilePicture');
        
        const addedComment = updatedPost.comments[updatedPost.comments.length - 1];
        
        res.status(201).json({
            success: true,
            data: addedComment,
            message: 'Comment added successfully'
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding comment'
        });
    }
};

// Get recommended posts based on user activity and preferences
const getRecommendedPosts = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const { limit = 5 } = req.query;
        
        if (!userId) {
            // For non-authenticated users, return popular posts using aggregation
            const popularPosts = await ForumPost.aggregate([
                {
                    $addFields: {
                        upvoteCount: { $size: '$upvotes' },
                        downvoteCount: { $size: '$downvotes' },
                        commentCount: { $size: '$comments' },
                        score: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
                    }
                },
                {
                    $sort: { upvoteCount: -1, createdAt: -1 }
                },
                {
                    $limit: parseInt(limit)
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author',
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    profilePicture: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: '$author'
                }
            ]);
            
            return res.status(200).json({
                success: true,
                data: popularPosts
            });
        }
        
        // For authenticated users, get personalized recommendations
        const userPosts = await ForumPost.find({ author: userId });
        const userCategories = [...new Set(userPosts.map(post => post.category))];
        const userTags = [...new Set(userPosts.flatMap(post => post.tags))];
        
        // Build recommendation query
        let matchStage = { author: { $ne: userId } };
        
        if (userCategories.length > 0 || userTags.length > 0) {
            const orConditions = [];
            
            if (userCategories.length > 0) {
                orConditions.push({ category: { $in: userCategories } });
            }
            
            if (userTags.length > 0) {
                orConditions.push({ tags: { $in: userTags } });
            }
            
            matchStage.$or = orConditions;
        }
        
        const recommendedPosts = await ForumPost.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    upvoteCount: { $size: '$upvotes' },
                    downvoteCount: { $size: '$downvotes' },
                    commentCount: { $size: '$comments' },
                    score: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
                }
            },
            {
                $sort: { upvoteCount: -1, createdAt: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                profilePicture: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: '$author'
            }
        ]);
        
        // If not enough recommendations, fill with popular posts
        if (recommendedPosts.length < parseInt(limit)) {
            const excludeIds = recommendedPosts.map(p => p._id);
            const additionalPosts = await ForumPost.aggregate([
                {
                    $match: {
                        author: { $ne: userId },
                        _id: { $nin: excludeIds }
                    }
                },
                {
                    $addFields: {
                        upvoteCount: { $size: '$upvotes' },
                        downvoteCount: { $size: '$downvotes' },
                        commentCount: { $size: '$comments' },
                        score: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
                    }
                },
                {
                    $sort: { upvoteCount: -1, createdAt: -1 }
                },
                {
                    $limit: parseInt(limit) - recommendedPosts.length
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author',
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    profilePicture: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: '$author'
                }
            ]);
            
            recommendedPosts.push(...additionalPosts);
        }
        
        res.status(200).json({
            success: true,
            data: recommendedPosts
        });
    } catch (error) {
        console.error('Error getting recommended posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting recommended posts'
        });
    }
};

// Get trending posts (popular in the last week)
const getTrendingPosts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const trendingPosts = await ForumPost.aggregate([
            {
                $match: {
                    createdAt: { $gte: oneWeekAgo }
                }
            },
            {
                $addFields: {
                    upvoteCount: { $size: '$upvotes' },
                    commentCount: { $size: '$comments' },
                    score: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
                }
            },
            {
                $sort: {
                    upvoteCount: -1,
                    commentCount: -1,
                    createdAt: -1
                }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                profilePicture: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: '$author'
            }
        ]);
        
        const postsWithStats = trendingPosts.map(post => ({
            ...post,
            downvoteCount: post.downvotes.length
        }));
        
        res.status(200).json({
            success: true,
            data: postsWithStats
        });
    } catch (error) {
        console.error('Error getting trending posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting trending posts'
        });
    }
};

// Get community statistics
const getCommunityStats = async (req, res) => {
    try {
        // Count total posts
        const totalPosts = await ForumPost.countDocuments();
        
        // Count total users
        const totalUsers = await User.countDocuments();
        
        res.status(200).json({
            success: true,
            data: {
                totalPosts,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Error getting community stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting community stats'
        });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    voteOnPost,
    addComment,
    getRecommendedPosts,
    getTrendingPosts,
    getCommunityStats
};
