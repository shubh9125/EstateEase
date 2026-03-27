const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim : true
    },
    description: {
        type: String,
        required: true,
        trim : true
    },
    price: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['buy', 'rent', 'sell'],
        default: 'buy'
    },
    propertyType: {
        type: String,
        enum: ['house', 'villa', 'apartment'],
        default: 'house'
    },
    location: {
        city:{
            type: String,
            required: true,
            trim : true
        },
        address: {
            type: String,
            required: true,
            trim : true
        }
    },
    images:{
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'sold'],
        default: 'available'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    flaggedAsFraud: {
        type: Boolean,
        default: false
    }
},
{timestamps: true}
);

module.exports = mongoose.model('Property', propertySchema);