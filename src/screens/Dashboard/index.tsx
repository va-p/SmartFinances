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
  VictoryGroup
} from 'victory-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { addMonths, subMonths } from 'date-fns';
import { useSelector } from 'react-redux';

import { TransactionListItem, TransactionProps } from '@components/TransactionListItem';
import { FilterButton } from '@components/FilterButton';
import { Load } from '@components/Load';

import {
  selectUserTenantId
} from '@slices/userSlice';

import {
  COLLECTION_TOKENS,
  COLLECTION_USERS
} from '@configs/database';

import api from '@api/api';

type MonthData = TransactionProps & {
  totalRevenuesByMonth: number;
  totalExpensesByMonth: number;
}

export function Dashboard({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [transactionsFormatted, setTransactionsFormatted] = useState<TransactionProps>();
  const [totalAmountsByMonth, setTotalAmountsByMonth] = useState<MonthData[]>([]);
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
    let initialTotalBRL = 0;
    let initialTotalBTC = 0;

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      })
      if (!data) {
      } else {
        setTransactions(data);
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

      const transactionsFormattedBrl: MonthData = transactionsBRL
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
            totalExpensesByMonth,
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

      const totalBRL = initialTotalBRL + totalRevenuesBRL - totalExpensesBRL;
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
        * All Transactions and Totals By Months - Start
      **/
      let totalRevenuesByMonth = 0;
      let totalExpensesByMonth = 0;

      const totalsByMonths: TransactionProps = transactionsBRL
        .map((transactionByMonth: TransactionProps) => {
          const dateTransactionByMonth = Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
          }).format(new Date(transactionByMonth.created_at));

          return {
            created_at: dateTransactionByMonth,
            type: transactionByMonth.type,
            amount: transactionByMonth.amount
          }
        });

      // Agrupe
      const groups = totalsByMonths.reduce((acc: any, current: any) => {
        if (!acc[current.created_at]) {
          acc[current.created_at] = {
            ...current
          }
          return acc
        }

        acc[current.created_at].amount = acc[current.created_at].amount + current.amount

        current.type === 'income' ?
          acc[current.created_at].totalRevenuesByMonth = acc[current.created_at].amount + current.amount :
          acc[current.created_at].totalExpensesByMonth = acc[current.created_at].amount + current.amount

        return acc
      }, {})

      // Extraia a lista 
      const newList: any = Object.values(groups);

      setTotalAmountsByMonth(newList);
      console.log(totalAmountsByMonth);
      /**
       * All Transactions and Totals By Months - End
      **/


      /**
       * Transactions By Selected Date Formatted in BRL - Start
      **/
      const transactionsBySelectedDate = data
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

          const dateTransaction = transactionBRLBySelectedDate.created_at.toLocaleDateString();

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
      const totalBySelectedDateFormattedBRL = totalBRLBySelectedDate.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })

      setTransactionsFormattedBySelectedDate(transactionsBySelectedDateFormattedBrl);
      /**
       * Transactions By Selected Date Formatted in BRL - End
      **/

      /**
       * Transactions in BTC - Start
      **/
      const transactionsBtc = data
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
          const amountBtc = Number(transactionBtc.amount)
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

          /*const dateAccountBtc = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBtc.account.created_at));

          const dateCategoryBtc = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBtc.category.created_at));*/

          return {
            id: transactionBtc.id,
            created_at: dateTransactionBtc,
            description: transactionBtc.description,
            amountBtc,
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
        .concat(transactionsFormattedBtc)
      /**
       * Transactions in BTC - End
      */

      setCashFlowTotalBySelectedDate(totalBySelectedDateFormattedBRL);

      //console.log(selectedDate.toLocaleDateString('pt-BR'));

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

  async function handleLogout() {
    await AsyncStorage.removeItem(COLLECTION_TOKENS);
    await AsyncStorage.removeItem(COLLECTION_USERS);
    navigation.navigate('SignIn');
  }

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
          width={400} height={220}
          maxDomain={{ x: 6 }}
          domainPadding={{ x: 6, y: 2 }}
        >
          <VictoryGroup
            offset={12}
          >
            <VictoryBar
              data={totalAmountsByMonth}
              x={'created_at'}
              y={'totalRevenuesByMonth'}
              sortKey = "x"
              sortOrder="descending"
              alignment='start'
              style={{
                data: {
                  width: 10,
                  fill: 'green'
                }
              }}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
                easing: 'backOut'
              }}
              cornerRadius={{top: 2, bottom: 2}}
            />
            <VictoryBar
              data={totalAmountsByMonth}
              x={'created_at'}
              y={'amount'}
              sortOrder="descending"
              alignment='start'
              style={{
                data: {
                  width: 10,
                  fill: 'red'
                }
              }}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
                easing: 'backOut'
              }}
              cornerRadius={{top: 2, bottom: 2}}
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