import { PrismaClient } from '@prisma/client';

export async function commonSeed(prisma: PrismaClient) {
  let commons = [];

  const providers = ['NETZME', 'DANA', 'ALIPAY', 'STIKPAY'];

  for (const provider of providers) {
    const common = await prisma.common.create({
      data: {
        div: 'PROVIDER',
        value: provider,
        explain: `Provider for ${provider}`,
      },
    });
    commons.push(common);
  }
  console.log(commons);
  commons = [];

  const paymentMethods = ['QRIS', 'GOPAY', 'OVO', 'BCA', 'MANDIRI', 'BRI'];
  for (const paymentMethod of paymentMethods) {
    const common = await prisma.common.create({
      data: {
        div: 'PAYMENT_METHOD',
        value: paymentMethod,
        explain: `Payment Method for ${paymentMethod}`,
      },
    });
    commons.push(common);
  }
  console.log(commons);
  commons = [];
}
