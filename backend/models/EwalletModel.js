const mongoose = require('mongoose');

const EwalletSchema = new mongoose.Schema({
    AccountNumer: {
        type: String,
        required: true,
        unique: true
    },
    AccountHolderName: {
        type: String,
        required: true
    },
    AccountBalance: {
        type: Number,
        default: 0
    },
    EwalletType:{
        type: String,
        enum: ['gcash', 'paypal','bdo','paymaya','unionbank', 'bpi'],
        required: true
    },
    pin: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 6
    },
    isActive: {
        type: Boolean,
        default: true
    },
    connectedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const EWallet = mongoose.model('EWallet', EwalletSchema);

module.exports = EWallet;