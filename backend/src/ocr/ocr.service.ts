import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);

    async scanImage(fileBuffer: Buffer) {
        this.logger.log('Starting OCR scan...');
        try {
            const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
            this.logger.log('Extracted text successfully.');

            return this.parseExtractedText(text);
        } catch (error) {
            this.logger.error('OCR failed', error.stack);
            throw new Error('OCR text extraction failed');
        }
    }

    private parseExtractedText(text: string) {
        // Advanced heuristic regex for extraction
        const brandRegex = /(Apple|Samsung|Sony|LG|Microsoft|Dell|HP|Bosch|Nike|Lego|Google|Amazon|Panasonic|Philips|Logitech)/i;
        const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
        // Capture patterns like "2 years", "12 months", "Lifetime", etc.
        const durationRegex = /(\d+|one|two|three)\s*(year|month|day)s?\s*(warranty|coverage|protection)/i;

        const brandMatch = text.match(brandRegex);
        const dateMatch = text.match(dateRegex);
        const durationMatch = text.match(durationRegex);

        let durationInMonths = 12; // Default
        if (durationMatch) {
            let valueStr = durationMatch[1].toLowerCase();
            const unit = durationMatch[2].toLowerCase();

            // Map words to numbers for common durations
            const wordMap: Record<string, number> = { 'one': 1, 'two': 2, 'three': 3 };
            const value = wordMap[valueStr] || parseInt(valueStr);

            if (!isNaN(value)) {
                if (unit.startsWith('year')) durationInMonths = value * 12;
                else if (unit.startsWith('month')) durationInMonths = value;
            }
        }

        return {
            product_name: 'Extracted Product', // In a real app, use NLP or user prompt
            brand: brandMatch ? brandMatch[0] : null,
            purchase_date: dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0],
            warranty_duration_months: durationInMonths,
            raw_text: text, // For debugging/review
        };
    }
}
