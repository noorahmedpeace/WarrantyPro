import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
export declare class RemindersService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    handleCron(): Promise<void>;
}
