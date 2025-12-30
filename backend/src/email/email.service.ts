import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    async onModuleInit() {
        await this.setupTransporter();
    }

    private async setupTransporter() {
        if (process.env.NODE_ENV === 'production') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            try {
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
                this.logger.log('Ethereal Email transporter initialized for development');
            } catch (error) {
                this.logger.error('Failed to create Ethereal Email account', error);
            }
        }
    }

    async sendMagicLink(email: string, token: string) {
        const magicLink = `http://localhost:5173/auth/verify?token=${token}`;

        const mailOptions = {
            from: '"WarrantyPro Security" <security@warrantypro.io>',
            to: email,
            subject: 'Your Magic Login Link 🔐',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;">WarrantyPro</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Greetings,</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">A secure authentication portal has been generated for your session. Click the button below to gain access to your protection catalog.</p>
          <a href="${magicLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; text-align: center; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">Access My Dashboard</a>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 40px;">This link will expire in 15 minutes. For your security, it can only be used once.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Military-Grade Security • AES-256 Encryption • © 2025 WarrantyPro</p>
        </div>
      `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Magic link sent to ${email}`);
            if (process.env.NODE_ENV !== 'production') {
                this.logger.log(`Ethereal URL: ${nodemailer.getTestMessageUrl(info)}`);
                this.logger.log(`LOGIN LINK: ${magicLink}`); // Added for easy testing
            }
            return true;
        } catch (error) {
            this.logger.error(`Error sending magic link to ${email}`, error);
            return false;
        }
    }

    async sendExpiryReminder(email: string, productName: string, daysLeft: number) {
        // Keep existing reminder functionality but upgrade it with proper email sending
        const mailOptions = {
            from: '"WarrantyPro Alerts" <alerts@warrantypro.io>',
            to: email,
            subject: `Warranty Expiry Alert: ${productName}`,
            html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;">WarrantyPro</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Your warranty for <b>${productName}</b> will expire in <b>${daysLeft} days</b>.</p>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 40px;">Access your dashboard to renew or check documentation.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Managed by WarrantyPro Enterprise Security</p>
          </div>
        `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Expiry reminder sent to ${email} for ${productName}`);
            return true;
        } catch (error) {
            this.logger.error(`Error sending expiry reminder to ${email}`, error);
            return false;
        }
    }
}
