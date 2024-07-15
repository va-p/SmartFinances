import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  CloseCashFlowAlertButton,
  CashFlowAlertContainer,
  CashFlowAlertTitle,
  CashFlowAlertText,
  PeriodRulerContainer,
  PeriodRulerList,
  PeriodRulerListItem,
  PeriodRulerListDivisor,
} from './styles';

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  withSpring,
} from 'react-native-reanimated';
import {
  VictoryChart,
  VictoryBar,
  VictoryGroup,
  VictoryZoomContainer,
} from 'victory-native';
import { RectButton, PanGestureHandler } from 'react-native-gesture-handler';
import {
  addMonths,
  addYears,
  format,
  isFirstDayOfMonth,
  parse,
  parseISO,
  subMonths,
  subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Plus, Eye, EyeSlash, X } from 'phosphor-react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import { SectionListHeader } from '@components/SectionListHeader';
import { ChartSelectButton } from '@components/ChartSelectButton';
import TransactionListItem from '@components/TransactionListItem';
import { SkeletonHomeScreen } from '@components/SkeletonHomeScreen';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ModalViewWithoutHeader } from '@components/ModalViewWithoutHeader';

import { RegisterTransaction } from '@screens/RegisterTransaction';
import { PeriodProps, ChartPeriodSelect } from '@screens/ChartPeriodSelect';

import apiQuotes from '@api/apiQuotes';

import { useUser } from '@stores/userStore';
import { useUserConfigs } from '@stores/userConfigsStore';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import theme from '@themes/theme';
import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';

import formatDatePtBr from '@utils/formatDatePtBr';
import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import groupTransactionsByDate from '@utils/groupTransactionsByDate';

import api from '@api/api';
import { useQuotes } from '@stores/quotesStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
// PeriodRulerList Column
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 5;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS = SCREEN_HEIGHT * 0.38;
const SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS = SCREEN_HEIGHT * 0.25;

type PeriodData = {
  date: Date | number;
  totalRevenuesByPeriod: number;
  totalExpensesByPeriod: number;
};

