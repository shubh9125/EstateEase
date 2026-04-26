const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    buyerOrRenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingtype: {
        type: String,
        enum: ['rent', 'buy'],
        required: true
    },
    message: {
        type: String,
        default: '',
    },
    sellerReply: {
        type: String,
        default: '',
    },
    buyerReply: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},
{timestamps: true}
);

module.exports = mongoose.model('Booking', bookingSchema);