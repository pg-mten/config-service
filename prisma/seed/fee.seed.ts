import { PrismaClient } from '@prisma/client';

// function getRandomPercentage(): number {
//   const minCeil = Math.ceil(0);
//   const maxFloor = Math.floor(100);
//   return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
// }

function getRandomPercentage(): number {
  const min = 1;
  const max = 20;
  const minCeil = Math.ceil(min / 5);
  const maxFloor = Math.floor(max / 5);
  const multiplier =
    Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
  return multiplier * 5;
}

export async function feeSeed(prisma: PrismaClient) {
  const agents = await Promise.all([
    prisma.agent.create({ data: { id: 1, name: 'agent 1' } }),
    prisma.agent.create({ data: { id: 2, name: 'agent 2' } }),
    prisma.agent.create({ data: { id: 3, name: 'agent 3' } }),
    prisma.agent.create({ data: { id: 4, name: 'agent 4' } }),
    prisma.agent.create({ data: { id: 5, name: 'agent 5' } }),
  ]);
  console.log({ agents });

  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        id: 1,
        name: 'merchant 1',
      },
    }),
    prisma.merchant.create({
      data: {
        id: 2,
        name: 'merchant 2',
      },
    }),
    prisma.merchant.create({
      data: {
        id: 3,
        name: 'merchant 3',
      },
    }),
    prisma.merchant.create({
      data: {
        id: 4,
        name: 'merchant 4',
      },
    }),
    prisma.merchant.create({
      data: {
        id: 5,
        name: 'merchant 5',
      },
    }),
  ]);
  console.log({ merchants });

  const providersCommon = await prisma.common.findMany({
    where: {
      div: 'PROVIDER',
    },
  });

  const providers = await Promise.all(
    providersCommon.map((e) => {
      return prisma.provider.create({ data: { name: e.value } });
    }),
  );
  console.log({ providers });

  const paymentMethodsCommon = await prisma.common.findMany({
    where: {
      div: 'PAYMENT_METHOD',
    },
  });

  const paymentMethods = await Promise.all(
    paymentMethodsCommon.map((e) => {
      return prisma.paymentMethod.create({ data: { name: e.value } });
    }),
  );
  console.log({ paymentMethods });

  /// Merchant 1 -> agent 1 (60%) dan agent 2 (40%)
  /// Merchant 2 -> agent 2 (30%), agent 3 (50%) dan agent 4 (20%)
  const agentShareholders = await Promise.all([
    /// Merchant 1
    prisma.agentShareholder.create({
      data: { id: 1, merchantId: 1, agentId: 1, percentagePerAgent: 60 },
    }),
    prisma.agentShareholder.create({
      data: { id: 2, merchantId: 1, agentId: 2, percentagePerAgent: 40 },
    }),

    /// Merchant 2
    prisma.agentShareholder.create({
      data: { id: 3, merchantId: 2, agentId: 2, percentagePerAgent: 30 },
    }),
    prisma.agentShareholder.create({
      data: { id: 4, merchantId: 2, agentId: 3, percentagePerAgent: 50 },
    }),
    prisma.agentShareholder.create({
      data: { id: 5, merchantId: 2, agentId: 4, percentagePerAgent: 20 },
    }),
  ]);

  console.log({ agentShareholders });

  // const providers = ['NETZME', 'DANA', 'ALIPAY', 'STICPAY'];
  // const paymentMethods = ['QRIS', 'GOPAY', 'OVO', 'BCA', 'MANDIRI', 'BRI'];
  /// NETZME -> QRIS, GOPAY, OVO
  /// ALIPAY -> QRIS, GOPAY
  const providerFees = await Promise.all([
    /// BCA
    prisma.providerFee.create({
      data: {
        providerName: 'NETZME',
        paymentMethodName: 'QRIS',
        percentageProvider: 5,
      },
    }),
    prisma.providerFee.create({
      data: {
        providerName: 'NETZME',
        paymentMethodName: 'GOPAY',
        percentageProvider: 10,
      },
    }),
    prisma.providerFee.create({
      data: {
        providerName: 'NETZME',
        paymentMethodName: 'OVO',
        percentageProvider: 15,
      },
    }),

    /// Mandiri
    prisma.providerFee.create({
      data: {
        providerName: 'ALIPAY',
        paymentMethodName: 'QRIS',
        percentageProvider: 10,
      },
    }),
    prisma.providerFee.create({
      data: {
        providerName: 'ALIPAY',
        paymentMethodName: 'GOPAY',
        percentageProvider: 15,
      },
    }),
  ]);
  console.log({ providerFees });

  const internalFees = await Promise.all(
    providerFees.map((ppm) => {
      return prisma.internalFee.create({
        data: {
          providerFeeId: ppm.id,
          percentageInternal: getRandomPercentage(),
        },
      });
    }),
  );

  const merchantIds = merchants.map((merchant) => merchant.id);

  const agentFees = await Promise.all(
    internalFees.map((internalFee) => {
      return Promise.all(
        merchantIds.map((id) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return prisma.agentFee.create({
            data: {
              internalFeeId: internalFee.id,
              merchantId: id,
              percentageForAgent: getRandomPercentage(),
            },
          });
        }),
      );
    }),
  );

  console.log({ agentFees });

  // /// Merchant memilih provider dan jenis pembayarannya
  // const merchantProviderFee = await Promise.all([
  //   /// Merchant 1:
  //   /// BCA QRIS
  //   prisma.merchantProviderFee.create({
  //     data: {
  //       id: 1,
  //       merchantId: 1,
  //       providerPaymentMethodFeeId: 1,
  //     },
  //   }),
  //   /// BCA Debit
  //   prisma.merchantProviderFee.create({
  //     data: { id: 2, merchantId: 1, providerPaymentMethodFeeId: 2 },
  //   }),
  //   /// BCA Credit
  //   prisma.merchantProviderFee.create({
  //     data: { id: 3, merchantId: 1, providerPaymentMethodFeeId: 3 },
  //   }),
  //   /// Mandiri QRIS
  //   prisma.merchantProviderFee.create({
  //     data: { id: 4, merchantId: 1, providerPaymentMethodFeeId: 4 },
  //   }),

  //   /// Merchant 2
  //   /// BCA QRIS
  //   prisma.merchantProviderFee.create({
  //     data: { id: 5, merchantId: 2, providerPaymentMethodFeeId: 1 },
  //   }),
  //   /// Mandiri QRIS
  //   prisma.merchantProviderFee.create({
  //     data: { id: 6, merchantId: 2, providerPaymentMethodFeeId: 4 },
  //   }),
  // ]);
  // console.log({ merchantProviderFee });

  // const merchantProviderFeeMany = await prisma.merchantProviderFee.findMany();
  // const internalFee = await Promise.all(
  //   merchantProviderFeeMany.map((merchantProviderFee) => {
  //     return prisma.internalFee.create({
  //       data: {
  //         merchantProviderFeeId: merchantProviderFee.id,
  //         percentageInternal: getRandomPercentage(),
  //       },
  //     });
  //   }),
  // );
}
