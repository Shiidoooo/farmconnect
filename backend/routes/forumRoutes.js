const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateUser } = require('../middleware/auth');
const {
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
} = require('../controllers/forumController');

// Public routes (can be accessed without authentication)
router.get('/', getAllPosts);
router.get('/stats', getCommunityStats);
router.get('/trending', getTrendingPosts);
router.get('/recommended', getRecommendedPosts);
router.get('/:id', getPostById);

// Protected routes (authentication required)
router.post('/', authenticateUser, upload.array('images', 5), createPost);
router.put('/:id', authenticateUser, upload.array('images', 5), updatePost);
router.delete('/:id', authenticateUser, deletePost);
router.post('/:id/vote', authenticateUser, voteOnPost);
router.post('/:id/comment', authenticateUser, addComment);

module.exports = router;
