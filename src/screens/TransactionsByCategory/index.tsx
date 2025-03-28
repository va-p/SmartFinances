import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, RefreshControl, SectionList } from 'react-native';
import { Container, Month, MonthSelect, MonthSelectButton } from './styles';

import formatDatePtBr from '@utils/formatDatePtBr';
import getTransactions from '@utils/getTransactions';
import groupTransactionsByDate from '@utils/groupTransactionsByDate';

import { ptBR } from 'date-fns/locale';
import { addMonths, format, parse, subMonths } from 'date-fns';
import CaretLeft from 'phosphor-react-native/src/icons/CaretLeft';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { useUser } from '@storage/userStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';

import theme from '@themes/theme';

export function TransactionsByCategory({ navigation }: any) {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [loading, setLoading] = useState(false);
  const { id: userID } = useUser();
  const [refreshing, setRefreshing] = useState(true);
  const route = useRoute();
  const categoryId = route.params?.id;

  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();

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
      const data = await getTransactions(userID);

      /**
       * All Transactions By Account Formatted in pt-BR - Start
       */
      let amount_formatted: any;
      let amountNotConvertedFormatted = '';

      let transactionsByCategoryFormattedPtbr: any = [];
      for (const item of data) {
        const dmy = formatDatePtBr(item.created_at).short();

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
              minimumFractionDigits: 6,
              maximumSignificantDigits: 6,
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
                color_code: item.color.color_code,
              },
            },
            tags: item.tags,
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

      // Group transactions by date to section list
      const transactionsFormattedPtbrGroupedByDate = groupTransactionsByDate(
        transactionsByCategoryFormattedPtbr
      );
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

      /**
       * Transactions By Years Formatted in pt-BR - End
       */

      /**
       * Set Transactions and Totals by Selected Period - Start
       */
      switch (selectedPeriod.period) {
        case 'months':
          setTransactionsFormattedBySelectedPeriod(
            transactionsByMonthsFormattedPtbr
          );
          break;
        case 'years':
          setTransactionsFormattedBySelectedPeriod(
            transactionsByYearsFormattedPtbr
          );
          break;
        case 'all':
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
    }, [selectedPeriod, selectedDate])
  );

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () =>
      navigation.goBack()
    );
  }, []);

  if (loading) {
    return <SkeletonAccountsScreen />;
  }

  return (
    <Container>
      <Gradient />

      <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Transações por categoria'} />
      </Header.Root>

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
        renderItem={({ item, index }) => (
          <TransactionListItem data={item} index={index} hideAmount={false} />
        )}
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
          rowGap: 8,
          paddingTop: 16,
          paddingBottom: bottomTabBarHeight,
        }}
      />
    </Container>
  );
}
