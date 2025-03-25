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
  SectionList,
  Dimensions,
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
} from './styles';

import fetchQuote from '@utils/fetchQuotes';
import formatDatePtBr from '@utils/formatDatePtBr';
import formatCurrency from '@utils/formatCurrency';
import { processTransactions } from '@utils/processTransactions';

import Animated, {
  Extrapolation,
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
  parse,
  subMonths,
  subYears,
} from 'date-fns';
import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { BarChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Plus, Eye, EyeSlash } from 'phosphor-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

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

import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import { eInsightsCashFlow } from '@enums/enumsInsights';
import { CashFLowData, TransactionProps } from '@interfaces/transactions';

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
  const [loading, setLoading] = useState(false);
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
  const [refreshing, setRefreshing] = useState(true);
  const [
    transactionsFormattedBySelectedPeriod,
    setTransactionsFormattedBySelectedPeriod,
  ] = useState<any[]>([]);
  const optimizedTransactions = useMemo(
    () => transactionsFormattedBySelectedPeriod,
    [transactionsFormattedBySelectedPeriod]
  );
  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const { selectedPeriod, setSelectedPeriod, selectedDate, setSelectedDate } =
    useSelectedPeriod();
  const [
    totalAmountsGroupedBySelectedPeriod,
    setTotalAmountsGroupedBySelectedPeriod,
  ] = useState<CashFLowData[]>([
    {
      date: String(new Date()),
      totalRevenuesByPeriod: new Decimal(0),
      totalExpensesByPeriod: new Decimal(0),
      cashFlow: '',
    },
    {
      date: String(new Date()),
      totalRevenuesByPeriod: new Decimal(0),
      totalExpensesByPeriod: new Decimal(0),
      cashFlow: '',
    },
  ]);
  const [chartData, setChartData] = useState<any[]>();
  const [cashFlowTotalBySelectedPeriod, setCashFlowTotalBySelectedPeriod] =
    useState('');
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
  // Animated section list
  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
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

  async function fetchTransactions() {
    try {
      setLoading(true);

      const { data } = await api.get(
        '/banking_integration/fetch_transactions',
        {
          params: {
            user_id: userID,
          },
        }
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
            : null,
          currency: item.currency,
          type: item.type,
          account: item.account,
          category: item.category,
          tags: item.tags,
          user_id: item.user_id,
        };
      });

      // Process transactions
      const { cashFlows, chartData, currentCashFlow, groupedTransactions } =
        processTransactions(
          transactionsFormattedPtbr,
          selectedPeriod.period,
          selectedDate
        );

      // Update states
      setCashFlowTotalBySelectedPeriod(currentCashFlow);
      setTotalAmountsGroupedBySelectedPeriod(cashFlows);
      setChartData(chartData);
      setTransactionsFormattedBySelectedPeriod(groupedTransactions);
    } catch (error) {
      console.error('Home fetchTransactions error =>', error);
      Alert.alert(
        'Transações',
        'Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenPeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.present();
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
    const dateParsed = parse(dateAux, 'MMM yyyy', new Date(), {
      locale: ptBR,
    });
    const selectedDateAux = lastDayOfMonth(new Date(dateParsed));

    setSelectedDate(selectedDateAux);

    // TODO: tratar caso onde o período selecionado for anos
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
    const dates = totalAmountsGroupedBySelectedPeriod?.map((item: any) => {
      // TODO: tratar caso onde o período selecionado for anos, pois neste caso o formato da data muda

      const dateSplit = item.date.split('\n');
      const trimmedDateParts = dateSplit.map((part: string) => part.trim());
      const dateAux = trimmedDateParts.join(' ');

      let parsedDate: Date | null = null;
      try {
        parsedDate = parse(dateAux, 'MMM yyyy', selectedDate, {
          locale: ptBR,
        });
        if (!isValid(parsedDate)) {
          console.warn('Data inválida:', dateAux);
        }
      } catch (error) {
        console.error('Erro ao converter data, _renderPeriodRuler:', error);
      }

      const isActive = parsedDate
        ? getYear(selectedDate) === getYear(parsedDate) &&
          getMonth(selectedDate) === getMonth(parsedDate)
        : false;

      return {
        date: item.date,
        isActive,
      };
    });

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
  }, [selectedDate, totalAmountsGroupedBySelectedPeriod]);

  const _renderInsightCard = useCallback(() => {
    const lastPeriodIndex = totalAmountsGroupedBySelectedPeriod.length - 1;
    const lastPeriod = totalAmountsGroupedBySelectedPeriod[lastPeriodIndex];
    const lastPeriodCashFlow =
      Number(lastPeriod.totalRevenuesByPeriod) -
      Number(lastPeriod.totalExpensesByPeriod);
    const cashFlowIsPositive = lastPeriodCashFlow >= 0;

    return (
      <InsightCard.Root>
        <InsightCard.CloseButton onPress={handleHideCashFlowInsights} />
        <InsightCard.Title
          title={
            cashFlowIsPositive
              ? eInsightsCashFlow.CONGRATULATIONS_TITLE
              : eInsightsCashFlow.INCENTIVE_TITLE
          }
          text={
            cashFlowIsPositive
              ? eInsightsCashFlow.CONGRATULATIONS_DESCRIPTION
              : eInsightsCashFlow.INCENTIVE_DESCRIPTION
          }
        />
      </InsightCard.Root>
    );
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
    fetchQuote('BRL', 'BTC', setBrlQuoteBtc);
    fetchQuote('BRL', 'EUR', setBrlQuoteEur);
    fetchQuote('BRL', 'USD', setBrlQuoteUsd);

    fetchQuote('BTC', 'BRL', setBtcQuoteBrl);
    fetchQuote('BTC', 'EUR', setBtcQuoteEur);
    fetchQuote('BTC', 'USD', setBtcQuoteUsd);

    fetchQuote('EUR', 'BRL', setEurQuoteBrl);
    fetchQuote('EUR', 'BTC', setEurQuoteBtc);
    fetchQuote('EUR', 'USD', setEurQuoteUsd);

    fetchQuote('USD', 'BRL', setUsdQuoteBrl);
    fetchQuote('USD', 'BTC', setUsdQuoteBtc);
    fetchQuote('USD', 'EUR', setUsdQuoteEur);

    fetchTransactions();
  }, [selectedDate, selectedPeriod.period]);

  if (loading) {
    return <SkeletonHomeScreen />;
  }

  return (
    <Container>
      <Gradient />

      <Animated.View style={[headerStyleAnimation, styles.header]}>
        <Header>
          <CashFlowContainer>
            <CashFlowTotal>
              {!hideAmount ? cashFlowTotalBySelectedPeriod : '•••••'}
            </CashFlowTotal>
            <CashFlowDescription>Fluxo de Caixa</CashFlowDescription>
          </CashFlowContainer>

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
            data={chartData}
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

      <Transactions>
        <AnimatedSectionList
          sections={optimizedTransactions}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }: any) => (
            <TransactionListItem
              data={item}
              index={index}
              hideAmount={hideAmount}
              onPress={() => handleOpenTransaction(item.id)}
            />
          )}
          renderSectionHeader={({ section }: any) => (
            <SectionListHeader data={section} />
          )}
          ListEmptyComponent={_renderEmpty}
          initialNumToRender={200}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTransactions}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandlerToTop}
          scrollEventThrottle={16}
          contentContainerStyle={{
            rowGap: 8,
            paddingTop: 16,
            paddingBottom: bottomTabBarHeight,
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
          setPeriod={setSelectedPeriod}
          closeSelectPeriod={handleOpenPeriodSelectedModal}
        />
      </ModalViewSelection>

      <ModalViewWithoutHeader
        bottomSheetRef={registerTransactionBottomSheetRef}
        snapPoints={['95%']}
      >
        <RegisterTransaction
          id={transactionId}
          resetId={ClearTransactionId}
          closeRegisterTransaction={handleCloseRegisterTransactionModal}
          closeModal={handleCloseRegisterTransactionModal}
        />
      </ModalViewWithoutHeader>
    </Container>
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
