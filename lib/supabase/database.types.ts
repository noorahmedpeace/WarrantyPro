export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            warranties: {
                Row: {
                    id: string
                    user_id: string
                    product_name: string
                    brand: string | null
                    category: string | null
                    purchase_date: string
                    warranty_duration_months: number
                    expiry_date: string
                    shop_name: string | null
                    notes: string | null
                    status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    product_name: string
                    brand?: string | null
                    category?: string | null
                    purchase_date: string
                    warranty_duration_months: number
                    expiry_date: string
                    shop_name?: string | null
                    notes?: string | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    product_name?: string
                    brand?: string | null
                    category?: string | null
                    purchase_date?: string
                    warranty_duration_months?: number
                    expiry_date?: string
                    shop_name?: string | null
                    notes?: string | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            warranty_files: {
                Row: {
                    id: string
                    warranty_id: string
                    file_url: string
                    file_type: string | null
                    file_path: string
                    uploaded_at: string
                }
                Insert: {
                    id?: string
                    warranty_id: string
                    file_url: string
                    file_type?: string | null
                    file_path: string
                    uploaded_at?: string
                }
                Update: {
                    id?: string
                    warranty_id?: string
                    file_url?: string
                    file_type?: string | null
                    file_path?: string
                    uploaded_at?: string
                }
            }
        }
    }
}
