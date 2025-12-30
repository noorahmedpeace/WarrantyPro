import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        return this.prisma.alert.findMany({
            where: { user_id: userId, dismissed: false },
            include: { warranty: true },
            orderBy: [{ read: 'asc' }, { created_at: 'desc' }],
        });
    }

    async markAsRead(id: string) {
        return this.prisma.alert.update({
            where: { id },
            data: { read: true },
        });
    }

    async dismiss(id: string) {
        return this.prisma.alert.update({
            where: { id },
            data: { dismissed: true },
        });
    }

    async generateExpiryAlerts() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const now = new Date();

        // Find warranties expiring within 30 days or already expired
        const expiringWarranties = await this.prisma.warranty.findMany({
            where: {
                expiry_date: { lte: thirtyDaysFromNow },
                status: 'active',
            },
        });

        const alerts: any[] = [];

        for (const warranty of expiringWarranties) {
            const isExpired = warranty.expiry_date <= now;
            const daysUntilExpiry = Math.ceil(
                (warranty.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

            // Check if alert already exists
            const existingAlert = await this.prisma.alert.findFirst({
                where: {
                    warranty_id: warranty.id,
                    type: isExpired ? 'EXPIRED' : 'EXPIRING_SOON',
                    dismissed: false,
                },
            });

            if (!existingAlert) {
                const alert = await this.prisma.alert.create({
                    data: {
                        user_id: warranty.user_id,
                        warranty_id: warranty.id,
                        type: isExpired ? 'EXPIRED' : 'EXPIRING_SOON',
                        title: isExpired
                            ? `Warranty Expired: ${warranty.product_name}`
                            : `Warranty Expiring Soon: ${warranty.product_name}`,
                        message: isExpired
                            ? `The warranty for your ${warranty.product_name} has expired.`
                            : `Your ${warranty.product_name} warranty will expire in ${daysUntilExpiry} day(s).`,
                        severity: isExpired ? 'CRITICAL' : daysUntilExpiry <= 7 ? 'WARNING' : 'INFO',
                    },
                });
                alerts.push(alert);
            }
        }

        return { generated: alerts.length, alerts };
    }
}
