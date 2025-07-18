const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    updateProfilePicture,
    changePassword,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserWallet,
    cashIn,
    cashOut,
    connectEwallet,
    disconnectEwallet,
    createEwalletAccount,
    getAvailableEwallets,
    getEwalletsByType,
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/userController');
const {
    authenticateUser,
    authorizeAdmin,
    authorizeOwnerOrAdmin
} = require('../middleware/auth');

// Public routes
router.post('/register', (req, res, next) => {
    console.log('Register route hit');
    console.log('Content-Type:', req.headers['content-type']);
    
    // Check if it's multipart/form-data (file upload)
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        console.log('Processing as multipart/form-data');
        upload.single('profilePicture')(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'File upload error'
                });
            }
            console.log('Multer processed successfully');
            console.log('Body after multer:', req.body);
            console.log('File after multer:', req.file);
            registerUser(req, res);
        });
    } else {
        console.log('Processing as regular JSON');
        // No file upload, proceed directly
        registerUser(req, res);
    }
});
router.post('/login', loginUser);

// Protected routes - User authentication required
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);
router.put('/profile-picture', authenticateUser, upload.single('profilePicture'), updateProfilePicture);
router.put('/change-password', authenticateUser, changePassword);

// Wallet routes
router.get('/wallet', authenticateUser, getUserWallet);
router.post('/wallet/cash-in', authenticateUser, cashIn);
router.post('/wallet/cash-out', authenticateUser, cashOut);
router.post('/wallet/connect', authenticateUser, connectEwallet);
router.delete('/wallet/disconnect/:ewalletId', authenticateUser, disconnectEwallet);

// E-wallet discovery routes
router.get('/wallet/available-ewallets', authenticateUser, getAvailableEwallets);
router.get('/wallet/ewallets/:type', authenticateUser, getEwalletsByType);

// Cart routes
router.post('/cart/add', authenticateUser, addToCart);
router.get('/cart', authenticateUser, getCart);
router.put('/cart/update', authenticateUser, updateCartItem);
router.delete('/cart/remove/:productId', authenticateUser, removeFromCart);
router.delete('/cart/clear', authenticateUser, clearCart);

// Public route for creating e-wallet accounts (for demo purposes)
router.post('/wallet/create-account', createEwalletAccount);

// Protected routes - Owner or Admin can access
router.put('/:id', authenticateUser, authorizeOwnerOrAdmin, updateUserProfile);
router.delete('/:id', authenticateUser, authorizeOwnerOrAdmin, deleteUser);

// Admin only routes
router.get('/', authenticateUser, authorizeAdmin, getAllUsers);
router.get('/:id', authenticateUser, authorizeAdmin, getUserById);

module.exports = router;
