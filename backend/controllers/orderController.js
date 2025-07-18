const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');

// Helper function to process seller payment distribution
const processSellerPayment = async (order, adminId) => {
    try {
        const admin = await User.findById(adminId);
        if (!admin) {
            throw new Error('Admin account not found');
        }

        // Calculate commission (2% of total amount)
        const totalAmount = order.totalAmount;
        const commissionAmount = totalAmount * 0.02; // 2%
        const sellerNetAmount = totalAmount - commissionAmount;

        // Get unique sellers from the order products
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'products.product',
                select: 'user productName productPrice',
                populate: {
                    path: 'user',
                    select: 'name email defaultWallet'
                }
            });

        // Group products by seller and calculate each seller's portion
        const sellerPayments = {};
        let totalSellerAmount = 0;

        populatedOrder.products.forEach(item => {
            const seller = item.product.user;
            const sellerId = seller._id.toString();
            const itemTotal = item.price * item.quantity;
            
            if (!sellerPayments[sellerId]) {
                sellerPayments[sellerId] = {
                    seller: seller,
                    amount: 0,
                    products: []
                };
            }
            
            sellerPayments[sellerId].amount += itemTotal;
            sellerPayments[sellerId].products.push({
                productName: item.product.productName,
                quantity: item.quantity,
                price: item.price,
                total: itemTotal
            });
            
            totalSellerAmount += itemTotal;
        });

        // Check if admin has sufficient funds
        if (admin.defaultWallet < totalAmount) {
            throw new Error('Admin has insufficient funds to process seller payments');
        }

        // Process payments to each seller
        for (const sellerId in sellerPayments) {
            const sellerPayment = sellerPayments[sellerId];
            const sellerUser = await User.findById(sellerId);
            
            if (!sellerUser) {
                console.error(`Seller ${sellerId} not found`);
                continue;
            }

            // Calculate this seller's portion after commission
            const sellerPortion = sellerPayment.amount;
            const sellerCommission = sellerPortion * 0.02; // 2% commission
            const sellerNetAmount = sellerPortion - sellerCommission;

            // Transfer money from admin to seller
            admin.defaultWallet -= sellerPortion;
            sellerUser.defaultWallet += sellerNetAmount;
            
            await sellerUser.save();
            
            console.log(`Seller payment processed: ₱${sellerNetAmount} transferred to ${sellerUser.name} (${sellerUser.email})`);
            console.log(`Commission deducted: ₱${sellerCommission} (2%)`);
        }

        // Update admin wallet (commission stays with admin)
        await admin.save();

        console.log(`Order ${order._id} seller payment distribution completed:`);
        console.log(`Total distributed to sellers: ₱${sellerNetAmount}`);
        console.log(`Admin commission: ₱${commissionAmount}`);
        
    } catch (error) {
        console.error('Error processing seller payment:', error);
        throw error;
    }
};

