import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { DateHelper } from 'src/shared/helper/date.helper';
import { UpdateSettlementInternalDto } from './dto/update-settlement-internal.dto';
import axios from 'axios';
import { ResponseDto } from 'src/shared/response.dto';
import { SettlementInternalDto } from './dto/settlement-internal.dto';
import { URL_TRANSACTION } from 'src/shared/constant/url.constant';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runEveryMinutes() {
    await this.runForInterval(1);
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async runEvery30Minutes() {
    await this.runForInterval(30);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async runEvery1Hour() {
    await this.runForInterval(60);
  }

  @Cron('0 */90 * * * *')
  async runEvery90Minutes() {
    await this.runForInterval(90);
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async runEvery2Hours() {
    await this.runForInterval(120);
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async runEvery6Hours() {
    await this.runForInterval(360);
  }

  async runForInterval(intervalInMinutes: number) {
    const now = DateHelper.now();

    // Ambil merchant yang memiliki interval yang sesuai DAN waktunya sudah lewat
    const merchants = await this.prisma.merchant.findMany({
      where: {
        settlementInterval: intervalInMinutes,
        OR: [
          { lastSettlementAt: null },
          {
            lastSettlementAt: {
              lt: new Date(now.toMillis() - intervalInMinutes * 60 * 1000),
            },
          },
        ],
      },
    });

    if (merchants.length === 0) {
      this.logger.debug(
        `Tidak ada merchant dengan interval ${intervalInMinutes} menit untuk disettlement`,
      );
      return;
    }

    this.logger.log(
      `Menjalankan settlement untuk ${merchants.length} merchant (interval ${intervalInMinutes} menit)`,
    );

    const merchantIds: number[] = merchants.map((merchant) => merchant.id);

    const updateSettlementInternalDto = new UpdateSettlementInternalDto({
      date: now,
      interval: intervalInMinutes,
      merchantIds,
    });

    // eslint-disable-next-line no-useless-catch
    try {
      console.log(updateSettlementInternalDto);
      const res = await this.settlementServiceTCP(updateSettlementInternalDto);
      // const res = await this.settlementService(updateSettlementInternalDto);
      const data = res.data!;
      const { merchantIds } = data;

      await this.prisma.$transaction(async (tx) => {
        await Promise.all(
          merchantIds.map((merchantId) => {
            return tx.merchant.update({
              where: { id: merchantId },
              data: { lastSettlementAt: now.toJSDate() },
            });
          }),
        );
      });
      return data;
    } catch (error) {
      // console.log(error);
      // this.logger.error(error);
      throw error;
    }
  }
  async settlementServiceTCP(filter: UpdateSettlementInternalDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await firstValueFrom(
        this.transactionClient.send<ResponseDto<SettlementInternalDto>>(
          { cmd: 'settlement_schedule' },
          filter,
        ),
      );
      return res;
    } catch (error) {
      throw error;
    }
  }
  async settlementService(filter: UpdateSettlementInternalDto) {
    try {
      const res = await axios.post<ResponseDto<SettlementInternalDto>>(
        `${URL_TRANSACTION}/settlement/internal`,
        filter,
      );
      return res.data;
    } catch (error) {
      throw new Error('error call http ' + error.message);
    }
  }
}
