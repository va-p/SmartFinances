import React, { useCallback, useRef, useState } from 'react';
import { Container, Month, MonthSelect, MonthSelectButton } from './styles';

import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { useFocusEffect, useRoute } from '@react-navigation/native';
import { addMonths, format, parse, subMonths } from 'date-fns';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';

import { PeriodProps } from '@screens/ChartPeriodSelect';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';
import { RefreshControl, SectionList } from 'react-native';
import TransactionListItem from '@components/TransactionListItem';
import { SectionListHeader } from '@components/SectionListHeader';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export function TransactionsByCategory() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const route = useRoute();
  const categoryId = route.params?.id;
  const [periodSelected, setPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months',
  });
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [
    transactionsFormattedBySelectedPeriod,
    setTransactionsFormattedBySelectedPeriod,
  ] = useState([]);

  function handleDateChange(action: 'next' | 'prev'): void {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function fetchTransactions() {
    setLoading(true);

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId,
        },
      });

      /**
       * All Transactions By Account Formatted in pt-BR - Start
       */
      let amount_formatted: any;
      let amountNotConvertedFormatted = '';
      let totalRevenues = 0;
      let totalExpenses = 0;

      let transactionsByCategoryFormattedPtbr: any = [];
      for (const item of data) {
        // Format the date "dd/MM/yyyy"
        const dmy = format(item.created_at, 'dd/MM/yyyy', { locale: ptBR });
        // Format the currency
        switch (item.account.currency.code) {
          case 'BRL':
            amount_formatted = Number(item.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            break;
          case 'BTC':
            amount_formatted = Number(item.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8,
            });
            break;
          case 'EUR':
            amount_formatted = Number(item.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'EUR',
            });
            break;
          case 'USD':
            amount_formatted = Number(item.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD',
            });
            break;
        }
        if (item.amount_not_converted && item.currency.code === 'BRL') {
          amountNotConvertedFormatted = Number(
            item.amount_not_converted
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
        }
        if (item.amount_not_converted && item.currency.code === 'BTC') {
          amountNotConvertedFormatted = Number(
            item.amount_not_converted
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BTC',
            minimumFractionDigits: 8,
            maximumSignificantDigits: 8,
          });
        }
        if (item.amount_not_converted && item.currency.code === 'EUR') {
          amountNotConvertedFormatted = Number(
            item.amount_not_converted
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'EUR',
          });
        }
        if (item.amount_not_converted && item.currency.code === 'USD') {
          amountNotConvertedFormatted = Number(
            item.amount_not_converted
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'USD',
          });
        }
        // Create the objects
        if (!transactionsByCategoryFormattedPtbr.hasOwnProperty(dmy)) {
          transactionsByCategoryFormattedPtbr[item.id] = {
            id: item.id,
            created_at: dmy,
            description: item.description,
            amount: item.amount,
            amount_formatted,
            amount_not_converted: amountNotConvertedFormatted,
            currency: {
              id: item.currency.id,
              name: item.currency.name,
              code: item.currency.code,
              symbol: item.currency.symbol,
            },
            type: item.type,
            account: {
              id: item.account.id,
              name: item.account.name,
              currency: {
                id: item.account.currency.id,
                name: item.account.currency.name,
                code: item.account.currency.code,
                symbol: item.account.currency.symbol,
              },
              initial_amount: item.account.initial_amount,
              totalAccountAmount: 0,
              tenant_id: item.account.tenant_id,
            },
            category: {
              id: item.category.id,
              name: item.category.name,
              icon: {
                id: item.category.icon.id,
                title: item.category.icon.title,
                name: item.category.icon.name,
              },
              color: {
                id: item.category.color.id,
                name: item.category.color.name,
                hex: item.category.color.hex,
              },
              tenant_id: item.category.tenant_id,
            },
            tags: item.tags,
            tenant_id: item.tenant_id,
          };
        }
      }
      transactionsByCategoryFormattedPtbr = Object.values(
        transactionsByCategoryFormattedPtbr
      )
        .filter(
          (transactionFormattedPtbr: any) =>
            transactionFormattedPtbr.category.id === categoryId
        )
        .sort((a: any, b: any) => {
          const firstDateParsed = parse(a.created_at, 'dd/MM/yyyy', new Date());
          const secondDateParsed = parse(
            b.created_at,
            'dd/MM/yyyy',
            new Date()
          );
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        });

      // Sum the total revenues and expenses by category
      transactionsByCategoryFormattedPtbr.forEach((cur: any) => {
        if (cur.type === 'credit') {
          totalRevenues += cur.amount;
        } else if (cur.type === 'debit') {
          totalExpenses += cur.amount;
        } else if (cur.type === 'transferCredit') {
          totalRevenues += cur.amount;
        } else if (cur.type === 'transferDebit') {
          totalExpenses += cur.amount;
        }
      });
      // Sum balance total of account
      /*const total = accountInitialAmount + totalRevenues - totalExpenses;

      // Verify if balance is positive
      total >= 0 ? setBalanceIsPositive(true) : setBalanceIsPositive(false);

      const totalAccountBalanceFormatted = Number(total).toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        }
      );
      setTotalAccountBalance(totalAccountBalanceFormatted);*/

      // Group transactions by date to section list
      const transactionsFormattedPtbrGroupedByDate =
        transactionsByCategoryFormattedPtbr.reduce((acc: any, cur: any) => {
          const existObj = acc.find((obj: any) => obj.title === cur.created_at);
          if (existObj) {
            existObj.data.push(cur);
          } else {
            acc.push({
              title: cur.created_at,
              data: [cur],
            });
          }
          return acc;
        }, []);
      /**
       * All Transactions By Account Formatted in pt-BR - End
       */

      /**
       * Transactions By Months Formatted in pt-BR - Start
       */
      const transactionsByMonthsFormattedPtbr =
        transactionsFormattedPtbrGroupedByDate.filter(
          (transactionByMonthsPtBr: any) =>
            parse(
              transactionByMonthsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getMonth() === selectedDate.getMonth() &&
            parse(
              transactionByMonthsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getFullYear() === selectedDate.getFullYear()
        );

      // Sum revenues and expenses
      let totalRevenuesByMonths = 0;
      let totalExpensesByMonths = 0;

      for (const item of transactionsByMonthsFormattedPtbr) {
        if (item.data) {
          item.data.forEach((cur: any) => {
            if (
              parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() &&
              cur.type === 'credit'
            ) {
              totalRevenuesByMonths += cur.amount;
            } else if (
              parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() &&
              cur.type === 'debit'
            ) {
              totalExpensesByMonths += cur.amount;
            }
          });
        }
      }
      // Sum category cash flow
      /* const cashFlowByMonths =
        accountInitialAmount + totalRevenuesByMonths - totalExpensesByMonths;

      // Verify if balance is positive
      if (periodSelected.period === 'months') {
        cashFlowByMonths >= 0
          ? setCashFlowIsPositive(true)
          : setCashFlowIsPositive(false);
      }

      const cashFlowFormattedPtbrByMonths = Number(
        cashFlowByMonths
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });*/
      /**
       * Transactions By Months Formatted in pt-BR - End
       */

      /**
       * Transactions By Years Formatted in pt-BR - Start
       */
      const transactionsByYearsFormattedPtbr =
        transactionsFormattedPtbrGroupedByDate.filter(
          (transactionByYearsPtBr: any) =>
            parse(
              transactionByYearsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getFullYear() === selectedDate.getFullYear()
        );

      // Sum revenues and expenses
      let totalRevenuesByYears = 0;
      let totalExpensesByYears = 0;

      for (const item of transactionsByYearsFormattedPtbr) {
        if (item.data) {
          item.data.forEach((cur: any) => {
            if (
              parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() &&
              cur.type === 'credit'
            ) {
              totalRevenuesByYears += cur.amount;
            } else if (
              parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() &&
              cur.type === 'debit'
            ) {
              totalExpensesByYears += cur.amount;
            }
          });
        }
      }
      // Sum category cash flow
      /*const cashFlowByYears =
        accountInitialAmount + totalRevenuesByYears - totalExpensesByYears;

      // Verify if balance is positive
      if (periodSelected.period === 'years') {
        cashFlowByYears >= 0
          ? setCashFlowIsPositive(true)
          : setCashFlowIsPositive(false);
      }

      const cashFlowFormattedPtbrByYears = Number(
        cashFlowByYears
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });*/
      /**
       * Transactions By Years Formatted in pt-BR - End
       */

      /**
       * Set Transactions and Totals by Selected Period - Start
       */
      switch (periodSelected.period) {
        case 'months':
          //setCashFlowBySelectedPeriod(cashFlowFormattedPtbrByMonths);
          setTransactionsFormattedBySelectedPeriod(
            transactionsByMonthsFormattedPtbr
          );
          break;
        case 'years':
          //setCashFlowBySelectedPeriod(cashFlowFormattedPtbrByYears);
          setTransactionsFormattedBySelectedPeriod(
            transactionsByYearsFormattedPtbr
          );
          break;
        case 'all':
          //setCashFlowBySelectedPeriod(totalAccountBalanceFormatted);
          setTransactionsFormattedBySelectedPeriod(
            transactionsFormattedPtbrGroupedByDate
          );
          break;
      }
      /**
       * Set Transactions and Totals by Selected Period  - End
       */
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [periodSelected, selectedDate])
  );

  if (loading) {
    return <SkeletonAccountsScreen />;
  }

  return (
    <Container>
      <MonthSelect>
        <MonthSelectButton onPress={() => handleDateChange('prev')}>
          <CaretLeft size={20} color={theme.colors.text} />
        </MonthSelectButton>

        <Month>{format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}</Month>

        <MonthSelectButton onPress={() => handleDateChange('next')}>
          <CaretRight size={20} color={theme.colors.text} />
        </MonthSelectButton>
      </MonthSelect>

      <SectionList
        sections={transactionsFormattedBySelectedPeriod}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionListItem data={item} />}
        renderSectionHeader={({ section }) => (
          <SectionListHeader data={section} />
        )}
        ListEmptyComponent={() => <ListEmptyComponent />}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        initialNumToRender={200}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchTransactions}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: getBottomSpace(),
        }}
      />
    </Container>
  );
}
