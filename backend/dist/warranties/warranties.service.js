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
exports.WarrantiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let WarrantiesService = class WarrantiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createWarrantyDto) {
        const purchaseDate = new Date(createWarrantyDto.purchase_date);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + createWarrantyDto.warranty_duration_months);
        return this.prisma.warranty.create({
            data: {
                ...createWarrantyDto,
                purchase_date: purchaseDate,
                expiry_date: expiryDate,
            },
            include: { category: true },
        });
    }
    findAll(userId) {
        return this.prisma.warranty.findMany({
            where: { user_id: userId },
            include: { category: true },
            orderBy: { expiry_date: 'asc' },
        });
    }
    findOne(id, userId) {
        return this.prisma.warranty.findFirst({
            where: { id, user_id: userId },
            include: { category: true },
        });
    }
    update(id, userId, updateWarrantyDto) {
        return this.prisma.warranty.updateMany({
            where: { id, user_id: userId },
            data: updateWarrantyDto,
        });
    }
    remove(id, userId) {
        return this.prisma.warranty.deleteMany({
            where: { id, user_id: userId },
        });
    }
    async addFile(warrantyId, userId, file) {
        const warranty = await this.prisma.warranty.findFirst({
            where: { id: warrantyId, user_id: userId },
        });
        if (!warranty) {
            throw new common_1.NotFoundException('Warranty not found or access denied');
        }
        return this.prisma.warrantyFile.create({
            data: {
                warranty_id: warrantyId,
                url: `/uploads/${file.filename}`,
                filename: file.originalname,
                mime_type: file.mimetype,
                size: file.size,
            },
        });
    }
};
exports.WarrantiesService = WarrantiesService;
exports.WarrantiesService = WarrantiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarrantiesService);
//# sourceMappingURL=warranties.service.js.map