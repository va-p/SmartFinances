import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, BackHandler } from 'react-native';
import {
  Container,
  Header,
  CashFlowTotal,
  CashFlowDescription,
  FiltersContainer,
  FilterButtonGroup,
  Transactions
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
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryTheme
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
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ptBR } from 'date-fns/locale';

import {
  TransactionListItem,
  TransactionProps
} from '@components/TransactionListItem';
import { ModalViewRegisterTransaction } from '@components/ModalViewRegisterTransaction';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ChartSelectButton } from '@components/ChartSelectButton';
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
  const [transactionsFormattedBySelectedPeriod, setTransactionsFormattedBySelectedPeriod] = useState<TransactionProps[]>([]);
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

  //Animated header and chart
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 210],
        [210, 0],
        Extrapolate.CLAMP
      )
    }
  });
  const sliderChartStyleAnimation = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 160],
        [1, 0],
        Extrapolate.CLAMP
      )
    }
  });
  //Animated button register transaction
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
        const dmy = format(item.created_at, 'dd/MM/yyyy', { locale: ptBR });
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
        // Sum revenues and expenses
        if (item.type === 'income') {
          totalRevenues += item.amount;
        } else if (item.type === 'outcome') {
          totalExpenses += item.amount;
        }
      };
      transactionsFormattedPtbr = Object.values(transactionsFormattedPtbr);
      console.log(transactionsFormattedPtbr);

      const total =
        totalRevenues -
        totalExpenses;
      const totalFormattedPtbrByAllHistory = Number(total)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      /**
       * All Transactions Formatted in pt-BR - End
       */


      /**
       * Transactions By Months Formatted in pt-BR - Start
       */
      let totalRevenuesByMonths = 0;
      let totalExpensesByMonths = 0;

      const transactionsByMonthsFormattedPtbr = transactionsFormattedPtbr
        .filter((transactionByMonthsPtBr: TransactionProps) =>
          parse(transactionByMonthsPtBr.created_at, 'dd/MM/yyyy', new Date()).getMonth() === selectedPeriod.getMonth() &&
          parse(transactionByMonthsPtBr.created_at, 'dd/MM/yyyy', new Date()).getFullYear() === selectedPeriod.getFullYear()
        );

      // Sum revenues and expenses
      for (const item of transactionsByMonthsFormattedPtbr) {
        if (item.type === 'income') {
          totalRevenuesByMonths += item.amount;
        } else if (item.type === 'outcome') {
          totalExpensesByMonths += item.amount;
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
      let totalRevenuesByYears = 0;
      let totalExpensesByYears = 0;

      const transactionsByYearsFormattedPtbr = transactionsFormattedPtbr
        .filter((transactionByYearsPtBr: TransactionProps) =>
          parse(transactionByYearsPtBr.created_at, 'dd/MM/yyyy', new Date()).getFullYear() === selectedPeriod.getFullYear()
        );

      // Sum revenues and expenses
      for (const item of transactionsByYearsFormattedPtbr) {
        if (item.type === 'income') {
          totalRevenuesByYears += item.amount;
        } else if (item.type === 'outcome') {
          totalExpensesByYears += item.amount;
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
        if (item.type === 'income') {
          totalsGroupedByMonths[ym].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'outcome') {
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
        if (item.type === 'income') {
          totalsGroupedByYears[y].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'outcome') {
          totalsGroupedByYears[y].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByYears = Object.values(totalsGroupedByYears);
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
        if (item.type === 'income') {
          totalsGroupedByAllHistory[allHistory].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'outcome') {
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
          setTransactionsFormattedBySelectedPeriod(transactionsFormattedPtbr);
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
          <CashFlowTotal>{cashFlowTotalBySelectedPeriod}</CashFlowTotal>
          <CashFlowDescription>Fluxo de Caixa</CashFlowDescription>
        </Header>

        <FiltersContainer>
          <FilterButtonGroup>
            <ChartSelectButton
              title={`Por ${chartPeriodSelected.name}`}
              onPress={handleOpenPeriodSelectedModal}
            />
          </FilterButtonGroup>
        </FiltersContainer>

        <Animated.View style={sliderChartStyleAnimation}>
          <VictoryChart
            theme={VictoryTheme.material}
            padding={{ top: 10, right: 50, bottom: 130, left: 50 }}
            width={420} height={210}
            maxDomain={{ x: 6 }}
            domainPadding={{ x: 7 }}
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
        <Animated.FlatList
          data={transactionsFormattedBySelectedPeriod}
          keyExtractor={(item: TransactionProps) => item.id}
          renderItem={({ item }: any) => (
            <TransactionListItem
              data={item}
              onPress={() => handleOpenTransaction(item.id)}
            />
          )}
          initialNumToRender={200}
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
          closeRegisterTransaction={handleCloseRegisterTransactionModal}
          id={transactionId}
          setId={ClearTransactionId}
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
    backgroundColor: theme.colors.secondary,
    borderRadius: 30
  }
})