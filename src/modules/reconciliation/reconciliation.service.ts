import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleReconciliationCheck() {
    const now = new Date();
    const currentTime = this.formatTime(now); // HH:mm format
    const today = new Date(now.toDateString()); // jam 00:00 hari ini

    const providers = await this.prisma.provider.findMany({
      where: {
        reconciliationTime: currentTime,
        OR: [
          { lastReconciliationAt: null },
          { lastReconciliationAt: { lt: today } }, // pastikan belum recon hari ini
        ],
      },
    });

    if (providers.length === 0) {
      this.logger.debug(
        `⏰ Tidak ada provider yang waktunya reconciliation sekarang (${currentTime})`,
      );
      return;
    }

    for (const provider of providers) {
      try {
        this.logger.log(
          `▶ Menjalankan reconciliation untuk provider ${provider.name} (${provider.name})`,
        );

        // TODO: Gantikan dengan proses recon kamu
        // await this.reconciliationService.runForProvider(provider.id);

        await this.prisma.provider.update({
          where: { name: provider.name },
          data: { lastReconciliationAt: now },
        });
      } catch (error) {
        this.logger.error(
          `❌ Gagal reconciliation provider ${provider.name}`,
          error.stack,
        );
      }
    }
  }
  private formatTime(date: Date): string {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`; // 'HH:mm'
  }

  async runForProvider(providerName: string, date: Date) {
    const provider = await this.prisma.provider.findUnique({
      where: { name: providerName },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with id ${providerName} not found`);
    }

    const reconDate = date.toISOString().split('T')[0];
    this.logger.log(
      `🔁 Menjalankan manual reconciliation untuk ${provider.name} pada tanggal ${reconDate}`,
    );

    // [TODO] Jalankan logic recon di sini:
    // Contoh: Ambil transaksi berdasarkan providerId & tanggal, lalu proses recon

    // Simulasi:
    return {
      message: `Reconciliation untuk provider ${provider.name} (${provider.name}) pada tanggal ${reconDate} dijalankan.`,
    };
  }
}
