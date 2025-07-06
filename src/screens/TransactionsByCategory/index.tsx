import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, RefreshControl, View } from 'react-native';
import { Container, Month, MonthSelect, MonthSelectButton } from './styles';

import {
  FlashListTransactionItem,
  flattenTransactionsForFlashList,
} from '@utils/flattenTransactionsForFlashList';
import formatDatePtBr from '@utils/formatDatePtBr';
import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import { processTransactions } from '@utils/processTransactions';

import { ptBR } from 'date-fns/locale';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { addMonths, format, subMonths } from 'date-fns';
import CaretLeft from 'phosphor-react-native/src/icons/CaretLeft';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { useUser } from '@storage/userStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';

import { TransactionProps } from '@interfaces/transactions';

import theme from '@themes/theme';

export function TransactionsByCategory({ navigation }: any) {
  const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const { id: userID } = useUser();
  const route = useRoute();
  const categoryID = route.params?.id;

  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();

  const [
    transactionsFormattedBySelectedPeriod,
    setTransactionsFormattedBySelectedPeriod,
  ] = useState<any[]>([]);
  const optimizedTransactions = useMemo(
    () => transactionsFormattedBySelectedPeriod,
    [transactionsFormattedBySelectedPeriod]
  );
  const flattenedTransactions = flattenTransactionsForFlashList(
    optimizedTransactions
  );

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
      const data = (await getTransactions(userID)).filter(
        (transaction) => transaction.category.id === categoryID
      );

      // Format transactions
      const transactionsFormattedPtbr = data.map((item: TransactionProps) => {
        const dmy = formatDatePtBr(item.created_at).short();
        return {
          id: item.id,
          created_at: dmy,
          description: item.description,
          amount: item.amount,
          amount_formatted: formatCurrency(item.currency.code, item.amount),
          amount_in_account_currency: item.amount_in_account_currency,
          amount_in_account_currency_formatted: item.amount_in_account_currency
            ? formatCurrency(
                item.account.currency.code,
                item.amount_in_account_currency
              )
            : undefined,
          currency: item.currency,
          type: item.type,
          account: item.account,
          category: item.category,
          tags: item.tags,
          user_id: item.user_id,
        };
      });

      // Process transactions
      const { groupedTransactions } = processTransactions(
        transactionsFormattedPtbr,
        selectedPeriod.period,
        selectedDate
      );

      // Update states
      setTransactionsFormattedBySelectedPeriod(groupedTransactions);
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
    return (
      <Screen>
        <SkeletonAccountsScreen />
      </Screen>
    );
  }

  return (
    <Screen>
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

        <AnimatedFlashList
          data={flattenedTransactions}
          keyExtractor={(item: any) => {
            return item.isHeader ? String(item.headerTitle!) : String(item.id);
          }}
          renderItem={({ item, index }: any) => {
            if (item.isHeader) {
              return (
                <SectionListHeader
                  data={{ title: item.headerTitle, total: item.headerTotal }}
                />
              );
            }
            return (
              <TransactionListItem
                data={item}
                index={index}
                hideAmount={false}
              />
            );
          }}
          getItemType={(item) =>
            (item as FlashListTransactionItem).isHeader
              ? 'sectionHeader'
              : 'row'
          }
          estimatedItemSize={100}
          ListEmptyComponent={() => <ListEmptyComponent />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTransactions}
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => (
            <View style={{ minHeight: 8, maxHeight: 8 }} />
          )}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: bottomTabBarHeight,
          }}
        />
      </Container>
    </Screen>
  );
}
