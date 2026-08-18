import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Dimensions, RefreshControl, View } from 'react-native';
import { Container, FiltersContainer } from './styles';

// Hooks
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useDateNavigation } from '@hooks/useDateNavigation';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import {
  FlashListTransactionItem,
  flattenTransactionsForFlashList,
} from '@utils/flattenTransactionsForFlashList';
import { formatTransactions } from '@utils/formatTransactions';
import { processTransactions } from '@utils/processTransactions';
import { buildPeriodRulerDates } from '@utils/buildPeriodRulerDates';

// Dependencies
import { useRoute } from 'expo-router';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { parse, isToday, isYesterday, isTomorrow } from 'date-fns';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { PeriodRuler } from '@components/PeriodRuler';
import { FilterButton } from '@components/FilterButton';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

// Screens
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';

// Storages
import { useSelectedPeriod } from '@stores/selectedPeriodStorage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;

export function TransactionsByCategory({ navigation }: any) {
  const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const route = useRoute();
  const categoryID = route.params?.categoryId;

  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();

  const {
    data: allTransactions,
    isLoading,
    refetch,
  } = useTransactionsQuery();

  const { handleDateChange, handlePressDate } = useDateNavigation({
    selectedPeriod,
    selectedDate,
    setSelectedDate,
  });

  const transactionsForThisCategory = useMemo(() => {
    if (!allTransactions) {
      return [];
    }
    return allTransactions.filter(
      (transaction) => transaction.category.id === categoryID
    );
  }, [allTransactions, categoryID]);

  const flattenedTransactions = useMemo(() => {
    const { groupedTransactions } = processTransactions(
      formatTransactions(transactionsForThisCategory),
      selectedPeriod.period,
      selectedDate
    );

    return flattenTransactionsForFlashList(groupedTransactions);
  }, [transactionsForThisCategory, selectedPeriod, selectedDate]);

  const periodRulerDates = useMemo(() => {
    const years = new Set<number>();
    for (const transaction of transactionsForThisCategory) {
      const transactionDate = new Date(transaction.created_at);
      if (!Number.isNaN(transactionDate.getTime())) {
        years.add(transactionDate.getFullYear());
      }
    }

    return buildPeriodRulerDates({
      period: selectedPeriod.period,
      selectedDate,
      years: Array.from(years),
    });
  }, [transactionsForThisCategory, selectedPeriod, selectedDate]);

  function handleOpenPeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.present();
  }

  function handleClosePeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.dismiss();
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

        <FiltersContainer>
          <FilterButton
            title={`Por ${selectedPeriod.name}`}
            onPress={handleOpenPeriodSelectedModal}
          />
        </FiltersContainer>

        <PeriodRuler
          dates={periodRulerDates}
          handleDateChange={handleDateChange}
          handlePressDate={handlePressDate}
          periodRulerListColumnWidth={PERIOD_RULER_LIST_COLUMN_WIDTH}
          horizontalPadding={0}
        />

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

        <ModalViewSelection
          title='Selecione o período'
          bottomSheetRef={chartPeriodSelectedBottomSheetRef}
          snapPoints={['30%', '50%']}
          onClose={handleClosePeriodSelectedModal}
        >
          <ChartPeriodSelect
            period={selectedPeriod}
            closeSelectPeriod={handleClosePeriodSelectedModal}
          />
        </ModalViewSelection>
      </Container>
    </Screen>
  );
}
