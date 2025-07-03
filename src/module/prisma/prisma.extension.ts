import { PrismaClient } from '@prisma/client';

export const extendedPrismaClient = new PrismaClient().$extends({});

export type ExtendedPrismaClient = typeof extendedPrismaClient;
