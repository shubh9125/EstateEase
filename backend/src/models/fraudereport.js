const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'rejected'],
        default: 'pending'
    }
},
{timestamps: true}
);

module.exports = mongoose.model('FraudReport', fraudReportSchema); 