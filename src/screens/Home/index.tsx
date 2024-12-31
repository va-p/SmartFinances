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

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  VictoryChart,
  VictoryBar,
  VictoryGroup,
  VictoryZoomContainer,
  VictoryAxis,
} from 'victory-native';
import {
  RectButton,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {
  addMonths,
  addYears,
  format,
  getMonth,
  getYear,
  isFirstDayOfMonth,
  isValid,
  parse,
  parseISO,
  subMonths,
  subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Plus, Eye, EyeSlash } from 'phosphor-react-native';

import { InsightCard } from '@components/InsightCard';
import { PeriodRuler } from '@components/PeriodRuler';
import { SectionListHeader } from '@components/SectionListHeader';
import { ChartSelectButton } from '@components/ChartSelectButton';
import TransactionListItem from '@components/TransactionListItem';
import { SkeletonHomeScreen } from '@components/SkeletonHomeScreen';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ModalViewWithoutHeader } from '@components/ModalViewWithoutHeader';

import { RegisterTransaction } from '@screens/RegisterTransaction';
import { PeriodProps, ChartPeriodSelect } from '@screens/ChartPeriodSelect';

import fetchQuote from '@utils/fetchQuotes';
import formatDatePtBr from '@utils/formatDatePtBr';
import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import groupTransactionsByDate from '@utils/groupTransactionsByDate';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import api from '@api/api';

import theme from '@themes/theme';
import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';
import Decimal from 'decimal.js';
import { TransactionProps } from '@interfaces/transactions';

const SCREEN_WIDTH = Dimensions.get('window').width;
// PeriodRulerList Column
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS = SCREEN_HEIGHT * 0.44;
const SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS = SCREEN_HEIGHT * 0.32;

export type CashFLowData = {
  date: Date | string | number;
  totalRevenuesByPeriod: Decimal;
  totalExpensesByPeriod: Decimal;
  total: Decimal;
  // total: number;
  cashFlow: string;
};

