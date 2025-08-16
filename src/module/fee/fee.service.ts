import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseFeeDto } from './dto/base-fee.dto';

@Injectable()
export class FeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllConfig() {
    const baseFees = await this.prisma.baseFee.findMany();

    const baseFeeDtos: BaseFeeDto[] = [];
    for (const baseFee of baseFees) {
      baseFeeDtos.push(new BaseFeeDto({ ...baseFee }));
    }
    return baseFeeDtos;
  }
}
