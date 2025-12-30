import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RemindersService {
    private readonly logger = new Logger(RemindersService.name);

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.debug('Running daily warranty expiry check...');

        const today = new Date();

        // Check for 30 days
        const in30Days = new Date();
        in30Days.setDate(today.getDate() + 30);

        // Check for 7 days
        const in7Days = new Date();
        in7Days.setDate(today.getDate() + 7);

        const checkDates = [in30Days, in7Days];

        for (const date of checkDates) {
            const dateString = date.toISOString().split('T')[0];
            const expiringWarranties = await this.prisma.warranty.findMany({
                where: {
                    expiry_date: {
                        gte: new Date(dateString + 'T00:00:00Z'),
                        lte: new Date(dateString + 'T23:59:59Z'),
                    },
                    status: 'active',
                },
                include: { user: true },
            });

            for (const warranty of expiringWarranties) {
                const daysLeft = date === in30Days ? 30 : 7;
                if (warranty.user && warranty.user.email) {
                    await this.emailService.sendExpiryReminder(warranty.user.email, warranty.product_name, daysLeft);
                }
            }
        }
    }
}
