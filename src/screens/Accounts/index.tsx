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
  AccountsContent,
  Footer,
  ButtonGroup,
  HeaderContainer,
  SectionTitle,
} from './styles';

import getAccounts from '@utils/getAccounts';
import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import { convertCurrency } from '@utils/convertCurrency';
import generateYAxisLabelsTotalAssetsChart from '@utils/generateYAxisLabelsForLineChart';

import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import * as Icon from 'phosphor-react-native';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { AddAccountButton } from '@components/AddAccountButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CreditCardListItem } from '@components/CreditCardListItem';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import api from '@api/api';

import {
  AccountProps,
  AccountSubTypes,
  AccountTypes,
} from '@interfaces/accounts';

import theme from '@themes/theme';

type TotalByMonths = {
  date: string;
  totalRevenuesByMonth?: number;
  totalExpensesByMonth?: number;
  total: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HORIZONTAL_PADDING = 80;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING;

export function Accounts({ navigation }: any) {
  const bottomTabHeight = useBottomTabBarHeight();
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
  const { hideAmount, setHideAmount } = useUserConfigs();
  const [total, setTotal] = useState('R$0'); // Total assets
  const [accounts, setAccounts] = useState<AccountProps[]>([]); // Accounts list
  const [totalsByMonths, setTotalsByMonths] = useState<TotalByMonths[]>([]); // Totals equity chart

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
                  totalsByMonths[ym].total.minus(transactionAmountBRL); // Credit card - subtrai
              } else {
                totalsByMonths[ym].total =
                  totalsByMonths[ym].total.plus(transactionAmountBRL); // Others accounts - soma
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

              total: accumulatedTotal.toNumber(),
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

  function handleTouchConnectAccount() {
    navigation.navigate('Contas Conectadas', {
      showHeader: true,
    });
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
    type: AccountTypes,
    subType: AccountSubTypes | null,
    currency: any,
    balance: number
  ) {
    useCurrentAccountSelected.setState(() => ({
      accountId: id,
      accountName: name,
      accountType: type,
      accountSubType: subType,
      accountCurrency: currency,
      accountBalance: balance,
    }));
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

  type _renderItemProps = {
    item: AccountProps;
    index: number;
  };
  function _renderItem({ item, index }: _renderItemProps) {
    const getAccountIcon = () => {
      switch (item.type) {
        case 'OTHER':
        case 'WALLET':
          return <Icon.Wallet color={theme.colors.primary} />;
        case 'CRYPTOCURRENCY WALLET':
          return <Icon.CurrencyBtc color={theme.colors.primary} />;
        case 'INVESTMENTS':
        case 'BANK':
          return <Icon.Bank color={theme.colors.primary} />;
        case 'CREDIT':
          return <Icon.CreditCard color={theme.colors.primary} />;
        default:
          return <Icon.Wallet color={theme.colors.primary} />;
      }
    };

    if (item.type !== 'CREDIT' && item.subtype !== 'CREDIT_CARD') {
      return (
        <AccountsContent>
          <AccountListItem
            data={item}
            index={index}
            icon={getAccountIcon()}
            hideAmount={hideAmount}
            onPress={() =>
              handleOpenAccount(
                item.id!,
                item.name,
                item.type,
                item.subtype || null,
                item.currency,
                item.balance
              )
            }
          />
        </AccountsContent>
      );
    }

    if (item.type === 'CREDIT' && item.subtype === 'CREDIT_CARD') {
      return (
        <CreditCardListItem
          data={item}
          index={index}
          hideAmount={hideAmount}
          onPress={() =>
            handleOpenAccount(
              item.id!,
              item.name,
              item.type,
              item.subtype!,
              item.currency,
              item.balance
            )
          }
        />
      );
    }

    return null;
  }

  function _renderSkeletonTotal() {
    return (
      <SkeletonPlaceholder
        speed={1000}
        shimmerWidth={100}
        highlightColor={theme.colors.overlay}
        backgroundColor={theme.colors.background}
      >
        <SkeletonPlaceholder.Item
          maxWidth={100}
          alignItems='center'
          justifyContent='center'
        >
          <SkeletonPlaceholder.Item width={80} height={25} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
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
      <Gradient />
      <HeaderContainer>
        <Header>
          <CashFlowContainer>
            <CashFlowTotal>
              {refreshing
                ? _renderSkeletonTotal()
                : hideAmount
                ? '•••••'
                : total}
            </CashFlowTotal>
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
            key={totalsByMonths.length}
            data={totalsByMonths.map((item) => {
              return { value: item.total };
            })}
            xAxisLabelTexts={totalsByMonths.map((item) => {
              return item.date;
            })}
            yAxisLabelTexts={generateYAxisLabelsTotalAssetsChart(
              totalsByMonths
            )}
            width={GRAPH_WIDTH}
            height={128}
            noOfSections={5}
            mostNegativeValue={0}
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
              paddingRight: 12,
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
            animateOnDataChange
            scrollToEnd
          />
        </ChartContainer>
      </HeaderContainer>

      <AccountsContainer>
        {/** ACCOUNTS */}
        <FlatList
          data={accounts.filter(
            (account) =>
              account.type !== 'CREDIT' && account.subtype !== 'CREDIT_CARD'
          )}
          keyExtractor={(item) => String(item.id)}
          renderItem={_renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchAccounts(true);
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: bottomTabHeight,
          }}
          ListHeaderComponent={<SectionTitle>Contas</SectionTitle>}
          ListFooterComponent={
            /** CREDIT CARDS */
            accounts.some(
              (account) =>
                account.type === 'CREDIT' && account.subtype === 'CREDIT_CARD'
            ) ? (
              <>
                <SectionTitle>Cartões de crédito</SectionTitle>
                <FlatList
                  data={accounts.filter(
                    (account) =>
                      account.type === 'CREDIT' &&
                      account.subtype === 'CREDIT_CARD'
                  )}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={_renderItem}
                  snapToOffsets={[
                    ...Array(
                      accounts.filter(
                        (account) =>
                          account.type === 'CREDIT' &&
                          account.subtype === 'CREDIT_CARD'
                      ).length
                    ),
                  ].map((x, i) => i * (SCREEN_WIDTH * 0.8 - 32) + (i - 1) * 32)}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => {
                        fetchAccounts(true);
                      }}
                    />
                  }
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    columnGap: 8,
                    paddingRight: 16,
                    paddingBottom: 8,
                    paddingLeft: 16,
                  }}
                />

                {/** SCREEN FOOTER */}
                <Footer>
                  <ButtonGroup>
                    <AddAccountButton
                      icon='card'
                      title='Integrações Bancárias'
                      onPress={handleTouchConnectAccount}
                    />
                  </ButtonGroup>

                  <ButtonGroup>
                    <AddAccountButton
                      icon='wallet'
                      title='Criar Conta Manual'
                      onPress={handleOpenRegisterAccountModal}
                    />
                  </ButtonGroup>
                </Footer>
              </>
            ) : null
          }
          ListEmptyComponent={_renderEmpty}
        />
      </AccountsContainer>

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
