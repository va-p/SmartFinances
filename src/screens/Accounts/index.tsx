import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import * as Icon from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  VictoryArea,
  VictoryChart,
  VictoryZoomContainer,
} from 'victory-native';

import { ModalView } from '@components/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { AddAccountButton } from '@components/AddAccountButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';
import { SelectConnectAccount } from '@screens/SelectConnectAccount';

import { selectUserTenantId } from '@slices/userSlice';
import { selectBtcQuoteBrl } from '@slices/quotesSlice';
import {
  setAccountName,
  setAccountCurrency,
  setAccountInitialAmount,
  setAccountType,
  AccountType,
} from '@slices/accountSlice';

import { AccountProps } from '@interfaces/accounts';

import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import getTransactions from '@utils/getTransactions';

import theme from '@themes/theme';
import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';
import { useFocusEffect } from '@react-navigation/native';

export function Accounts({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [total, setTotal] = useState('R$0');
  const [totalByMonths, setTotalByMonths] = useState([]);
  const [hideAmount, setHideAmount] = useState(true);

  const connectAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const registerAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);

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
        if (new Date(item.created_at) <= new Date()) {
          switch (item.currency.code) {
            case 'BRL':
              switch (item.type) {
                case 'credit':
                case 'transferCredit':
                  totalRevenuesBRL += item.amount;
                  break;
                case 'debit':
                case 'transferDebit':
                  totalExpensesBRL += item.amount;
                  break;
              }
              break;
            case 'BTC':
              switch (item.type) {
                case 'credit':
                case 'transferCredit':
                  totalRevenuesBRL += item.amount * btcQuoteBrl.price;
                  break;
                case 'debit':
                case 'transferDebit':
                  totalExpensesBRL += item.amount * btcQuoteBrl.price;
                  break;
              }
              break;
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
              totalAccountAmountConverted: null,
            };
          }

          switch (item.currency.code) {
            case 'BRL':
              switch (item.type) {
                case 'credit':
                case 'transferCredit':
                  accounts[account].totalRevenuesByAccount += item.amount;
                  break;
                case 'debit':
                case 'transferDebit':
                  accounts[account].totalExpensesByAccount += item.amount;
                  break;
              }
              break;
            case 'BTC':
              switch (item.type) {
                case 'credit':
                case 'transferCredit':
                  accounts[account].totalRevenuesByAccount += item.amount;
                  break;
                case 'debit':
                case 'transferDebit':
                  accounts[account].totalExpensesByAccount += item.amount;
                  break;
              }
          }
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

        switch (accounts[i].currency.code) {
          case 'BTC':
            accounts[i].totalAccountAmount = Number(
              totalByAccount
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8,
            });
            accounts[i].totalAccountAmountConverted = Number(
              totalByAccount * btcQuoteBrl.price
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            break;
          default:
            accounts[i].totalAccountAmount = Number(
              totalByAccount
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });
            break;
        }
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
          switch (item.type) {
            case 'credit':
              totalsByMonths[ym].totalRevenuesByMonth += item.amount;
              break;
            case 'debit':
              totalsByMonths[ym].totalExpensesByMonth += item.amount;
              break;
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

  // TODO Remover essa função e buscar ias configs do Zustand!!!
  function getUserConfig() {
    (() => {
      const dataIsVisible = storageConfig.getBoolean(
        `${DATABASE_CONFIGS}.dataIsVisible`
      );
      if (dataIsVisible != undefined) {
        setHideAmount(dataIsVisible);
      }
    })();
  }
  function handleHideData() {
    try {
      storageConfig.set(`${DATABASE_CONFIGS}.dataIsVisible`, !hideAmount);

      setHideAmount((prevState) => !prevState);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Não foi possível salvar suas configurações. Por favor, tente novamente.'
      );
    }
  }

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
        hide_amount={hideAmount}
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUserConfig();
    }, [])
  );

  if (loading) {
    return <SkeletonAccountsScreen />;
  }

  return (
    <Container>
      <Header>
        <CashFlowContainer>
          <CashFlowTotal>{!hideAmount ? total : '•••••'}</CashFlowTotal>
          <CashFlowDescription>Patrimônio Total</CashFlowDescription>
        </CashFlowContainer>

        <HideDataButton onPress={() => handleHideData()}>
          {!hideAmount ? (
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchAccounts();
                getUserConfig();
              }}
            />
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
