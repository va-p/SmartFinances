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

import getAccounts from '@utils/getAccounts';
import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import { convertCurrency } from '@utils/convertCurrency';

import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, parse, parseISO } from 'date-fns';
import * as Icon from 'phosphor-react-native';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { ModalView } from '@components/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { AddAccountButton } from '@components/AddAccountButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';
import { ConnectedAccounts } from '@screens/ConnectedAccounts';

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
import { TransactionProps } from '@interfaces/transactions';

export type TotalByMonths = {
  date: string;
  totalRevenuesByMonth?: number;
  totalExpensesByMonth?: number;
  total: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HORIZONTAL_PADDING = 32;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2;

export function Accounts({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { id: userID } = useUser();
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
  const {
    setAccountId,
    setAccountName,
    setAccountType,
    setAccountCurrency,
    setAccountBalance,
  } = useCurrentAccountSelected();
  const { hideAmount, setHideAmount } = useUserConfigs();
  const [total, setTotal] = useState('R$0'); // Total assets
  const [accounts, setAccounts] = useState<AccountProps[]>([]); // Accounts list
  const [totalsByMonths, setTotalsByMonths] = useState<TotalByMonths[]>([]); // Totals equity chart

  const connectAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const registerAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  async function fetchAccounts(isRefresh: boolean = false) {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const accountsData = await getAccounts(userID);

      let totalAccountsBalance = 0;

      if (!!accountsData) {
        const filteredAccounts = accountsData.filter(
          (account: AccountProps) => !account.hide
        );

        for (const account of filteredAccounts) {
          const accountBalanceConvertedToBRL = convertCurrency({
            amount: account.balance,
            fromCurrency: account.currency.code,
            toCurrency: 'BRL',
            accountCurrency: account.currency.code,
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
          });
          if (account.currency.code !== 'BRL') {
            account.totalAccountAmountConverted = formatCurrency(
              'BRL',
              accountBalanceConvertedToBRL,
              false
            );
          }

          totalAccountsBalance += accountBalanceConvertedToBRL;

          account.balance = formatCurrency(
            account.currency.code,
            account.balance,
            false
          );

          setTotal(formatCurrency('BRL', totalAccountsBalance, false));

          /**
           * Totals Grouped By Months - Start
           */
          let totalsByMonths: any = {};
          let accumulatedTotal = new Decimal(0);

          const allTransactions = await getTransactions(userID);

          for (const transaction of allTransactions) {
            if (new Date(transaction.created_at) <= new Date()) {
              const ym = format(transaction.created_at, `yyyy-MM`, {
                locale: ptBR,
              });

              if (!totalsByMonths.hasOwnProperty(ym)) {
                totalsByMonths[ym] = {
                  date: ym,
                  total: new Decimal(0),
                };
              }

              const transactionAmountBRL =
                transaction.amount_in_account_currency
                  ? transaction.amount_in_account_currency
                  : transaction.amount;

              // Desconsidera transferências
              if (
                transaction.type === 'TRANSFER_CREDIT' ||
                transaction.type === 'TRANSFER_DEBIT'
              ) {
                continue;
              }

              if (transaction.account.type === 'CREDIT') {
                totalsByMonths[ym].total =
                  totalsByMonths[ym].total.minus(transactionAmountBRL); // Cartão de crédito - subtrai
              } else {
                totalsByMonths[ym].total =
                  totalsByMonths[ym].total.plus(transactionAmountBRL); // Outras contas - soma
              }
            }
          }

          const sortedMonths = Object.keys(totalsByMonths).sort(
            (a, b) =>
              parse(a, 'yyyy-MM', new Date()).getTime() -
              parse(b, 'yyyy-MM', new Date()).getTime()
          );
          const formattedTotalByMonths = sortedMonths.map((monthYear) => {
            accumulatedTotal = accumulatedTotal.plus(
              totalsByMonths[monthYear].total
            );

            return {
              date: format(
                parse(`${monthYear}-01`, 'yyyy-MM-dd', new Date()),
                "MMM '\n' yyyy",
                { locale: ptBR }
              ),

              total: accumulatedTotal.toNumber(), // Salva o total acumulado
            };
          });

          setTotalsByMonths(formattedTotalByMonths);
          /**
           * Totals Grouped By Months - End
           */
        }

        setAccounts(filteredAccounts);
      }
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
  function handleTouchConnectAccountModal() {
    navigation.navigate('Contas Conectadas', {
      showHeader: true,
    });
  }

  function handleCloseConnectAccountModal() {
    connectAccountBottomSheetRef.current?.dismiss();
  }

  function handleOpenRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.present();
  }

  function handleCloseRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.dismiss();
    fetchAccounts(true);
  }

  function handleOpenAccount(
    id: string,
    name: string,
    type: AccountType,
    currency: any,
    balance: number
  ) {
    setAccountId(id);
    setAccountName(name);
    setAccountType(type);
    setAccountCurrency(currency);
    setAccountBalance(balance);
    navigation.navigate('Conta');
  }

  async function handleHideData() {
    try {
      const { status } = await api.post('edit_hide_amount', {
        user_id: userID,
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
            item.balance
            // item.initial_amount
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
          data={totalsByMonths.map((item) => {
            return { value: item.total };
          })}
          xAxisLabelTexts={totalsByMonths.map((item) => {
            return item.date;
          })}
          yAxisLabelTexts={totalsByMonths.map((item) => {
            return item.total.toLocaleString('en-US', {
              maximumFractionDigits: 2,
              notation: 'compact',
              compactDisplay: 'short',
            });
          })}
          height={128}
          width={GRAPH_WIDTH}
          xAxisColor='#455A64'
          yAxisColor='#455A64'
          areaChart
          curved
          showVerticalLines
          verticalLinesUptoDataPoint
          initialSpacing={8}
          endSpacing={8}
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
                fetchAccounts(true);
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
              onPress={handleTouchConnectAccountModal}
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
        <ConnectedAccounts />
      </ModalView>

      <ModalView
        bottomSheetRef={registerAccountBottomSheetRef}
        snapPoints={['75%']}
        closeModal={handleCloseRegisterAccountModal}
        title='Criar Conta Manual'
      >
        <RegisterAccount id='' closeAccount={handleCloseRegisterAccountModal} />
      </ModalView>
    </Container>
  );
}
