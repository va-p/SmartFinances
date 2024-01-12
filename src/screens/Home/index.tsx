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
import {
  RectButton,
  PanGestureHandler,
  // Swipeable,
} from 'react-native-gesture-handler';
import {
  addMonths,
  addYears,
  format,
  getDay,
  parse,
  parseISO,
  subMonths,
  subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
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

import {
  setBrlQuoteBtc,
  setBtcQuoteBrl,
  setEurQuoteBrl,
  setUsdQuoteBrl,
} from '@slices/quotesSlice';
import { selectUserTenantId } from '@slices/userSlice';

import apiQuotes from '@api/apiQuotes';

import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import theme from '@themes/theme';
import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';

import formatDatePtBr from '@utils/formatDatePtBr';
import getTransactions from '@utils/getTransactions';
import groupTransactionsByDate from '@utils/groupTransactionsByDate';

type PeriodData = {
  date: Date | number;
  totalRevenuesByPeriod: number;
  totalExpensesByPeriod: number;
};

export function Home() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const dispatch = useDispatch();
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
  const [hideAmount, setHideAmount] = useState(true);
  const [hideCashFlowAlert, setHideCashFlowAlert] = useState(false);
  const isFirstOrSecondDayOfMonth =
    getDay(new Date()) === 0 || getDay(new Date()) === 1;

  // Animated header, chart and transactions list
  const scrollY = useSharedValue(0);
  const scrollHandlerToTop = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(scrollY.value, [0, 400], [200, 0], Extrapolate.CLAMP),
      opacity: interpolate(scrollY.value, [0, 370], [1, 0], Extrapolate.CLAMP),
    };
  });
  const chartStyleAnimationOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 220], [1, 0], Extrapolate.CLAMP),
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
      dispatch(setBrlQuoteBtc(data.data[0].quote.BTC));
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
      // console.log('BTC quote >>>', data.data[0].quote.BRL);
      dispatch(setBtcQuoteBrl(data.data[0].quote.BRL));
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
        dispatch(setEurQuoteBrl(data.data[0].quote.BRL));
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
        dispatch(setUsdQuoteBrl(data.data[0].quote.BRL));
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
      let amount_formatted: any;
      let amountNotConvertedFormatted = '';
      let totalRevenues = 0;
      let totalExpenses = 0;

      let transactionsFormattedPtbr: any = [];
      for (const item of data) {
        const dmy = formatDatePtBr().short(item.created_at);

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

  // TODO Configurar Zustand e passar as configs por ele!!!
  function getUserConfig() {
    (() => {
      const dataIsVisible = storageConfig.getBoolean(
        `${DATABASE_CONFIGS}.dataIsVisible`
      );
      if (dataIsVisible != undefined) {
        setHideAmount(dataIsVisible);
      }
    })();
  }
  function handleHideData() {
    try {
      storageConfig.set(`${DATABASE_CONFIGS}.dataIsVisible`, !hideAmount);

      setHideAmount((prevState) => !prevState);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Não foi possível salvar suas configurações. Por favor, tente novamente.'
      );
    }
  }

  function _renderEmpty() {
    return <ListEmptyComponent />;
  }

  function _renderCashFlowAlertContainer() {
    return (
      <CashFlowAlertContainer>
        <CloseCashFlowAlertButton>
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getUserConfig();
      setLoading(false);
    }, [])
  );

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
            height={200}
            padding={{ top: 12, right: 12, bottom: 128, left: 48 }}
            domainPadding={{ x: 6, y: 6 }}
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
      </Animated.View>

      {/*!hideCashFlowAlert &&
        !isFirstOrSecondDayOfMonth &&
              _renderCashFlowAlertContainer()*/}

      <Transactions>
        <AnimatedSectionList
          sections={optimizedTransactions}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }: any) => (
            <TransactionListItem
              data={item}
              index={index}
              hide_amount={hideAmount}
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
                getUserConfig();
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
