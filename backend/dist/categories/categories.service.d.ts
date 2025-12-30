import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
export declare class CategoriesService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        slug: string;
        created_at: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        name: string;
        slug: string;
        created_at: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
