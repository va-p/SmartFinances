import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  Header,
  CashFlowContainer,
  CashFlowTotal,
  CashFlowDescription,
  HideDataButton,
  ChartContainer,
  AccountsContainer,
  Footer,
  ButtonGroup
} from './styles';

import { VictoryArea, VictoryChart, VictoryZoomContainer } from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { AccountListItem, AccountProps } from '@components/AccountListItem';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { AddAccountButton } from '@components/AddAccountButton';
import { ModalView } from '@components/ModalView';

import { SelectConnectAccount } from '@screens/SelectConnectAccount';
import { RegisterAccount } from '@screens/RegisterAccount';

import {
  setAccountName,
  setAccountCurrency,
  setAccountTotalAmount,
  setAccountInitialAmount
} from '@slices/accountSlice';
import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';
import theme from '@themes/theme';

export function Accounts({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [total, setTotal] = useState('R$0');
  const [totalByMonths, setTotalByMonths] = useState([]);
  const [visible, setVisible] = useState(true);
  const connectAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const registerAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  async function fetchAccounts() {
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
       * All totals Grouped By Accounts/Wallets - Start
       */
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      let accounts: any = [];
      for (const item of data) {
        // Sum the total revenues and expenses of all accounts
        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          totalRevenuesBRL += item.amount
        } else if (new Date(item.created_at) <= new Date() && item.type === 'debit') {
          totalExpensesBRL += item.amount
        }

        // Group by account
        const account = item.account.id;
        // Create the objects
        if (!accounts.hasOwnProperty(account)) {
          accounts[account] = {
            id: account,
            name: item.account.name,
            currency: {
              code: item.account.currency.code,
              symbol: item.account.currency.symbol
            },
            initial_amount: item.account.initial_amount,
            totalRevenuesByAccount: 0,
            totalExpensesByAccount: 0,
            totalAccountAmount: 0
          };
        }

        // Sum the total revenues and expenses by account
        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          accounts[account].totalRevenuesByAccount += item.amount
        } else if (new Date(item.created_at) <= new Date() && item.type === 'debit') {
          accounts[account].totalExpensesByAccount += item.amount
        } else if (new Date(item.created_at) <= new Date() && item.type === 'transferCredit') {
          accounts[account].totalRevenuesByAccount += item.amount
        } else if (new Date(item.created_at) <= new Date() && item.type === 'transferDebit') {
          accounts[account].totalExpensesByAccount += item.amount
        }
      };

      // Sum the total of all accounts
      const totalBRL =
        totalRevenuesBRL -
        totalExpensesBRL;
      const totalFormattedPtbr = Number(totalBRL)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

      accounts = Object.values(accounts);

      // Runs from last to first, accumulating the total
      for (var i = accounts.length - 1; i >= 0; i--) {
        const totalByAccount =
          accounts[i].initial_amount +
          accounts[i].totalRevenuesByAccount -
          accounts[i].totalExpensesByAccount;

        accounts[i].totalAccountAmount = Number(totalByAccount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
      };

      setTotal(totalFormattedPtbr);
      setAccounts(accounts);
      /**
       * All totals Grouped By Accounts/Wallets - End
       */


      /**
       * All Totals Grouped By Months - Start
       */
      // Group by month
      let totalsByMonths: any = [];
      for (const item of data) {
        // Format the date to "aaaa-mm", easier to sort the array
        const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });
        // Create the objects
        if (!totalsByMonths.hasOwnProperty(ym)) {
          totalsByMonths[ym] = { date: ym, totalRevenuesByMonth: 0, totalExpensesByMonth: 0, total: 0 };
        }
        if (item.type === 'credit') {
          totalsByMonths[ym].totalRevenuesByMonth += item.amount;
        } else if (item.type === 'debit') {
          totalsByMonths[ym].totalExpensesByMonth += item.amount;
        }
      }
      totalsByMonths = Object.values(totalsByMonths);

      // Runs from last to first, accumulating the total
      let total = 0;
      for (var i = totalsByMonths.length - 1; i >= 0; i--) {
        total += totalsByMonths[i].totalRevenuesByMonth - totalsByMonths[i].totalExpensesByMonth;
        totalsByMonths[i].total = total;
        // Converts the date to the final format
        totalsByMonths[i].date = format(parseISO(totalsByMonths[i].date), `MMM '\n' yyyy`, { locale: ptBR });
      };

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

  function handleOpenConnectAccountModal() {
    connectAccountBottomSheetRef.current?.present();
  };

  function handleCloseConnectAccountModal() {
    connectAccountBottomSheetRef.current?.dismiss();
  };

  function handleOpenRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.present();
  };

  function handleCloseRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.dismiss();
    fetchAccounts();
  };

  function handleHideData() {
    visible ? setVisible(false) : setVisible(true);
  };

  function handleOpenAccount(
    id: string,
    name: string,
    currency: any,
    initialAmount: string,
    total: any) {
    dispatch(
      setAccountName(name)
    );
    dispatch(
      setAccountCurrency(currency)
    );
    dispatch(
      setAccountInitialAmount(initialAmount)
    );
    dispatch(
      setAccountTotalAmount(total)
    );
    navigation.navigate('Conta', { id });
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  if (loading) {
    return <SkeletonAccountsScreen />
  }

  return (
    <Container>
      <Header>
        <CashFlowContainer>
          <CashFlowTotal>{visible ? total : "•••••"}</CashFlowTotal>
          <CashFlowDescription>Patrimônio Total</CashFlowDescription>
        </CashFlowContainer>

        <HideDataButton onPress={() => handleHideData()}>
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.primary}
          />
        </HideDataButton>
      </Header>

      <ChartContainer>
        <VictoryChart
          height={220}
          domainPadding={{ y: 12 }}
          containerComponent={
            <VictoryZoomContainer
              allowZoom={false}
              zoomDomain={{ x: [6, 12] }}
              zoomDimension='x'
            />
          }
          theme={smartFinancesChartTheme}
        >
          <VictoryArea
            data={totalByMonths}
            x='date'
            y='total'
            sortKey='x'
            sortOrder='descending'
            interpolation='natural'
            style={{
              data: {
                fill: theme.colors.primary,
                fillOpacity: 0.1,
                stroke: theme.colors.primary,
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
          data={accounts}
          keyExtractor={item => item.id}
          renderItem={({ item }: any) => (
            <AccountListItem
              data={item}
              icon='wallet'
              color={theme.colors.primary}
              onPress={() => handleOpenAccount(
                item.id,
                item.name,
                item.currency,
                item.initial_amount,
                item.totalAccountAmount
              )}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent text="Nenhuma conta possui transação. Crie uma conta e ao menos uma transação para visualizar a conta aqui" />
          )}
          initialNumToRender={10}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
          }
          showsVerticalScrollIndicator={false}
        />

        <Footer>
          <ButtonGroup>
            <AddAccountButton
              icon='card'
              title='Conectar conta bancária'
              onPress={handleOpenConnectAccountModal}
            />
          </ButtonGroup>

          <ButtonGroup>
            <AddAccountButton
              icon='wallet'
              title='Criar conta manual'
              onPress={handleOpenRegisterAccountModal}
            />
          </ButtonGroup>
        </Footer>
      </AccountsContainer>

      <ModalView
        bottomSheetRef={connectAccountBottomSheetRef}
        snapPoints={['50%', '75%']}
        closeModal={handleCloseConnectAccountModal}
        title="Conectar Conta Bancária"
      >
        <SelectConnectAccount />
      </ModalView>

      <ModalView
        bottomSheetRef={registerAccountBottomSheetRef}
        snapPoints={['50%', '75%']}
        closeModal={handleCloseRegisterAccountModal}
        title="Criar Conta Manual"
      >
        <RegisterAccount
          id=''
          closeAccount={handleCloseRegisterAccountModal}
        />
      </ModalView>
    </Container>
  );
}