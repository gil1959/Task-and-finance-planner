import { PrismaClient } from '@prisma/client'


declare global {
    // biar ga re-init di dev mode
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        log: ['warn', 'error'],
    })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
