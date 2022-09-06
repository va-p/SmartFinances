import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  Header,
  CashFlowTotal,
  CashFlowDescription,
  ChartContainer,
  AccountsContainer,
  Footer
} from './styles';

import { VictoryArea, VictoryChart, VictoryTheme } from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

import { AccountListItem, AccountProps } from '@components/AccountListItem';
import { TransactionProps } from '@components/TransactionListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Load } from '@components/Load';

import { RegisterAccount } from '@screens/RegisterAccount';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';

export function Accounts() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [transactions, setTransactions] = useState<AccountProps[]>([]);
  const [total, setTotal] = useState('R$0');
  const [totalByMonths, setTotalByMonths] = useState([]);
  const [registerAccountModalOpen, setRegisterAccountModalOpen] = useState(false);

  async function fetchAccounts() {
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
       * All totals Grouped By Accounts/Wallets - Start
       */
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      const transactionsFormattedByAccounts = data
        .map((transactionByAccount: TransactionProps) => {
          switch (transactionByAccount.type) {
            case 'income':
              totalRevenuesBRL += Number(transactionByAccount.amount)
              break;
            case 'outcome':
              totalExpensesBRL += Number(transactionByAccount.amount)
              break;
            default: 'income';
              break;
          }

          return {
            type: transactionByAccount.type,
            amount: transactionByAccount.amount,
            id: transactionByAccount.account.id,
            name: transactionByAccount.account.name,
            currency: {
              code: transactionByAccount.account.currency.code,
              symbol: transactionByAccount.account.currency.symbol
            },
            initial_amount: transactionByAccount.account.initial_amount,
            totalRevenuesByAccounts: 0,
            totalExpensesByAccounts: 0,
            totalAccountAmount: 0,
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

      const totalsByAccounts = transactionsFormattedByAccounts
        .reduce((acc: any, current: any) => {
          if (!acc[current.id]) acc[current.id] = { ...current }

          switch (current.type) {
            case 'income':
              acc[current.id].totalRevenuesByAccounts += Number(current.amount)
              break;
            case 'transferIn':
              acc[current.id].totalRevenuesByAccounts += Number(current.amount)
              break;
            case 'outcome':
              acc[current.id].totalExpensesByAccounts += Number(current.amount)
              break;
            case 'transferOut':
              acc[current.id].totalExpensesByAccounts += Number(current.amount)
              break;
          }

          const totalByAccount =
            acc[current.id].initial_amount +
            acc[current.id].totalRevenuesByAccounts -
            acc[current.id].totalExpensesByAccounts;
          acc[current.id].totalAccountAmount = Number(totalByAccount)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
          return acc
        }, []);

      const totalsGroupedByAccounts: any = Object.values(totalsByAccounts);
      setTransactions(totalsGroupedByAccounts);
      setTotal(totalFormattedPtbr);
      /**  
       * All totals Grouped By Accounts/Wallets - End
       */


      /** 
       * All Totals Grouped By Months - Start
       */
      // Format the date
      const transactionsFormattedByMonths = data
        .map((transactionByAccount: TransactionProps) => {
          const dateTransactionByMonth = format(
            transactionByAccount.created_at, `MMM '\n' yyyy`, { locale: ptBR }
          );

          return {
            date: dateTransactionByMonth,
            type: transactionByAccount.type,
            amount: transactionByAccount.amount,
          }
        });

      // Group by month
      let totalsByMonths: any = [];
      for (const item of transactionsFormattedByMonths) {
        if (!totalsByMonths.hasOwnProperty(item.date)) {
          totalsByMonths[item.date] = { date: item.date, total: 0, totalExpensesByMonth: 0, totalRevenuesByMonth: 0 };
        }
        if (item.type === 'income') {
          totalsByMonths[item.date].totalRevenuesByMonth += item.amount;
        } else if (item.type === 'outcome') {
          totalsByMonths[item.date].totalExpensesByMonth += item.amount;
        }
      }
      totalsByMonths = Object.values(totalsByMonths);

      // Runs from last to first, accumulating the total
      let total = 0;
      for (var i = totalsByMonths.length - 1; i >= 0; i--) {
        total += totalsByMonths[i].totalRevenuesByMonth - totalsByMonths[i].totalExpensesByMonth;
        totalsByMonths[i].total = total;
      }
      setTotalByMonths(totalsByMonths);
      /** 
       * All Totals Grouped By Months - End
       */

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Contas", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleOpenRegisterAccountModal() {
    setRegisterAccountModalOpen(true);
  }

  function handleCloseRegisterAccountModal() {
    setRegisterAccountModalOpen(false);
  }

  async function handleAccountSwipeLeft(id: string) {
    Alert.alert("Exclusão de transação", "Tem certeza que deseja excluir a conta?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a conta.", onPress: () => handleDeleteAccount(id) }])
  };

  async function handleDeleteAccount(id: string) {
    try {
      await api.delete('delete_account', {
        params: {
          account_id: id
        }
      });
      fetchAccounts();
      Alert.alert("Exclusão de conta", "Conta excluída com sucesso!")
    } catch (error) {
      Alert.alert("Exclusão de conta", `${error}`)
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header>
        <CashFlowTotal>{total}</CashFlowTotal>
        <CashFlowDescription>Patrimônio Total</CashFlowDescription>
      </Header>

      <ChartContainer>
        <VictoryChart
          theme={VictoryTheme.material}
          width={400} height={180}
          maxDomain={{ x: 6 }}
          domainPadding={{ x: 1 }}
        >
          <VictoryArea
            data={totalByMonths}
            x='date'
            y='total'
            sortKey="x"
            sortOrder="descending"
            style={{
              data: {
                fill: theme.colors.success,
                fillOpacity: 0.3,
                stroke: theme.colors.success,
                strokeWidth: 2
              }
            }}
            animate={{
              onLoad: { duration: 10000 },
              easing: 'backOut'
            }}
          />
        </VictoryChart>
      </ChartContainer>
      <AccountsContainer>
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <AccountListItem
              data={item}
              icon='wallet'
              color={theme.colors.primary}
              onSwipeableLeftOpen={() => handleAccountSwipeLeft(item.id)}
            />
          )}
          initialNumToRender={50}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 10
          }}
        />
      </AccountsContainer>

      <Footer>
        <Button
          type='secondary'
          title='Criar nova conta'
          onPress={handleOpenRegisterAccountModal}
        />
      </Footer>

      <ModalView
        visible={registerAccountModalOpen}
        closeModal={handleCloseRegisterAccountModal}
        title='Criar Nova Conta'
      >
        <RegisterAccount />
      </ModalView>
    </Container>
  );
}