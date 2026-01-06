export declare class CreateWarrantyDto {
    user_id: string;
    product_name: string;
    brand?: string;
    categoryId?: string;
    purchase_date: string | Date;
    warranty_duration_months: number;
    shop_name?: string;
    notes?: string;
}
