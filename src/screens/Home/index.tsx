import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  Header,
  CashFlowTotal,
  CashFlowDescription,
  ChartContainer,
  FiltersContainer,
  FilterButtonGroup,
  Transactions,
  RegisterTransactionButton
} from './styles'

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import {
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryTheme
} from 'victory-native';
import { addMonths, addYears, subMonths, subYears, format } from 'date-fns';
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
  selectBtcQuoteBrl,
  setEurQuoteBrl,
  selectEurQuoteBrl,
  setUsdQuoteBrl,
  selectUsdQuoteBrl
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
  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);
  const eurQuoteBrl = useSelector(selectEurQuoteBrl);
  const usdQuoteBrl = useSelector(selectUsdQuoteBrl);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
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
  const selectedPeriodFormatted = format(
    selectedPeriod, `MMM '\n' yyyy`, { locale: ptBR }
  );
  const [cashFlowTotalBySelectedPeriod, setCashFlowTotalBySelectedPeriod] = useState('');
  const [registerTransactionModalOpen, setRegisterTransactionModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
    console.log(event.contentOffset.y);
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 200],
        [200, 70],
        Extrapolate.CLAMP
      ),
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
        setTransactions(data);
        setRefreshing(false);
      }

      /**
       * All Transactions Formatted in pt-BR - Start
       */
      let amount: any;
      let amountNotConvertedFormatted = '';
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      const transactionsFormattedPtbr = data
        .map((transactionPtbr: TransactionProps) => {
          switch (transactionPtbr.account.currency.code) {
            case 'BRL':
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC':
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
              break;
            case 'EUR':
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'EUR'
                });
              break;
            case 'USD':
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                });
              break;
            default: 'BRL'
              break;
          }

          if (transactionPtbr.amount_not_converted && transactionPtbr.currency.code === 'BRL') {
            amountNotConvertedFormatted = Number(transactionPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
          }
          if (transactionPtbr.amount_not_converted && transactionPtbr.currency.code === 'BTC') {
            amountNotConvertedFormatted = Number(transactionPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BTC',
                minimumFractionDigits: 8,
                maximumSignificantDigits: 8
              });
          }
          if (transactionPtbr.amount_not_converted && transactionPtbr.currency.code === 'EUR') {
            amountNotConvertedFormatted = Number(transactionPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
              });
          }
          if (transactionPtbr.amount_not_converted && transactionPtbr.currency.code === 'USD') {
            amountNotConvertedFormatted = Number(transactionPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'USD'
              });
          }

          switch (transactionPtbr.type) {
            case 'income':
              totalRevenuesBRL += Number(transactionPtbr.amount)
              break;
            case 'outcome':
              totalExpensesBRL += Number(transactionPtbr.amount)
              break;
            default: 'income';
              break;
          }

          const dateTransactionPtbr = format(
            transactionPtbr.created_at, 'dd/MM/yyyy', { locale: ptBR }
          );

          return {
            id: transactionPtbr.id,
            created_at: dateTransactionPtbr,
            description: transactionPtbr.description,
            amount,
            amount_not_converted: amountNotConvertedFormatted,
            currency: {
              id: transactionPtbr.currency.id,
              name: transactionPtbr.currency.name,
              code: transactionPtbr.currency.code,
              symbol: transactionPtbr.currency.symbol
            },
            type: transactionPtbr.type,
            account: {
              id: transactionPtbr.account.id,
              name: transactionPtbr.account.name,
              currency: {
                id: transactionPtbr.account.currency.id,
                name: transactionPtbr.account.currency.name,
                code: transactionPtbr.account.currency.code,
                symbol: transactionPtbr.account.currency.symbol
              },
              initial_amount: transactionPtbr.account.initial_amount,
              totalAccountAmount: 0,
              tenant_id: transactionPtbr.account.tenant_id
            },
            category: {
              id: transactionPtbr.category.id,
              name: transactionPtbr.category.name,
              icon: {
                id: transactionPtbr.category.icon.id,
                title: transactionPtbr.category.icon.title,
                name: transactionPtbr.category.icon.name,
              },
              color: {
                id: transactionPtbr.category.color.id,
                name: transactionPtbr.category.color.name,
                hex: transactionPtbr.category.color.hex,
              },
              tenant_id: transactionPtbr.category.tenant_id
            },
            tenant_id: transactionPtbr.tenant_id
          }
        });

      const totalBRL =
        totalRevenuesBRL -
        totalExpensesBRL;
      const totalFormattedPtbr = Number(totalBRL)
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
      //let initialTotalAmountBRLByMonths = 0;
      let totalRevenuesBRLByMonths = 0;
      let totalExpensesBRLByMonths = 0;

      const transactionsByMonths = transactions
        .filter((transactionByMonthsPtBr: TransactionProps) =>
          new Date(transactionByMonthsPtBr.created_at).getMonth() === selectedPeriod.getMonth() &&
          new Date(transactionByMonthsPtBr.created_at).getFullYear() === selectedPeriod.getFullYear()
        );

      var transactionsByMonthsFormattedPtbr = transactionsByMonths
        .map((transactionByMonthsPtbr: TransactionProps) => {
          switch (transactionByMonthsPtbr.account.currency.code) {
            case 'BRL':
              amount = Number(transactionByMonthsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC':
              amount = Number(transactionByMonthsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
              break;
            case 'EUR':
              amount = Number(transactionByMonthsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'EUR'
                });
              break;
            case 'USD':
              amount = Number(transactionByMonthsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                });
              break;
            default: 'BRL'
              break;
          }

          if (transactionByMonthsPtbr.amount_not_converted && transactionByMonthsPtbr.currency.code === 'BRL') {
            amountNotConvertedFormatted = Number(transactionByMonthsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
          }
          if (transactionByMonthsPtbr.amount_not_converted && transactionByMonthsPtbr.currency.code === 'BTC') {
            amountNotConvertedFormatted = Number(transactionByMonthsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BTC',
                minimumFractionDigits: 8,
                maximumSignificantDigits: 8
              });
          }
          if (transactionByMonthsPtbr.amount_not_converted && transactionByMonthsPtbr.currency.code === 'EUR') {
            amountNotConvertedFormatted = Number(transactionByMonthsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
              });
          }
          if (transactionByMonthsPtbr.amount_not_converted && transactionByMonthsPtbr.currency.code === 'USD') {
            amountNotConvertedFormatted = Number(transactionByMonthsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'USD'
              });
          }

          switch (transactionByMonthsPtbr.type) {
            case 'income':
              totalRevenuesBRLByMonths += Number(transactionByMonthsPtbr.amount)
              break;
            case 'outcome':
              totalExpensesBRLByMonths += Number(transactionByMonthsPtbr.amount)
              break;
            default: 'income';
              break;
          }

          const dateTransactionPtbr = format(
            transactionByMonthsPtbr.created_at, 'dd/MM/yyyy', { locale: ptBR }
          );

          return {
            id: transactionByMonthsPtbr.id,
            created_at: dateTransactionPtbr,
            description: transactionByMonthsPtbr.description,
            amount,
            amount_not_converted: amountNotConvertedFormatted,
            currency: {
              id: transactionByMonthsPtbr.currency.id,
              name: transactionByMonthsPtbr.currency.name,
              code: transactionByMonthsPtbr.currency.code,
              symbol: transactionByMonthsPtbr.currency.symbol
            },
            type: transactionByMonthsPtbr.type,
            account: {
              id: transactionByMonthsPtbr.account.id,
              name: transactionByMonthsPtbr.account.name,
              currency: {
                id: transactionByMonthsPtbr.account.currency.id,
                name: transactionByMonthsPtbr.account.currency.name,
                code: transactionByMonthsPtbr.account.currency.code,
                symbol: transactionByMonthsPtbr.account.currency.symbol
              },
              initial_amount: transactionByMonthsPtbr.account.initial_amount,
              tenant_id: transactionByMonthsPtbr.account.tenant_id
            },
            category: {
              id: transactionByMonthsPtbr.category.id,
              name: transactionByMonthsPtbr.category.name,
              icon: {
                id: transactionByMonthsPtbr.category.icon.id,
                title: transactionByMonthsPtbr.category.icon.title,
                name: transactionByMonthsPtbr.category.icon.name,
              },
              color: {
                id: transactionByMonthsPtbr.category.color.id,
                name: transactionByMonthsPtbr.category.color.name,
                hex: transactionByMonthsPtbr.category.color.hex,
              },
              tenant_id: transactionByMonthsPtbr.category.tenant_id
            },
            tenant_id: transactionByMonthsPtbr.tenant_id
          }
        });

      const totalBRLByMonths =
        //initialTotalAmountBRLByMonths +
        totalRevenuesBRLByMonths -
        totalExpensesBRLByMonths;
      const totalFormattedPtbrByMonths = Number(totalBRLByMonths)
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
      //let initialTotalAmountBRLByYears = 0;
      let totalRevenuesBRLByYears = 0;
      let totalExpensesBRLByYears = 0;

      const transactionsByYears = transactions
        .filter((transactionByYearsPtBr: TransactionProps) =>
          new Date(transactionByYearsPtBr.created_at).getFullYear() === selectedPeriod.getFullYear()
        );

      const transactionsByYearsFormattedPtbr = transactionsByYears
        .map((transactionByYearsPtbr: TransactionProps) => {
          switch (transactionByYearsPtbr.account.currency.code) {
            case 'BRL':
              amount = Number(transactionByYearsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC':
              amount = Number(transactionByYearsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
              break;
            case 'EUR':
              amount = Number(transactionByYearsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'EUR'
                });
              break;
            case 'USD':
              amount = Number(transactionByYearsPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                });
              break;
            default: 'BRL'
              break;
          }

          if (transactionByYearsPtbr.amount_not_converted && transactionByYearsPtbr.currency.code === 'BRL') {
            amountNotConvertedFormatted = Number(transactionByYearsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
          }
          if (transactionByYearsPtbr.amount_not_converted && transactionByYearsPtbr.currency.code === 'BTC') {
            amountNotConvertedFormatted = Number(transactionByYearsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BTC',
                minimumFractionDigits: 8,
                maximumSignificantDigits: 8
              });
          }
          if (transactionByYearsPtbr.amount_not_converted && transactionByYearsPtbr.currency.code === 'EUR') {
            amountNotConvertedFormatted = Number(transactionByYearsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
              });
          }
          if (transactionByYearsPtbr.amount_not_converted && transactionByYearsPtbr.currency.code === 'USD') {
            amountNotConvertedFormatted = Number(transactionByYearsPtbr.amount_not_converted)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'USD'
              });
          }

          switch (transactionByYearsPtbr.type) {
            case 'income':
              totalRevenuesBRLByYears += Number(transactionByYearsPtbr.amount)
              break;
            case 'outcome':
              totalExpensesBRLByYears += Number(transactionByYearsPtbr.amount)
              break;
            default: 'income';
              break;
          }

          const dateTransactionPtbr = format(
            transactionByYearsPtbr.created_at, 'dd/MM/yyyy', { locale: ptBR }
          );

          return {
            id: transactionByYearsPtbr.id,
            created_at: dateTransactionPtbr,
            description: transactionByYearsPtbr.description,
            amount,
            amount_not_converted: amountNotConvertedFormatted,
            currency: {
              id: transactionByYearsPtbr.currency.id,
              name: transactionByYearsPtbr.currency.name,
              code: transactionByYearsPtbr.currency.code,
              symbol: transactionByYearsPtbr.currency.symbol
            },
            type: transactionByYearsPtbr.type,
            account: {
              id: transactionByYearsPtbr.account.id,
              name: transactionByYearsPtbr.account.name,
              currency: {
                id: transactionByYearsPtbr.account.currency.id,
                name: transactionByYearsPtbr.account.currency.name,
                code: transactionByYearsPtbr.account.currency.code,
                symbol: transactionByYearsPtbr.account.currency.symbol
              },
              initial_amount: transactionByYearsPtbr.account.initial_amount,
              tenant_id: transactionByYearsPtbr.account.tenant_id
            },
            category: {
              id: transactionByYearsPtbr.category.id,
              name: transactionByYearsPtbr.category.name,
              icon: {
                id: transactionByYearsPtbr.category.icon.id,
                title: transactionByYearsPtbr.category.icon.title,
                name: transactionByYearsPtbr.category.icon.name,
              },
              color: {
                id: transactionByYearsPtbr.category.color.id,
                name: transactionByYearsPtbr.category.color.name,
                hex: transactionByYearsPtbr.category.color.hex,
              },
              tenant_id: transactionByYearsPtbr.category.tenant_id
            },
            tenant_id: transactionByYearsPtbr.tenant_id
          }
        });

      const totalBRLByYears =
        //initialTotalAmountBRLByYears +
        totalRevenuesBRLByYears -
        totalExpensesBRLByYears;
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
      const transactionsGroupedByMonths = data
        .map((transactionByMonth: TransactionProps) => {
          switch (transactionByMonth.account.currency.code) {
            case 'BRL':
              amount = Number(transactionByMonth.amount);
              break;
            case 'BTC':
              amount = Number(transactionByMonth.amount) * btcQuoteBrl.price;
              break;
            case 'EUR':
              amount = Number(transactionByMonth.amount) * eurQuoteBrl.price;
              break;
            case 'USD':
              amount = Number(transactionByMonth.amount) * usdQuoteBrl.price;
              break;
            default: 'BRL'
              break;
          }

          const dateTransactionByMonth = format(
            transactionByMonth.created_at, `MMM '\n' yyyy`, { locale: ptBR }
          );

          return {
            date: dateTransactionByMonth,
            type: transactionByMonth.type,
            amount,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0
          }
        });

      const totalsByMonths = transactionsGroupedByMonths
        .reduce((acc: any, current: any) => {
          if (!acc[current.date]) acc[current.date] = { ...current };

          switch (current.type) {
            case 'income':
              acc[current.date].totalRevenuesByPeriod += Number(current.amount)
              break;
            case 'outcome':
              acc[current.date].totalExpensesByPeriod += Number(current.amount)
              break;
          }

          return acc
        }, []);

      const totalsGroupedByMonths: any = Object.values(totalsByMonths);
      /**
       * All Totals Grouped By Months - End
       */


      /**
       * All Totals Grouped By Years - Start
       */
      const transactionsGroupedByYears = data
        .map((transactionByYear: TransactionProps) => {
          switch (transactionByYear.account.currency.code) {
            case 'BRL':
              amount = Number(transactionByYear.amount);
              break;
            case 'BTC':
              amount = Number(transactionByYear.amount) * btcQuoteBrl.price;
              break;
            case 'EUR':
              amount = Number(transactionByYear.amount) * eurQuoteBrl.price;
              break;
            case 'USD':
              amount = Number(transactionByYear.amount) * usdQuoteBrl.price;
              break;
            default: 'BRL'
              break;
          }

          const dateTransactionByYear = format(
            transactionByYear.created_at, 'yyyy', { locale: ptBR }
          );

          return {
            date: dateTransactionByYear,
            type: transactionByYear.type,
            amount: transactionByYear.amount,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0
          }
        });

      const totalsByYears = transactionsGroupedByYears
        .reduce((acc: any, current: any) => {
          if (!acc[current.date]) acc[current.date] = { ...current };

          switch (current.type) {
            case 'income':
              acc[current.date].totalRevenuesByPeriod += Number(current.amount)
              break;
            case 'outcome':
              acc[current.date].totalExpensesByPeriod += Number(current.amount)
              break;
          }

          return acc
        }, []);

      const totalsGroupedByYears: any = Object.values(totalsByYears);
      /**
       * All Totals Grouped By Years - End
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
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbr);
          //setTotalAmountsGroupedBySelectedPeriod();
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
  }

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
  }

  useEffect(() => {
    fetchBtcQuote();
    fetchEurQuote();
    fetchUsdQuote();
    fetchTransactions();
  }, [chartPeriodSelected.period]);

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
      <Animated.View>
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

        <ChartContainer>
          <VictoryChart
            theme={VictoryTheme.material}
            width={400} height={180}
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
                sortKey="x"
                sortOrder="descending"
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
                sortOrder="descending"
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
        </ChartContainer>
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
          initialNumToRender={80}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />
          }
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: getBottomSpace()
          }}
        />
      </Transactions>

      <RegisterTransactionButton onPress={handleOpenRegisterTransactionModal}>
        <Ionicons name='add-outline' size={32} color={theme.colors.background} />
      </RegisterTransactionButton>

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