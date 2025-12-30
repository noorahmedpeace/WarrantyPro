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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AlertsService = class AlertsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.alert.findMany({
            where: { user_id: userId, dismissed: false },
            include: { warranty: true },
            orderBy: [{ read: 'asc' }, { created_at: 'desc' }],
        });
    }
    async markAsRead(id) {
        return this.prisma.alert.update({
            where: { id },
            data: { read: true },
        });
    }
    async dismiss(id) {
        return this.prisma.alert.update({
            where: { id },
            data: { dismissed: true },
        });
    }
    async generateExpiryAlerts() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const now = new Date();
        const expiringWarranties = await this.prisma.warranty.findMany({
            where: {
                expiry_date: { lte: thirtyDaysFromNow },
                status: 'active',
            },
        });
        const alerts = [];
        for (const warranty of expiringWarranties) {
            const isExpired = warranty.expiry_date <= now;
            const daysUntilExpiry = Math.ceil((warranty.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map