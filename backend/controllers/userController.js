const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const EWallet = require('../models/EwalletModel');
const validator = require('validator');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register User
const registerUser = async (req, res) => {
    try {       
        const { 
            name, 
            email, 
            address, 
            phone_number, 
            password, 
            gender,
            dateOfBirth,
            role = 'user' 
        } = req.body;

        // Validation
        if (!name || !email || !address || !phone_number || !password || !gender || !dateOfBirth) {
            console.log('Validation failed - missing fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate and parse date of birth
        const birthDate = new Date(dateOfBirth);
        if (isNaN(birthDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid date of birth'
            });
        }

        // Check if date is not in the future
        const today = new Date();
        if (birthDate > today) {
            return res.status(400).json({
                success: false,
                message: 'Date of birth cannot be in the future'
            });
        }

        // Check if user is at least 13 years old
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && dayDiff < 0)) {
            return res.status(400).json({
                success: false,
                message: 'You must be at least 13 years old to register'
            });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Handle optional profile picture upload
        let profilePicture = {};
        if (req.file) {
            console.log('File uploaded:', req.file);
            profilePicture = {
                public_id: req.file.public_id || req.file.filename,
                url: req.file.secure_url || req.file.path
            };
            console.log('Profile picture object:', profilePicture);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Create user
        const user = new User({
            name,
            email,
            address,
            phone_number,
            password: hashedPassword,
            gender,
            dateOfBirth: birthDate,
            role,
            profilePicture
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        // First try without populate to see if the basic query works
        let user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Try to populate ewallets, but don't fail if it doesn't work
        try {
            user = await User.findById(req.user._id)
                .select('-password')
                .populate('ewallets');
        } catch (populateError) {
            console.warn('Could not populate ewallets:', populateError.message);
            // Continue with user data without populated ewallets
        }

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.user._id;
        const { 
            name, 
            address, 
            phone_number, 
            gender, 
            profilePicture,
            dateOfBirth
        } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (address) user.address = address;
        if (phone_number) user.phone_number = phone_number;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = profilePicture;
        
        // Update date of birth if provided
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid date of birth'
                });
            }

            // Check if date is not in the future
            const today = new Date();
            if (birthDate > today) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth cannot be in the future'
                });
            }

            user.dateOfBirth = birthDate;
        }

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Find user with password
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
};

// Delete User (Admin or Self)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting user'
        });
    }
};

// Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalUsers = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    usersPerPage: limit
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching users'
        });
    }
};

// Get Single User (Admin Only)
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .select('-password')
            .populate('ewallets');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user'
        });
    }
};

// Wallet Management Functions

// Get user wallet info
const getUserWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('defaultWallet ewallets')
            .populate('ewallets');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                defaultWallet: user.defaultWallet,
                ewallets: user.ewallets
            }
        });

    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching wallet'
        });
    }
};

// Cash in to default wallet
const cashIn = async (req, res) => {
    try {
        const { amount, ewalletId } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        if (!ewalletId) {
            return res.status(400).json({
                success: false,
                message: 'E-wallet is required for cash in'
            });
        }

        // Find user
        const user = await User.findById(req.user._id).populate('ewallets');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find the selected e-wallet
        const selectedEwallet = user.ewallets.find(ewallet => ewallet._id.toString() === ewalletId);
        if (!selectedEwallet) {
            return res.status(404).json({
                success: false,
                message: 'E-wallet not found or not associated with your account'
            });
        }

        // Check if e-wallet has sufficient balance
        if (selectedEwallet.AccountBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance in selected e-wallet'
            });
        }

        // Perform the transaction
        selectedEwallet.AccountBalance -= amount;
        user.defaultWallet += amount;

        // Save both documents
        await selectedEwallet.save();
        await user.save();

        res.status(200).json({
            success: true,
            message: `Successfully cashed in $${amount} from ${selectedEwallet.EwalletType}`,
            data: {
                defaultWallet: user.defaultWallet,
                ewalletBalance: selectedEwallet.AccountBalance
            }
        });

    } catch (error) {
        console.error('Cash in error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cash in'
        });
    }
};

