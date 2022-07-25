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
import { AccountProps } from '@components/AccountListItem';
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
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [transactions, setTransactions] = useState<TransactionProps>();
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
    //await AsyncStorage.removeItem(COLLECTION_TRANSACTIONS);

    let initialTotalBRL = 0;
    let initialTotalBTC = 0;

    try {
      const { data } = await api.get('account', {
        params: {
          tenant_id: tenantId
        }
      });
      const AccountsBRL = data.filter((account: AccountProps) =>
        account.currency === 'BRL'
      );

      let SumInitialTotalBRL = AccountsBRL.
        reduce((acumullator: number, account: AccountProps) => {
          return initialTotalBRL += Number(account.initial_amount);
        }, 0);

      const AccountsBTC = data.filter((account: AccountProps) =>
        account.currency === 'BTC'
      );
      let SumInitialTotalBTC = AccountsBTC.
        reduce((acumullator: number, account: AccountProps) => {
          return initialTotalBTC + Number(account.initial_amount);
        }, 0);

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Contas", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.");
    }

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
        .filter((transaction: TransactionProps) =>
          transaction.account?.currency === 'BRL'
        );

      let totalRevenuesBrl = 0;
      let totalExpensesBrl = 0;

      const transactionsFormattedBrl: TransactionProps = transactionsBrl
        .map((transactionBrl: TransactionProps) => {
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
              id: transactionBrl.account?.id,
              //created_at: dateAccountBrl,
              name: transactionBrl.account?.name,
              currency: transactionBrl.account?.currency,
              simbol: transactionBrl.account?.simbol,
              amount: transactionBrl.account?.amount,
              tenant_id: transactionBrl.account?.tenant_id
            },
            category: {
              id: transactionBrl.category?.id,
              //created_at: dateCategoryBrl,
              name: transactionBrl.category?.name,
              icon: {
                id: transactionBrl.category?.icon.id,
                title: transactionBrl.category?.icon.title,
                name: transactionBrl.category?.icon.name,
              },
              color: {
                id: transactionBrl.category.color.id,
                name: transactionBrl.category.color.name,
                hex: transactionBrl.category.color.hex,
              },
              tenant_id: transactionBrl.category?.tenant_id
            },
            tenant_id: transactionBrl.tenant_id
          }
        });

      const totalBrl = initialTotalBRL + totalRevenuesBrl - totalExpensesBrl;

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
              //created_at: dateAccountBtc,
              name: transactionBtc.account.name,
              currency: transactionBtc.account.currency,
              simbol: transactionBtc.account.simbol,
            },
            category: {
              id: transactionBtc.category.id,
              //created_at: dateCategoryBtc,
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

      const UserTransactionsDataFormatted = transactionsFormattedBrl
        .concat(transactionsFormattedBtc)

      setTransactions(UserTransactionsDataFormatted);

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

  useFocusEffect(useCallback(() => {
    fetchTransactions();
  }, []));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo urlImage="http://cdn.onlinewebfonts.com/svg/img_364496.png" />
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
          keyExtractor={(item) => item.id}
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