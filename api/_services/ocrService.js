const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_VERSION = 'v1beta';

/**
 * Receipt reading, done by the vision model rather than by OCR plus regex.
 *
 * The previous implementation posted the image to OCR.space, got a flat wall of
 * text back, and then tried to recover structure from it with rules that were
 * guesses: take the highest number on the receipt as the price, assume any date
 * is US month-first, match a product name by picking the first line over ten
 * characters that does not look like an address. It also fell back to a public
 * API key shared with every other user of that free tier, so it rate-limited
 * under no load at all.
 *
 * A vision model reads the layout, so it knows which number is the total and
 * which is a line item, and it can say it does not know rather than guessing.
 * It also removes a whole third-party dependency: the project already has a
 * Gemini key for the claim assistant.
 */
class OCRService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        } else {
            console.warn('⚠️ GEMINI_API_KEY is missing. Receipt scanning will not work.');
        }
        this.model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    }

    /**
     * @param {string} imageBase64 - base64 image data, no data: prefix
     * @param {string} mimeType
     * @returns {Promise<{success: boolean, data?: object, error?: string, suggestion?: string}>}
     */
    async extractReceiptData(imageBase64, mimeType = 'image/jpeg') {
        if (!this.genAI) {
            return {
                success: false,
                error: 'Receipt scanning is not configured',
                suggestion: 'Enter the details manually for now.',
            };
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.model }, { apiVersion: API_VERSION });

            const result = await model.generateContent([
                { inlineData: { mimeType, data: imageBase64 } },
                { text: this.buildPrompt() },
            ]);

            const text = result.response.text();
            const match = text.match(/\{[\s\S]*\}/);
            if (!match) {
                return {
                    success: false,
                    error: 'Nothing readable was found in that image',
                    suggestion: 'Try a straighter, better-lit photograph, or enter the details manually.',
                };
            }

            return { success: true, data: this.normalise(JSON.parse(match[0])) };
        } catch (error) {
            console.error('Receipt read error:', error);
            return {
                success: false,
                error: 'The receipt could not be read',
                suggestion: 'Try again in a moment, or enter the details manually.',
            };
        }
    }

    buildPrompt() {
        return `You are reading a photograph of a purchase receipt or invoice.

Extract only what the document actually shows. Where it does not say something,
return null for that field rather than guessing. Do not infer a warranty length
from the product type.

Rules:
- price is the total paid, not a line item and not a subtotal before tax.
- purchaseDate is the transaction date, in YYYY-MM-DD. Read the format from the
  document itself; do not assume month-first or day-first.
- warrantyMonths only if the document states a warranty or guarantee period.
  Convert years to months.
- productName is the item bought, not the shop's name.
- brand is the manufacturer, not the retailer.
- confidence is "high" if the document is clearly legible and you found the
  product and the date, "medium" if some fields are guessed from partial text,
  "low" if the image is blurred, cropped or mostly unreadable.

Respond with JSON only, no commentary:
{"productName":null,"brand":null,"price":null,"purchaseDate":null,"warrantyMonths":null,"confidence":"low"}`;
    }

    /** Field names the add-warranty form already reads. */
    normalise(parsed) {
        const num = (v) => {
            const n = Number(v);
            return Number.isFinite(n) && n > 0 ? n : null;
        };

        const date = typeof parsed.purchaseDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.purchaseDate)
            ? parsed.purchaseDate
            : null;

        return {
            productName: parsed.productName || '',
            brand: parsed.brand || '',
            price: num(parsed.price) ?? 0,
            purchaseDate: date,
            warrantyDuration: num(parsed.warrantyMonths),
            confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'low',
        };
    }

    validateImage(imageBuffer) {
        const maxSize = 10 * 1024 * 1024;

        if (!imageBuffer || imageBuffer.length === 0) {
            return { valid: false, error: 'The image was empty' };
        }
        if (imageBuffer.length > maxSize) {
            return { valid: false, error: 'Image size exceeds 10MB limit' };
        }
        return { valid: true };
    }
}

module.exports = new OCRService();
