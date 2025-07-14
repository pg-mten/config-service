import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommonDto } from './dto/common.dto';

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  findByDivAndValueThrow(div: string, value: string) {
    return this.prisma.common.findFirstOrThrow({
      where: { div, value },
    });
  }

  async findManyByDiv(div: string) {
    const commons = await this.prisma.common.findMany({
      where: { div, isActive: true },
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
