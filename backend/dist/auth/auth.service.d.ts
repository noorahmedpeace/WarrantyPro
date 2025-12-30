import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    register(data: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            avatar: any;
        };
    }>;
    login(data: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            avatar: any;
        };
    }>;
    generateMagicLink(email: string): Promise<boolean>;
    verifyMagicLink(token: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            avatar: any;
        };
    }>;
    validateGoogleUser(googleProfile: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            avatar: any;
        };
    }>;
    generateTokens(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            avatar: any;
        };
    }>;
}
