import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, RefreshControl, View } from 'react-native';
import { Container, Month, MonthSelect, MonthSelectButton } from './styles';

// Hooks
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

// Utils
import {
  FlashListTransactionItem,
  flattenTransactionsForFlashList,
} from '@utils/flattenTransactionsForFlashList';
import { formatTransactions } from '@utils/formatTransactions';
import { processTransactions } from '@utils/processTransactions';

// Dependências
import { ptBR } from 'date-fns/locale';
import { useRoute } from 'expo-router';
import { useTheme } from 'styled-components';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';
import { addMonths, format, isToday, subMonths, parse, isYesterday, isTomorrow } from 'date-fns';

// Icons
import CaretLeft from 'phosphor-react-native/src/icons/CaretLeft';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

// Storages
import { useSelectedPeriod } from '@stores/selectedPeriodStorage';

// Interfaces
import { ThemeProps } from '@interfaces/theme';

export function TransactionsByCategory({ navigation }: any) {
  const theme = useTheme() as ThemeProps;
  const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const route = useRoute();
  const categoryID = route.params?.categoryId;

  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();

  const {
    data: allTransactions,
    isLoading,
    refetch,
  } = useTransactionsQuery();

  const flattenedTransactions = useMemo(() => {
    if (!allTransactions) {
      return [];
    }

    const transactionsForThisCategory = allTransactions.filter(
      (transaction) => transaction.category.id === categoryID
    );

    const { groupedTransactions } = processTransactions(
      formatTransactions(transactionsForThisCategory),
      selectedPeriod.period,
      selectedDate
    );

    return flattenTransactionsForFlashList(groupedTransactions);
  }, [allTransactions, categoryID, selectedPeriod, selectedDate]);

  function handleDateChange(action: 'next' | 'prev'): void {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () =>
      navigation.goBack()
    );
  }, []);

  if (isLoading) {
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
                  data={{ title: isToday(parse(item.headerTitle, 'dd/MM/yyyy', new Date()))
                    ? 'Hoje'
                    : isYesterday(parse(item.headerTitle, 'dd/MM/yyyy', new Date()))
                      ? 'Ontem'
                      : isTomorrow(parse(item.headerTitle, 'dd/MM/yyyy', new Date()))
                        ? 'Amanhã'
                        : item.headerTitle, total: item.headerTotal }}
                />
              );
            }
            return (
              <TransactionListItem
                data={item}
                index={index}
                hideAmount={false}
                onPress={() => null}
              />
            );
          }}
          getItemType={(item) =>
            (item as FlashListTransactionItem).isHeader
              ? 'sectionHeader'
              : 'row'
          }
          ListEmptyComponent={() => <ListEmptyComponent />}
          refreshControl={
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleRefresh}
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
