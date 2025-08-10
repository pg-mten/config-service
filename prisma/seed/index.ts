import { PrismaClient } from '@prisma/client';
import { feeSeed } from './fee.seed';
import { commonSeed } from './common.seed';

const prisma = new PrismaClient();

async function main() {
  await commonSeed(prisma);
  await feeSeed(prisma);
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
