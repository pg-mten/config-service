import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommonDto } from './dto/common.dto';

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  findByDivAndValue(div: string, value: string) {
    return this.prisma.common.findFirst({
      where: { div, value },
    });
  }

  async findManyByDiv(div: string) {
    const commons = await this.prisma.common.findMany({
      where: { div, isActive: true },
    });
    return commons.map((common) => new CommonDto(common));
  }
}
