const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim : true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'buyer', 'renter', 'seller'],
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim : true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);