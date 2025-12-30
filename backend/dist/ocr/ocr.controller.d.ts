import { OcrService } from './ocr.service';
export declare class OcrController {
    private readonly ocrService;
    constructor(ocrService: OcrService);
    scanFile(file: Express.Multer.File): Promise<{
        product_name: string;
        brand: string | null;
        purchase_date: string;
        warranty_duration_months: number;
        raw_text: string;
    }>;
}