export function Home() {
  const [loading, setLoading] = useState(false);
  const tenantId = useUser((state) => state.tenantId);
  const userId = useUser((state) => state.id);

  const setBrlQuoteBtc = useQuotes((state) => state.setBrlQuoteBtc);
  const setBtcQuoteBrl = useQuotes((state) => state.setBtcQuoteBrl);
  const setEurQuoteBrl = useQuotes((state) => state.setEurQuoteBrl);
  const setUsdQuoteBrl = useQuotes((state) => state.setUsdQuoteBrl);

  const hideAmount = useUserConfigs((state) => state.hideAmount);
  const setHideAmount = useUserConfigs((state) => state.setHideAmount);
  const insights = useUserConfigs((state) => state.insights);
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
  ] = useState<PeriodData[]>([
    {
      date: 0,
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0,
    },
    {
      date: 1,
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0,
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
        Extrapolate.CLAMP
      ),
      opacity: interpolate(scrollY.value, [0, 370], [1, 0], Extrapolate.CLAMP),
    };
  });
  const chartStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 300], [1, 0], Extrapolate.CLAMP),
    };
  });
  const insightsStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolate.CLAMP),
    };
  });
  // Animated section list
  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
  // Animated button register transaction
  const registerTransactionButtonPositionX = useSharedValue(0);
  const registerTransactionButtonPositionY = useSharedValue(0);
  const ButtonAnimated = Animated.createAnimatedComponent(RectButton);
  const registerTransactionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: registerTransactionButtonPositionX.value },
        { translateY: registerTransactionButtonPositionY.value },
      ],
    };
  });
  const OnMoveRegisterTransactionButton = useAnimatedGestureHandler({
    onStart(_, ctx: any) {
      ctx.positionX = registerTransactionButtonPositionX.value;
      ctx.positionY = registerTransactionButtonPositionY.value;
    },
    onActive(event, ctx: any) {
      registerTransactionButtonPositionX.value =
        ctx.positionX + event.translationX;
      registerTransactionButtonPositionY.value =
        ctx.positionY + event.translationY;
    },
    onEnd() {
      registerTransactionButtonPositionX.value = withSpring(0);
      registerTransactionButtonPositionY.value = withSpring(0);
    },
  });

  async function fetchBrlQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'BRL',
          convert: 'BTC',
        },
      });
      setBrlQuoteBtc(data.data[0].quote.BTC);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Cotação de moedas',
        'Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.'
      );
    }
  }

  async function fetchBtcQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'BTC',
          convert: 'BRL',
        },
      });
      setBtcQuoteBrl(data.data[0].quote.BRL);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Cotação de moedas',
        'Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.'
      );
    }
  }

  async function fetchEurQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'EUR',
          convert: 'BRL',
        },
      });
      if (data) {
        setEurQuoteBrl(data.data[0].quote.BRL);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Cotação de moedas',
        'Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.'
      );
    }
  }

  async function fetchUsdQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'USD',
          convert: 'BRL',
        },
      });
      if (data) {
        setUsdQuoteBrl(data.data[0].quote.BRL);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Cotação de moedas',
        'Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.'
      );
    }
  }

  async function fetchTransactions() {
    setLoading(true);

    try {
      const data = await getTransactions(tenantId);

      /**
       * All Transactions Formatted in pt-BR - Start
       */
      let amountNotConvertedFormatted = '';
      let totalRevenues = 0;
      let totalExpenses = 0;

      let transactionsFormattedPtbr: any = [];
      for (const item of data) {
        const dmy = formatDatePtBr(item.created_at).short();

        const amount_formatted = formatCurrency(
          item.account.currency.code,
          item.amount
        ).formatAmountConverted();

        if (item.amount_not_converted) {
          amountNotConvertedFormatted =
            formatCurrency(
              item.currency.code,
              item.amount_not_converted
            ).formatAmountNotConverted() || '';
        }

        if (!transactionsFormattedPtbr.hasOwnProperty(dmy)) {
          transactionsFormattedPtbr[item.id] = {
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

        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          totalRevenues += item.amount;
        } else if (
          new Date(item.created_at) <= new Date() &&
          item.type === 'debit'
        ) {
          totalExpenses += item.amount;
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

      const total = totalRevenues - totalExpenses;
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

      const totalByMonths =
        //initialTotalAmountByMonths +
        totalRevenuesByMonths - totalExpensesByMonths;
      const totalFormattedPtbrByMonths = totalByMonths.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
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

      let totalRevenuesByYears = 0;
      let totalExpensesByYears = 0;

      for (const item of transactionsByYearsFormattedPtbr) {
        item.data.forEach((cur: any) => {
          if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date()) {
            switch (cur.type) {
              case 'credit':
                totalRevenuesByYears += cur.amount;
                break;
              case 'debit':
                totalExpensesByYears += cur.amount;
                break;
            }
          }
        });
      }

      const totalBRLByYears =
        //initialTotalAmountBRLByYears +
        totalRevenuesByYears - totalExpensesByYears;
      const totalFormattedPtbrByYears = totalBRLByYears.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        }
      );
      /**
       * Transactions By Years Formatted in pt-BR - End
       */

      /**
       * All Totals Grouped By Months - Start
       */
      let totalsGroupedByMonths: any = [];
      for (const item of data) {
        const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });

        if (!totalsGroupedByMonths.hasOwnProperty(ym)) {
          totalsGroupedByMonths[ym] = {
            date: ym,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0,
          };
        }
        if (new Date(item.created_at) < new Date() && item.type === 'credit') {
          totalsGroupedByMonths[ym].totalRevenuesByPeriod += item.amount;
        } else if (
          new Date(item.created_at) < new Date() &&
          item.type === 'debit'
        ) {
          totalsGroupedByMonths[ym].totalExpensesByPeriod += item.amount;
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
      /**
       * All Totals Grouped By Months - End
       */

      /**
       * All Totals Grouped By Years - Start
       */
      let totalsGroupedByYears: any = [];
      for (const item of data) {
        const y = format(item.created_at, `yyyy`, { locale: ptBR });

        if (!totalsGroupedByYears.hasOwnProperty(y)) {
          totalsGroupedByYears[y] = {
            date: y,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0,
          };
        }
        if (new Date(item.created_at) < new Date() && item.type === 'credit') {
          totalsGroupedByYears[y].totalRevenuesByPeriod += item.amount;
        } else if (
          new Date(item.created_at) < new Date() &&
          item.type === 'debit'
        ) {
          totalsGroupedByYears[y].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByYears = Object.values(totalsGroupedByYears).sort(
        (a: any, b: any) => {
          const firstDateParsed = parse(a.date, 'yyyy', new Date());
          const secondDateParsed = parse(b.date, 'yyyy', new Date());
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        }
      );
      /**
       * All Totals Grouped By Years - End
       */

      /**
       * All Totals Grouped By All History - Start
       */
      let totalsGroupedByAllHistory: any = [];
      for (const item of data) {
        item.created_at = `Todo o \n histórico`;
        const allHistory = item.created_at;

        if (!totalsGroupedByAllHistory.hasOwnProperty(allHistory)) {
          totalsGroupedByAllHistory[allHistory] = {
            date: allHistory,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0,
          };
        }
        if (new Date(item.created_at) < new Date() && item.type === 'credit') {
          totalsGroupedByAllHistory[allHistory].totalRevenuesByPeriod +=
            item.amount;
        } else if (
          new Date(item.created_at) < new Date() &&
          item.type === 'debit'
        ) {
          totalsGroupedByAllHistory[allHistory].totalExpensesByPeriod +=
            item.amount;
        }
      }
      totalsGroupedByAllHistory = Object.values(totalsGroupedByAllHistory);
      /**
       * All Totals Grouped All History - End
       */

      /**
       * Set Transactions and Totals by Selected Period - Start
       */
      switch (chartPeriodSelected.period) {
        case 'months':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByMonths);
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByMonths);
          setTransactionsFormattedBySelectedPeriod(
            transactionsByMonthsFormattedPtbr
          );
          break;
        case 'years':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByYears);
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByYears);
          setTransactionsFormattedBySelectedPeriod(
            transactionsByYearsFormattedPtbr
          );
          break;
        case 'all':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByAllHistory);
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByAllHistory);
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

  /*function handleClosePeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.dismiss();
  };*/

  function handleOpenRegisterTransactionModal() {
    setTransactionId('');
    registerTransactionBottomSheetRef.current?.present();
  }

  function handleCloseRegisterTransactionModal() {
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

  function handleGesture(evt: any) {
    const { nativeevent } = evt;

    if (nativeevent.velocityX > 0) {
      console.log('swipe right');
    } else {
      console.log('swipe left');
    }
  }

  function ClearTransactionId() {
    setTransactionId('');
  }

  async function handleHideData() {
    try {
      const { status } = await api.post('edit_hide_amount', {
        user_id: userId,
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

  const arrayAux = ['mai', 'jun', 'jul', 'ago', 'set'];

  function _renderPeriodRuler() {
    return (
      <PeriodRulerContainer>
        <PeriodRulerList
          data={arrayAux}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }: any) => (
            <PeriodRulerListItem
              // data={item}
              // index={index}
              width={PERIOD_RULER_LIST_COLUMN_WIDTH}
              isActive={false}
              // onPress={() => handleOpenTransaction(item.id)}
            >
              {item}
            </PeriodRulerListItem>
            // <Text style={{ color: '#FFF' }}>a</Text>
          )}
          ListFooterComponent={<PeriodRulerListDivisor />}
        />
      </PeriodRulerContainer>
    );
  }

  function _renderCashFlowInsightContainer() {
    return (
      <CashFlowAlertContainer>
        <CloseCashFlowAlertButton onPress={handleHideCashFlowInsights}>
          <X size={20} color={theme.colors.primary} />
        </CloseCashFlowAlertButton>
        <CashFlowAlertTitle>
          Parabéns! 🎉 Você fechou o mês positivo!
        </CashFlowAlertTitle>
        <CashFlowAlertText>
          Continue assim nos próximos meses e invista parte do dinheiro que
          sobrou para aumentar seu patrimônio!
        </CashFlowAlertText>
      </CashFlowAlertContainer>
    );
  }

  function _renderEmpty() {
    return <ListEmptyComponent />;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
  }, []);

  useEffect(() => {
    fetchBrlQuote();
    fetchBtcQuote();
    fetchEurQuote();
    fetchUsdQuote();
    fetchTransactions();
  }, [chartPeriodSelected.period]);

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
            padding={{ top: 16, right: 16, bottom: 40, left: 40 }}
            //domainPadding={{ x: 6, y: 6 }}
            containerComponent={
              <VictoryZoomContainer
                allowZoom={false}
                zoomDomain={{ x: [6, 12] }}
                zoomDimension='x'
              />
            }
            theme={smartFinancesChartTheme}
          >
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
                  onLoad: { duration: 1500 },
                  easing: 'backOut',
                }}
              />
            </VictoryGroup>
          </VictoryChart>
        </Animated.View>

        {/* <Animated.View>
          {_renderPeriodRuler()}
        </Animated.View> */}

        <Animated.View style={insightsStyleAnimationOpacity}>
          {insights &&
            showInsights &&
            firstDayOfMonth &&
            _renderCashFlowInsightContainer()}
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
                fetchTransactions();
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: getBottomSpace(),
          }}
          onScroll={scrollHandlerToTop}
          scrollEventThrottle={16}
        />
      </Transactions>

      <PanGestureHandler onGestureEvent={OnMoveRegisterTransactionButton}>
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
      </PanGestureHandler>

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
          closeModal={() =>
            registerTransactionBottomSheetRef.current?.dismiss()
          }
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
