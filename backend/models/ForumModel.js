const mongoose = require('mongoose');

// Forum Post Schema
const forumPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['farming-tips', 'product-discussion', 'general', 'marketplace', 'community'],
        default: 'general'
    },
    tags: [{
        type: String,
        maxlength: 50
    }],
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    productimage: [
    {
        public_id: {
        type: String,
        required: false,
        },
        url: {
        type: String,
        required: false,
        }
    }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better performance
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ category: 1 });
forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ title: 'text', content: 'text' });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;
