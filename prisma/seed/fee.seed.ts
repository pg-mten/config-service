import { PrismaClient } from '@prisma/client';

function getRandomPercentage(): number {
  const min = 1;
  const max = 50;
  const minCeil = Math.ceil(min / 5);
  const maxFloor = Math.floor(max / 5);
  const multiplier =
    Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
  return multiplier * 5;
}

export async function feeSeed(prisma: PrismaClient) {
  const agent = await Promise.all([
    prisma.agent.create({ data: { id: 1, name: 'agent 1' } }),
    prisma.agent.create({ data: { id: 2, name: 'agent 2' } }),
    prisma.agent.create({ data: { id: 3, name: 'agent 3' } }),
    prisma.agent.create({ data: { id: 4, name: 'agent 4' } }),
    prisma.agent.create({ data: { id: 5, name: 'agent 5' } }),
  ]);
  console.log({ agent });

  const merchant = await Promise.all([
    prisma.merchant.create({
      data: {
        id: 1,
        name: 'merchant 1',
        percentageForAgent: 10,
      },
    }),
    prisma.merchant.create({
      data: {
        id: 2,
        name: 'merchant 2',
        percentageForAgent: 10,
      },
    }),
    prisma.merchant.create({
      data: {
        id: 3,
        name: 'merchant 3',
        percentageForAgent: 15,
      },
    }),
    prisma.merchant.create({
      data: {
        id: 4,
        name: 'merchant 4',
        percentageForAgent: 20,
      },
    }),
    prisma.merchant.create({
      data: {
        id: 5,
        name: 'merchant 5',
        percentageForAgent: 25,
      },
    }),
  ]);
  console.log({ merchant });

  const provider = await Promise.all([
    prisma.provider.create({ data: { id: 1, name: 'BCA' } }),
    prisma.provider.create({ data: { id: 2, name: 'Mandiri' } }),
  ]);
  console.log({ provider });

  const paymentMethod = await Promise.all([
    prisma.paymentMethod.create({ data: { id: 1, name: 'QRIS' } }),
    prisma.paymentMethod.create({ data: { id: 2, name: 'Debit' } }),
    prisma.paymentMethod.create({ data: { id: 3, name: 'Credit' } }),
  ]);
  console.log({ paymentMethod });

  /// Merchant 1 -> agent 1 (60%) dan agent 2 (40%)
  /// Merchant 2 -> agent 2 (30%), agent 3 (50%) dan agent 4 (20%)
  const merchantAgentFee = await Promise.all([
    /// Merchant 1
    prisma.merchantAgentFee.create({
      data: { id: 1, merchantId: 1, agentId: 1, percentagePerAgent: 60 },
    }),
    prisma.merchantAgentFee.create({
      data: { id: 2, merchantId: 1, agentId: 2, percentagePerAgent: 40 },
    }),

    /// Merchant 2
    prisma.merchantAgentFee.create({
      data: { id: 3, merchantId: 2, agentId: 2, percentagePerAgent: 30 },
    }),
    prisma.merchantAgentFee.create({
      data: { id: 4, merchantId: 2, agentId: 3, percentagePerAgent: 50 },
    }),
    prisma.merchantAgentFee.create({
      data: { id: 5, merchantId: 2, agentId: 4, percentagePerAgent: 20 },
    }),
  ]);
  console.log({ merchantAgentFee });

  /// BCA -> QRIS, Debit, Credit
  /// Mandiri -> QRIS, Debit
  const providerPaymentMethodFee = await Promise.all([
    /// BCA
    prisma.providerPaymentMethodFee.create({
      data: {
        id: 1,
        providerId: 1,
        paymentMethodId: 1,
        percentageProvider: 5,
      },
    }),
    prisma.providerPaymentMethodFee.create({
      data: {
        id: 2,
        providerId: 1,
        paymentMethodId: 2,
        percentageProvider: 10,
      },
    }),
    prisma.providerPaymentMethodFee.create({
      data: {
        id: 3,
        providerId: 1,
        paymentMethodId: 3,
        percentageProvider: 15,
      },
    }),

    /// Mandiri
    prisma.providerPaymentMethodFee.create({
      data: {
        id: 4,
        providerId: 2,
        paymentMethodId: 1,
        percentageProvider: 10,
      },
    }),
    prisma.providerPaymentMethodFee.create({
      data: {
        id: 5,
        providerId: 2,
        paymentMethodId: 2,
        percentageProvider: 15,
      },
    }),
  ]);
  console.log({ providerPaymentMethodFee });

  /// Merchant memilih provider dan jenis pembayarannya
  const merchantProviderFee = await Promise.all([
    /// Merchant 1:
    /// BCA QRIS
    prisma.merchantProviderFee.create({
      data: {
        id: 1,
        merchantId: 1,
        providerPaymentMethodFeeId: 1,
      },
    }),
    /// BCA Debit
    prisma.merchantProviderFee.create({
      data: { id: 2, merchantId: 1, providerPaymentMethodFeeId: 2 },
    }),
    /// BCA Credit
    prisma.merchantProviderFee.create({
      data: { id: 3, merchantId: 1, providerPaymentMethodFeeId: 3 },
    }),
    /// Mandiri QRIS
    prisma.merchantProviderFee.create({
      data: { id: 4, merchantId: 1, providerPaymentMethodFeeId: 4 },
    }),

    /// Merchant 2
    /// BCA QRIS
    prisma.merchantProviderFee.create({
      data: { id: 5, merchantId: 2, providerPaymentMethodFeeId: 1 },
    }),
    /// Mandiri QRIS
    prisma.merchantProviderFee.create({
      data: { id: 6, merchantId: 2, providerPaymentMethodFeeId: 4 },
    }),
  ]);
  console.log({ merchantProviderFee });

  const merchantProviderFeeMany = await prisma.merchantProviderFee.findMany();
  const internalFee = await Promise.all(
    merchantProviderFeeMany.map((merchantProviderFee) => {
      return prisma.internalFee.create({
        data: {
          merchantProviderFeeId: merchantProviderFee.id,
          percentageInternal: getRandomPercentage(),
        },
      });
    }),
  );
  console.log({ internalFee });
}
