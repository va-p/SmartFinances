import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  RefreshControl,
  StyleSheet,
  BackHandler,
  Dimensions,
  View,
} from 'react-native';
import {
  Container,
  Header,
  CashFlowContainer,
  CashFlowTotal,
  CashFlowDescription,
  HideDataButton,
  FiltersContainer,
  FilterButtonGroup,
  Transactions,
  SearchButton,
  SearchInputContainer,
  ClearSearchButton,
} from './styles';

import { useQuotesQuery } from '@hooks/useQuotesQuery';
import { useTransactions } from '@hooks/useTransactions';
import { useSyncTransactions } from '@hooks/useSyncTransactions';
import {
  FlashListTransactionItem,
  flattenTransactionsForFlashList,
} from '@utils/flattenTransactionsForFlashList';
import fetchQuote from '@utils/fetchQuotes';
import formatDatePtBr from '@utils/formatDatePtBr';
import formatCurrency from '@utils/formatCurrency';
import { processTransactions } from '@utils/processTransactions';

import Animated, {
  Easing,
  Extrapolation,
  FadeInUp,
  FadeOutUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  RectButton,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {
  addMonths,
  addYears,
  getMonth,
  getYear,
  isFirstDayOfMonth,
  isValid,
  lastDayOfMonth,
  lastDayOfYear,
  parse,
  subMonths,
  subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { FlashList } from '@shopify/flash-list';
import { BarChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Icons
import X from 'phosphor-react-native/src/icons/X';
import Eye from 'phosphor-react-native/src/icons/Eye';
import Plus from 'phosphor-react-native/src/icons/Plus';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import MagnifyingGlass from 'phosphor-react-native/src/icons/MagnifyingGlass';

import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';
import { InsightCard } from '@components/InsightCard';
import { PeriodRuler } from '@components/PeriodRuler';
import { FilterButton } from '@components/FilterButton';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { SkeletonHomeScreen } from '@components/SkeletonHomeScreen';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { ModalViewWithoutHeader } from '@components/Modals/ModalViewWithoutHeader';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import { eInsightsCashFlow } from '@enums/enumsInsights';
import { CashFlowChartData, TransactionProps } from '@interfaces/transactions';

import api from '@api/api';

import theme from '@themes/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
// PeriodRulerList Column
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS = SCREEN_HEIGHT * 0.48;
const SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS = SCREEN_HEIGHT * 0.32;

const CHART_BAR_SPACING = 40;
const CHART_BAR_WIDTH = 8;

export function Home() {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { id: userID } = useUser();
  const {
    setBrlQuoteBtc,
    setBrlQuoteEur,
    setBrlQuoteUsd,
    setBtcQuoteBrl,
    setBtcQuoteEur,
    setBtcQuoteUsd,
    setEurQuoteBrl,
    setEurQuoteBtc,
    setEurQuoteUsd,
    setUsdQuoteBrl,
    setUsdQuoteBtc,
    setUsdQuoteEur,
  } = useQuotes();
  const { hideAmount, setHideAmount, insights } = useUserConfigs();
  const { setAccountId: setAccountID, setAccountName } =
    useCurrentAccountSelected();
  const [showInsights, setShowInsights] = useState(true);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { control, watch, reset } = useForm();
  const searchQuery = watch('search', '');
  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();
  const cashFlows = useRef<CashFlowChartData[]>([]);
  const cashFlowTotalBySelectedPeriod = useRef('');
  const registerTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const firstDayOfMonth: boolean = isFirstDayOfMonth(new Date());
  // Animated header, chart and insights container
  const scrollY = useSharedValue(0);
  const scrollHandlerToTop = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  let AnimatedViewInitialHeight = SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS;
  AnimatedViewInitialHeight =
    insights && showInsights && firstDayOfMonth
      ? SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS
      : SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS;
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 400],
        [AnimatedViewInitialHeight, 0],
        Extrapolation.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, 370],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });
  const chartStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 300],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });
  const insightsStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });
  // Animated Flash List
  const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
  // Animated button register transaction
  const registerTransactionButtonPositionX = useSharedValue(0);
  const registerTransactionButtonPositionY = useSharedValue(0);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const ButtonAnimated = Animated.createAnimatedComponent(RectButton);
  const registerTransactionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: registerTransactionButtonPositionX.value },
        { translateY: registerTransactionButtonPositionY.value },
      ],
    };
  });

  const onMoveRegisterTransactionButton = Gesture.Pan()
    .onStart(() => {
      initialX.current = registerTransactionButtonPositionX.value;
      initialY.current = registerTransactionButtonPositionY.value;
    })
    .onUpdate((e) => {
      registerTransactionButtonPositionX.value =
        initialX.current + e.translationX;
      registerTransactionButtonPositionY.value =
        initialY.current + e.translationY;
    })
    .onEnd(() => {
      registerTransactionButtonPositionX.value = withSpring(0);
      registerTransactionButtonPositionY.value = withSpring(0);
    });

  const { data: quotesData, isLoading: isLoadingQuotes } = useQuotesQuery();

  const { data: transactions, isLoading, isError } = useTransactions(userID);

  const { mutate: syncTransactions, isPending: isSyncing } =
    useSyncTransactions();

  const processedData = useMemo(() => {
    if (!transactions) {
      return {
        cashFlowChartData: [],
        currentCashFlow: 'R$ 0,00',
        groupedTransactions: [],
      };
    }

    const transactionsFormattedPtbr = transactions.map(
      (item: TransactionProps) => {
        const dmy = formatDatePtBr(item.created_at).short();
        return {
          id: item.id,
          created_at: dmy,
          description: item.description || '',
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
      }
    );

    return processTransactions(
      transactionsFormattedPtbr,
      selectedPeriod.period,
      selectedDate
    );
  }, [transactions, selectedPeriod.period, selectedDate]);

  cashFlowTotalBySelectedPeriod.current = processedData.currentCashFlow;
  cashFlows.current = processedData.cashFlowChartData;
  const transactionsFormattedBySelectedPeriod =
    processedData.groupedTransactions;
  const flattenedTransactions = flattenTransactionsForFlashList(
    transactionsFormattedBySelectedPeriod
  );
  const filteredTransactions = useMemo(() => {
    if (!searchQuery || searchQuery.length === 0) {
      return flattenedTransactions;
    }

    const filteredGroups = transactionsFormattedBySelectedPeriod
      .map((group) => ({
        ...group,
        data: group.data.filter((transaction: TransactionProps) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.data.length > 0);

    return flattenTransactionsForFlashList(filteredGroups);
  }, [
    searchQuery,
    flattenedTransactions,
    transactionsFormattedBySelectedPeriod,
  ]);

  function handleRefresh() {
    if (!!userID) {
      syncTransactions(userID);
    }
  }

  function handleOpenPeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.present();
  }

  function handleClosePeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.dismiss();
  }

  function handleOpenRegisterTransactionModal() {
    setTransactionId('');
    registerTransactionBottomSheetRef.current?.present();
  }

  function handleCloseRegisterTransactionModal() {
    setTransactionId('');
    setAccountID(null);
    setAccountName(null);
    registerTransactionBottomSheetRef.current?.dismiss();
  }

  function handleOpenTransaction(id: string) {
    setTransactionId(id);
    registerTransactionBottomSheetRef.current?.present();
  }

  function handleDateChange(action: 'prev' | 'next'): void {
    switch (selectedPeriod.period) {
      case 'months':
        switch (action) {
          case 'prev':
            setSelectedDate(subMonths(selectedDate, 1));
            break;
          case 'next':
            setSelectedDate(addMonths(selectedDate, 1));
            break;
        }
        break;
      case 'years':
        switch (action) {
          case 'prev':
            setSelectedDate(subYears(selectedDate, 1));
            break;
          case 'next':
            setSelectedDate(addYears(selectedDate, 1));
            break;
        }
        break;
    }
  }

  function handlePressDate(stringDate: string) {
    const dateSplit = stringDate.split('\n');
    const trimmedDateParts = dateSplit.map((part: string) => part.trim());
    const dateAux = trimmedDateParts.join(' ');
    const dateFormat = selectedPeriod.period === 'months' ? 'MMM yyyy' : 'yyyy';
    const dateParsed = parse(dateAux, dateFormat, new Date(), {
      locale: ptBR,
    });

    const selectedDateAux =
      selectedPeriod.period === 'months'
        ? lastDayOfMonth(new Date(dateParsed))
        : lastDayOfYear(dateParsed);

    setSelectedDate(selectedDateAux);
  }

  function ClearTransactionId() {
    setTransactionId('');
  }

  async function handleHideData() {
    try {
      const { status } = await api.post('edit_hide_amount', {
        user_id: userID,
        hide_amount: !hideAmount,
      });

      if (status === 200) {
        storageConfig.set(`${DATABASE_CONFIGS}.hideAmount`, !hideAmount);
        setHideAmount(!hideAmount);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Não foi possível salvar suas configurações. Por favor, tente novamente.'
      );
    }
  }

  function handleHideCashFlowInsights() {
    setShowInsights(false);
  }

  const _renderPeriodRuler = useCallback(() => {
    const dates = cashFlows.current
      .filter((cashFlowChartData) => !!cashFlowChartData.label)
      .map((item: any) => {
        const dateSplit = item.label.split('\n');
        const trimmedDateParts = dateSplit.map((part: string) => part.trim());
        const dateAux = trimmedDateParts.join(' ');

        const currentDateFormat =
          selectedPeriod.period === 'months' ? 'MMM yyyy' : 'yyyy';
        let parsedDate: Date | null = null;
        try {
          parsedDate = parse(dateAux, currentDateFormat, selectedDate, {
            locale: ptBR,
          });
          if (!isValid(parsedDate)) {
            console.warn('Data inválida:', dateAux);
          }
        } catch (error) {
          console.error(
            'Erro ao converter data, home > _renderPeriodRuler:',
            error
          );
        }

        function checkIsActive() {
          let isActive = false;
          switch (selectedPeriod.period) {
            case 'months':
              isActive = parsedDate
                ? getYear(selectedDate) === getYear(parsedDate) &&
                  getMonth(selectedDate) === getMonth(parsedDate)
                : false;
              break;

            case 'years':
              isActive = parsedDate
                ? getYear(selectedDate) === getYear(parsedDate)
                : false;
              break;
          }
          return isActive;
        }

        const isActive = checkIsActive();

        return {
          date: item.label,
          isActive,
        };
      })
      .reverse();

    function checkIsActive(month: string) {
      const isActive =
        getMonth(selectedDate) === getMonth(parse(month, 'MMM', selectedDate))
          ? true
          : false;
      return isActive;
    }

    const mocks = [
      {
        date: `Dez \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Dez'),
      },
      {
        date: `Nov \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Nov'),
      },
      {
        date: `Out \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Out'),
      },
      {
        date: `Set \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Set'),
      },
      {
        date: `Ago \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Ago'),
      },
      {
        date: `Jul \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Jul'),
      },
      {
        date: `Jun \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Jun'),
      },
      {
        date: `Mai \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Mai'),
      },
      {
        date: `Abr \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Abr'),
      },
      {
        date: `Mar \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Mar'),
      },
      {
        date: `Fev \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Fev'),
      },
      {
        date: `Jan \n ${getYear(selectedDate)}`,
        isActive: checkIsActive('Jan'),
      },
    ];

    return (
      <PeriodRuler
        dates={dates.length > 0 ? dates : mocks}
        handleDateChange={handleDateChange}
        handlePressDate={handlePressDate}
        periodRulerListColumnWidth={PERIOD_RULER_LIST_COLUMN_WIDTH}
      />
    );
  }, [selectedDate, selectedPeriod.period]);

  const _renderInsightCard = useCallback(() => {
    if (cashFlows.current.length >= 1) {
      const formattedCurrentDate =
        formatDatePtBr(selectedDate).cashFlowChartMonth();

      const lastRevenueEntryIndex =
        cashFlows.current.findIndex(
          (cashFlow) => cashFlow.label === formattedCurrentDate
        ) - 2; // - 2 to get last cash flow instead current cash flow

      if (lastRevenueEntryIndex === -1) return null;

      const revenue = cashFlows.current[lastRevenueEntryIndex]?.value || 0;
      const expense = cashFlows.current[lastRevenueEntryIndex + 1]?.value || 0;
      const netCashFlow = revenue - expense;

      const cashFlowIsPositive = netCashFlow >= 0;

      return (
        <InsightCard.Root>
          <InsightCard.CloseButton onPress={handleHideCashFlowInsights} />
          <InsightCard.Title
            title={
              cashFlowIsPositive
                ? eInsightsCashFlow.CONGRATULATIONS_TITLE
                : eInsightsCashFlow.INCENTIVE_TITLE
            }
          />
          <InsightCard.Description
            description={
              cashFlowIsPositive
                ? eInsightsCashFlow.CONGRATULATIONS_DESCRIPTION
                : eInsightsCashFlow.INCENTIVE_DESCRIPTION
            }
          />
        </InsightCard.Root>
      );
    }
  }, []);

  function _renderEmpty() {
    return <ListEmptyComponent />;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
  }, []);

  useEffect(() => {
    if (!!quotesData) {
      setBrlQuoteBtc(quotesData.brlToBtc);
      setBrlQuoteEur(quotesData.brlToEur);
      setBrlQuoteUsd(quotesData.brlToUsd);

      setBtcQuoteBrl(quotesData.btcToBrl);
      setBtcQuoteEur(quotesData.btcToEur);
      setBtcQuoteUsd(quotesData.btcToUsd);

      setEurQuoteBrl(quotesData.eurToBrl);
      setEurQuoteBtc(quotesData.eurToBtc);
      setEurQuoteUsd(quotesData.eurToUsd);

      setUsdQuoteBrl(quotesData.usdToBrl);
      setUsdQuoteBtc(quotesData.usdToBtc);
      setUsdQuoteEur(quotesData.usdToEur);
    }
  }, [quotesData]);

  if (isLoading && !transactions) {
    return (
      <Screen>
        <SkeletonHomeScreen />
      </Screen>
    );
  }

  if (isError) {
    Alert.alert(
      'Erro',
      'Não foi possível carregar suas transações. Por favor, tente novamente'
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Animated.View style={[headerStyleAnimation, styles.header]}>
          <Header>
            <CashFlowContainer>
              <CashFlowTotal>
                {!hideAmount ? cashFlowTotalBySelectedPeriod.current : '•••••'}
              </CashFlowTotal>
              <CashFlowDescription>Fluxo de Caixa</CashFlowDescription>
            </CashFlowContainer>

            <SearchButton
              onPress={() => setShowSearchInput((prevState) => !prevState)}
            >
              <MagnifyingGlass size={20} color={theme.colors.primary} />
            </SearchButton>

            <HideDataButton onPress={() => handleHideData()}>
              {!hideAmount ? (
                <EyeSlash size={20} color={theme.colors.primary} />
              ) : (
                <Eye size={20} color={theme.colors.primary} />
              )}
            </HideDataButton>
          </Header>

          <FiltersContainer>
            <FilterButtonGroup>
              <FilterButton
                title={`Por ${selectedPeriod.name}`}
                onPress={handleOpenPeriodSelectedModal}
              />
            </FilterButtonGroup>
          </FiltersContainer>

          <Animated.View style={chartStyleAnimationOpacity}>
            <BarChart
              data={cashFlows.current}
              width={SCREEN_WIDTH - 40}
              height={80}
              barWidth={CHART_BAR_WIDTH}
              spacing={CHART_BAR_SPACING}
              roundedTop
              labelWidth={30}
              xAxisThickness={1}
              yAxisThickness={0}
              noOfSections={3}
              xAxisTextNumberOfLines={2}
              scrollToEnd
              isAnimated
              formatYLabel={(label: string) => {
                const value = Number(label);
                const k = Math.floor(value / 1000);
                return k > 0 ? `${k}k` : '0';
              }}
              yAxisTextStyle={{
                fontSize: 10,
                color: theme.colors.textPlaceholder,
              }}
              xAxisLabelTextStyle={{ fontSize: 10, color: '#90A4AE' }}
            />
          </Animated.View>

          <Animated.View>{_renderPeriodRuler()}</Animated.View>

          {insights && showInsights && firstDayOfMonth && (
            <Animated.View
              style={[insightsStyleAnimationOpacity, styles.insightCard]}
            >
              {_renderInsightCard()}
            </Animated.View>
          )}
        </Animated.View>

        {showSearchInput && (
          <Animated.View
            entering={FadeInUp.easing(Easing.bounce).duration(500)}
            exiting={FadeOutUp.easing(Easing.linear)}
          >
            <SearchInputContainer>
              <ControlledInputWithIcon
                icon={<MagnifyingGlass color={theme.colors.primary} />}
                placeholder='Pesquisar...'
                autoCorrect={false}
                name='search'
                control={control}
              />
              <ClearSearchButton onPress={() => reset()}>
                <X size={20} color={theme.colors.primary} />
              </ClearSearchButton>
            </SearchInputContainer>
          </Animated.View>
        )}

        <Transactions>
          <AnimatedFlashList
            data={filteredTransactions}
            keyExtractor={(item: any) => {
              return item.isHeader
                ? String(item.headerTitle!)
                : String(item.id);
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
                  hideAmount={hideAmount}
                  onPress={() => handleOpenTransaction(item.id)}
                />
              );
            }}
            getItemType={(item) =>
              (item as FlashListTransactionItem).isHeader
                ? 'sectionHeader'
                : 'row'
            }
            estimatedItemSize={100}
            ListEmptyComponent={_renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isSyncing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandlerToTop}
            scrollEventThrottle={16}
            ItemSeparatorComponent={() => (
              <View style={{ minHeight: 8, maxHeight: 8 }} />
            )}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: bottomTabBarHeight + 8,
            }}
          />
        </Transactions>

        <GestureDetector gesture={onMoveRegisterTransactionButton}>
          <Animated.View
            style={[
              registerTransactionButtonStyle,
              {
                position: 'absolute',
                bottom: 64,
                right: 16,
              },
            ]}
          >
            <ButtonAnimated
              onPress={handleOpenRegisterTransactionModal}
              style={styles.animatedButton}
            >
              <Plus size={24} color={theme.colors.background} />
            </ButtonAnimated>
          </Animated.View>
        </GestureDetector>

        <ModalViewSelection
          title='Selecione o período'
          bottomSheetRef={chartPeriodSelectedBottomSheetRef}
          snapPoints={['30%', '50%']}
        >
          <ChartPeriodSelect
            period={selectedPeriod}
            closeSelectPeriod={handleClosePeriodSelectedModal}
          />
        </ModalViewSelection>

        <ModalViewWithoutHeader
          bottomSheetRef={registerTransactionBottomSheetRef}
          snapPoints={['100%']}
        >
          <RegisterTransaction
            id={transactionId}
            resetId={ClearTransactionId}
            closeRegisterTransaction={handleCloseRegisterTransactionModal}
            closeModal={handleCloseRegisterTransactionModal}
          />
        </ModalViewWithoutHeader>
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
    backgroundColor: theme.colors.backgroundCardHeader,
    borderBottomRightRadius: 75,
    borderBottomLeftRadius: 75,
  },
  insightCard: {
    minHeight: 30,
    marginTop: -8,
    marginBottom: 16,
  },
  animatedButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 23,
  },
});
