import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Home & Furniture', slug: 'home-furniture' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Vehicle', slug: 'vehicle' },
      { name: 'Services', slug: 'services' },
      { name: 'Other', slug: 'other' },
    ];

    for (const cat of defaultCategories) {
      await this.prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }
}
