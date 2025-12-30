import { PrismaService } from '../prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreate(userId: string): Promise<{
        id: string;
        user_id: string;
        email_notifications: boolean;
        alert_days_before: number;
        theme: string;
        language: string;
        created_at: Date;
        updated_at: Date;
    }>;
    update(userId: string, data: any): Promise<{
        id: string;
        user_id: string;
        email_notifications: boolean;
        alert_days_before: number;
        theme: string;
        language: string;
        created_at: Date;
        updated_at: Date;
    }>;
}