// Cash out from default wallet
const cashOut = async (req, res) => {
    try {
        const { amount, ewalletId } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        if (!ewalletId) {
            return res.status(400).json({
                success: false,
                message: 'E-wallet is required for cash out'
            });
        }

        // Find user
        const user = await User.findById(req.user._id).populate('ewallets');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has sufficient balance in default wallet
        if (user.defaultWallet < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance in default wallet'
            });
        }

        // Find the selected e-wallet
        const selectedEwallet = user.ewallets.find(ewallet => ewallet._id.toString() === ewalletId);
        if (!selectedEwallet) {
            return res.status(404).json({
                success: false,
                message: 'E-wallet not found or not associated with your account'
            });
        }

        // Perform the transaction
        user.defaultWallet -= amount;
        selectedEwallet.AccountBalance += amount;

        // Save both documents
        await user.save();
        await selectedEwallet.save();

        res.status(200).json({
            success: true,
            message: `Successfully cashed out $${amount} to ${selectedEwallet.EwalletType}`,
            data: {
                defaultWallet: user.defaultWallet,
                ewalletBalance: selectedEwallet.AccountBalance
            }
        });

    } catch (error) {
        console.error('Cash out error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cash out'
        });
    }
};

// Connect to existing e-wallet (verify account)
const connectEwallet = async (req, res) => {
    try {
        const { AccountNumer, pin } = req.body;

        // Validate input
        if (!AccountNumer || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Account number and PIN are required'
            });
        }

        // Find the e-wallet account
        const ewallet = await EWallet.findOne({ AccountNumer });
        if (!ewallet) {
            return res.status(404).json({
                success: false,
                message: 'E-wallet account not found'
            });
        }

        // Check if account is active
        if (!ewallet.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This e-wallet account is inactive'
            });
        }

        // Verify PIN
        if (ewallet.pin !== pin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid PIN'
            });
        }

        // Find user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if e-wallet is already connected to this user
        if (user.ewallets.includes(ewallet._id)) {
            return res.status(400).json({
                success: false,
                message: 'E-wallet is already connected to your account'
            });
        }

        // Connect e-wallet to user
        user.ewallets.push(ewallet._id);
        await user.save();

        // Add user to e-wallet's connected users (if not already there)
        if (!ewallet.connectedUsers.includes(user._id)) {
            ewallet.connectedUsers.push(user._id);
            await ewallet.save();
        }

        res.status(200).json({
            success: true,
            message: `Successfully connected ${ewallet.EwalletType} account`,
            data: {
                ewallet: {
                    _id: ewallet._id,
                    AccountNumer: ewallet.AccountNumer,
                    AccountHolderName: ewallet.AccountHolderName,
                    AccountBalance: ewallet.AccountBalance,
                    EwalletType: ewallet.EwalletType
                }
            }
        });

    } catch (error) {
        console.error('Connect e-wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error connecting e-wallet'
        });
    }
};

// Disconnect e-wallet from user account
const disconnectEwallet = async (req, res) => {
    try {
        const { ewalletId } = req.params;

        // Find user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if e-wallet is connected to user
        if (!user.ewallets.includes(ewalletId)) {
            return res.status(404).json({
                success: false,
                message: 'E-wallet not connected to your account'
            });
        }

        // Remove e-wallet from user's ewallets array
        user.ewallets = user.ewallets.filter(id => id.toString() !== ewalletId);
        await user.save();

        // Remove user from e-wallet's connected users
        const ewallet = await EWallet.findById(ewalletId);
        if (ewallet) {
            ewallet.connectedUsers = ewallet.connectedUsers.filter(
                userId => userId.toString() !== req.user._id.toString()
            );
            await ewallet.save();
        }

        res.status(200).json({
            success: true,
            message: 'E-wallet disconnected successfully'
        });

    } catch (error) {
        console.error('Disconnect e-wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error disconnecting e-wallet'
        });
    }
};

