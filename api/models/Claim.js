const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    warrantyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warranty',
        required: true
    },
    claimNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    issueDescription: {
        type: String,
        required: true
    },
    claimDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    resolution: String,
    notes: String,
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: Date
    }],

    // AI Diagnostic Fields
    diagnosticConversation: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    aiSuggestions: {
        troubleshootingSteps: [String],
        severity: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        recommendClaim: Boolean,
        reasoning: String
    },
    generatedEmail: {
        subject: String,
        body: String,
        generatedAt: Date
    },
    emailSentAt: Date,
    emailSentTo: String,

    // Service Center Integration
    serviceCenterInfo: {
        centerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceCenter'
        },
        appointmentDate: Date,
        appointmentStatus: {
            type: String,
            enum: ['scheduled', 'confirmed', 'completed', 'cancelled']
        }
    }
}, {
    timestamps: true
});

// Generate unique claim number
claimSchema.pre('save', async function (next) {
    if (!this.claimNumber && this.isNew) {
        const count = await mongoose.model('Claim').countDocuments();
        this.claimNumber = `CLM-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

// Index for efficient querying
claimSchema.index({ userId: 1, status: 1 });
claimSchema.index({ warrantyId: 1 });
claimSchema.index({ claimNumber: 1 });

module.exports = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
