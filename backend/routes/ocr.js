const express = require('express');
const multer = require('multer');
const ocrService = require('../services/ocrService');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

/**
 * POST /api/ocr/scan-receipt
 * Extract warranty data from receipt image
 */
router.post('/scan-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        // Validate image
        const validation = ocrService.validateImage(req.file.buffer);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        // Convert buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');

        // Extract data using OCR service
        const result = await ocrService.extractReceiptData(imageBase64);

        if (!result.success) {
            return res.status(422).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('OCR Route Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process receipt image',
            details: error.message
        });
    }
});

/**
 * POST /api/ocr/scan-receipt-base64
 * Alternative endpoint accepting base64 directly (for mobile camera)
 */
router.post('/scan-receipt-base64', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({
                success: false,
                error: 'No image data provided'
            });
        }

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Extract data using OCR service
        const result = await ocrService.extractReceiptData(base64Data);

        if (!result.success) {
            return res.status(422).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('OCR Base64 Route Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process receipt image',
            details: error.message
        });
    }
});

module.exports = router;
