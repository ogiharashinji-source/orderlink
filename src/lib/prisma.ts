import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1,
  });
  return new PrismaClient({ adapter } as never);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
