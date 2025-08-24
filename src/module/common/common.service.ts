import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommonDto } from './dto/common.dto';
import { CommonDiv } from 'src/shared/constant/fee.constant';
import { TransactionTypeEnum } from '@prisma/client';
import { FilterCommonDto } from './dto/filter-common.dto';

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  findByDivAndValueThrow(div: CommonDiv, value: string) {
    if (CommonDiv.PROVIDER === div) {
      return this.prisma.provider.findFirstOrThrow({
        where: { name: value },
      });
    } else if (CommonDiv.PAYMENT_METHOD === div) {
      return this.prisma.paymentMethod.findFirstOrThrow({
        where: { name: value },
      });
    }
    return this.prisma.common.findFirstOrThrow({
      where: { div: div, value: value },
    });
  }

  async findManyByDiv(filter: FilterCommonDto) {
    const { div } = filter;

    if (CommonDiv.PROVIDER === div) {
      const commons = await this.prisma.provider.findMany();
      return commons
        .filter((common) => common.name !== 'INTERNAL')
        .map(
          (common) =>
            new CommonDto({ name: common.name, explain: common.name }),
        );
    } else if (CommonDiv.PROVIDER_TOPUP === div) {
      return [new CommonDto({ name: 'INTERNAL', explain: 'INTERNAL' })];
    } else if (CommonDiv.PAYMENT_METHOD === div) {
      const commons = await this.prisma.paymentMethod.findMany();
      return commons.map((common) => new CommonDto(common));
    }

    let type: TransactionTypeEnum = TransactionTypeEnum.PURCHASE;
    if (CommonDiv.PAYMENT_METHOD_PURCHASE === div)
      type = TransactionTypeEnum.PURCHASE;
    if (CommonDiv.PAYMENT_METHOD_TOPUP === div)
      type = TransactionTypeEnum.TOPUP;
    if (CommonDiv.PAYMENT_METHOD_WITHDRAW === div)
      type = TransactionTypeEnum.WITHDRAW;
    if (CommonDiv.PAYMENT_METHOD_DISBURSEMENT === div)
      type = TransactionTypeEnum.DISBURSEMENT;

    const commons = await this.prisma.paymentMethod.findMany({
      where: {
        transactionTypes: { has: type },
      },
    });
    return commons.map((common) => new CommonDto(common));
  }

  divAndValueIsExist(div: string, values: string[]) {
    return this.prisma.common.findMany({
      where: {
        div: div,
        value: {
          in: values,
        },
      },
    });
  }
}
