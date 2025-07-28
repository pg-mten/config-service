import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  @Cron(CronExpression.EVERY_90_MINUTES)
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
    const now = new Date();

    // Ambil merchant yang memiliki interval yang sesuai DAN waktunya sudah lewat
    const merchants = await this.prisma.merchant.findMany({
      where: {
        settlementInterval: intervalInMinutes,
        OR: [
          { lastSettlementAt: null },
          {
            lastSettlementAt: {
              lt: new Date(now.getTime() - intervalInMinutes * 60 * 1000),
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

    for (const merchant of merchants) {
      try {
        // TODO: Gantikan dengan logika settlement kamu
        this.logger.log(
          `▶ Settlement merchant ${merchant.id} [${merchant.name}]`,
        );

        // Simulasikan proses settlement
        // await this.settlementService.process(merchant.id);

        // Update waktu terakhir settlement
        await this.prisma.merchant.update({
          where: { id: merchant.id },
          data: { lastSettlementAt: now },
        });
      } catch (error) {
        this.logger.error(
          `❌ Gagal settlement merchant ${merchant.id}`,
          error.stack,
        );
      }
    }
  }
}
