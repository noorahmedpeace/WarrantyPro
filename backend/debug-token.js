
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listLinks() {
    const count = await prisma.magicLink.count();
    console.log(`Total links: ${count}`);
    const links = await prisma.magicLink.findMany();
    console.log(JSON.stringify(links, null, 2));
}

listLinks();
