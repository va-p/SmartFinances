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
import { addMonths, subMonths } from 'date-fns';
import { useSelector } from 'react-redux';

import { TransactionListItem, TransactionProps } from '@components/TransactionListItem';
import { FilterButton } from '@components/FilterButton';
import { Load } from '@components/Load';

import {
  selectUserTenantId
} from '@slices/userSlice';

import api from '@api/api';

type MonthData = {
  date: Date | number;
  totalRevenuesByMonth: number;
  totalExpensesByMonth: number;
}

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  //const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [transactionsFormatted, setTransactionsFormatted] = useState<TransactionProps>();
  const [totalAmountsByMonth, setTotalAmountsByMonth] = useState<MonthData[]>([
    {
      date: 0,
      totalRevenuesByMonth: 0,
      totalExpensesByMonth: 0
    },
    {
      date: 1,
      totalRevenuesByMonth: 0,
      totalExpensesByMonth: 0
    }
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactionsFormattedBySelectedDate, setTransactionsFormattedBySelectedDate] = useState<TransactionProps[]>([]);
  const [cashFlowTotal, setCashFlowTotal] = useState('');
  const [cashFlowTotalBySelectedDate, setCashFlowTotalBySelectedDate] = useState('');

  function handleDateChange(action: 'next' | 'prev'): void {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  async function fetchTransactions() {
    setLoading(true);

    //await AsyncStorage.removeItem(COLLECTION_TRANSACTIONS);
    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      })
      if (!data) {
      } else {
        setRefreshing(false);
      }

      /**
       * All Transactions and Total Formatted in BRL - Start
      **/
      const transactionsBRL = data
        .filter((transaction: TransactionProps) =>
          transaction.account?.currency === 'BRL'
        );

      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      const transactionsFormattedBrl: TransactionProps = transactionsBRL
        .map((transactionBRL: TransactionProps) => {
          switch (transactionBRL.type) {
            case 'income':
              totalRevenuesBRL += Number(transactionBRL.amount);
              break;
            case 'outcome':
              totalExpensesBRL += Number(transactionBRL.amount);
              break;
            default: 'income';
              break;
          }

          const amount = Number(transactionBRL.amount)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });

          const dateTransactionBRL = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBRL.created_at));

          return {
            id: transactionBRL.id,
            created_at: dateTransactionBRL,
            description: transactionBRL.description,
            amount,
            totalExpensesBRL,
            type: transactionBRL.type,
            account: {
              id: transactionBRL.account?.id,
              name: transactionBRL.account?.name,
              currency: transactionBRL.account?.currency,
              simbol: transactionBRL.account?.simbol,
              initial_amount: transactionBRL.account?.initial_amount,
              tenant_id: transactionBRL.account?.tenant_id
            },
            category: {
              id: transactionBRL.category?.id,
              name: transactionBRL.category?.name,
              icon: {
                id: transactionBRL.category?.icon.id,
                title: transactionBRL.category?.icon.title,
                name: transactionBRL.category?.icon.name,
              },
              color: {
                id: transactionBRL.category.color.id,
                name: transactionBRL.category.color.name,
                hex: transactionBRL.category.color.hex,
              },
              tenant_id: transactionBRL.category?.tenant_id
            },
            tenant_id: transactionBRL.tenant_id
          }
        });

      let initialTotalAmount = 0;

      const totalBRL = initialTotalAmount + totalRevenuesBRL - totalExpensesBRL;
      const totalFormattedBRL = Number(totalBRL).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      setTransactionsFormatted(transactionsFormattedBrl);
      setCashFlowTotal(totalFormattedBRL);
      /**
       * All Transactions and Total Formatted in BRL - End
      **/


      /**
        * All Totals By Months - Start
      **/
      const transactionsByMonths: TransactionProps = transactionsBRL
        .map((transactionByMonth: TransactionProps) => {
          const dateTransactionByMonth = Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
          }).format(new Date(transactionByMonth.created_at));

          return {
            date: dateTransactionByMonth,
            type: transactionByMonth.type,
            amount: transactionByMonth.amount,
            totalRevenuesByMonth: 0,
            totalExpensesByMonth: 0
          }
        });

      // Agrupe
      const totalsByMonths = transactionsByMonths.reduce((acc: any, current: any) => {
        if (!acc[current.date]) {
          acc[current.date] = {
            ...current
          }
          return acc
        }

        //errado, tem que especificar current outcome e income
        //acc[current.date].amount = acc[current.date].amount + current.amount

        switch (current.type) {
          case 'income':
            acc[current.date].totalRevenuesByMonth = acc[current.date].amount += current.amount
            break;
          case 'outcome':
            acc[current.date].totalExpensesByMonth = acc[current.date].amount += current.amount
          default: 'income'
            break;
        }
        /*current.type === 'income' ?
          acc[current.date].totalRevenuesByMonth = acc[current.date].amount + current.amount :
          acc[current.date].totalExpensesByMonth = acc[current.date].amount + current.amount*/

        return acc
      }, {})

      // Extraia a lista 
      const newList: any = Object.values(totalsByMonths);

      setTotalAmountsByMonth(newList);
      console.log(totalAmountsByMonth);
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

      const transactionsBySelectedDateFormattedBrl = transactionsBySelectedDate
        .map((transactionBRLBySelectedDate: TransactionProps) => {
          switch (transactionBRLBySelectedDate.type) {
            case 'income':
              totalRevenuesBRLBySelectedDate += Number(transactionBRLBySelectedDate.amount);
              break;
            case 'outcome':
              totalExpensesBRLBySelectedDate += Number(transactionBRLBySelectedDate.amount);
              break;
            default: 'income';
              break;
          }
          const amount = Number(transactionBRLBySelectedDate.amount)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });

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

      /**
       * Transactions in BTC - Start
      **/
      /*const transactionsBtc = data
        .filter((transaction: TransactionProps) =>
          transaction.account?.currency === 'BTC'
        );

      let totalRevenuesBtc = 0;
      let totalExpensesBtc = 0;

      const transactionsFormattedBtc: TransactionProps = transactionsBtc
        .map((transactionBtc: TransactionProps) => {
          switch (transactionBtc.type) {
            case 'income':
              totalRevenuesBtc += Number(transactionBtc.amount);
              break;
            case 'outcome':
              totalExpensesBtc += Number(transactionBtc.amount);
              break;
            default: 'income';
              break;
          }
          const amount = Number(transactionBtc.amount)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8
            });

          const dateTransactionBtc = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBtc.created_at));

          return {
            id: transactionBtc.id,
            created_at: dateTransactionBtc,
            description: transactionBtc.description,
            amount,
            type: transactionBtc.type,
            account: {
              id: transactionBtc.account.id,
              name: transactionBtc.account.name,
              currency: transactionBtc.account.currency,
              simbol: transactionBtc.account.simbol,
            },
            category: {
              id: transactionBtc.category.id,
              name: transactionBtc.category.name,
              icon: {
                id: transactionBtc.category?.icon.id,
                title: transactionBtc.category?.icon.title,
                name: transactionBtc.category?.icon.name,
              },
              color: {
                id: transactionBtc.category.color.id,
                name: transactionBtc.category.color.name,
                hex: transactionBtc.category.color.hex,
              },
              tenant_id: transactionBtc.category.tenant_id
            },
            tenant_id: transactionBtc.tenant_id
          }
        });

      const totalBtc = initialTotalBTC + totalRevenuesBtc - totalExpensesBtc;

      const UserTransactionsDataFormatted = transactionsFormattedBrl
        .concat(transactionsFormattedBtc)*/
      /**
       * Transactions in BTC - End
      */

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
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
              y='totalRevenuesByMonth'
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
                duration: 2000,
                onLoad: { duration: 1000 },
                easing: 'backOut'
              }}
            />
            <VictoryBar
              data={totalAmountsByMonth}
              x='date'
              y='totalExpensesByMonth'
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
                onLoad: { duration: 1000 },
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