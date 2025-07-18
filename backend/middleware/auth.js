const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token. User not found.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
};

// Middleware to authorize admin only
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No user found.' 
        });
    }
    
    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin privileges required.' 
        });
    }
};

// Middleware to authorize user or admin
const authorizeUser = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin' || req.user.role === 'farmer')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. User privileges required.' 
        });
    }
};

// Middleware to authorize farmer or admin
const authorizeFarmer = (req, res, next) => {
    if (req.user && (req.user.role === 'farmer' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. Farmer privileges required.' 
        });
    }
};

// Middleware to allow users to access their own data or admin to access any
const authorizeOwnerOrAdmin = (req, res, next) => {
    const userId = req.params.userId || req.params.id;
    
    if (req.user && (req.user._id.toString() === userId || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. You can only access your own data.' 
        });
    }
};

module.exports = {
    authenticateUser,
    authorizeAdmin,
    authorizeUser,
    authorizeFarmer,
    authorizeOwnerOrAdmin
};
