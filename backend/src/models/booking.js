const moongoose = require('mongoose');

const bookingSchema = new moongoose.Schema({
    propertyId: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    buyerOrRenterId: {
        type: moongoose.Schema.Types.ObjectId,
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

module.exports = moongoose.model('Booking', bookingSchema);