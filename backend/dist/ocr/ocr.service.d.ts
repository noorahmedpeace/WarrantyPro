export declare class OcrService {
    private readonly logger;
    scanImage(fileBuffer: Buffer): Promise<{
        product_name: string;
        brand: string | null;
        purchase_date: string;
        warranty_duration_months: number;
        raw_text: string;
    }>;
    private parseExtractedText;
}
