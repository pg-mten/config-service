import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseFeeDto } from '../merchant/dto-response/base-fee.dto';

@Injectable()
export class FeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllConfig() {
    const baseFees = await this.prisma.baseFee.findMany();

    return baseFees.map((baseFee) => new BaseFeeDto({ ...baseFee }));
  }
}
