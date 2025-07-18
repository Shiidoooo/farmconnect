const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    shipping: {
        fee: {
            type: Number,
            default: 0
        },
        address: {
            fullName: {
                type: String,
                required: true
            },
            phoneNumber: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            }
        },
        courier: {
            name: {
                type: String,
                default: 'Standard Delivery'
            },
            trackingNumber: {
                type: String
            }
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['cod', 'ewallet'],
            default: 'cod'
        },
        ewalletDetails: {
            ewalletId: String,
            accountNumber: String,
            ewalletType: String
        }
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'to deliver', 'delivered', 'cancelled'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'to deliver', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentProcessed: {
        type: Boolean,
        default: false
    },
    adminPaymentReceived: {
        type: Boolean,
        default: false
    },
    adminPaymentAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
OrderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;