import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterProfileProviderSystemDto } from 'src/microservice/config/dto-system/filter-profile-provider.system.dto';
import { TransactionUserRole } from 'src/shared/constant/transaction.constant';
import { ProfileProviderSystemDto } from 'src/microservice/config/dto-system/profile-provider.system.dto';

@Injectable()
export class UserProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileProvider(dto: FilterProfileProviderSystemDto) {
    const { userId, userRole, transactionType } = dto;

    if (userRole === TransactionUserRole.ADMIN) {
      return new ProfileProviderSystemDto({
        userId,
        userRole,
        providerName: 'aaa', // TODO
        paymentMethodName: 'TRANSFERBANK',
      });
    } else if (userRole === TransactionUserRole.AGENT) {
      const agent = await this.prisma.agent.findUniqueOrThrow({
        where: { id: userId },
      });

      return new ProfileProviderSystemDto({
        userId,
        userRole,
        providerName: agent.providerName ?? 'aaa', // TODO
        paymentMethodName: agent.paymentMethodName ?? 'TRANSFERBANK',
      });
    }

    const merchantFees = await this.prisma.merchantFee.findMany({
      where: { merchantId: userId },
      include: { baseFee: true },
    });

    const merchantFee = merchantFees.find((merchantFee) => {
      return merchantFee.baseFee.transactionType === transactionType;
    });
    if (!merchantFee) console.log('Belum terdaftar');

    const baseFee = merchantFee?.baseFee;

    return new ProfileProviderSystemDto({
      userId,
      userRole,
      providerName: baseFee?.providerName ?? 'Not registered yet',
      paymentMethodName: baseFee?.paymentMethodName ?? 'Not Registered yet',
    });
  }
}
