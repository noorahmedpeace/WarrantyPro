import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(userId: string): Promise<{
        id: string;
        user_id: string;
        email_notifications: boolean;
        alert_days_before: number;
        theme: string;
        language: string;
        created_at: Date;
        updated_at: Date;
    }>;
    updateSettings(userId: string, data: any): Promise<{
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