// Create new order from cart
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            shippingAddress,
            shippingFee = 0,
            paymentMethod = { type: 'cod' },
            selectedItems
        } = req.body;

        // Admin ID from your database
        const ADMIN_ID = '686fcb79c45728d5cd379585';

        // Get user's cart and populate ewallets for payment validation
        const user = await User.findById(userId)
            .populate({
                path: 'cart.product',
                select: 'productName productPrice productStock'
            })
            .populate('ewallets');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get admin user for payment processing
        const admin = await User.findById(ADMIN_ID);
        if (!admin) {
            return res.status(500).json({
                success: false,
                message: 'Admin account not found for payment processing'
            });
        }

        // Determine which items to process
        let itemsToProcess;
        
        if (selectedItems && selectedItems.length > 0) {
            // Use selected items from frontend
            itemsToProcess = selectedItems;
        } else {
            // Fallback to all cart items if no selectedItems provided
            if (!user.cart || user.cart.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cart is empty'
                });
            }
            itemsToProcess = user.cart;
        }

        // Validate shipping address (removed postalCode validation)
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phoneNumber || 
            !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({
                success: false,
                message: 'Complete shipping address is required'
            });
        }

        // Check product availability and calculate totals
        let subtotal = 0;
        const orderProducts = [];

        for (const cartItem of itemsToProcess) {
            const product = cartItem.product;
            
            // Check if product exists and has enough stock
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more products in cart no longer exist'
                });
            }

            if (product.productStock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.productName}. Available: ${product.productStock}, Requested: ${cartItem.quantity}`
                });
            }

            const itemTotal = product.productPrice * cartItem.quantity;
            subtotal += itemTotal;

            orderProducts.push({
                product: product._id,
                quantity: cartItem.quantity,
                price: product.productPrice
            });
        }

        const totalAmount = subtotal + shippingFee;

        // Handle payment processing based on payment method
        let paymentStatus = 'pending';
        let paymentProcessed = false;

        if (paymentMethod.type === 'ewallet') {
            if (!paymentMethod.ewalletDetails || !paymentMethod.ewalletDetails.ewalletId) {
                return res.status(400).json({
                    success: false,
                    message: 'E-wallet details are required for e-wallet payment'
                });
            }

            // Find customer's e-wallet
            const userEwallet = user.ewallets.find(ewallet => 
                ewallet._id.toString() === paymentMethod.ewalletDetails.ewalletId
            );

            if (!userEwallet) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected e-wallet is not linked to your account'
                });
            }

            // Check if customer has sufficient balance
            if (userEwallet.AccountBalance < totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance in selected e-wallet'
                });
            }

            // Process e-wallet payment immediately to admin
            userEwallet.AccountBalance -= totalAmount;
            admin.defaultWallet += totalAmount;
            
            await userEwallet.save();
            await admin.save();

            paymentStatus = 'paid';
            paymentProcessed = true;

            console.log(`E-wallet payment processed: ₱${totalAmount} transferred from customer to admin`);
        }

        // Create order with payment tracking
        const order = new Order({
            user: userId,
            products: orderProducts,
            subtotal: subtotal,
            shipping: {
                fee: shippingFee,
                address: shippingAddress
            },
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            paymentProcessed: paymentProcessed,
            adminPaymentReceived: paymentProcessed,
            adminPaymentAmount: paymentProcessed ? totalAmount : 0
        });

        const savedOrder = await order.save();

        // Update product stock and remove ordered items from user's cart
        const orderedProductIds = [];
        for (const cartItem of itemsToProcess) {
            await Product.findByIdAndUpdate(
                cartItem.product._id,
                { $inc: { productStock: -cartItem.quantity, totalSold: cartItem.quantity } }
            );
            orderedProductIds.push(cartItem.product._id.toString());
        }

        // Remove ordered items from user's cart
        user.cart = user.cart.filter(item => 
            !orderedProductIds.includes(item.product._id.toString())
        );
        await user.save();

        // Populate the saved order with product details
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate({
                path: 'products.product',
                select: 'productName productPrice productimage'
            })
            .populate('user', 'name email');

        const responseMessage = paymentMethod.type === 'ewallet' 
            ? `Order created successfully and payment of ₱${totalAmount} has been processed`
            : 'Order created successfully. Payment will be collected on delivery';

        res.status(201).json({
            success: true,
            message: responseMessage,
            data: populatedOrder
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating order'
        });
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .populate({
                path: 'products.product',
                select: 'productName productPrice productimage productCategory'
            })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        console.log('Found orders for user:', userId, 'Count:', orders.length); // Debug log

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

// Get single order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate({
                path: 'products.product',
                select: 'productName productPrice productimage productCategory'
            })
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching order'
        });
    }
};

// Update order status (for admins or order processing)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber } = req.body;

        // Admin ID from your database
        const ADMIN_ID = '686fcb79c45728d5cd379585';

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'to deliver', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        // Find the order
        const order = await Order.findById(orderId)
            .populate({
                path: 'products.product',
                select: 'productName productPrice productimage'
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Handle COD payment when order is delivered
        if (status === 'delivered' && order.paymentMethod.type === 'cod' && !order.paymentProcessed) {
            const admin = await User.findById(ADMIN_ID);
            if (!admin) {
                return res.status(500).json({
                    success: false,
                    message: 'Admin account not found for payment processing'
                });
            }

            // Process COD payment to admin
            admin.defaultWallet += order.totalAmount;
            await admin.save();

            // Update order payment status
            order.paymentStatus = 'paid';
            order.paymentProcessed = true;
            order.adminPaymentReceived = true;
            order.adminPaymentAmount = order.totalAmount;

            console.log(`COD payment processed: ₱${order.totalAmount} added to admin wallet for order ${orderId}`);
        }

        // Handle seller payment distribution when order is delivered (for both COD and e-wallet)
        if (status === 'delivered' && order.paymentProcessed) {
            await processSellerPayment(order, ADMIN_ID);
        }

        // Update order status
        const updateData = { 
            orderStatus: status,
            status: status  // Ensure both status fields are updated
        };
        
        if (trackingNumber && status === 'shipped') {
            updateData['shipping.courier.trackingNumber'] = trackingNumber;
        }

        // Apply updates to order
        Object.assign(order, updateData);
        await order.save();

        console.log(`Order ${orderId} status updated to: ${status}`);

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating order status'
        });
    }
};

// Get orders for products owned by the seller
const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // Find all products owned by this seller
        const sellerProducts = await Product.find({ user: sellerId }).select('_id');
        const sellerProductIds = sellerProducts.map(product => product._id);

        // Find all orders that contain products owned by this seller
        const orders = await Order.find({
            'products.product': { $in: sellerProductIds }
        })
        .populate({
            path: 'products.product',
            select: 'productName productPrice productimage productCategory user'
        })
        .populate('user', 'name email phone_number')
        .sort({ createdAt: -1 });

        // Filter orders to only include products owned by this seller
        const sellerOrders = orders.map(order => {
            const sellerProducts = order.products.filter(item => 
                item.product && item.product.user.toString() === sellerId.toString()
            );
            
            if (sellerProducts.length > 0) {
                // Calculate subtotal for seller's products only
                const sellerSubtotal = sellerProducts.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                );
                
                return {
                    ...order.toObject(),
                    products: sellerProducts,
                    subtotal: sellerSubtotal,
                    // Keep original total amount for reference
                    originalTotalAmount: order.totalAmount,
                    totalAmount: sellerSubtotal + (order.shipping?.fee || 0)
                };
            }
            return null;
        }).filter(order => order !== null);

        console.log('Found seller orders:', sellerId, 'Count:', sellerOrders.length);

        res.status(200).json({
            success: true,
            data: sellerOrders
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching seller orders'
        });
    }
};

// Customer confirms receipt of order
const confirmOrderReceived = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        // Find the order and ensure it belongs to the user
        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate({
                path: 'products.product',
                select: 'productName productPrice productimage user',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is in a state that can be confirmed as received
        const validStatuses = ['shipped', 'out_for_delivery', 'to deliver'];
        if (!validStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be confirmed as received in its current status'
            });
        }

        // Admin ID from your database
        const ADMIN_ID = '686fcb79c45728d5cd379585';

        // Update order status to delivered
        order.orderStatus = 'delivered';
        order.status = 'delivered';
        
        // Handle COD payment if not already processed
        if (order.paymentMethod.type === 'cod' && !order.paymentProcessed) {
            const admin = await User.findById(ADMIN_ID);
            if (!admin) {
                return res.status(500).json({
                    success: false,
                    message: 'Admin account not found for payment processing'
                });
            }

            // Process COD payment to admin
            admin.defaultWallet += order.totalAmount;
            await admin.save();

            // Update order payment status
            order.paymentStatus = 'paid';
            order.paymentProcessed = true;
            order.adminPaymentReceived = true;
            order.adminPaymentAmount = order.totalAmount;

            console.log(`COD payment processed: ₱${order.totalAmount} added to admin wallet for order ${orderId}`);
        }

        // Process seller payment distribution (for both COD and e-wallet)
        if (order.paymentProcessed) {
            await processSellerPayment(order, ADMIN_ID);
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order confirmed as received successfully. Payment has been distributed to sellers.',
            data: order
        });

    } catch (error) {
        console.error('Confirm order received error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while confirming order receipt'
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getSellerOrders,
    confirmOrderReceived
};
