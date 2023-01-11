import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  StyleSheet,
  BackHandler,
  SectionList
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
  ListEmptyContainer,
  ListEmptyText
} from './styles'

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  withSpring
} from 'react-native-reanimated';
import {
  VictoryChart,
  VictoryBar,
  VictoryGroup,
  VictoryZoomContainer
} from 'victory-native';
import {
  format,
  parse,
  parseISO,
  addMonths,
  addYears,
  subMonths,
  subYears
} from 'date-fns';
import { RectButton, PanGestureHandler } from 'react-native-gesture-handler';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ptBR } from 'date-fns/locale';

import { ModalViewRegisterTransaction } from '@components/ModalViewRegisterTransaction';
import { TransactionListItem } from '@components/TransactionListItem';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ChartSelectButton } from '@components/ChartSelectButton';
import { SectionListHeader } from '@components/SectionListHeader';
import { Load } from '@components/Load';

import { PeriodProps, ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

import {
  setBtcQuoteBrl,
  setEurQuoteBrl,
  setUsdQuoteBrl,
} from '@slices/quotesSlice';
import {
  selectUserTenantId
} from '@slices/userSlice';

import apiQuotes from '@api/apiQuotes';
import api from '@api/api';

import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';
import theme from '@themes/theme';

type PeriodData = {
  date: Date | number;
  totalRevenuesByPeriod: number;
  totalExpensesByPeriod: number;
}

export function Home() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const dispatch = useDispatch();
  const [transactionsFormattedBySelectedPeriod, setTransactionsFormattedBySelectedPeriod] = useState([]);
  const [periodSelectedModalOpen, setPeriodSelectedModalOpen] = useState(false);
  const [chartPeriodSelected, setChartPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months'
  });
  const [totalAmountsGroupedBySelectedPeriod, setTotalAmountsGroupedBySelectedPeriod] = useState<PeriodData[]>([
    {
      date: 0,
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0
    },
    {
      date: 1,
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0
    }
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const [cashFlowTotalBySelectedPeriod, setCashFlowTotalBySelectedPeriod] = useState('');
  const [registerTransactionModalOpen, setRegisterTransactionModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [visible, setVisible] = useState(true);
  // Animated header, chart
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 400],
        [200, 0],
        Extrapolate.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, 400],
        [1, 0],
        Extrapolate.CLAMP
      )
    }
  });
  const chartStyleAnimation = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 300],
        [1, 0],
        Extrapolate.CLAMP
      )
    }
  });
  // Animated button register transaction
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const ButtonAnimated = Animated.createAnimatedComponent(RectButton);
  const registerTransactionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value }
      ]
    }
  });
  const OnGestureEvent = useAnimatedGestureHandler({
    onStart(_, ctx: any) {
      ctx.positionX = positionX.value;
      ctx.positionY = positionY.value;
    },
    onActive(event, ctx: any) {
      positionX.value = ctx.positionX + event.translationX;
      positionY.value = ctx.positionY + event.translationY;
    },
    onEnd() {
      positionX.value = withSpring(0);
      positionY.value = withSpring(0);
    }
  });
  // Animated section list
  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);


  async function fetchBtcQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          id: '1',
          convert: 'BRL'
        }
      })
      if (!data) {
      }
      else {
        dispatch(
          setBtcQuoteBrl(data.data.quote.BRL)
        )
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Cotação de moedas", "Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.")
    }
  };

  async function fetchEurQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'EUR',
          convert: 'BRL'
        }
      })
      if (!data) {
      }
      else {
        dispatch(
          setEurQuoteBrl(data.data['0'].quote.BRL)
        )
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Cotação de moedas", "Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.")
    }
  };

  async function fetchUsdQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'USD',
          convert: 'BRL'
        }
      })
      if (!data) {
      }
      else {
        dispatch(
          setUsdQuoteBrl(data.data['0'].quote.BRL)
        )
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Cotação de moedas", "Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.")
    }
  };

  async function fetchTransactions() {
    setLoading(true);

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      })
      if (!data) {
      }
      else {
        setRefreshing(false);
      }

      /**
       * All Transactions Formatted in pt-BR - Start
       */
      let amount_formatted: any;
      let amountNotConvertedFormatted = '';
      let totalRevenues = 0;
      let totalExpenses = 0;

      let transactionsFormattedPtbr: any = [];
      for (const item of data) {
        // Format the date "dd/MM/yyyy"
        var dmy = format(item.created_at, 'dd/MM/yyyy', { locale: ptBR });
        // Format the currency
        switch (item.account.currency.code) {
          case 'BRL':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
            break;
          case 'BTC':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BTC',
                minimumFractionDigits: 8,
                maximumSignificantDigits: 8
              });
            break;
          case 'EUR':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
              });
            break;
          case 'USD':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'USD'
              });
        }
        if (item.amount_not_converted && item.currency.code === 'BRL') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
        }
        if (item.amount_not_converted && item.currency.code === 'BTC') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8
            });
        }
        if (item.amount_not_converted && item.currency.code === 'EUR') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'EUR'
            });
        }
        if (item.amount_not_converted && item.currency.code === 'USD') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD'
            });
        }
        // Create the objects
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
              symbol: item.currency.symbol
            },
            type: item.type,
            account: {
              id: item.account.id,
              name: item.account.name,
              currency: {
                id: item.account.currency.id,
                name: item.account.currency.name,
                code: item.account.currency.code,
                symbol: item.account.currency.symbol
              },
              initial_amount: item.account.initial_amount,
              totalAccountAmount: 0,
              tenant_id: item.account.tenant_id
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
              tenant_id: item.category.tenant_id
            },
            tenant_id: item.tenant_id,
          };
        }
        // Sum revenues and expenses of all transactions
        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          totalRevenues += item.amount
        } else if (new Date(item.created_at) <= new Date() && item.type === 'debit') {
          totalExpenses += item.amount
        }
      };
      transactionsFormattedPtbr = Object.values(transactionsFormattedPtbr)
        .sort((a: any, b: any) => {
          const firstDateParsed = parse(a.created_at, 'dd/MM/yyyy', new Date());
          const secondDateParsed = parse(b.created_at, 'dd/MM/yyyy', new Date());
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        });

      const total =
        totalRevenues -
        totalExpenses;
      const totalFormattedPtbrByAllHistory = Number(total)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

      // Group transactions by date to section list
      const transactionsFormattedPtbrGroupedByDate = transactionsFormattedPtbr
        .reduce((acc: any, cur: any) => {
          const existObj = acc.find(
            (obj: any) => obj.title === cur.created_at
          )

          if (existObj) {
            existObj.data.push(cur)
          } else {
            acc.push({
              title: cur.created_at,
              data: [cur]
            })
          }
          return acc
        }, [])
      /**
       * All Transactions Formatted in pt-BR - End
       */


      /**
       * Transactions By Months Formatted in pt-BR - Start
       */
      const transactionsByMonthsFormattedPtbr = transactionsFormattedPtbrGroupedByDate
        .filter((transactionByMonthsPtBr: any) =>
          parse(transactionByMonthsPtBr.title, 'dd/MM/yyyy', new Date()).getMonth() === selectedPeriod.getMonth() &&
          parse(transactionByMonthsPtBr.title, 'dd/MM/yyyy', new Date()).getFullYear() === selectedPeriod.getFullYear()
        );

      // Sum revenues and expenses
      let totalRevenuesByMonths = 0;
      let totalExpensesByMonths = 0;

      for (const item of transactionsByMonthsFormattedPtbr) {
        if (item.data) {
          item.data.forEach((cur: any) => {
            if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'credit') {
              totalRevenuesByMonths += cur.amount;
            } else if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'debit') {
              totalExpensesByMonths += cur.amount;
            }
          })
        }
      };

      const totalByMonths =
        //initialTotalAmountByMonths +
        totalRevenuesByMonths -
        totalExpensesByMonths;
      const totalFormattedPtbrByMonths = Number(totalByMonths)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      /**
       * Transactions By Months Formatted in pt-BR - End
       */


      /**
       * Transactions By Years Formatted in pt-BR - Start
       */
      const transactionsByYearsFormattedPtbr = transactionsFormattedPtbrGroupedByDate
        .filter((transactionByYearsPtBr: any) =>
          parse(transactionByYearsPtBr.title, 'dd/MM/yyyy', new Date()).getFullYear() === selectedPeriod.getFullYear()
        );

      // Sum revenues and expenses
      let totalRevenuesByYears = 0;
      let totalExpensesByYears = 0;

      for (const item of transactionsByYearsFormattedPtbr) {
        if (item.data) {
          item.data.forEach((cur: any) => {
            if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'credit') {
              totalRevenuesByYears += cur.amount
            } else if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'debit') {
              totalExpensesByYears += cur.amount
            }
          })
        }
      };

      const totalBRLByYears =
        //initialTotalAmountBRLByYears +
        totalRevenuesByYears -
        totalExpensesByYears;
      const totalFormattedPtbrByYears = Number(totalBRLByYears)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      /**
       * Transactions By Years Formatted in pt-BR - End
       */


      /**
       * All Totals Grouped By Months - Start
       */
      let totalsGroupedByMonths: any = [];
      for (const item of data) {
        // Format the date to "yyyy-mm", easier to sort the array
        const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });
        // Create the objects
        if (!totalsGroupedByMonths.hasOwnProperty(ym)) {
          totalsGroupedByMonths[ym] = { date: ym, totalRevenuesByPeriod: 0, totalExpensesByPeriod: 0 };
        }
        if (item.type === 'credit') {
          totalsGroupedByMonths[ym].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'debit') {
          totalsGroupedByMonths[ym].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByMonths = Object.values(totalsGroupedByMonths);

      // Runs from last to first, formating the date to "MMM yyyy"
      for (var i = totalsGroupedByMonths.length - 1; i >= 0; i--) {
        totalsGroupedByMonths[i].date = format(parseISO(totalsGroupedByMonths[i].date), `MMM '\n' yyyy`, { locale: ptBR });
      };
      /**
       * All Totals Grouped By Months - End
       */


      /**
       * All Totals Grouped By Years - Start
       */
      let totalsGroupedByYears: any = [];
      for (const item of data) {
        // Format the date to "yyyy", easier to sort the array
        const y = format(item.created_at, `yyyy`, { locale: ptBR });
        // Create the objects
        if (!totalsGroupedByYears.hasOwnProperty(y)) {
          totalsGroupedByYears[y] = { date: y, totalRevenuesByPeriod: 0, totalExpensesByPeriod: 0 };
        }
        if (item.type === 'credit') {
          totalsGroupedByYears[y].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'debit') {
          totalsGroupedByYears[y].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByYears = Object.values(totalsGroupedByYears)
        .sort((a: any, b: any) => {
          const firstDateParsed = parse(a.date, 'yyyy', new Date());
          const secondDateParsed = parse(b.date, 'yyyy', new Date());
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        });
      /**
       * All Totals Grouped By Years - End
       */


      /**
       * All Totals Grouped By All History - Start
       */
      let totalsGroupedByAllHistory: any = [];
      for (const item of data) {
        // Format the date to "Todo o \n histórico"
        item.created_at = `Todo o \n histórico`;
        const allHistory = item.created_at;
        // Create the objects
        if (!totalsGroupedByAllHistory.hasOwnProperty(allHistory)) {
          totalsGroupedByAllHistory[allHistory] = { date: allHistory, totalRevenuesByPeriod: 0, totalExpensesByPeriod: 0 };
        }
        if (item.type === 'credit') {
          totalsGroupedByAllHistory[allHistory].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'debit') {
          totalsGroupedByAllHistory[allHistory].totalExpensesByPeriod += item.amount;
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
          setTransactionsFormattedBySelectedPeriod(transactionsByMonthsFormattedPtbr);
          break;
        case 'years':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByYears);
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByYears);
          setTransactionsFormattedBySelectedPeriod(transactionsByYearsFormattedPtbr);
          break;
        case 'all':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByAllHistory);
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByAllHistory);
          setTransactionsFormattedBySelectedPeriod(transactionsFormattedPtbrGroupedByDate);
          break;
      }
      /**
       * Set Transactions and Totals by Selected Period  - End
       */

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleOpenPeriodSelectedModal() {
    setPeriodSelectedModalOpen(true);
  };

  function handleClosePeriodSelectedModal() {
    setPeriodSelectedModalOpen(false);
  };

  function handleOpenRegisterTransactionModal() {
    setRegisterTransactionModalOpen(true);
  };

  function handleCloseRegisterTransactionModal() {
    fetchTransactions();
    setRegisterTransactionModalOpen(false);
  };

  function handleOpenTransaction(id: string) {
    setTransactionId(id);
    setRegisterTransactionModalOpen(true);
  };

  function handleDateChange(action: 'next' | 'prev'): void {
    switch (chartPeriodSelected.period) {
      case 'months':
        if (action === 'next') {
          setSelectedPeriod(addMonths(selectedPeriod, 1));
        } else {
          setSelectedPeriod(subMonths(selectedPeriod, 1));
        }
        break;
      case 'years':
        if (action === 'next') {
          setSelectedPeriod(addYears(selectedPeriod, 1));
        } else {
          setSelectedPeriod(subYears(selectedPeriod, 1));
        }
        break;
      default: 'months'
        break;
    }

  };

  function ClearTransactionId() {
    setTransactionId('');
  };

  function handleHideData() {
    visible ? setVisible(false) : setVisible(true);
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    })
  }, []);

  useFocusEffect(useCallback(() => {
    fetchBtcQuote();
    fetchEurQuote();
    fetchUsdQuote();
    fetchTransactions();
  }, [chartPeriodSelected.period]));


  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Animated.View style={[headerStyleAnimation, styles.header]}>
        <Header>
          <CashFlowContainer>
            <CashFlowTotal>{visible ? cashFlowTotalBySelectedPeriod : "•••••"}</CashFlowTotal>
            <CashFlowDescription>Fluxo de Caixa</CashFlowDescription>
          </CashFlowContainer>

          <HideDataButton onPress={() => handleHideData()}>
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.primary}
            />
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

        <Animated.View style={chartStyleAnimation}>
          <VictoryChart
            width={420}
            height={210}
            minDomain={{ y: 0 }}
            padding={{ top: 10, right: 40, bottom: 130, left: 40 }}
            domainPadding={{ x: 6, y: 6 }}
            containerComponent={
              <VictoryZoomContainer
                allowZoom={false}
                zoomDomain={{ x: [6, 12] }}
              />
            }
            theme={smartFinancesChartTheme}
          >
            <VictoryGroup
              offset={12}
            >
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
                    fill: theme.colors.success_light
                  }
                }}
                cornerRadius={{ top: 2, bottom: 2 }}
                animate={{
                  onLoad: { duration: 1500 },
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
                    fill: theme.colors.attention_light
                  }
                }}
                cornerRadius={{ top: 2, bottom: 2 }}
                animate={{
                  onLoad: { duration: 1500 },
                  easing: 'backOut'
                }}
              />
            </VictoryGroup>
          </VictoryChart>
        </Animated.View>
      </Animated.View>

      <Transactions>
        <AnimatedSectionList
          sections={transactionsFormattedBySelectedPeriod}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <TransactionListItem
              data={item}
              onPress={() => handleOpenTransaction(item.id)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <SectionListHeader
              data={section}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyContainer>
              <ListEmptyText>
                Nenhuma transação no período selecionado. Adicione transações para visualizá-las aqui.
              </ListEmptyText>
            </ListEmptyContainer>
          )}
          initialNumToRender={60}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: getBottomSpace()
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={32}
        />
      </Transactions>

      <PanGestureHandler onGestureEvent={OnGestureEvent}>
        <Animated.View
          style={[
            registerTransactionButtonStyle,
            {
              position: 'absolute',
              bottom: 22,
              right: 22
            }
          ]}
        >
          <ButtonAnimated onPress={handleOpenRegisterTransactionModal} style={styles.animatedButton}>
            <Ionicons name='add-outline' size={32} color={theme.colors.background} />
          </ButtonAnimated>
        </Animated.View>
      </PanGestureHandler>

      <ModalViewSelection
        visible={periodSelectedModalOpen}
        closeModal={handleClosePeriodSelectedModal}
        title='Selecione o período'
      >
        <ChartPeriodSelect
          period={chartPeriodSelected}
          setPeriod={setChartPeriodSelected}
          closeSelectPeriod={handleClosePeriodSelectedModal}
        />
      </ModalViewSelection>

      <ModalViewRegisterTransaction
        visible={registerTransactionModalOpen}
        closeModal={handleCloseRegisterTransactionModal}
      >
        <RegisterTransaction
          id={transactionId}
          setId={ClearTransactionId}
          closeRegisterTransaction={handleCloseRegisterTransactionModal}
        />
      </ModalViewRegisterTransaction>
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
    zIndex: 1
  },
  animatedButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 30
  }
});