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
  ButtonGroup,
} from './styles';

import {
  VictoryArea,
  VictoryChart,
  VictoryZoomContainer,
} from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import * as Icon from 'phosphor-react-native';
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
  setAccountInitialAmount,
  setAccountType,
  AccountType,
} from '@slices/accountSlice';
import { selectUserTenantId } from '@slices/userSlice';

import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';
import theme from '@themes/theme';
import getTransactions from '@utils/getTransactions';

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
      const data = await getTransactions(tenantId);

      /**
       * All totals Grouped By Accounts/Wallets - Start
       */
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      let accounts: any = [];
      for (const item of data) {
        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          totalRevenuesBRL += item.amount;
        } else if (
          new Date(item.created_at) <= new Date() &&
          item.type === 'debit'
        ) {
          totalExpensesBRL += item.amount;
        }

        const account = item.account.id;
        if (!accounts.hasOwnProperty(account)) {
          accounts[account] = {
            id: account,
            name: item.account.name,
            currency: {
              code: item.account.currency.code,
              symbol: item.account.currency.symbol,
            },
            initial_amount: item.account.initial_amount,
            type: item.account.type,
            transactions: [],
            hide: item.account.hide,
            totalRevenuesByAccount: 0,
            totalExpensesByAccount: 0,
            totalAccountAmount: 0,
          };
        }

        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          accounts[account].totalRevenuesByAccount += item.amount;
        } else if (
          new Date(item.created_at) <= new Date() &&
          item.type === 'debit'
        ) {
          accounts[account].totalExpensesByAccount += item.amount;
        } else if (
          new Date(item.created_at) <= new Date() &&
          item.type === 'transferCredit'
        ) {
          accounts[account].totalRevenuesByAccount += item.amount;
        } else if (
          new Date(item.created_at) <= new Date() &&
          item.type === 'transferDebit'
        ) {
          accounts[account].totalExpensesByAccount += item.amount;
        }
      }

      const totalBRL = totalRevenuesBRL - totalExpensesBRL;
      const totalFormattedPtbr = Number(totalBRL).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      accounts = Object.values(accounts);
      const filteredAccounts = accounts.filter(
        (account: AccountProps) => !account.hide
      );

      for (let i = accounts.length - 1; i >= 0; i--) {
        const totalByAccount =
          accounts[i].initial_amount +
          accounts[i].totalRevenuesByAccount -
          accounts[i].totalExpensesByAccount;

        accounts[i].totalAccountAmount = Number(totalByAccount).toLocaleString(
          'pt-BR',
          {
            style: 'currency',
            currency: 'BRL',
          }
        );
      }

      setTotal(totalFormattedPtbr);
      setAccounts(filteredAccounts);
      /**
       * All totals Grouped By Accounts/Wallets - End
       */

      /**
       * All Totals Grouped By Months - Start
       */
      let totalsByMonths: any = [];
      for (const item of data) {
        if (new Date(item.created_at) <= new Date()) {
          const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });
          if (!totalsByMonths.hasOwnProperty(ym)) {
            totalsByMonths[ym] = {
              date: ym,
              totalRevenuesByMonth: 0,
              totalExpensesByMonth: 0,
              total: 0,
            };
          }
          if (item.type === 'credit') {
            totalsByMonths[ym].totalRevenuesByMonth += item.amount;
          } else if (item.type === 'debit') {
            totalsByMonths[ym].totalExpensesByMonth += item.amount;
          }
        }
      }
      totalsByMonths = Object.values(totalsByMonths);

      let total = 0;
      for (let i = totalsByMonths.length - 1; i >= 0; i--) {
        total +=
          totalsByMonths[i].totalRevenuesByMonth -
          totalsByMonths[i].totalExpensesByMonth;
        totalsByMonths[i].total = total;
        totalsByMonths[i].date = format(
          parseISO(totalsByMonths[i].date),
          `MMM '\n' yyyy`,
          { locale: ptBR }
        );
      }

      setTotalByMonths(totalsByMonths);
      /**
       * All Totals Grouped By Months - End
       */
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Contas',
        'Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenConnectAccountModal() {
    connectAccountBottomSheetRef.current?.present();
  }

  function handleCloseConnectAccountModal() {
    connectAccountBottomSheetRef.current?.dismiss();
  }

  function handleOpenRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.present();
  }

  function handleCloseRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.dismiss();
    fetchAccounts();
  }

  function handleOpenAccount(
    id: string,
    name: string,
    type: AccountType,
    currency: any,
    initialAmount: number
  ) {
    dispatch(setAccountName(name));
    dispatch(setAccountType(type));
    dispatch(setAccountCurrency(currency));
    dispatch(setAccountInitialAmount(initialAmount));
    navigation.navigate('Conta', { id });
  }

  function handleHideData() {
    try {
      storageConfig.set(`${DATABASE_CONFIGS}.dataIsVisible`, !visible);

      setVisible((prevState) => !prevState);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Não foi possível salvar suas configurações. Por favor, tente novamente.'
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();

      (() => {
        const dataIsVisible = storageConfig.getBoolean(
          `${DATABASE_CONFIGS}.dataIsVisible`
        );
        if (dataIsVisible != undefined) {
          setVisible(dataIsVisible);
        }
      })();
    }, [])
  );

  function _renderEmpty() {
    return (
      <ListEmptyComponent text='Nenhuma conta possui transação. Crie uma conta e ao menos uma transação para visualizar a conta aqui' />
    );
  }

  function _renderItem({ item, index }: any) {
    const getAccountIcon = () => {
      switch (item.type) {
        case 'Outro':
        case 'Carteira':
          return <Icon.Wallet color={theme.colors.primary} />;
        case 'Carteira de Criptomoedas':
          return <Icon.CurrencyBtc color={theme.colors.primary} />;
        case 'Poupança':
        case 'Investimentos':
        case 'Conta Corrente':
          return <Icon.Bank color={theme.colors.primary} />;
        case 'Cartão de Crédito':
          return <Icon.CreditCard color={theme.colors.primary} />;
        default:
          'Carteira';
          break;
      }
    };

    return (
      <AccountListItem
        data={item}
        index={index}
        icon={getAccountIcon()}
        onPress={() =>
          handleOpenAccount(
            item.id,
            item.name,
            item.type,
            item.currency,
            item.initial_amount
          )
        }
      />
    );
  }

  //if (loading) {
  //  return <SkeletonAccountsScreen />;
  //}

  return (
    <Container>
      <Header>
        <CashFlowContainer>
          <CashFlowTotal>{visible ? total : '•••••'}</CashFlowTotal>
          <CashFlowDescription>Patrimônio Total</CashFlowDescription>
        </CashFlowContainer>

        <HideDataButton onPress={() => handleHideData()}>
          {visible ? (
            <Icon.EyeSlash size={20} color={theme.colors.primary} />
          ) : (
            <Icon.Eye size={20} color={theme.colors.primary} />
          )}
        </HideDataButton>
      </Header>

      <ChartContainer>
        <VictoryChart
          height={180}
          padding={{ top: 16, bottom: 16, left: 48, right: 48 }}
          domainPadding={{ y: 12 }}
          containerComponent={
            <VictoryZoomContainer
              height={200}
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
                strokeWidth: 2,
              },
            }}
            animate={{
              onEnter: { duration: 3000 },
              easing: 'linear',
            }}
          />
        </VictoryChart>
      </ChartContainer>

      <AccountsContainer>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={_renderItem}
          ListEmptyComponent={_renderEmpty}
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
        title='Conectar Conta Bancária'
      >
        <SelectConnectAccount />
      </ModalView>

      <ModalView
        bottomSheetRef={registerAccountBottomSheetRef}
        snapPoints={['50%', '75%']}
        closeModal={handleCloseRegisterAccountModal}
        title='Criar Conta Manual'
      >
        <RegisterAccount id='' closeAccount={handleCloseRegisterAccountModal} />
      </ModalView>
    </Container>
  );
}
