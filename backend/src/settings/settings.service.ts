import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getOrCreate(userId: string) {
        let settings = await this.prisma.userSettings.findUnique({
            where: { user_id: userId },
        });

        if (!settings) {
            settings = await this.prisma.userSettings.create({
                data: {
                    user_id: userId,
                    email_notifications: true,
                    alert_days_before: 30,
                    theme: 'dark',
                    language: 'en',
                },
            });
        }

        return settings;
    }

    async update(userId: string, data: any) {
        return this.prisma.userSettings.update({
            where: { user_id: userId },
            data,
        });
    }
}
