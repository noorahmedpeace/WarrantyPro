import { OnModuleInit } from '@nestjs/common';
export declare class EmailService implements OnModuleInit {
    private transporter;
    private readonly logger;
    onModuleInit(): Promise<void>;
    private setupTransporter;
    sendMagicLink(email: string, token: string): Promise<boolean>;
    sendExpiryReminder(email: string, productName: string, daysLeft: number): Promise<boolean>;
}
