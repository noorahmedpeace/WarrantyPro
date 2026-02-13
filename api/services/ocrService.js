const OpenAI = require('openai');

class OCRService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Extract warranty information from receipt image
     * @param {string} imageBase64 - Base64 encoded image
     * @returns {Promise<Object>} Extracted warranty data
     */
    async extractReceiptData(imageBase64) {
        try {
            const prompt = `You are an expert receipt analyzer. Extract the following information from this receipt image:

1. Product Name (the main item purchased)
2. Brand (manufacturer/brand name)
3. Price (total amount paid, in USD if possible)
4. Purchase Date (in YYYY-MM-DD format)
5. Warranty Duration (if mentioned, in months)

Return ONLY a valid JSON object with this exact structure:
{
    "productName": "string",
    "brand": "string",
    "price": number,
    "purchaseDate": "YYYY-MM-DD",
    "warrantyDuration": number or null,
    "confidence": "high" | "medium" | "low"
}

Rules:
- If warranty duration is not found, set it to null
- If multiple items exist, extract the most expensive one
- For price, extract only the number (no currency symbols)
- Set confidence based on image quality and data clarity
- If you cannot extract a field with confidence, use null`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.1
            });

            const content = response.choices[0].message.content;

            // Parse JSON response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to extract JSON from response');
            }

            const extractedData = JSON.parse(jsonMatch[0]);

            // Validate required fields
            if (!extractedData.productName || !extractedData.purchaseDate) {
                throw new Error('Missing required fields: productName or purchaseDate');
            }

            return {
                success: true,
                data: {
                    productName: extractedData.productName,
                    brand: extractedData.brand || 'Unknown',
                    price: extractedData.price || 0,
                    purchaseDate: extractedData.purchaseDate,
                    warrantyDuration: extractedData.warrantyDuration || 12, // Default 12 months
                    confidence: extractedData.confidence || 'medium'
                }
            };

        } catch (error) {
            console.error('OCR Service Error:', error);
            return {
                success: false,
                error: error.message,
                suggestion: 'Please try again with a clearer image or enter details manually'
            };
        }
    }

    /**
     * Validate image before processing
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Object} Validation result
     */
    validateImage(imageBuffer) {
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (imageBuffer.length > maxSize) {
            return {
                valid: false,
                error: 'Image size exceeds 10MB limit'
            };
        }

        return { valid: true };
    }
}

module.exports = new OCRService();
