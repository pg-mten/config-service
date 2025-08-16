import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommonDto } from './dto/common.dto';
import { CommonDiv } from 'src/shared/constant/fee.constant';

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

  async findManyByDiv(div: CommonDiv) {
    if (CommonDiv.PROVIDER === div) {
      const commons = await this.prisma.provider.findMany({
        select: { name: true },
      });
      return commons.map((common) => new CommonDto(common));
    } else if (CommonDiv.PAYMENT_METHOD === div) {
      const commons = await this.prisma.paymentMethod.findMany({
        select: { name: true },
      });
      return commons.map((common) => new CommonDto(common));
    }
    return [];
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
