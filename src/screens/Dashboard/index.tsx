import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton
} from './styles'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { TransactionListItem, TransactionProps } from '@components/TransactionListItem';
import { CashFlowCard } from '@components/CashFlowCard';
import { Load } from '@components/Load';

import {
  selectUserTenantId,
  selectUserName
} from '@slices/userSlice';

import {
  selectRevenuesBrl,
  selectExpensesBrl,
  selectTotalBrl,
  setRevenuesBrl,
  setExpensesBrl,
  setTotalBrl
} from '@slices/amountBrlSlice';

import {
  selectExpensesBtc,
  selectRevenuesBtc,
  selectTotalBtc,
  setExpensesBtc,
  setRevenuesBtc,
  setTotalBtc
} from '@slices/amountBtcSlice';

import {
  COLLECTION_HIGHLIGHTDATA,
  COLLECTION_TRANSACTIONS,
  COLLECTION_TOKENS,
  COLLECTION_USERS
} from '@configs/database';

import api from '@api/api';

export type DataListProps = TransactionProps & {
  id: string;
}

interface HighlightProps {
  amount: string | number;
}

type HighlightData = {
  revenues: HighlightProps;
  expenses: HighlightProps;
  total: HighlightProps;
}

export function Dashboard({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useSelector(selectUserTenantId);
  const userName = useSelector(selectUserName);
  const revenuesBrl = useSelector(selectRevenuesBrl);
  const expensesBrl = useSelector(selectExpensesBrl);
  const totalBrl = useSelector(selectTotalBrl);
  const revenuesBtc = useSelector(selectRevenuesBtc);
  const expensesBtc = useSelector(selectExpensesBtc);
  const totalBtc = useSelector(selectTotalBtc);

  const dispatch = useDispatch();

  async function fetchTransactions() {
    setLoading(true);

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
       * Transactions in BRL - Start
      */
      const transactionsBrl = data
        .filter((transaction: DataListProps) =>
          transaction.account.currency === 'BRL'
        );

      let totalRevenuesBrl = 0;
      let totalExpensesBrl = 0;

      const transactionsFormattedBrl: DataListProps[] = transactionsBrl
        .map((transactionBrl: DataListProps) => {
          switch (transactionBrl.type) {
            case 'income':
              totalRevenuesBrl += Number(transactionBrl.amount);
              break;
            case 'outcome':
              totalExpensesBrl += Number(transactionBrl.amount);
              break;
            default: 'income';
              break;
          }
          const amount = Number(transactionBrl.amount)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });

          const dateTransactionBrl = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBrl.created_at));

          /*const dateAccountBrl = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBrl.account.created_at));

          const dateCategoryBrl = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBrl.category.created_at));*/

          return {
            id: transactionBrl.id,
            created_at: dateTransactionBrl,
            description: transactionBrl.description,
            amount,
            type: transactionBrl.type,
            account: {
              id: transactionBrl.account.id,
              //created_at: dateAccountBrl,
              name: transactionBrl.account.name,
              currency: transactionBrl.account.currency,
              simbol: transactionBrl.account.simbol,
            },
            category: {
              id: transactionBrl.category.id,
              //created_at: dateCategoryBrl,
              name: transactionBrl.category.name,
              icon: transactionBrl.category.icon,
              color: transactionBrl.category.color,
              tenantId: transactionBrl.category.tenant_id
            },
            tenantId: transactionBrl.tenant_id
          }
        });

      const totalBrl = totalRevenuesBrl - totalExpensesBrl;

      const highlightDataBrl = {
        revenues: {
          amount: totalRevenuesBrl.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        },
        expenses: {
          amount: totalExpensesBrl.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        },
        total: {
          amount: totalBrl.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        }
      };
      /**
       * Transactions in BRL - End
      */


      /**
       * Transactions in BTC - Start
      */
      const transactionsBtc = data
        .filter((transaction: DataListProps) =>
          transaction.account.currency === 'BTC'
        );

      let totalRevenuesBtc = 0;
      let totalExpensesBtc = 0;

      const transactionsFormattedBtc: DataListProps[] = transactionsBtc
        .map((transactionBtc: DataListProps) => {
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

          const dateAccountBtc = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBtc.account.created_at));

          const dateCategoryBtc = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionBtc.category.created_at));

          return {
            id: transactionBtc.id,
            created_at: dateTransactionBtc,
            description: transactionBtc.description,
            amountBtc,
            type: transactionBtc.type,
            account: {
              id: transactionBtc.account.id,
              created_at: dateAccountBtc,
              name: transactionBtc.account.name,
              currency: transactionBtc.account.currency,
              simbol: transactionBtc.account.simbol,
            },
            category: {
              id: transactionBtc.category.id,
              created_at: dateCategoryBtc,
              name: transactionBtc.category.name,
              icon: transactionBtc.category.icon,
              color: transactionBtc.category.color,
              tenantId: transactionBtc.category.tenant_id
            },
            tenantId: transactionBtc.tenant_id
          }
        });

      const totalBtc = totalRevenuesBtc - totalExpensesBtc;

      const highlightDataBtc = {
        revenues: {
          amount: totalRevenuesBtc.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BTC',
            minimumFractionDigits: 8
          }),
        },
        expenses: {
          amount: totalExpensesBtc.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BTC',
            minimumFractionDigits: 8
          }),
        },
        total: {
          amount: totalBtc.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BTC',
            minimumFractionDigits: 8
          }),
        }
      };

      const jsonUserTransactionsData = await AsyncStorage.getItem(COLLECTION_TRANSACTIONS);
      const currentTransactionsData = jsonUserTransactionsData ? JSON.parse(jsonUserTransactionsData) : [];

      const jsonUserTransactionsDataFormatted = [
        ...currentTransactionsData,
        transactionsFormattedBrl,
        transactionsFormattedBtc
      ];
      await AsyncStorage.setItem(COLLECTION_TRANSACTIONS, JSON.stringify(jsonUserTransactionsDataFormatted));
      setTransactions(transactionsFormattedBrl);

      const jsonHighlightData = await AsyncStorage.getItem(COLLECTION_HIGHLIGHTDATA);
      const currentHighlightData = jsonHighlightData ? JSON.parse(jsonHighlightData) : [];

      const jsonUserHighlightDataFormatted = [
        currentHighlightData,
        highlightDataBrl,
        highlightDataBtc
      ];
      await AsyncStorage.setItem(COLLECTION_HIGHLIGHTDATA, JSON.stringify(jsonUserHighlightDataFormatted));
      dispatch(
        setRevenuesBrl(highlightDataBrl.revenues)
      );
      dispatch(
        setExpensesBrl(highlightDataBrl.expenses)
      );
      dispatch(
        setTotalBrl(highlightDataBrl.total)
      );
      dispatch(
        setRevenuesBtc(highlightDataBtc.revenues)
      );
      dispatch(
        setExpensesBtc(highlightDataBtc.expenses)
      );
      dispatch(
        setTotalBtc(highlightDataBtc.total)
      );
      /*setHighlightDataBrl(highlightDataBrl);
      setHighlightDataBtc(highlightDataBtc);*/

      /*console.log(
        //highlightDataBrl.revenues,
        //highlightDataBrl.expenses,
        //highlightDataBrl.total
      );
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

  async function handleLogout() {
    await AsyncStorage.removeItem(COLLECTION_TOKENS);
    await AsyncStorage.removeItem(COLLECTION_USERS);
    navigation.navigate('SignIn');
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  useFocusEffect(useCallback(() => {
    fetchTransactions();
  }, []));

  console.log()

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo
              source={{ uri: 'https://avatars.githubusercontent.com/u/86264374?s=400&u=1f5068f1cd425601df99567d3419c77a6fab80f9&v=4' }}
            />
            <User>
              <UserGreeting>Olá,</UserGreeting>
              <UserName>{userName}</UserName>
            </User>
          </UserInfo>

          <LogoutButton onPress={handleLogout}>
            <Icon name='log-out-outline' />
          </LogoutButton>
        </UserWrapper>
      </Header>

      <HighlightCards>
        <CashFlowCard
          amountIncome={revenuesBrl.amount}
          amountOutcome={expensesBrl.amount}
          amount={totalBrl.amount}
        />

        <CashFlowCard
          amountIncome={revenuesBtc.amount}
          amountOutcome={expensesBtc.amount}
          amount={totalBtc.amount}
        />
      </HighlightCards>

      <Transactions>
        <Title>Transações</Title>

        <TransactionList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
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