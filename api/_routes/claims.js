const express = require('express');
const router = express.Router();
const Claim = require('../_models/Claim');
const Warranty = require('../_models/Warranty');
const User = require('../_models/User');
const aiService = require('../_services/aiService');
const emailService = require('../_services/emailService');

/**
 * POST /api/claims/diagnose
 * AI diagnostic chat endpoint
 */
router.post('/diagnose', async (req, res) => {
    try {
        const { warrantyId, message, conversationHistory = [] } = req.body;
        const userId = req.userId;

        // Get warranty details for context
        const warranty = await Warranty.findOne({ _id: warrantyId, userId });
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        // Add user message to conversation
        const updatedHistory = [
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        // Get AI response
        const aiResponse = await aiService.getDiagnosticResponse(
            updatedHistory,
            warranty
        );

        // Add AI response to conversation
        updatedHistory.push({ role: 'assistant', content: aiResponse });

        res.json({
            response: aiResponse,
            conversationHistory: updatedHistory
        });
    } catch (error) {
        console.error('Diagnostic chat error:', error);
        res.status(500).json({ error: 'Failed to process diagnostic request' });
    }
});

/**
 * POST /api/claims/analyze-severity
 * Analyze issue severity
 */
router.post('/analyze-severity', async (req, res) => {
    try {
        const { issueDescription, conversationHistory = [] } = req.body;

        const analysis = await aiService.analyzeIssueSeverity(
            issueDescription,
            conversationHistory
        );

        res.json(analysis);
    } catch (error) {
        console.error('Severity analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze severity' });
    }
});

/**
 * POST /api/claims/generate-troubleshooting
 * Generate troubleshooting steps
 */
router.post('/generate-troubleshooting', async (req, res) => {
    try {
        const { warrantyId, issueDescription } = req.body;
        const userId = req.userId;

        const warranty = await Warranty.findOne({ _id: warrantyId, userId });
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        const steps = await aiService.generateTroubleshootingSteps(
            warranty.categoryId || 'General',
            issueDescription
        );

        res.json({ troubleshootingSteps: steps });
    } catch (error) {
        console.error('Troubleshooting generation error:', error);
        res.status(500).json({ error: 'Failed to generate troubleshooting steps' });
    }
});

/**
 * POST /api/claims/generate-email
 * Generate professional claim email
 */
router.post('/generate-email', async (req, res) => {
    try {
        const {
            warrantyId,
            issueDescription,
            troubleshootingSteps = [],
            conversationSummary = ''
        } = req.body;
        const userId = req.userId;

        // Get warranty and user details
        const warranty = await Warranty.findOne({ _id: warrantyId, userId });
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate email using AI
        const emailData = await aiService.generateClaimEmail({
            warranty,
            issueDescription,
            troubleshootingSteps,
            conversationSummary,
            userInfo: {
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

        res.json(emailData);
    } catch (error) {
        console.error('Email generation error:', error);
        res.status(500).json({ error: 'Failed to generate claim email' });
    }
});

/**
 * POST /api/claims/submit
 * Submit warranty claim with email
 */
router.post('/submit', async (req, res) => {
    try {
        const {
            warrantyId,
            issueDescription,
            conversationHistory = [],
            troubleshootingSteps = [],
            emailSubject,
            emailBody,
            manufacturerEmail,
            attachments = []
        } = req.body;
        const userId = req.userId;

        // Get warranty and user
        const warranty = await Warranty.findOne({ _id: warrantyId, userId });
        if (!warranty) {
            return res.status(404).json({ error: 'Warranty not found' });
        }

        const user = await User.findById(userId);

        // Analyze severity
        const severityAnalysis = await aiService.analyzeIssueSeverity(
            issueDescription,
            conversationHistory
        );

        // Create claim record
        const claim = new Claim({
            userId,
            warrantyId,
            issueDescription,
            diagnosticConversation: conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: new Date()
            })),
            aiSuggestions: {
                troubleshootingSteps,
                severity: severityAnalysis.severity,
                recommendClaim: severityAnalysis.recommendClaim,
                reasoning: severityAnalysis.reasoning
            },
            generatedEmail: {
                subject: emailSubject,
                body: emailBody,
                generatedAt: new Date()
            },
            status: 'pending'
        });

        await claim.save();

        // Send email to manufacturer if email provided
        if (manufacturerEmail) {
            try {
                const emailResult = await emailService.sendClaimEmail({
                    to: manufacturerEmail,
                    cc: user.email, // CC user
                    subject: emailSubject,
                    body: emailBody,
                    attachments,
                    warranty,
                    user
                });

                claim.emailSentAt = emailResult.sentAt;
                claim.emailSentTo = manufacturerEmail;
                await claim.save();

                // Send confirmation to user
                await emailService.sendClaimConfirmation(user, claim, warranty);
            } catch (emailError) {
                console.error('Email send failed:', emailError);
                // Don't fail the claim creation, just log the error
            }
        }

        res.json({
            success: true,
            claim: {
                id: claim._id,
                claimNumber: claim.claimNumber,
                status: claim.status,
                createdAt: claim.createdAt
            }
        });
    } catch (error) {
        console.error('Claim submission error:', error);
        res.status(500).json({ error: 'Failed to submit claim' });
    }
});

/**
 * GET /api/claims
 * Get all claims for user
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { status, warrantyId } = req.query;

        const query = { userId };
        if (status) query.status = status;
        if (warrantyId) query.warrantyId = warrantyId;

        const claims = await Claim.find(query)
            .populate('warrantyId', 'product_name brand purchase_date')
            .sort({ createdAt: -1 });

        res.json({ claims });
    } catch (error) {
        console.error('Get claims error:', error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

/**
 * GET /api/claims/:id
 * Get single claim details
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const claim = await Claim.findOne({ _id: id, userId })
            .populate('warrantyId')
            .populate('serviceCenterInfo.centerId');

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({ claim });
    } catch (error) {
        console.error('Get claim error:', error);
        res.status(500).json({ error: 'Failed to fetch claim' });
    }
});

/**
 * PATCH /api/claims/:id/status
 * Update claim status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { status, notes } = req.body;

        const claim = await Claim.findOne({ _id: id, userId });
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        claim.status = status;
        if (notes) claim.notes = notes;
        await claim.save();

        res.json({ success: true, claim });
    } catch (error) {
        console.error('Update claim error:', error);
        res.status(500).json({ error: 'Failed to update claim' });
    }
});

/**
 * DELETE /api/claims/:id
 * Delete claim
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const claim = await Claim.findOneAndDelete({ _id: id, userId });
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({ success: true, message: 'Claim deleted successfully' });
    } catch (error) {
        console.error('Delete claim error:', error);
        res.status(500).json({ error: 'Failed to delete claim' });
    }
});

module.exports = router;
