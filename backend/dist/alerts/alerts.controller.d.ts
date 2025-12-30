import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    findAll(userId: string): Promise<({
        warranty: {
            id: string;
            user_id: string;
            product_name: string;
            brand: string | null;
            categoryId: string | null;
            purchase_date: Date;
            warranty_duration_months: number;
            expiry_date: Date;
            shop_name: string | null;
            notes: string | null;
            status: string;
            created_at: Date;
            updated_at: Date;
        } | null;
    } & {
        id: string;
        user_id: string;
        warranty_id: string | null;
        type: string;
        title: string;
        message: string;
        severity: string;
        read: boolean;
        dismissed: boolean;
        created_at: Date;
        updated_at: Date;
    })[]>;
    markAsRead(id: string): Promise<{
        id: string;
        user_id: string;
        warranty_id: string | null;
        type: string;
        title: string;
        message: string;
        severity: string;
        read: boolean;
        dismissed: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    dismiss(id: string): Promise<{
        id: string;
        user_id: string;
        warranty_id: string | null;
        type: string;
        title: string;
        message: string;
        severity: string;
        read: boolean;
        dismissed: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    generateAlerts(): Promise<{
        generated: number;
        alerts: any[];
    }>;
}