export function Home() {
  const [loading, setLoading] = useState(false);
  const { tenantId: tenantID, id: userID } = useUser();
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
  ] = useState([]);
  const optimizedTransactions = useMemo(
    () => transactionsFormattedBySelectedPeriod,
    [transactionsFormattedBySelectedPeriod]
  );
  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const [chartPeriodSelected, setChartPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months',
  });
  const [
    totalAmountsGroupedBySelectedPeriod,
    setTotalAmountsGroupedBySelectedPeriod,
  ] = useState<CashFLowData[]>([
    {
      date: String(new Date()),
      totalRevenuesByPeriod: new Decimal(0),
      totalExpensesByPeriod: new Decimal(0),
      total: new Decimal(0),
      cashFlow: '',
    },
    {
      date: String(new Date()),
      totalRevenuesByPeriod: new Decimal(0),
      totalExpensesByPeriod: new Decimal(0),
      total: new Decimal(0),
      cashFlow: '',
    },
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
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
    .onStart((e) => {
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

  async function fetchTransactions(transactions?: TransactionProps[]) {
    try {
      setLoading(true);

      const data = transactions ? transactions : await getTransactions(userID);

      /**
       * All Transactions Formatted in pt-BR - Start
       */
      let total = 0;
      let amountNotConvertedFormatted = '';

      let transactionsFormattedPtbr: any = {};
      for (const item of data) {
        const dmy = formatDatePtBr(item.created_at).short();

        const amount_formatted = formatCurrency(
          item.account.currency.code,
          item.amount
        );

        if (item.amount_not_converted) {
          amountNotConvertedFormatted =
            formatCurrency(
              item.currency.code,
              item.amount_not_converted,
              false
            ) || '';
        }

        if (!transactionsFormattedPtbr.hasOwnProperty(dmy)) {
          transactionsFormattedPtbr[item.id] = {
            id: item.id,
            created_at: dmy,
            description: item.description,
            amount: item.amount,
            amount_formatted,
            amount_not_converted: amountNotConvertedFormatted,
            amount_in_account_currency: item.amount_in_account_currency,
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
              type: item.account.type,
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
            // tenant_id: item.tenant_id,
            user_id: item.user_id,
          };
        }

        // Cartão de crédito
        if (
          new Date(item.created_at) <= new Date() &&
          item.account.type === 'CREDIT'
        ) {
          total -= item.amount; //Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
        }
        // Outros tipos de conta
        if (
          new Date(item.created_at) <= new Date() &&
          item.account.type !== 'CREDIT'
        ) {
          total += item.amount;
        }
      }
      transactionsFormattedPtbr = Object.values(transactionsFormattedPtbr).sort(
        (a: any, b: any) => {
          const firstDateParsed = parse(a.created_at, 'dd/MM/yyyy', new Date());
          const secondDateParsed = parse(
            b.created_at,
            'dd/MM/yyyy',
            new Date()
          );
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        }
      );

      const totalFormattedPtbrByAllHistory = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      const transactionsFormattedPtbrGroupedByDate = groupTransactionsByDate(
        transactionsFormattedPtbr
      );
      /**
       * All Transactions Formatted in pt-BR - End
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
            ).getMonth() === selectedPeriod.getMonth() &&
            parse(
              transactionByMonthsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getFullYear() === selectedPeriod.getFullYear()
        );

      let cashFlowByMonth = 0;

      for (const item of transactionsByMonthsFormattedPtbr) {
        const cleanTotal = item.total.replace(/[R$\s.]/g, '').replace(',', '.');
        cashFlowByMonth += parseFloat(cleanTotal);
      }

      const totalByMonthsFormattedPtbr = formatCurrency(
        'BRL',
        cashFlowByMonth,
        false
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
            ).getFullYear() === selectedPeriod.getFullYear()
        );

      let cashFlowByYear = 0;

      for (const item of transactionsByYearsFormattedPtbr) {
        const cleanTotal = item.total.replace(/[R$\s.]/g, '').replace(',', '.');
        cashFlowByYear += parseFloat(cleanTotal);
      }

      const totalByYearsFormattedPtbr = formatCurrency(
        'BRL',
        cashFlowByYear,
        false
      );
      /**
       * Transactions By Years Formatted in pt-BR - End
       */

      /**
       * All Cash Flows Grouped By Months (Chart Data) - Start
       */
      if (chartPeriodSelected.period === 'months') {
        let totalsGroupedByMonths: any = {};
        for (const item of data) {
          const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });

          if (!totalsGroupedByMonths.hasOwnProperty(ym)) {
            totalsGroupedByMonths[ym] = {
              date: ym,
              totalRevenuesByPeriod: 0,
              totalExpensesByPeriod: 0,
              total: 0,
            };
          }

          if (new Date(item.created_at) < new Date()) {
            // Credit card
            if (item.account.type === 'CREDIT' && item.type === 'CREDIT') {
              totalsGroupedByMonths[ym].totalRevenuesByPeriod -= item.amount; // Lógica invertida para Cartão de Crédito
            }
            if (item.account.type === 'CREDIT' && item.type === 'DEBIT') {
              totalsGroupedByMonths[ym].totalExpensesByPeriod += item.amount; // Lógica invertida para Cartão de Crédito
            }

            // Other account types
            if (item.account.type !== 'CREDIT' && item.type === 'CREDIT') {
              totalsGroupedByMonths[ym].totalRevenuesByPeriod += item.amount;
            }
            if (item.account.type !== 'CREDIT' && item.type === 'DEBIT') {
              totalsGroupedByMonths[ym].totalExpensesByPeriod -= item.amount;
            }
          }
        }
        totalsGroupedByMonths = Object.values(totalsGroupedByMonths);

        for (let i = totalsGroupedByMonths.length - 1; i >= 0; i--) {
          totalsGroupedByMonths[i].date = format(
            parseISO(totalsGroupedByMonths[i].date),
            `MMM '\n' yyyy`,
            { locale: ptBR }
          );
        }

        setCashFlowTotalBySelectedPeriod(totalByMonthsFormattedPtbr);
        setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByMonths);
        setTransactionsFormattedBySelectedPeriod(
          transactionsByMonthsFormattedPtbr
        );

        return;
      }
      /**
       * All Cash Flows Grouped By Months (Chart Data) - End
       */

      /**
       * All Totals Grouped By Years - Start
       */
      if (chartPeriodSelected.period === 'years') {
        let totalsGroupedByYears: any = {};
        for (const item of data) {
          const y = format(item.created_at, `yyyy`, { locale: ptBR });

          if (!totalsGroupedByYears.hasOwnProperty(y)) {
            totalsGroupedByYears[y] = {
              date: y,
              totalRevenuesByPeriod: 0,
              totalExpensesByPeriod: 0,
              total: 0,
            };
          }

          if (
            new Date(item.created_at) <= new Date() &&
            item.account.type === 'CREDIT'
          ) {
            totalsGroupedByYears[y].total -= item.amount; //Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
          }

          // Outros tipos de conta
          if (
            new Date(item.created_at) <= new Date() &&
            item.account.type !== 'CREDIT'
          ) {
            totalsGroupedByYears[y].total += item.amount;
          }
        }
        totalsGroupedByYears = Object.values(totalsGroupedByYears).sort(
          (a: any, b: any) => {
            const firstDateParsed = parse(a.date, 'yyyy', new Date());
            const secondDateParsed = parse(b.date, 'yyyy', new Date());
            return secondDateParsed.getTime() - firstDateParsed.getTime();
          }
        );

        setCashFlowTotalBySelectedPeriod(totalByYearsFormattedPtbr);
        setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByYears);
        setTransactionsFormattedBySelectedPeriod(
          transactionsByYearsFormattedPtbr
        );

        return;
      }
      /**
       * All Totals Grouped By Years - End
       */

      /**
       * All Totals Grouped By All History - Start
       */
      if (chartPeriodSelected.period === 'all') {
        let totalsGroupedByAllHistory: any = {};
        for (const item of data) {
          item.created_at = `Todo o \n histórico`;
          const allHistory = item.created_at;

          if (!totalsGroupedByAllHistory.hasOwnProperty(allHistory)) {
            totalsGroupedByAllHistory[allHistory] = {
              date: allHistory,
              totalRevenuesByPeriod: 0,
              totalExpensesByPeriod: 0,
              total: 0,
            };
          }
          if (
            new Date(item.created_at) <= new Date() &&
            item.account.type === 'CREDIT'
          ) {
            totalsGroupedByAllHistory[allHistory].total -= item.amount; //Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
          }

          // Outros tipos de conta
          if (
            new Date(item.created_at) <= new Date() &&
            item.account.type !== 'CREDIT'
          ) {
            totalsGroupedByAllHistory[allHistory].total += item.amount;
          }
        }
        totalsGroupedByAllHistory = Object.values(totalsGroupedByAllHistory);

        setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByAllHistory);
        setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByAllHistory);
        setTransactionsFormattedBySelectedPeriod(
          transactionsFormattedPtbrGroupedByDate
        );

        return;
      }
      /**
       * All Totals Grouped All History - End
       */
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

  async function fetchBankingIntegrations(isRefresh: boolean = false) {
    try {
      setLoading(true);

      const { data, status } = await api.get(
        '/banking_integration/get_and_sync_integrations',
        {
          params: {
            user_id: userID,
          },
        }
      );

      if (status === 200 && data.length > 0) {
        fetchTransactions(data);
      }

      fetchTransactions();

      return;
    } catch (error) {
      console.error('Erro ao verificar contas conectadas:', error);
      Alert.alert(
        'Transações',
        'Não foi possível buscar suas conexões bancárias. Verifique sua conexão com a internet e tente novamente.'
      );
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
    setAccountID(null);
    setAccountName(null);
    fetchTransactions();
    registerTransactionBottomSheetRef.current?.dismiss();
  }

  function handleOpenTransaction(id: string) {
    setTransactionId(id);
    registerTransactionBottomSheetRef.current?.present();
  }

  function handleDateChange(action: 'prev' | 'next'): void {
    switch (chartPeriodSelected.period) {
      case 'months':
        switch (action) {
          case 'prev':
            setSelectedPeriod(subMonths(selectedPeriod, 1));
            break;
          case 'next':
            setSelectedPeriod(addMonths(selectedPeriod, 1));
            break;
        }
        break;
      case 'years':
        switch (action) {
          case 'prev':
            setSelectedPeriod(subYears(selectedPeriod, 1));
            break;
          case 'next':
            setSelectedPeriod(addYears(selectedPeriod, 1));
            break;
        }
        break;
    }
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
      const dateSplit = item.date.split('\n');
      const trimmedDateParts = dateSplit.map((part: string) => part.trim());
      const dateAux = trimmedDateParts.join(' ');

      let parsedDate: Date | null = null;
      try {
        parsedDate = parse(dateAux, 'MMM yyyy', selectedPeriod, {
          locale: ptBR,
        });
        if (!isValid(parsedDate)) {
          console.warn('Data inválida:', dateAux);
        }
      } catch (error) {
        console.error('Erro ao converter data, _renderPeriodRuler:', error);
      }

      const isActive = parsedDate
        ? getYear(selectedPeriod) === getYear(parsedDate) &&
          getMonth(selectedPeriod) === getMonth(parsedDate)
        : false;

      return {
        date: item.date,
        isActive,
      };
    });

    return (
      <PeriodRuler
        dates={dates}
        handleDateChange={handleDateChange}
        periodRulerListColumnWidth={PERIOD_RULER_LIST_COLUMN_WIDTH}
      />
    );
  }, [selectedPeriod, totalAmountsGroupedBySelectedPeriod]);

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

    fetchBankingIntegrations();
  }, [selectedPeriod, chartPeriodSelected.period, userID, tenantID]);

  if (loading) {
    return <SkeletonHomeScreen />;
  }

  return (
    <Container>
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
            <ChartSelectButton
              title={`Por ${chartPeriodSelected.name}`}
              onPress={handleOpenPeriodSelectedModal}
            />
          </FilterButtonGroup>
        </FiltersContainer>

        <Animated.View style={chartStyleAnimationOpacity}>
          <VictoryChart
            height={120}
            padding={{ top: 16, right: 16, bottom: 40, left: 56 }}
            containerComponent={
              <VictoryZoomContainer
                allowZoom={false}
                zoomDomain={{ x: [6, 12] }}
                zoomDimension='x'
              />
            }
            theme={smartFinancesChartTheme}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(tick) => formatCurrency('BRL', tick, false, false)}
            />
            <VictoryAxis tickFormat={(tick) => tick} />
            <VictoryGroup offset={12}>
              <VictoryBar
                data={totalAmountsGroupedBySelectedPeriod}
                x='date'
                y='totalRevenuesByPeriod'
                sortKey='x'
                sortOrder='descending'
                alignment='start'
                style={{
                  data: {
                    width: 10,
                    fill: theme.colors.success_light,
                  },
                }}
                cornerRadius={{ top: 2, bottom: 2 }}
                animate={{
                  onEnter: { duration: 3000 },
                  easing: 'backOut',
                }}
              />
              <VictoryBar
                data={totalAmountsGroupedBySelectedPeriod}
                x='date'
                y='totalExpensesByPeriod'
                sortOrder='descending'
                alignment='start'
                style={{
                  data: {
                    width: 10,
                    fill: theme.colors.attention_light,
                  },
                }}
                cornerRadius={{ top: 2, bottom: 2 }}
                animate={{
                  onLoad: { duration: 3000 },
                  easing: 'backOut',
                }}
              />
            </VictoryGroup>
          </VictoryChart>
        </Animated.View>

        <Animated.View>{_renderPeriodRuler()}</Animated.View>

        <Animated.View style={insightsStyleAnimationOpacity}>
          {insights && showInsights && firstDayOfMonth && (
            <InsightCard.Root>
              <InsightCard.CloseButton onPress={handleHideCashFlowInsights} />
              <InsightCard.Title
                title='Parabéns! 🎉 Você fechou o mês positivo!'
                text='Continue assim nos próximos meses e invista parte do dinheiro que sobrou para aumentar seu patrimônio!'
              />
            </InsightCard.Root>
          )}
        </Animated.View>
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
          initialNumToRender={2000}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchBankingIntegrations(true);
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandlerToTop}
          scrollEventThrottle={16}
        />
      </Transactions>

      <GestureDetector gesture={onMoveRegisterTransactionButton}>
        <Animated.View
          style={[
            registerTransactionButtonStyle,
            {
              position: 'absolute',
              bottom: 22,
              right: 22,
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
          period={chartPeriodSelected}
          setPeriod={setChartPeriodSelected}
          closeSelectPeriod={handleOpenPeriodSelectedModal}
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
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
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
