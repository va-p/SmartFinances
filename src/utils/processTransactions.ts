import groupTransactionsByDate, {
  GroupedTransactionProps,
} from '@utils/groupTransactionsByDate';
import formatCurrency from '@utils/formatCurrency';

import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, parse, isValid } from 'date-fns';

import {
  CashFlowChartData,
  CashFLowData,
  TransactionProps,
} from '@interfaces/transactions';

import theme from '@themes/theme';

type PeriodType = 'months' | 'years' | 'all';

interface ProcessTransactionsResult {
  cashFlows: CashFLowData[]; // CashFlows by months, years or all history
  cashFlowChartData: CashFlowChartData[];
  currentCashFlow: string; // Current CashFlow (by selected period)
  groupedTransactions: any[]; // Transactions grouped by day with total of the day, to show on SectionList
}

export const processTransactions = (
  transactions: TransactionProps[],
  period: PeriodType,
  selectedDate: Date
): ProcessTransactionsResult => {
  const cashFlowsMap: Record<string, CashFLowData> = {};

  const periodConfig = {
    months: {
      groupKey: (date: Date) => format(date, 'yyyy-MM'),
      outputFormat: "MMM '\n' yyyy",
      parseFormat: 'yyyy-MM',
    },
    years: {
      groupKey: (date: Date) => format(date, 'yyyy'),
      outputFormat: 'yyyy',
      parseFormat: 'yyyy',
    },
    all: {
      groupKey: () => 'all',
      outputFormat: 'Todo o \n histórico',
      parseFormat: '',
    },
  };

  const config = periodConfig[period];

  // Process transactions to chart
  transactions.forEach((item) => {
    // Ignore transfers
    if (item.type.includes('TRANSFER')) return;

    const transactionDate = parse(item.created_at, 'dd/MM/yyyy', new Date());
    if (!isValid(transactionDate)) return;

    const groupKey = config.groupKey(transactionDate);
    const isCreditAccount = item.account.type === 'CREDIT';
    const amount = new Decimal(item.amount);

    if (!cashFlowsMap[groupKey]) {
      cashFlowsMap[groupKey] = {
        date: groupKey,
        totalRevenuesByPeriod: new Decimal(0),
        totalExpensesByPeriod: new Decimal(0),
      };
    }

    // Credit card
    if (isCreditAccount) {
      if (item.type === 'CREDIT') {
        cashFlowsMap[groupKey].totalRevenuesByPeriod =
          cashFlowsMap[groupKey].totalRevenuesByPeriod.minus(amount); // Lógica invertida para Cartão de Crédito
      }
      if (item.type === 'DEBIT') {
        cashFlowsMap[groupKey].totalExpensesByPeriod =
          cashFlowsMap[groupKey].totalExpensesByPeriod.plus(amount); // Lógica invertida para Cartão de Crédito
      }
    }

    // Other account types
    if (!isCreditAccount) {
      if (item.type === 'CREDIT') {
        cashFlowsMap[groupKey].totalRevenuesByPeriod =
          cashFlowsMap[groupKey].totalRevenuesByPeriod.plus(amount);
      }
      if (item.type === 'DEBIT') {
        cashFlowsMap[groupKey].totalExpensesByPeriod =
          cashFlowsMap[groupKey].totalExpensesByPeriod.minus(amount);
      }
    }
  });

  // Format and order chart data
  const cashFlows = Object.values(cashFlowsMap)
    .map((group) => {
      let formattedDate = config.outputFormat;

      if (period !== 'all') {
        const parsedDate = parse(
          String(group.date),
          config.parseFormat,
          new Date()
        );
        formattedDate = format(parsedDate, config.outputFormat, {
          locale: ptBR,
        });
      }

      return {
        ...group,
        date: formattedDate,
      };
    })
    .sort((a, b) => {
      if (period === 'all') return 0;
      const dateA = parse(a.date, config.outputFormat, new Date(), {
        locale: ptBR,
      });
      const dateB = parse(b.date, config.outputFormat, new Date(), {
        locale: ptBR,
      });
      return dateB.getTime() - dateA.getTime();
    });

  const cashFlowChartData = cashFlows
    .map((group) => {
      const revenue = group.totalRevenuesByPeriod.toNumber();
      const expense = Math.abs(group.totalExpensesByPeriod.toNumber());

      const label = group.date.toString();

      const revenueData = {
        value: revenue || 0,
        label,
        spacing: 2,
        frontColor: theme.colors.success_light,
      };

      const expenseData = {
        value: expense || 0,
        frontColor: theme.colors.attention_light,
      };

      return [revenueData, expenseData];
    })
    .reverse()
    .flat();

  const isInSelectedPeriod = (date: Date) => {
    switch (period) {
      case 'months':
        return (
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()
        );
      case 'years':
        return date.getFullYear() === selectedDate.getFullYear();
      case 'all':
        return true;
      default:
        return false;
    }
  };

  // Filter transactions by selected date and period
  const filteredTransactions = transactions.filter((item) => {
    const transactionDate = parse(item.created_at, 'dd/MM/yyyy', new Date());
    return isValid(transactionDate) && isInSelectedPeriod(transactionDate);
  });

  // Group transactions by day and calc total of day (to use on section list)
  const groupedTransactions = groupTransactionsByDate(
    filteredTransactions
  ).sort((a: GroupedTransactionProps, b: GroupedTransactionProps) => {
    const firstDateParsed = parse(a.title, 'dd/MM/yyyy', new Date());
    const secondDateParsed = parse(b.title, 'dd/MM/yyyy', new Date());
    return secondDateParsed.getTime() - firstDateParsed.getTime();
  });

  // Calculate current Cash Flow (by selected period)
  let currentCashFlowByPeriod = 0;
  for (const item of groupedTransactions) {
    const cleanTotal = item.total.replace(/[R$\s.]/g, '').replace(',', '.');
    currentCashFlowByPeriod += parseFloat(cleanTotal);
  }

  return {
    cashFlows, // CashFlows by months, years or all history
    cashFlowChartData, // CashFlows by months, years or 'all' to use on cash flow chart
    currentCashFlow: formatCurrency('BRL', currentCashFlowByPeriod), // Current CashFlow (by selected period)
    groupedTransactions, // Transactions grouped by day with total of the day, to show on SectionList
  };
};
