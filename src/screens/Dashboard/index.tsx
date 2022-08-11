import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  Header,
  CashFlowGroup,
  CashFlowTotal,
  CashFlowDescription,
  Chart,
  MonthSelect,
  FilterButtonGroup,
  Transactions,
  TransactionList,
} from './styles'

import {
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryTheme
} from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addMonths, subMonths } from 'date-fns';

import { TransactionListItem, TransactionProps } from '@components/TransactionListItem';
import { FilterButton } from '@components/FilterButton';
import { Load } from '@components/Load';

import {
  setBtcQuoteBrl,
  selectBtcQuoteBrl,
  setEurQuoteBrl,
  selectEurQuoteBrl,
  setUsdQuoteBrl,
  selectUsdQuoteBrl
} from '@slices/quotesBrlSlice';

import {
  selectUserTenantId
} from '@slices/userSlice';

import apiQuotes from '@api/apiQuotes';
import api from '@api/api';

type PeriodData = {
  date: Date | number;
  totalRevenuesByPeriod: number;
  totalExpensesByPeriod: number;
}

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const dispatch = useDispatch();
  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);
  const eurQuoteBrl = useSelector(selectEurQuoteBrl);
  const usdQuoteBrl = useSelector(selectUsdQuoteBrl);
  const [transactionsFormatted, setTransactionsFormatted] = useState<TransactionProps>();
  const [totalAmountsByMonth, setTotalAmountsByMonth] = useState<PeriodData[]>([
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
  /*const [totalAmountsByYear, setTotalAmountsByYear] = useState<PeriodData[]>([
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
  ]);*/
  const [selectedDate, setSelectedDate] = useState(new Date());
  //const [transactionsFormattedBySelectedDate, setTransactionsFormattedBySelectedDate] = useState<TransactionProps[]>([]);
  const [cashFlowTotal, setCashFlowTotal] = useState('');
  //const [cashFlowTotalBySelectedDate, setCashFlowTotalBySelectedDate] = useState('');

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
       * All Transactions and Totals Formatted in PT-br - Start
      **/
      let amount = 'R$0';
      let amountConvertedBRL = 0;
      let amountConvertedBRLFormatted = 'R$0';
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      const transactionsFormattedPtbr: TransactionProps = data
        .map((transactionPtbr: TransactionProps) => {
          //Insert switch for verify currency and formatted amount for this currency. If currency is BTC, convert value to BTC using converting API.
          switch (transactionPtbr.account.currency) {
            case 'BRL - Real Brasileiro':
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC - Bitcoin':
              amountConvertedBRL = Number(transactionPtbr.amount) * btcQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
              break;
            case 'EUR - Euro':
              amountConvertedBRL = Number(transactionPtbr.amount) * eurQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'EUR'
                });
              break;
            case 'USD - Dólar Americano':
              amountConvertedBRL = Number(transactionPtbr.amount) * usdQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                });
              break;
            default: 'BRL - Real Brasileiro'
              break;
          }

          switch (transactionPtbr.type) {
            case 'income':
              if (transactionPtbr.account.currency != 'BRL - Real Brasileiro') {
                totalRevenuesBRL += amountConvertedBRL
              } else {
                totalRevenuesBRL += Number(transactionPtbr.amount)
              }
              break;
            case 'outcome':
              if (transactionPtbr.account.currency != 'BRL - Real Brasileiro') {
                totalExpensesBRL += amountConvertedBRL
              } else {
                totalExpensesBRL += Number(transactionPtbr.amount)
              }
              break;
            default: 'income';
              break;
          }

          const dateTransactionPtbr = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionPtbr.created_at));

          return {
            id: transactionPtbr.id,
            created_at: dateTransactionPtbr,
            description: transactionPtbr.description,
            amount,
            amountConvertedBRLFormatted,
            type: transactionPtbr.type,
            account: {
              id: transactionPtbr.account?.id,
              name: transactionPtbr.account?.name,
              currency: transactionPtbr.account?.currency,
              simbol: transactionPtbr.account?.simbol,
              initial_amount: transactionPtbr.account?.initial_amount,
              tenant_id: transactionPtbr.account?.tenant_id
            },
            category: {
              id: transactionPtbr.category?.id,
              name: transactionPtbr.category?.name,
              icon: {
                id: transactionPtbr.category?.icon.id,
                title: transactionPtbr.category?.icon.title,
                name: transactionPtbr.category?.icon.name,
              },
              color: {
                id: transactionPtbr.category.color.id,
                name: transactionPtbr.category.color.name,
                hex: transactionPtbr.category.color.hex,
              },
              tenant_id: transactionPtbr.category?.tenant_id
            },
            tenant_id: transactionPtbr.tenant_id
          }
        });

      let initialTotalAmount = 0;

      const totalBRL = initialTotalAmount + totalRevenuesBRL - totalExpensesBRL;
      const totalFormattedBRL = Number(totalBRL).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      setTransactionsFormatted(transactionsFormattedPtbr);
      setCashFlowTotal(totalFormattedBRL);
      /**
       * All Transactions and Totals Formatted in PT-br - End
      **/


      /**
        * All Totals By Months - Start
      **/
      let totalRevenuesByPeriod = 0;
      let totalExpensesByPeriod = 0;

      const transactionsByMonths = data
        .map((transactionByMonth: TransactionProps) => {
          switch (transactionByMonth.account.currency) {
            case 'BRL - Real Brasileiro':
              amount = Number(transactionByMonth.amount);
              break;
            case 'BTC - Bitcoin':
              amount = Number(transactionByMonth.amount) * btcQuoteBrl.price;
              break;
            case 'EUR - Euro':
              amount = Number(transactionByMonth.amount) * eurQuoteBrl.price;
              break;
            case 'USD - Dólar Americano':
              amount = Number(transactionByMonth.amount) * usdQuoteBrl.price;
              break;
            default: 'BRL - Real Brasileiro'
              break;
          }

          const dateTransactionByMonth = Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
          }).format(new Date(transactionByMonth.created_at));

          return {
            date: dateTransactionByMonth,
            type: transactionByMonth.type,
            amount,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0
          }
        });

      const transactionsByYears = data
        .map((transactionByYear: TransactionProps) => {
          const dateTransactionByYear = Intl.DateTimeFormat('pt-BR', {
            year: 'numeric'
          }).format(new Date(transactionByYear.created_at));

          return {
            date: dateTransactionByYear,
            type: transactionByYear.type,
            amount: transactionByYear.amount,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0
          }
        });


      const totalsByMonths = transactionsByMonths
        .reduce((acc: any, current: any) => {
          if (!acc[current.date]) {
            acc[current.date] = {
              ...current
            }
          }

          switch (current.type) {
            case 'income':
              acc[current.date].totalRevenuesByPeriod += Number(current.amount)
              break;
            case 'outcome':
              acc[current.date].totalExpensesByPeriod += Number(current.amount)
              break;
          }

          return acc
        }, [])

      const newList: any = Object.values(totalsByMonths);

      setTotalAmountsByMonth(newList);
      /**
       * All Totals By Months - End
      **/


      /**
       * Transactions By Selected Date Formatted in BRL - Start
      **/
      /*const transactionsBySelectedDate = data
        .filter((transaction: TransactionProps) =>
          transaction.account?.currency === 'BRL' &&
          new Date(transaction.created_at).getMonth() === selectedDate.getMonth() &&
          new Date(transaction.created_at).getFullYear() === selectedDate.getFullYear()
        );

      let totalRevenuesBRLBySelectedDate = 0;
      let totalExpensesBRLBySelectedDate = 0;

      const transactionsBySelectedDateFormattedPtbr = transactionsBySelectedDate
        .map((transactionPtbrBySelectedDate: TransactionProps) => {
          switch (transactionPtbrBySelectedDate.account.currency) {
            case 'BRL':
              amount = Number(transactionPtbrBySelectedDate.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC':
              amountConvertedBRL = Number(transactionPtbrBySelectedDate.amount) * bitcoinQuoteBRL.quote.BRL.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
              amount = Number(transactionPtbrBySelectedDate.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
            default: 'BRL'
              break;
          }

          switch (transactionPtbrBySelectedDate.type) {
            case 'income':
              if (transactionPtbrBySelectedDate.account.currency != 'BRL') {
                totalRevenuesBRL += amountConvertedBRL
              } else {
                totalRevenuesBRL += Number(transactionPtbrBySelectedDate.amount);
              }
              break;
            case 'outcome':
              if (transactionPtbrBySelectedDate.account.currency != 'BRL') {
                totalExpensesBRL += amountConvertedBRL
              } else {
                totalExpensesBRL += Number(transactionPtbrBySelectedDate.amount);
              }
              break;
            default: 'income';
              break;
          }

          const dateTransaction = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBRLBySelectedDate.created_at));

          return {
            id: transactionBRLBySelectedDate.id,
            created_at: dateTransaction,
            description: transactionBRLBySelectedDate.description,
            amount,
            amountConvertedBRLFormatted,
            type: transactionBRLBySelectedDate.type,
            account: {
              id: transactionBRLBySelectedDate.account?.id,
              name: transactionBRLBySelectedDate.account?.name,
              currency: transactionBRLBySelectedDate.account?.currency,
              simbol: transactionBRLBySelectedDate.account?.simbol,
              initial_amount: transactionBRLBySelectedDate.account?.initial_amount,
              tenant_id: transactionBRLBySelectedDate.account?.tenant_id
            },
            category: {
              id: transactionBRLBySelectedDate.category?.id,
              name: transactionBRLBySelectedDate.category?.name,
              icon: {
                id: transactionBRLBySelectedDate.category?.icon.id,
                title: transactionBRLBySelectedDate.category?.icon.title,
                name: transactionBRLBySelectedDate.category?.icon.name,
              },
              color: {
                id: transactionBRLBySelectedDate.category.color.id,
                name: transactionBRLBySelectedDate.category.color.name,
                hex: transactionBRLBySelectedDate.category.color.hex,
              },
              tenant_id: transactionBRLBySelectedDate.category?.tenant_id
            },
            tenant_id: transactionBRLBySelectedDate.tenant_id
          }
        });

      const totalBRLBySelectedDate = totalRevenuesBRLBySelectedDate - totalExpensesBRLBySelectedDate;
      const totalBySelectedDateFormattedBRL = Number(totalBRLBySelectedDate).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })

      setTransactionsFormattedBySelectedDate(transactionsBySelectedDateFormattedBrl);
      setCashFlowTotalBySelectedDate(totalBySelectedDateFormattedBRL);*/
      /**
       * Transactions By Selected Date Formatted in BRL - End
      **/

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleDateChange(action: 'next' | 'prev'): void {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  async function handleTransactionSwipeLeft(id: string) {
    Alert.alert("Exclusão de transação", "Tem certeza que deseja excluir a transação?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a transação.", onPress: () => handleDeleteTransaction(id) }])
  };

  async function handleDeleteTransaction(id: string) {
    try {
      await api.delete('delete_transaction', {
        params: {
          transaction_id: id
        }
      });
      fetchTransactions();
      Alert.alert("Exclusão de transação", "Transação excluída com sucesso!")
    } catch (error) {
      Alert.alert("Exclusão de transação", `${error}`)
    }
  };

  useFocusEffect(useCallback(() => {
    fetchBtcQuote();
    fetchEurQuote();
    fetchUsdQuote();
    fetchTransactions();
  }, []));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header>
        <CashFlowGroup>
          <CashFlowTotal>{cashFlowTotal}</CashFlowTotal>
          <CashFlowDescription> Fluxo de Caixa</CashFlowDescription>
        </CashFlowGroup>
      </Header>

      <Chart>
        <MonthSelect>
          <FilterButtonGroup>
            <FilterButton
              title='Por meses'
            />
          </FilterButtonGroup>
        </MonthSelect>

        <VictoryChart
          theme={VictoryTheme.material}
          width={400} height={220}
          maxDomain={{ x: 6 }}
          domainPadding={{ x: 7 }}
        >
          <VictoryGroup
            offset={12}
          >
            <VictoryBar
              data={totalAmountsByMonth}
              x='date'
              y='totalRevenuesByPeriod'
              sortKey="x"
              sortOrder="descending"
              alignment='start'
              style={{
                data: {
                  width: 10,
                  fill: 'seagreen'
                }
              }}
              cornerRadius={{ top: 2, bottom: 2 }}
              animate={{
                duration: 2500,
                onLoad: { duration: 2500 },
                easing: 'backOut'
              }}
            />
            <VictoryBar
              data={totalAmountsByMonth}
              x='date'
              y='totalExpensesByPeriod'
              sortOrder="descending"
              alignment='start'
              style={{
                data: {
                  width: 10,
                  fill: 'tomato'
                }
              }}
              cornerRadius={{ top: 2, bottom: 2 }}
              animate={{
                duration: 2000,
                onLoad: { duration: 2500 },
                easing: 'backOut'
              }}
            />
          </VictoryGroup>
        </VictoryChart>
      </Chart>

      <Transactions>
        <TransactionList
          data={transactionsFormatted}
          keyExtractor={(item: TransactionProps) => item.id}
          renderItem={({ item }: any) => (
            <TransactionListItem
              data={item}
              onSwipeableLeftOpen={() => handleTransactionSwipeLeft(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />
          }
        />
      </Transactions>
    </Container>
  )
}