import { PrismaClient } from '@prisma/client';

export async function bankSeed(prisma: PrismaClient) {
  const bankUmumNasional = await prisma.bank.createManyAndReturn({
    data: [
      {
        name: 'BCA',
        code: '014',
      },
      {
        name: 'MANDIRI',
        code: '008',
      },
      {
        name: 'BNI',
        code: '009',
      },
      {
        name: 'BRI',
        code: '002',
      },
      {
        name: 'BTN',
        code: '200',
      },
      {
        name: 'PERMATA',
        code: '013',
      },
      {
        name: 'DANAMON',
        code: '011',
      },
      {
        name: 'MAYBANK INDONESIA',
        code: '016',
      },
      {
        name: 'MEGA',
        code: '426',
      },
      {
        name: 'SINARMAS',
        code: '153',
      },
      {
        name: 'OCBC NISP',
        code: '028',
      },
      {
        name: 'BUKOPIN (KB BUKOPIN)',
        code: '441',
      },
      {
        name: 'PANIN',
        code: '019',
      },
      {
        name: 'BTPN / Jenius',
        code: '213',
      },
      {
        name: 'COMMONWEALTH',
        code: '950',
      },
      {
        name: 'UOB INDONESIA',
        code: '023',
      },
      {
        name: 'CAPITAL INDONESIA',
        code: '054',
      },
      {
        name: 'MAYAPADA',
        code: '097',
      },
      {
        name: 'MASPION',
        code: '157',
      },
      {
        name: 'GANESHA',
        code: '161',
      },
      {
        name: 'WOORI SAUDARA',
        code: '212',
      },
      {
        name: 'JTRUST',
        code: '095',
      },
      {
        name: 'VICTORIA INTERNATIONAL',
        code: '566',
      },
      {
        name: 'SAHABAT SAMPOERNA',
        code: '523',
      },
      {
        name: 'INDEX SELINDO',
        code: '555',
      },
      {
        name: 'NOBU (NATIONAL NOBU)',
        code: '503',
      },
      {
        name: 'INA PERDANA',
        code: '513',
      },
      {
        name: 'MAYORA INDONESIA',
        code: '553',
      },
      {
        name: 'MNC INTERNASIONAL',
        code: '485',
      },
      {
        name: 'HARDA INTERNASIONAL',
        code: '567',
      },
    ],
  });

  const bankDigitalOrFintech = await prisma.bank.createManyAndReturn({
    data: [
      {
        name: 'blu by BCA Digital',
        code: '501',
      },
      // {
      //   name: 'Jenius (BTPN)',
      //   code: '213',
      // },
      // {
      //   name: 'Digibank by DBS',
      //   code: '046',
      // },
      {
        name: 'Seabank',
        code: '535',
      },
      {
        name: 'Bank Jago',
        code: '542',
      },
      // {
      //   name: 'Allo Bank',
      //   code: '567',
      // },
      {
        name: 'Bank Neo Commerce',
        code: '490',
      },
      {
        name: 'Line Bank',
        code: '484',
      },
      // {
      //   name: 'Hibank',
      //   code: '553',
      // },
      {
        name: 'Superbank',
        code: '562',
      },
      {
        name: 'Bank Aladin Syariah',
        code: '947',
      },
    ],
  });

  const bankSyariah = await prisma.bank.createManyAndReturn({
    data: [
      {
        name: 'Bank Suariah Indonesia (BSI)',
        code: '451',
      },
      {
        name: 'Bank Muamalat',
        code: '147',
      },
      {
        name: 'BCA Syariah',
        code: '536',
      },
      {
        name: 'BTPN Syariah',
        code: '547',
      },
      {
        name: 'KB Bukopin Syariah',
        code: '521',
      },
      // {
      //   name: 'BTN Syariah',
      //   code: '200',
      // },
      {
        name: 'CIMB Niaga Syariah',
        code: '022',
      },
      {
        name: 'Bank BJB Syariah',
        code: '425',
      },
      {
        name: 'Bank Panin Dubai Syariah',
        code: '517',
      },
      {
        name: 'Bank Mega Syariah',
        code: '506',
      },
      {
        name: 'BPD Aceh Suariah',
        code: '116',
      },
      // {
      //   name: 'Bank NTB Syariah',
      //   code: '128',
      // },
    ],
  });

  const bankPembangunanDaerah = await prisma.bank.createManyAndReturn({
    data: [
      {
        name: 'Bank BJB',
        code: '110',
      },
      {
        name: 'Bank DKI',
        code: '111',
      },
      {
        name: 'BPD DIY',
        code: '112',
      },
      {
        name: 'Bank Jateng',
        code: '113',
      },
      {
        name: 'Bank Jatim',
        code: '114',
      },
      {
        name: 'BPD Jambi',
        code: '115',
      },
      {
        name: 'Bank Sumut',
        code: '117',
      },
      {
        name: 'Bank Nagari (Sumbar)',
        code: '118',
      },
      {
        name: 'Bank Riau Kepri',
        code: '119',
      },
      {
        name: 'Bank Sumsel Babel',
        code: '120',
      },
      {
        name: 'Bank Lampung',
        code: '121',
      },
      {
        name: 'Bank Kalsel',
        code: '122',
      },
      {
        name: 'Bank Kalbar',
        code: '123',
      },
      {
        name: 'Bank Kaltimtara',
        code: '124',
      },
      {
        name: 'Bank Kalteng',
        code: '125',
      },
      {
        name: 'Bank Sulselbar',
        code: '126',
      },
      {
        name: 'Bank SulutGo',
        code: '128',
      },
      {
        name: 'Bank NTB',
        code: '127',
      },
      {
        name: 'BPD Bali',
        code: '129',
      },
      {
        name: 'Bank NTT',
        code: '130',
      },
      {
        name: 'Bank Muluku Malut',
        code: '131',
      },
      {
        name: 'Bank Papua',
        code: '132',
      },
      {
        name: 'Bank Bengkulu',
        code: '133',
      },
      {
        name: 'Bank Sulteng',
        code: '134',
      },
      {
        name: 'Bank Sultra',
        code: '135',
      },
      {
        name: 'Bank Banten',
        code: '137',
      },
    ],
  });

  const bankAsing = await prisma.bank.createManyAndReturn({
    data: [
      {
        name: 'HSBC',
        code: '041',
      },
      {
        name: 'Standart Chartered',
        code: '050',
      },
      {
        name: 'JP Morgan Chase',
        code: '032',
      },
      {
        name: 'Bank of America',
        code: '033',
      },
      {
        name: 'DBS Indonesia',
        code: '046',
      },
      {
        name: 'Bank of China',
        code: '069',
      },
      {
        name: 'Mizuho Bank',
        code: '048',
      },
      {
        name: 'MUFG Bank',
        code: '042',
      },
      {
        name: 'ANZ Indonesia',
        code: '061',
      },
      {
        name: 'Deutsche Bank',
        code: '067',
      },
      {
        name: 'BNP Paribas',
        code: '057',
      },
      {
        name: 'Bangkok Bank',
        code: '040',
      },
      {
        name: 'China Construction Bank (CCB)',
        code: '036',
      },
      {
        name: 'ICBC Indonesia',
        code: '164',
      },
      {
        name: 'Resona Perdania',
        code: '047',
      },
      {
        name: 'Credit Agricole Indosuez',
        code: '039',
      },
      {
        name: 'CTBC Indonesia',
        code: '949',
      },
      {
        name: 'Korea Exchane Bank',
        code: '059',
      },
    ],
  });

  console.log({
    bankUmumNasional,
    bankDigitalOrFintech,
    bankSyariah,
    bankPembangunanDaerah,
    bankAsing,
  });
}
