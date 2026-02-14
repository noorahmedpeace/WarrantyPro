const fetch = require('node-fetch');

class OCRService {
    constructor() {
        // OCR.space API - Free tier: 25,000 requests/month
        this.apiKey = process.env.OCR_SPACE_API_KEY || 'K87899142388957'; // Free public key
        this.apiUrl = 'https://api.ocr.space/parse/image';
    }

    /**
     * Extract warranty information from receipt image
     * @param {string} imageBase64 - Base64 encoded image
     * @returns {Promise<Object>} Extracted warranty data
     */
    async extractReceiptData(imageBase64) {
        try {
            // Step 1: Extract text from image using OCR.space
            const ocrText = await this.performOCR(imageBase64);

            if (!ocrText) {
                throw new Error('No text could be extracted from the image');
            }

            // Step 2: Parse the extracted text to find warranty info
            const parsedData = this.parseReceiptText(ocrText);

            return {
                success: true,
                data: parsedData
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
     * Perform OCR using OCR.space API
     * @param {string} imageBase64 - Base64 encoded image
     * @returns {Promise<string>} Extracted text
     */
    async performOCR(imageBase64) {
        const formData = new URLSearchParams();
        formData.append('base64Image', `data:image/jpeg;base64,${imageBase64}`);
        formData.append('apikey', this.apiKey);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const result = await response.json();

        if (!result.IsErroredOnProcessing && result.ParsedResults && result.ParsedResults.length > 0) {
            return result.ParsedResults[0].ParsedText;
        } else {
            throw new Error(result.ErrorMessage || 'OCR processing failed');
        }
    }

    /**
     * Parse receipt text to extract warranty information
     * @param {string} text - OCR extracted text
     * @returns {Object} Parsed warranty data
     */
    parseReceiptText(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Initialize result
        const result = {
            productName: '',
            brand: 'Unknown',
            price: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            warrantyDuration: 12,
            confidence: 'medium'
        };

        // Extract product name (usually one of the first few lines with substantial text)
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const line = lines[i];
            // Skip store names, addresses, and short lines
            if (line.length > 10 && !this.isStoreInfo(line)) {
                result.productName = line;
                break;
            }
        }

        // Extract price (look for currency symbols and numbers)
        const priceRegex = /[\$€£₹]?\s*(\d+[,.]?\d*\.?\d+)/g;
        const prices = [];
        for (const line of lines) {
            const matches = line.match(priceRegex);
            if (matches) {
                matches.forEach(match => {
                    const num = parseFloat(match.replace(/[^\d.]/g, ''));
                    if (num > 0 && num < 100000) { // Reasonable price range
                        prices.push(num);
                    }
                });
            }
        }
        if (prices.length > 0) {
            result.price = Math.max(...prices); // Take the highest price (likely the total)
        }

        // Extract date (various formats)
        const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g;
        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            if (dateMatch) {
                try {
                    const parsedDate = this.parseDate(dateMatch[0]);
                    if (parsedDate) {
                        result.purchaseDate = parsedDate;
                        break;
                    }
                } catch (e) {
                    // Continue searching
                }
            }
        }

        // Extract brand (look for common brand keywords)
        const brandKeywords = ['Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'Google', 'Amazon'];
        for (const line of lines) {
            for (const brand of brandKeywords) {
                if (line.toLowerCase().includes(brand.toLowerCase())) {
                    result.brand = brand;
                    break;
                }
            }
            if (result.brand !== 'Unknown') break;
        }

        // Extract warranty duration (look for "warranty" keyword)
        const warrantyRegex = /(\d+)\s*(month|year|yr|mo)/i;
        for (const line of lines) {
            if (line.toLowerCase().includes('warrant')) {
                const match = line.match(warrantyRegex);
                if (match) {
                    let duration = parseInt(match[1]);
                    if (match[2].toLowerCase().includes('year') || match[2].toLowerCase().includes('yr')) {
                        duration *= 12; // Convert years to months
                    }
                    result.warrantyDuration = duration;
                    break;
                }
            }
        }

        // Set confidence based on how much data we extracted
        const fieldsFound = [
            result.productName !== '',
            result.price > 0,
            result.brand !== 'Unknown',
            result.warrantyDuration !== 12
        ].filter(Boolean).length;

        if (fieldsFound >= 3) result.confidence = 'high';
        else if (fieldsFound >= 2) result.confidence = 'medium';
        else result.confidence = 'low';

        return result;
    }

    /**
     * Check if line is likely store information
     * @param {string} line - Text line
     * @returns {boolean}
     */
    isStoreInfo(line) {
        const storeKeywords = ['store', 'shop', 'mall', 'street', 'avenue', 'road', 'tel:', 'phone:', 'email:', 'www.'];
        return storeKeywords.some(keyword => line.toLowerCase().includes(keyword));
    }

    /**
     * Parse date string to YYYY-MM-DD format
     * @param {string} dateStr - Date string
     * @returns {string|null} Formatted date
     */
    parseDate(dateStr) {
        const parts = dateStr.split(/[-/]/);
        if (parts.length !== 3) return null;

        let year, month, day;

        // Try to determine format
        if (parts[0].length === 4) {
            // YYYY-MM-DD or YYYY-DD-MM
            year = parts[0];
            month = parts[1];
            day = parts[2];
        } else if (parts[2].length === 4) {
            // MM-DD-YYYY or DD-MM-YYYY
            year = parts[2];
            // Assume MM-DD-YYYY (US format)
            month = parts[0];
            day = parts[1];
        } else {
            // Two-digit year
            year = '20' + parts[2];
            month = parts[0];
            day = parts[1];
        }

        // Validate and format
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');

        return `${year}-${month}-${day}`;
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
