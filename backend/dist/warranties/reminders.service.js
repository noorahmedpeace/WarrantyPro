"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
const email_service_1 = require("../email/email.service");
let RemindersService = RemindersService_1 = class RemindersService {
    prisma;
    emailService;
    logger = new common_1.Logger(RemindersService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async handleCron() {
        this.logger.debug('Running daily warranty expiry check...');
        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(today.getDate() + 30);
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
};
exports.RemindersService = RemindersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "handleCron", null);
exports.RemindersService = RemindersService = RemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map