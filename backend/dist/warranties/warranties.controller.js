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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarrantiesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const warranties_service_1 = require("./warranties.service");
const create_warranty_dto_1 = require("./dto/create-warranty.dto");
const update_warranty_dto_1 = require("./dto/update-warranty.dto");
let WarrantiesController = class WarrantiesController {
    warrantiesService;
    constructor(warrantiesService) {
        this.warrantiesService = warrantiesService;
    }
    async create(createWarrantyDto, req) {
        console.log('Creating warranty - Payload:', JSON.stringify(createWarrantyDto));
        console.log('User from Req:', req.user);
        try {
            createWarrantyDto.user_id = req.user.id;
            return await this.warrantiesService.create(createWarrantyDto);
        }
        catch (error) {
            console.error('Error creating warranty:', error);
            throw error;
        }
    }
    findAll(req) {
        return this.warrantiesService.findAll(req.user.id);
    }
    findOne(id, req) {
        return this.warrantiesService.findOne(id, req.user.id);
    }
    update(id, updateWarrantyDto, req) {
        return this.warrantiesService.update(id, req.user.id, updateWarrantyDto);
    }
    remove(id, req) {
        return this.warrantiesService.remove(id, req.user.id);
    }
    uploadFile(id, file, req) {
        return this.warrantiesService.addFile(id, req.user.id, file);
    }
};
exports.WarrantiesController = WarrantiesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_warranty_dto_1.CreateWarrantyDto, Object]),
    __metadata("design:returntype", Promise)
], WarrantiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WarrantiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WarrantiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_warranty_dto_1.UpdateWarrantyDto, Object]),
    __metadata("design:returntype", void 0)
], WarrantiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WarrantiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WarrantiesController.prototype, "uploadFile", null);
exports.WarrantiesController = WarrantiesController = __decorate([
    (0, common_1.Controller)('warranties'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [warranties_service_1.WarrantiesService])
], WarrantiesController);
//# sourceMappingURL=warranties.controller.js.map