// Admin function to create e-wallet accounts (for demo/setup purposes)
const createEwalletAccount = async (req, res) => {
    try {
        const { AccountNumer, AccountHolderName, EwalletType, pin, AccountBalance } = req.body;

        // Validate input
        if (!AccountNumer || !AccountHolderName || !EwalletType || !pin) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate PIN format
        if (pin.length < 4 || pin.length > 6) {
            return res.status(400).json({
                success: false,
                message: 'PIN must be 4-6 digits'
            });
        }

        // Check if account number already exists
        const existingEwallet = await EWallet.findOne({ AccountNumer });
        if (existingEwallet) {
            return res.status(400).json({
                success: false,
                message: 'E-wallet account number already exists'
            });
        }

        // Create new e-wallet account
        const newEwallet = new EWallet({
            AccountNumer,
            AccountHolderName,
            EwalletType,
            pin,
            AccountBalance: AccountBalance || 1000, // Default balance for demo
            connectedUsers: []
        });

        await newEwallet.save();

        res.status(201).json({
            success: true,
            message: 'E-wallet account created successfully',
            data: {
                _id: newEwallet._id,
                AccountNumer: newEwallet.AccountNumer,
                AccountHolderName: newEwallet.AccountHolderName,
                AccountBalance: newEwallet.AccountBalance,
                EwalletType: newEwallet.EwalletType
            }
        });

    } catch (error) {
        console.error('Create e-wallet account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating e-wallet account'
        });
    }
};

// Get available e-wallets by type
const getAvailableEwallets = async (req, res) => {
    try {
        // Get all active e-wallets grouped by type
        const ewallets = await EWallet.find({ isActive: true })
            .select('AccountNumer AccountHolderName EwalletType AccountBalance')
            .sort({ EwalletType: 1, AccountNumer: 1 });

        // Group by e-wallet type
        const groupedEwallets = {};
        ewallets.forEach(ewallet => {
            if (!groupedEwallets[ewallet.EwalletType]) {
                groupedEwallets[ewallet.EwalletType] = [];
            }
            groupedEwallets[ewallet.EwalletType].push({
                _id: ewallet._id,
                AccountNumer: ewallet.AccountNumer,
                AccountHolderName: ewallet.AccountHolderName,
                AccountBalance: ewallet.AccountBalance
            });
        });

        res.status(200).json({
            success: true,
            data: {
                ewalletTypes: Object.keys(groupedEwallets),
                ewallets: groupedEwallets,
                totalCount: ewallets.length
            }
        });

    } catch (error) {
        console.error('Get available e-wallets error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching available e-wallets'
        });
    }
};

// Get e-wallets by specific type
const getEwalletsByType = async (req, res) => {
    try {
        const { type } = req.params;

        // Validate e-wallet type
        const validTypes = ['gcash', 'paypal', 'bdo', 'paymaya', 'unionbank', 'bpi'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid e-wallet type'
            });
        }

        const ewallets = await EWallet.find({ 
            EwalletType: type.toLowerCase(), 
            isActive: true 
        })
        .select('AccountNumer AccountHolderName AccountBalance')
        .sort({ AccountNumer: 1 });

        res.status(200).json({
            success: true,
            data: {
                type: type.toLowerCase(),
                ewallets: ewallets,
                count: ewallets.length
            }
        });

    } catch (error) {
        console.error('Get e-wallets by type error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching e-wallets by type'
        });
    }
};

// Cart functionality
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product already exists in cart
        const existingCartItem = user.cart.find(item => 
            item.product.toString() === productId
        );

        if (existingCartItem) {
            // Update quantity if product already in cart
            existingCartItem.quantity += quantity;
        } else {
            // Add new item to cart
            user.cart.push({
                product: productId,
                quantity: quantity
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product added to cart successfully',
            cart: user.cart
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding to cart'
        });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: 'cart.product',
            select: 'productName productPrice productimage productCategory user',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            cart: user.cart
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cart'
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        if (!productId || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid product ID and quantity are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cartItem = user.cart.find(item => 
            item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            });
        }

        cartItem.quantity = quantity;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            cart: user.cart
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating cart item'
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.cart = user.cart.filter(item => 
            item.product.toString() !== productId
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Product removed from cart successfully',
            cart: user.cart
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing from cart'
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.cart = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart: user.cart
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing cart'
        });
    }
};

// Update User Profile Picture
const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture file provided'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create profile picture object
        const profilePicture = {
            public_id: req.file.public_id || req.file.filename,
            url: req.file.secure_url || req.file.path
        };

        // Update user's profile picture
        user.profilePicture = profilePicture;
        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        console.error('Update profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile picture'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
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
    clearCart,
    updateProfilePicture
};
