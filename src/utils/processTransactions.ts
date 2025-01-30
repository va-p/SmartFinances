import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, isValid, parse, parseISO } from 'date-fns';

import formatCurrency from './formatCurrency';

import { TransactionProps } from '@interfaces/transactions';

type ProcessedData = {
  date: string;
  totalRevenuesByPeriod: Decimal;
  totalExpensesByPeriod: Decimal;
  total: Decimal;
};

type PeriodConfig = {
  groupFormat: string;
  sortFormat: string;
  finalFormat: string;
};

const getPeriodConfig = (period: string): PeriodConfig => {
  const configs = {
    months: {
      groupFormat: 'yyyy-MM',
      sortFormat: 'yyyy-MM',
      finalFormat: "MMM '\n' yyyy",
    },
    years: {
      groupFormat: 'yyyy',
      sortFormat: 'yyyy',
      finalFormat: 'yyyy',
    },
    all: {
      groupFormat: 'all',
      sortFormat: 'all',
      finalFormat: 'Todo o \n histórico',
    },
  };

  return configs[period as keyof typeof configs] || configs.months;
};

export const processTransactions = (
  data: TransactionProps[],
  period: 'months' | 'years' | 'all'
): {
  groupedData: ProcessedData[];
  total: Decimal;
  formattedTotal: string;
} => {
  const config = getPeriodConfig(period);
  const grouped: Record<string, ProcessedData> = {};

  let total = new Decimal(0);

  for (const item of data) {
    const dateKey =
      config.groupFormat === 'all'
        ? config.finalFormat
        : format(new Date(item.created_at), config.groupFormat);

    console.log('dateKey ===>', dateKey);

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        totalRevenuesByPeriod: new Decimal(0),
        totalExpensesByPeriod: new Decimal(0),
        total: new Decimal(0),
      };
    }

    const isCreditAccount = item.account.type === 'CREDIT';
    const isTransactionDateValid = new Date(item.created_at) <= new Date();

    if (isTransactionDateValid) {
      const amount = new Decimal(item.amount);
      if (isCreditAccount) {
        // Lógica específica para cartão de crédito
        if (item.type === 'CREDIT') {
          grouped[dateKey].totalRevenuesByPeriod =
            grouped[dateKey].totalRevenuesByPeriod.minus(amount);
        } else {
          grouped[dateKey].totalExpensesByPeriod =
            grouped[dateKey].totalExpensesByPeriod.plus(amount);
        }
        total = total.minus(amount);
      } else {
        if (item.type === 'CREDIT') {
          grouped[dateKey].totalRevenuesByPeriod =
            grouped[dateKey].totalRevenuesByPeriod.plus(amount);
        } else {
          grouped[dateKey].totalExpensesByPeriod =
            grouped[dateKey].totalExpensesByPeriod.minus(amount);
        }
        total = total.plus(amount);
      }
    }
  }

  const sortedData = Object.values(grouped).sort((a, b) => {
    if (config.groupFormat === 'all') return 0;

    const dateA = parse(a.date, config.sortFormat, new Date());
    const dateB = parse(b.date, config.sortFormat, new Date());
    return dateB.getTime() - dateA.getTime();
  });

  console.log('sortedData ===>', sortedData);

  // Aplicar formatação final
  const formattedData = sortedData.map((item) => {
    if (config.groupFormat === 'all') return item;

    try {
      const date = parse(item.date, config.groupFormat, new Date());
      return {
        ...item,
        date: isValid(date)
          ? format(date, config.finalFormat, { locale: ptBR })
          : 'Data inválida',
      };
    } catch (error) {
      console.error('Formatação de data falhou:', item.date, error);
      return { ...item, date: 'Erro' };
    }
  });

  console.log('formattedData ===>', formattedData);

  return {
    groupedData: formattedData,
    total,
    formattedTotal: formatCurrency('BRL', total.toNumber(), false),
  };
};
