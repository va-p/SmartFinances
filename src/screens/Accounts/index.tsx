import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, Dimensions } from 'react-native';
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

import getTransactions from '@utils/getTransactions';

import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import * as Icon from 'phosphor-react-native';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { ModalView } from '@components/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { AddAccountButton } from '@components/AddAccountButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';
import { SelectConnectAccount } from '@screens/SelectConnectAccount';

import {
  AccountType,
  useCurrentAccountSelected,
} from '@storage/currentAccountSelectedStorage';
import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';

import theme from '@themes/theme';
import { convertCurrency } from '@utils/convertCurrency';

export type TotalByMonths = {
  date: string;
  totalRevenuesByMonth: number;
  totalExpensesByMonth: number;
  total: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HORIZONTAL_PADDING = 32;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2;

export function Accounts({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const { tenantId, id: userId } = useUser();
  const {
    brlQuoteBtc,
    brlQuoteEur,
    brlQuoteUsd,
    btcQuoteBrl,
    btcQuoteEur,
    btcQuoteUsd,
    eurQuoteBrl,
    eurQuoteBtc,
    eurQuoteUsd,
    usdQuoteBrl,
    usdQuoteEur,
    usdQuoteBtc,
  } = useQuotes();
  const { hideAmount, setHideAmount } = useUserConfigs();
  const {
    setAccountId,
    setAccountName,
    setAccountType,
    setAccountCurrency,
    setAccountInitialAmount,
  } = useCurrentAccountSelected();
  const [refreshing, setRefreshing] = useState(true);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [total, setTotal] = useState('R$0');
  const [totalByMonths, setTotalByMonths] = useState<TotalByMonths[]>([]);

  const connectAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const registerAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  async function fetchAccounts() {
    try {
      setLoading(true);

      const data = await getTransactions(tenantId);

      /**
       * All totals Grouped By Accounts/Wallets - Start
       */
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      let accounts: any = [];
      for (const item of data) {
        if (new Date(item.created_at) <= new Date()) {
          switch (item.account.currency.code) {
            case 'BRL':
              switch (item.type) {
                case 'credit':
                case 'CREDIT':
                case 'transferCredit':
                  totalRevenuesBRL += item.amount;
                  break;
                case 'debit':
                case 'DEBIT':
                case 'transferDebit':
                  totalExpensesBRL += item.amount;
                  break;
              }
              break;
            case 'BTC':
              switch (item.type) {
                case 'credit':
                case 'CREDIT':
                case 'transferCredit':
                  totalRevenuesBRL += item.amount * btcQuoteBrl.price;
                  break;
                case 'debit':
                case 'DEBIT':
                case 'transferDebit':
                  totalExpensesBRL += item.amount * btcQuoteBrl.price;
                  break;
              }
            case 'USD':
              switch (item.type) {
                case 'credit':
                case 'CREDIT':
                case 'transferCredit':
                  totalRevenuesBRL += item.amount * usdQuoteBrl.price;
                  break;
                case 'debit':
                case 'DEBIT':
                case 'transferDebit':
                  totalExpensesBRL += item.amount * usdQuoteBrl.price;
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

          switch (item.type) {
            case 'credit':
            case 'CREDIT':
            case 'transferCredit':
              accounts[account].totalRevenuesByAccount += item.amount;
              break;
            case 'debit':
            case 'DEBIT':
            case 'transferDebit':
              accounts[account].totalExpensesByAccount += item.amount;
              break;
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
      // console.log('accounts ===>', accounts);

      for (let i = accounts.length - 1; i >= 0; i--) {
        const totalByAccount =
          Number(accounts[i].totalRevenuesByAccount) -
          Number(accounts[i].totalExpensesByAccount);

        // console.log('totalByAccount ===>', totalByAccount);

        accounts[i].totalAccountAmount = Number(totalByAccount).toLocaleString(
          'pt-BR',
          {
            style: 'currency',
            currency: accounts[i].currency.code, // Usa o código da moeda da conta
            minimumFractionDigits: accounts[i].currency.code === 'BTC' ? 8 : 2, // Define casas decimais conforme a moeda
            maximumSignificantDigits:
              accounts[i].currency.code === 'BTC' ? 8 : undefined,
          }
        );

        if (accounts[i].currency.code === 'BTC') {
          accounts[i].totalAccountAmountConverted = convertCurrency({
            amount: totalByAccount,
            fromCurrency: accounts[i].currency.code,
            toCurrency: 'BRL',
            accountCurrency: accounts[i].currency.code,
            quotes: {
              brlQuoteBtc,
              brlQuoteEur,
              brlQuoteUsd,
              btcQuoteBrl,
              btcQuoteEur,
              btcQuoteUsd,
              eurQuoteBrl,
              eurQuoteBtc,
              eurQuoteUsd,
              usdQuoteBrl,
              usdQuoteBtc,
              usdQuoteEur,
            },
          }).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
        }

        if (accounts[i].currency.code === 'EUR') {
          accounts[i].totalAccountAmountConverted = Number(
            totalByAccount * eurQuoteBrl.price
          ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
        }

        if (accounts[i].currency.code === 'USD') {
          accounts[i].totalAccountAmountConverted = convertCurrency({
            amount: totalByAccount,
            fromCurrency: accounts[i].currency.code,
            toCurrency: 'BRL',
            accountCurrency: accounts[i].currency.code,
            quotes: {
              brlQuoteBtc,
              brlQuoteEur,
              brlQuoteUsd,
              btcQuoteBrl,
              btcQuoteEur,
              btcQuoteUsd,
              eurQuoteBrl,
              eurQuoteBtc,
              eurQuoteUsd,
              usdQuoteBrl,
              usdQuoteBtc,
              usdQuoteEur,
            },
          }).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          // accounts[i].totalAccountAmountConverted = Number(
          //   totalByAccount * usdQuoteBrl.price
          // ).toLocaleString('pt-BR', {
          //   style: 'currency',
          //   currency: 'BRL',
          // });
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
              totalsByMonths[ym].totalRevenuesByMonth =
                totalsByMonths[ym].totalRevenuesByMonth + item.amount;

              break;
            case 'debit':
              totalsByMonths[ym].totalExpensesByMonth =
                totalsByMonths[ym].totalExpensesByMonth + item.amount;
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
        totalsByMonths[i].total = parseFloat(total.toFixed(2));
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
    setAccountId(id);
    setAccountName(name);
    setAccountType(type);
    setAccountCurrency(currency);
    setAccountInitialAmount(initialAmount);
    navigation.navigate('Conta');
  }

  async function handleHideData() {
    try {
      const { status } = await api.post('edit_hide_amount', {
        user_id: userId,
        hide_amount: !hideAmount,
      });

      if (status === 200) {
        storageConfig.set(`${DATABASE_CONFIGS}.hideAmount`, !hideAmount);
        setHideAmount(!hideAmount);
      }
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
        case 'BANK':
          return <Icon.Bank color={theme.colors.primary} />;
        case 'Cartão de Crédito':
        case 'CREDIT':
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
        hideAmount={hideAmount}
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
        <LineChart
          data={totalByMonths
            .map((item) => {
              return { value: item.total };
            })
            .reverse()}
          xAxisLabelTexts={totalByMonths
            .map((item) => {
              return item.date;
            })
            .reverse()}
          height={180}
          width={GRAPH_WIDTH}
          xAxisColor='#455A64'
          yAxisColor='#455A64'
          areaChart
          curved
          showVerticalLines
          verticalLinesUptoDataPoint
          initialSpacing={16}
          endSpacing={0}
          focusEnabled
          showStripOnFocus
          showValuesAsDataPointsText
          showTextOnFocus
          xAxisTextNumberOfLines={2}
          xAxisLabelTextStyle={{
            fontSize: 10,
            color: '#90A4AE',
            paddingRight: 10,
          }}
          yAxisTextStyle={{ fontSize: 11, color: '#90A4AE' }}
          rulesColor='#455A64'
          verticalLinesColor='#455A64'
          color1={theme.colors.primary}
          dataPointsColor1={theme.colors.primary}
          startFillColor1={theme.colors.primary}
          startOpacity={0.6}
          endOpacity={0.1}
          isAnimated
          animationDuration={5000}
        />
      </ChartContainer>

      <AccountsContainer>
        <FlatList
          data={accounts}
          keyExtractor={(item) => String(item.id)}
          renderItem={_renderItem}
          ListEmptyComponent={_renderEmpty}
          initialNumToRender={25}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchAccounts();
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
        snapPoints={['100%']}
        enableContentPanningGesture={false}
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
