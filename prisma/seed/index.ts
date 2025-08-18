// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { TransactionType } from '../../src/shared/constant/fee.constant';

const prisma = new PrismaClient();

function getRandomPercentage(): number {
  const min = 0.01; // 0.01%
  const max = 10; // 10%
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(2));
}

function getRandomDouble(): number {
  const base = 500;
  const min = Math.ceil(500 / base) * base;
  const max = Math.floor(7000 / base) * base;
  const rangeCount = Math.floor((max - min) / 500) + 1;
  const randomIndex = Math.floor(Math.random() * rangeCount);
  return min + randomIndex * 500;
}

async function main() {
  console.log('Seeding data...');

  const agents = await prisma.agent.createMany({
    data: [{ id: 1 }, { id: 2 }],
  });
  console.log({ agents });

  // 1. Provider
  const providers = await prisma.provider.createMany({
    data: [
      { name: 'INTERNAL', reconciliationTime: '02:00' },
      { name: 'NETZME', reconciliationTime: '02:00' },
      { name: 'DANA', reconciliationTime: '02:00' },
    ],
    skipDuplicates: true,
  });
  console.log({ providers });

  // 2. Payment Method
  const paymentMethods = await prisma.paymentMethod.createMany({
    data: [{ name: 'QRIS' }, { name: 'VA' }, { name: 'TransferBank' }],
    skipDuplicates: true,
  });
  console.log({ paymentMethods });

  // 3. Transaction Types
  const transactionTypes = await prisma.transactionType.createMany({
    data: Object.values(TransactionType).map((type) => {
      return { name: type };
    }),
    skipDuplicates: true,
  });
  console.log({ transactionTypes });

  // Helper function untuk dapat ID relasi by name
  // const getProviderName = (name: string) => name;
  // const getPaymentMethodName = (name: string) => name;
  // const getTransactionTypeName = (name: string) => name;

  // 4. Base Fee Config (fee provider default)
  const baseFeeConfigsData: Prisma.BaseFeeCreateManyInput[] = [
    // QRIS Purchase
    {
      code: 'NETZME_QRIS_PURCHASE',
      providerName: 'NETZME',
      paymentMethodName: 'QRIS',
      transactionTypeName: 'PURCHASE',
      isPercentageProvider: true,
      feeProvider: new Prisma.Decimal(getRandomPercentage()),
    },
    {
      code: 'DANA_QRIS_PURCHASE',
      providerName: 'DANA',
      paymentMethodName: 'QRIS',
      transactionTypeName: 'PURCHASE',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },

    // VA TopUp (0 fee provider)
    {
      code: 'NETZME_VA_TOPUP',
      providerName: 'NETZME',
      paymentMethodName: 'VA',
      transactionTypeName: 'TOPUP',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(0),
    },
    {
      code: 'DANA_VA_TOPUP',
      providerName: 'DANA',
      paymentMethodName: 'VA',
      transactionTypeName: 'TOPUP',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(0),
    },

    // TransferBank TopUp (0 fee provider)
    {
      code: 'NETZME_TF_TOPUP',
      providerName: 'NETZME',
      paymentMethodName: 'TransferBank',
      transactionTypeName: 'TOPUP',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(0),
    },
    {
      code: 'DANA_TF_TOPUP',
      providerName: 'DANA',
      paymentMethodName: 'TransferBank',
      transactionTypeName: 'TOPUP',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(0),
    },

    // VA Withdraw
    {
      code: 'NETZME_VA_WITHDRAW',
      providerName: 'NETZME',
      paymentMethodName: 'VA',
      transactionTypeName: 'WITHDRAW',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },
    {
      code: 'DANA_VA_WITHDRAW',
      providerName: 'DANA',
      paymentMethodName: 'VA',
      transactionTypeName: 'WITHDRAW',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },

    // TransferBank Withdraw
    {
      code: 'NETZME_TF_WITHDRAW',
      providerName: 'NETZME',
      paymentMethodName: 'TransferBank',
      transactionTypeName: 'WITHDRAW',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },
    {
      code: 'DANA_TF_WITHDRAW',
      providerName: 'DANA',
      paymentMethodName: 'TransferBank',
      transactionTypeName: 'WITHDRAW',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },

    // VA Disbursement
    {
      code: 'NETZME_VA_DISBURSEMENT',
      providerName: 'NETZME',
      paymentMethodName: 'VA',
      transactionTypeName: 'DISBURSEMENT',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },
    {
      code: 'DANA_VA_DISBURSEMENT',
      providerName: 'DANA',
      paymentMethodName: 'VA',
      transactionTypeName: 'DISBURSEMENT',
      isPercentageProvider: true,
      feeProvider: new Prisma.Decimal(getRandomPercentage()),
    },

    // TransferBank Disbursement
    {
      code: 'NETZME_TF_DISBURSEMENT',
      providerName: 'NETZME',
      paymentMethodName: 'TransferBank',
      transactionTypeName: 'DISBURSEMENT',
      isPercentageProvider: true,
      feeProvider: new Prisma.Decimal(getRandomPercentage()),
    },
    {
      code: 'DANA_TF_DISBURSEMENT',
      providerName: 'DANA',
      paymentMethodName: 'TransferBank',
      transactionTypeName: 'DISBURSEMENT',
      isPercentageProvider: false,
      feeProvider: new Prisma.Decimal(getRandomDouble()),
    },
  ];

  console.log({ baseFeeConfigsData });

  const baseFeeConfig = await prisma.baseFee.createMany({
    data: baseFeeConfigsData,
    skipDuplicates: true,
  });
  console.log({ baseFeeConfig });

  // 5. Merchant
  const merchantA = await prisma.merchant.upsert({
    where: { id: 1 },
    update: {},
    create: { settlementInterval: 120 },
  });

  const merchantB = await prisma.merchant.upsert({
    where: { id: 2 },
    update: {},
    create: { settlementInterval: 60 },
  });
  console.log({ merchantA, merchantB });

  // Ambil baseFeeConfig untuk assign ke MerchantFeeConfig
  const baseFees = await prisma.baseFee.findMany();

  // 6. Merchant Fee Config (override internal & agent fee)
  const merchantFees: Prisma.MerchantFeeCreateManyInput[] = [];

  for (const bfc of baseFees) {
    // Untuk TopUp → fee 0
    if (bfc.transactionTypeName === 'TOPUP') {
      merchantFees.push({
        merchantId: merchantA.id,
        baseFeeId: bfc.id,
        isPercentageInternal: false,
        feeInternal: new Prisma.Decimal(0),
        isPercentageAgent: false,
        feeAgent: new Prisma.Decimal(0),
      });
      merchantFees.push({
        merchantId: merchantB.id,
        baseFeeId: bfc.id,
        isPercentageInternal: false,
        feeInternal: new Prisma.Decimal(0),
        isPercentageAgent: false,
        feeAgent: new Prisma.Decimal(0),
      });
    } else {
      // Simulasi Merchant A dapat fee internal 0.2% dan agent 0.1%
      merchantFees.push({
        merchantId: merchantA.id,
        baseFeeId: bfc.id,
        isPercentageInternal: true,
        feeInternal: new Prisma.Decimal(getRandomPercentage()),
        isPercentageAgent: true,
        feeAgent: new Prisma.Decimal(getRandomPercentage()),
      });
      // Simulasi Merchant B flat fee internal 2000 dan agent flat 1500
      merchantFees.push({
        merchantId: merchantB.id,
        baseFeeId: bfc.id,
        isPercentageInternal: false,
        feeInternal: new Prisma.Decimal(getRandomDouble()),
        isPercentageAgent: false,
        feeAgent: new Prisma.Decimal(getRandomDouble()),
      });
    }
  }

  const merchantFeeConfig = await prisma.merchantFee.createMany({
    data: merchantFees,
    skipDuplicates: true,
  });
  console.log({ merchantFeeConfig });

  console.log('Seeding selesai ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
