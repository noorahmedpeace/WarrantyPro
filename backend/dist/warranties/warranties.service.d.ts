import { PrismaService } from '../prisma.service';
export declare class WarrantiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createWarrantyDto: any): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
        } | null;
    } & {
        id: string;
        user_id: string;
        product_name: string;
        brand: string | null;
        categoryId: string | null;
        purchase_date: Date;
        warranty_duration_months: number;
        expiry_date: Date;
        shop_name: string | null;
        notes: string | null;
        status: string;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(userId: string): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
        } | null;
    } & {
        id: string;
        user_id: string;
        product_name: string;
        brand: string | null;
        categoryId: string | null;
        purchase_date: Date;
        warranty_duration_months: number;
        expiry_date: Date;
        shop_name: string | null;
        notes: string | null;
        status: string;
        created_at: Date;
        updated_at: Date;
    })[]>;
    findOne(id: string, userId: string): import(".prisma/client").Prisma.Prisma__WarrantyClient<({
        category: {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
        } | null;
    } & {
        id: string;
        user_id: string;
        product_name: string;
        brand: string | null;
        categoryId: string | null;
        purchase_date: Date;
        warranty_duration_months: number;
        expiry_date: Date;
        shop_name: string | null;
        notes: string | null;
        status: string;
        created_at: Date;
        updated_at: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, userId: string, updateWarrantyDto: any): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, userId: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    addFile(warrantyId: string, userId: string, file: Express.Multer.File): Promise<{
        id: string;
        warranty_id: string;
        url: string;
        filename: string;
        mime_type: string;
        size: number;
        uploaded_at: Date;
    }>;
}
