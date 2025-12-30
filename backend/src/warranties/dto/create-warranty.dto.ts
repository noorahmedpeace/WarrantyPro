export class CreateWarrantyDto {
    user_id: string;
    product_name: string;
    brand?: string;
    category?: string;
    purchase_date: string | Date;
    warranty_duration_months: number;
    shop_name?: string;
    notes?: string;
}

