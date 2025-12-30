import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';

@Injectable()
export class WarrantiesService {
  constructor(private prisma: PrismaService) { }

  async create(createWarrantyDto: any) {
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

  findAll(userId: string) {
    return this.prisma.warranty.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { expiry_date: 'asc' },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.warranty.findFirst({
      where: { id, user_id: userId },
      include: { category: true },
    });
  }

  update(id: string, userId: string, updateWarrantyDto: any) {
    return this.prisma.warranty.updateMany({
      where: { id, user_id: userId },
      data: updateWarrantyDto,
    });
  }

  remove(id: string, userId: string) {
    return this.prisma.warranty.deleteMany({
      where: { id, user_id: userId },
    });
  }

  async addFile(warrantyId: string, userId: string, file: Express.Multer.File) {
    const warranty = await this.prisma.warranty.findFirst({
      where: { id: warrantyId, user_id: userId },
    });
    if (!warranty) {
      throw new NotFoundException('Warranty not found or access denied');
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
}
