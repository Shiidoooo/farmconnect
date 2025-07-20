const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    // Detailed address fields
    city: {
        type: String,
        required: false
    },
    barangay: {
        type: String,
        required: false
    },
    street: {
        type: String,
        required: false
    },
    landmark: {
        type: String,
        required: false
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    locationComment: {
        type: String,
        required: false
    },
    phone_number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    defaultWallet: {
        type: Number,
        default: 0
    },
    gender:{
        type: String,
        enum: ['male', 'female', 'prefer not to say'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                // Ensure the user is at least 13 years old
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                const monthDiff = today.getMonth() - value.getMonth();
                const dayDiff = today.getDate() - value.getDate();
                
                return age > 17 || (age === 17 && monthDiff > 0) || (age === 17 && monthDiff === 0 && dayDiff >= 0);
            },
            message: 'You must be at least 13 years old to register'
        }
    },
    profilePicture: {
            public_id: {
                type: String,
                required: false,
            },
            url: {
                type: String,
                required: false,
            },
        },
    ewallets: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'EWallet',
        }
      ],
    addresses: [
        {
            id: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['Home', 'Office'],
                required: true
            },
            fullName: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            barangay: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            landmark: {
                type: String,
                required: false
            },
            coordinates: {
                lat: {
                    type: Number,
                    required: false
                },
                lng: {
                    type: Number,
                    required: false
                }
            },
            locationComment: {
                type: String,
                required: false
            },
            isDefault: {
                type: Boolean,
                default: false
            }
        }
    ],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            },
            selectedSize: {
                type: String,
                required: false // Optional for products without size variants
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

});

const User = mongoose.model('User', userSchema);

module.exports = User;