// prisma/seed.ts
import { PrismaClient, Prisma, TransactionTypeEnum } from '@prisma/client';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

function getRandomPercentage(min: number = 0.01, max: number = 0.7): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(2));
}

function getRandomDouble(min: number = 500, max: number = 2500): number {
  const base = 500;
  const minCeil = Math.ceil(min / base) * base;
  const maxFloor = Math.floor(max / base) * base;
  const rangeCount = Math.floor((maxFloor - minCeil) / base) + 1;
  const randomIndex = Math.floor(Math.random() * rangeCount);
  return minCeil + randomIndex * base;
}

async function main() {
  console.log('Seeding data...');

  const agents = await prisma.agent.createMany({
    data: [{ id: 1 }, { id: 2 }, { id: 3 }],
  });
  console.log({ agents });

  // 1. Provider
  const providers = await prisma.provider.createMany({
    data: [
      { name: 'INTERNAL', reconciliationTime: '02:00' },
      { name: 'NETZME', reconciliationTime: '02:00' },
      { name: 'DANA', reconciliationTime: '02:00' },
      { name: 'PAYHERE', reconciliationTime: '02:00' },
    ],
    skipDuplicates: true,
  });
  console.log({ providers });

  // 2. Payment Method
  const paymentMethods = await prisma.paymentMethod.createMany({
    data: [
      {
        name: 'QRIS',
        explain: 'QRIS',
        transactionTypes: [TransactionTypeEnum.PURCHASE],
      },
      {
        name: 'VIRTUALACCOUNT',
        explain: 'VIRTUAL_ACCOUNT',
        transactionTypes: [TransactionTypeEnum.PURCHASE],
      },
      {
        name: 'DIRECTEWALLET',
        explain: 'DIRECT_E_WALLET',
        transactionTypes: [TransactionTypeEnum.PURCHASE],
      },
      {
        name: 'TRANSFERBANK',
        explain: 'TRANSFER_BANK',
        transactionTypes: [
          TransactionTypeEnum.TOPUP,
          TransactionTypeEnum.DISBURSEMENT,
          TransactionTypeEnum.WITHDRAW,
        ],
      },
      {
        name: 'TRANSFEREWALLET',
        explain: 'TRANSFER_E_WALLET',
        transactionTypes: [
          TransactionTypeEnum.DISBURSEMENT,
          TransactionTypeEnum.WITHDRAW,
        ],
      },
    ],
    skipDuplicates: true,
  });
  console.log({ paymentMethods });

  // 4. Base Fee Config (fee provider default)
  const baseFeeConfigsData: Prisma.BaseFeeCreateManyInput[] = [
    {
      code: 'INTERNAL_TRANSFERBANK_TOPUP',
      providerName: 'NETZME',
      paymentMethodName: 'QRIS',
      transactionType: 'TOPUP',
      feeProviderFixed: new Decimal(0),
      feeProviderPercentage: new Decimal(0),
    },
    /**
     * PURCHASE NETZME
     */
    {
      code: 'NETZME_QRIS_PURCHASE',
      providerName: 'NETZME',
      paymentMethodName: 'QRIS',
      transactionType: 'PURCHASE',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    {
      code: 'NETZME_VIRTUALACCOUNT_PURCHASE',
      providerName: 'NETZME',
      paymentMethodName: 'VIRTUALACCOUNT',
      transactionType: 'PURCHASE',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    /**
     * PURCHASE DANA
     */
    {
      code: 'DANA_VIRTUALACCOUNT_PURCHASE',
      providerName: 'DANA',
      paymentMethodName: 'VIRTUALACCOUNT',
      transactionType: 'PURCHASE',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    {
      code: 'DANA_DIRECTEWALLET_PURCHASE',
      providerName: 'DANA',
      paymentMethodName: 'DIRECTEWALLET',
      transactionType: 'PURCHASE',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },

    /**
     * TOPUP NETZME
     */
    {
      code: 'NETZME_TRANSFERBANK_TOPUP',
      providerName: 'NETZME',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: 'TOPUP',
      feeProviderFixed: new Decimal(0),
      feeProviderPercentage: new Decimal(0),
    },
    /**
     * TOPUP DANA
     */
    {
      code: 'DANA_TRANSFERBANK_TOPUP',
      providerName: 'DANA',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: 'TOPUP',
      feeProviderFixed: new Decimal(0),
      feeProviderPercentage: new Decimal(0),
    },

    /**
     * DISBURSEMENT NETZME
     */
    {
      code: 'NETZME_TRANSFERBANK_DISBURSEMENT',
      providerName: 'NETZME',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: 'DISBURSEMENT',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    {
      code: 'NETZME_TRANSFEREWALLET_DISBURSEMENT',
      providerName: 'NETZME',
      paymentMethodName: 'TRANSFEREWALLET',
      transactionType: 'DISBURSEMENT',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    /**
     * DISBURSEMENT DANA
     */
    {
      code: 'DANA_TRANSFERBANK_DISBURSEMENT',
      providerName: 'DANA',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: 'DISBURSEMENT',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    {
      code: 'DANA_TRANSFEREWALLET_DISBURSEMENT',
      providerName: 'DANA',
      paymentMethodName: 'TRANSFEREWALLET',
      transactionType: 'DISBURSEMENT',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },

    /**
     * WITHDRAW NETZME
     */
    {
      code: 'NETZME_TRANSFERBANK_WITHDRAW',
      providerName: 'NETZME',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: 'WITHDRAW',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    {
      code: 'NETZME_TRANSFEREWALLET_WITHDRAW',
      providerName: 'NETZME',
      paymentMethodName: 'TRANSFEREWALLET',
      transactionType: 'WITHDRAW',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    /**
     * WITHDRAW DANA
     */
    {
      code: 'DANA_TRANSFERBANK_WITHDRAW',
      providerName: 'DANA',
      paymentMethodName: 'TRANSFERBANK',
      transactionType: 'WITHDRAW',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },
    {
      code: 'DANA_TRANSFEREWALLET_WITHDRAW',
      providerName: 'DANA',
      paymentMethodName: 'TRANSFEREWALLET',
      transactionType: 'WITHDRAW',
      feeProviderFixed: new Decimal(getRandomDouble()),
      feeProviderPercentage: new Decimal(getRandomPercentage()),
    },

    /**
     * PAYHERE PURCHASE
     */
    {
      code: 'PAYHERE_QRIS_PURCHASE',
      providerName: 'PAYHERE',
      paymentMethodName: 'QRIS',
      transactionType: 'PURCHASE',
      feeProviderFixed: new Decimal(0),
      feeProviderPercentage: new Decimal(0.7),
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
    create: { settlementInterval: 1 },
  });

  const merchantB = await prisma.merchant.upsert({
    where: { id: 2 },
    update: {},
    create: { settlementInterval: 1 },
  });

  const merchantC = await prisma.merchant.upsert({
    where: { id: 3 },
    update: {},
    create: { settlementInterval: 1 },
  });

  const merchantD = await prisma.merchant.upsert({
    where: { id: 4 },
    update: {},
    create: { settlementInterval: 1 },
  });
  console.log({ merchantA, merchantB, merchantC, merchantD });

  // Ambil baseFeeConfig untuk assign ke MerchantFeeConfig
  const baseFees = await prisma.baseFee.findMany();

  // 6. Merchant Fee Config (override internal & agent fee)
  const merchantFees: Prisma.MerchantFeeCreateManyInput[] = [];

  for (const bfc of baseFees) {
    // Untuk TopUp → fee 0
    if (bfc.transactionType === 'TOPUP') {
      merchantFees.push({
        merchantId: merchantA.id,
        baseFeeId: bfc.id,
        feeAgentFixed: new Decimal(0),
        feeAgentPercentage: new Decimal(0),
        feeInternalFixed: new Decimal(0),
        feeInternalPercentage: new Decimal(0),
      });
      merchantFees.push({
        merchantId: merchantB.id,
        baseFeeId: bfc.id,
        feeAgentFixed: new Decimal(0),
        feeAgentPercentage: new Decimal(0),
        feeInternalFixed: new Decimal(0),
        feeInternalPercentage: new Decimal(0),
      });
    } else {
      // Simulasi Merchant A dapat fee internal 0.2% dan agent 0.1%
      merchantFees.push({
        merchantId: merchantA.id,
        baseFeeId: bfc.id,
        feeAgentFixed: new Decimal(getRandomDouble()),
        feeAgentPercentage: new Decimal(getRandomPercentage()),
        feeInternalFixed: new Decimal(getRandomDouble()),
        feeInternalPercentage: new Decimal(getRandomPercentage()),
      });
      // Simulasi Merchant B flat fee internal 2000 dan agent flat 1500
      merchantFees.push({
        merchantId: merchantB.id,
        baseFeeId: bfc.id,
        feeAgentFixed: new Decimal(getRandomDouble()),
        feeAgentPercentage: new Decimal(getRandomPercentage()),
        feeInternalFixed: new Decimal(getRandomDouble()),
        feeInternalPercentage: new Decimal(getRandomPercentage()),
      });
    }
  }

  Array.from([1, 2, 7, 9, 13, 14, 15]).forEach((bcfId) => {
    if (bcfId === 15) {
      merchantFees.push({
        merchantId: merchantC.id,
        baseFeeId: bcfId,
        feeAgentFixed: new Decimal(0),
        feeAgentPercentage: new Decimal(0.1),
        feeInternalFixed: new Decimal(0),
        feeInternalPercentage: new Decimal(0.2),
      });
    } else {
      merchantFees.push({
        merchantId: merchantC.id,
        baseFeeId: bcfId,
        feeAgentFixed: new Decimal(getRandomDouble()),
        feeAgentPercentage: new Decimal(getRandomPercentage()),
        feeInternalFixed: new Decimal(getRandomDouble()),
        feeInternalPercentage: new Decimal(getRandomPercentage()),
      });
    }
  });

  const merchantFeeConfig = await prisma.merchantFee.createMany({
    data: merchantFees,
    skipDuplicates: true,
  });
  console.log({ merchantFeeConfig });

  const agentShareholders: Prisma.AgentShareholderCreateManyInput[] = [];

  /// Merchant A Agent Sharehoder
  agentShareholders.push(
    ...[
      {
        agentId: 1,
        merchantId: merchantA.id,
        percentagePerAgent: new Decimal(40),
      },
      {
        agentId: 2,
        merchantId: merchantA.id,
        percentagePerAgent: new Decimal(60),
      },
    ],
  );

  /// Merchant B Agent Sharehoder
  agentShareholders.push(
    ...[
      {
        agentId: 2,
        merchantId: merchantB.id,
        percentagePerAgent: new Decimal(30),
      },
      {
        agentId: 3,
        merchantId: merchantB.id,
        percentagePerAgent: new Decimal(70),
      },
    ],
  );

  /// Merchant C Agent Sharehoder
  agentShareholders.push(
    ...[
      {
        agentId: 3,
        merchantId: merchantC.id,
        percentagePerAgent: new Decimal(100),
      },
    ],
  );

  /// Merchant D Agent Sharehoder
  agentShareholders.push(
    ...[
      {
        agentId: 2,
        merchantId: merchantD.id,
        percentagePerAgent: new Decimal(20),
      },
      {
        agentId: 3,
        merchantId: merchantD.id,
        percentagePerAgent: new Decimal(80),
      },
    ],
  );

  const agentShareholderConfig =
    await prisma.agentShareholder.createManyAndReturn({
      data: agentShareholders,
      skipDuplicates: true,
    });
  console.log({ agentShareholderConfig });

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
