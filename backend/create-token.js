
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function createInternalToken() {
    const email = 'demo@warrantypro.io';
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);

    const link = await prisma.magicLink.create({
        data: {
            email,
            token,
            expires_at: expiresAt
        }
    });

    console.log(`MAGIC_URL:http://localhost:5173/auth/verify?token=${token}`);
}

createInternalToken();
