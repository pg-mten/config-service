import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { DateHelper } from 'src/shared/helper/date.helper';
import { SettlementSettleReconClient } from 'src/microservice/settle-recon/settlement.client';

@Injectable()
export class SettlementSchedulerService {
  private readonly logger = new Logger(SettlementSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementClient: SettlementSettleReconClient,
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

    // eslint-disable-next-line no-useless-catch
    try {
      const merchantIdList: number[] = merchants.map((merchant) => merchant.id);

      const res = await this.settlementClient.scheduleTCP({
        date: now,
        interval: intervalInMinutes,
        merchantIds: merchantIdList,
      });

      const { merchantIds, merchantIdsNoSettlement } = res.data!;
      console.log({ merchantIds, merchantIdsNoSettlement });

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
      return;
    } catch (error) {
      // console.log(error);
      // this.logger.error(error);
      throw error;
    }
  }
}
