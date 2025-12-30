import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    async register(data: any) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                settings: {
                    create: {},
                },
            },
        });

        return this.generateTokens(user);
    }

    async login(data: any) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    async generateMagicLink(email: string) {
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins expiry

        await this.prisma.magicLink.create({
            data: {
                email,
                token,
                expires_at: expiresAt,
            },
        });

        return this.emailService.sendMagicLink(email, token);
    }

    async verifyMagicLink(token: string) {
        const magicLink = await this.prisma.magicLink.findUnique({
            where: { token },
        });

        if (!magicLink || magicLink.used || magicLink.expires_at < new Date()) {
            throw new UnauthorizedException('Invalid or expired magic link');
        }

        // Mark link as used
        await this.prisma.magicLink.update({
            where: { id: magicLink.id },
            data: { used: true },
        });

        // Get or create user
        let user = await this.prisma.user.findUnique({
            where: { email: magicLink.email },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: magicLink.email,
                    settings: {
                        create: {}, // Create default settings
                    },
                },
            });
        }

        return this.generateTokens(user);
    }

    async validateGoogleUser(googleProfile: any) {
        const { id, emails, displayName, photos } = googleProfile;
        const email = emails[0].value;

        let user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: displayName,
                    avatar: photos[0]?.value,
                    google_id: id,
                    settings: {
                        create: {},
                    },
                },
            });
        } else if (!user.google_id) {
            // Link google account to existing email user
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    google_id: id,
                    name: user.name || displayName,
                    avatar: user.avatar || photos[0]?.value,
                }
            });
        }

        return this.generateTokens(user);
    }

    async generateTokens(user: any) {
        const payload = { sub: user.id, email: user.email };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        };
    }
}
