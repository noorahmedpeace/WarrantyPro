"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const Tesseract = __importStar(require("tesseract.js"));
let OcrService = OcrService_1 = class OcrService {
    logger = new common_1.Logger(OcrService_1.name);
    async scanImage(fileBuffer) {
        this.logger.log('Starting OCR scan...');
        try {
            const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
            this.logger.log('Extracted text successfully.');
            return this.parseExtractedText(text);
        }
        catch (error) {
            this.logger.error('OCR failed', error.stack);
            throw new Error('OCR text extraction failed');
        }
    }
    parseExtractedText(text) {
        const brandRegex = /(Apple|Samsung|Sony|LG|Microsoft|Dell|HP|Bosch|Nike|Lego|Google|Amazon|Panasonic|Philips|Logitech)/i;
        const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
        const durationRegex = /(\d+|one|two|three)\s*(year|month|day)s?\s*(warranty|coverage|protection)/i;
        const brandMatch = text.match(brandRegex);
        const dateMatch = text.match(dateRegex);
        const durationMatch = text.match(durationRegex);
        let durationInMonths = 12;
        if (durationMatch) {
            let valueStr = durationMatch[1].toLowerCase();
            const unit = durationMatch[2].toLowerCase();
            const wordMap = { 'one': 1, 'two': 2, 'three': 3 };
            const value = wordMap[valueStr] || parseInt(valueStr);
            if (!isNaN(value)) {
                if (unit.startsWith('year'))
                    durationInMonths = value * 12;
                else if (unit.startsWith('month'))
                    durationInMonths = value;
            }
        }
        return {
            product_name: 'Extracted Product',
            brand: brandMatch ? brandMatch[0] : null,
            purchase_date: dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0],
            warranty_duration_months: durationInMonths,
            raw_text: text,
        };
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)()
], OcrService);
//# sourceMappingURL=ocr.service.js.map