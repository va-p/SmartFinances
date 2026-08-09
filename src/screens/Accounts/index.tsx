import React, { useMemo, useRef } from 'react';
import { Alert, FlatList, RefreshControl, Dimensions, Platform } from 'react-native';
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

// Hooks
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import generateYAxisLabelsTotalAssetsChart from '@utils/generateYAxisLabelsForLineChart';

// Dependencies
import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import { format, parse, parseISO } from 'date-fns';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Icons
import Eye from 'phosphor-react-native/src/icons/Eye';
import Bank from 'phosphor-react-native/src/icons/Bank';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import CreditCard from 'phosphor-react-native/src/icons/CreditCard';
import CurrencyBtc from 'phosphor-react-native/src/icons/CurrencyBtc';

// Components
import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { AddAccountButton } from '@components/AddAccountButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CreditCardListItem } from '@components/CreditCardListItem';
import {
  InstitutionCard,
  InstitutionCardData,
} from '@components/InstitutionCard';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

import { RegisterAccount } from '@screens/RegisterAccount';

// Stores
import { useUser } from '@stores/userStorage';
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';
import { useCurrentInstitutionSelected } from '@stores/currentInstitutionSelectedStorage';

import api from '@api/api';

// Interfaces
import {
  AccountProps,
  AccountSubTypes,
  AccountTypes,
  CreditDataProps,
} from '@interfaces/accounts';
import { ThemeProps } from '@interfaces/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_HORIZONTAL_PADDING = 80;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING;

export function Accounts() {
  const theme = useTheme() as ThemeProps;
  const bottomTabHeight = useBottomTabBarHeight();
  const router = useRouter();
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
  const registerAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions,
  } = useTransactionsQuery();
  const {
    data: rawAccounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isRefetching: isRefetchingAccounts,
  } = useAccountsQuery();

  const processedData = useMemo(() => {
    if (!rawAccounts || !transactions) {
      return {
        totalBalanceFormatted: formatCurrency('BRL', 0, false),
        processedAccounts: [],
        chartData: [],
        institutionCards: [],
        standaloneAccounts: [],
      };
    }

    let totalAccountsBalance = new Decimal(0);
    const filteredAccounts = rawAccounts.filter(
      (account: AccountProps) => !account.hide
    );

    const processedAccounts = filteredAccounts.map((account) => {
      const accountBalanceConvertedToBRL = convertCurrency({
        amount: Number(account.balance),
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
      totalAccountsBalance = totalAccountsBalance.plus(
        accountBalanceConvertedToBRL
      );

      return {
        ...account,
        balance: formatCurrency(
          account.currency.code,
          Number(account.balance),
          false
        ),
        totalAccountAmountConverted:
          account.currency.code !== 'BRL'
            ? formatCurrency('BRL', accountBalanceConvertedToBRL, false)
            : undefined,
        // Raw BRL-converted balance (not formatted) reused below to build
        // per-institution aggregated totals without re-implementing currency
        // conversion (AC13.1 / design.md §6 "Accounts screen changes")
        accountBalanceConvertedToBRL,
      };
    });

    // Partition non-credit-card accounts by institution (AC12.1). Institution
    // groups of length 1 are reclassified into standalone accounts, bypassing
    // the InstitutionCard wrapper entirely (AC12.3) — this self-corrects on
    // every render, so no extra invalidation is needed when an institution
    // becomes single-account after a delete/edit elsewhere (design.md §7).
    const institutionGroups = new Map<string, typeof processedAccounts>();
    const standaloneAccounts: typeof processedAccounts = [];

    processedAccounts
      .filter(
        (account) =>
          account.type !== 'CREDIT' && account.subtype !== 'CREDIT_CARD'
      )
      .forEach((account) => {
        const institutionId = account.institution?.id;

        if (!institutionId) {
          standaloneAccounts.push(account);
          return;
        }

        if (!institutionGroups.has(institutionId)) {
          institutionGroups.set(institutionId, []);
        }
        institutionGroups.get(institutionId)!.push(account);
      });

    const institutionCards: {
      id: string;
      name: string;
      totalFormatted: string;
      accountCount: number;
    }[] = [];

    institutionGroups.forEach((accounts) => {
      if (accounts.length < 2) {
        standaloneAccounts.push(...accounts);
        return;
      }

      const totalConverted = accounts.reduce(
        (sum, account) =>
          sum.plus(account.accountBalanceConvertedToBRL ?? 0),
        new Decimal(0)
      );

      institutionCards.push({
        id: accounts[0].institution!.id,
        name: accounts[0].institution!.name,
        totalFormatted: formatCurrency(
          'BRL',
          totalConverted.toNumber(),
          false
        ),
        accountCount: accounts.length,
      });
    });

    let totalsByMonths: any = {};
    let accumulatedTotal = new Decimal(0);

    for (const transaction of transactions) {
      if (new Date(transaction.created_at) <= new Date()) {
        const ym = format(parseISO(transaction.created_at), `yyyy-MM`, {
          locale: ptBR,
        });

        if (!totalsByMonths.hasOwnProperty(ym)) {
          totalsByMonths[ym] = {
            date: ym,
            total: new Decimal(0),
          };
        }

        const transactionAmountBRL = transaction.amount_in_account_currency
          ? transaction.amount_in_account_currency
          : transaction.amount;

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
      accumulatedTotal = accumulatedTotal.plus(totalsByMonths[monthYear].total);

      return {
        date: format(
          parse(`${monthYear}-01`, 'yyyy-MM-dd', new Date()),
          "MMM '\n' yyyy",
          { locale: ptBR }
        ),

        total: accumulatedTotal.toNumber(),
      };
    });

    return {
      totalBalanceFormatted: formatCurrency(
        'BRL',
        totalAccountsBalance.toNumber(),
        false
      ),
      processedAccounts: processedAccounts,
      chartData: formattedTotalByMonths,
      institutionCards,
      standaloneAccounts,
    };
  }, [rawAccounts, transactions]);

  const {
    totalBalanceFormatted,
    processedAccounts,
    chartData,
    institutionCards,
    standaloneAccounts,
  } = processedData;

  // Merge institution cards and standalone accounts into a single list,
  // sorted as two concatenated alphabetical blocks — institutions first,
  // then standalone accounts — per AC12.4 (two separate Array.sort() calls,
  // not one combined comparator, so "institutions first" always holds
  // regardless of name collisions between the two blocks).
  const accountsListData = useMemo(() => {
    const sortedInstitutionCards = [...institutionCards].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedStandaloneAccounts = [...standaloneAccounts].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return [
      ...sortedInstitutionCards.map((institution) => ({
        kind: 'institution' as const,
        data: institution,
      })),
      ...sortedStandaloneAccounts.map((account) => ({
        kind: 'account' as const,
        data: account,
      })),
    ];
  }, [institutionCards, standaloneAccounts]);

  function handleRefresh() {
    Promise.all([refetchTransactions(), refetchAccounts()]);
  }

  function handleTouchConnectAccount() {
    router.navigate({
      pathname: '/accounts/bankingIntegrations',
    });
  }

  function handleOpenRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.present();
  }

  function handleCloseRegisterAccountModal() {
    registerAccountBottomSheetRef.current?.dismiss();
    refetchAccounts();
  }

  function handleOpenAccount(
    id: string,
    name: string,
    type: AccountTypes,
    subType: AccountSubTypes | null,
    currency: any,
    balance: string,
    creditData: CreditDataProps | null
  ) {
    useCurrentAccountSelected.setState(() => ({
      accountId: id,
      accountName: name,
      accountType: type,
      accountSubType: subType,
      accountCurrency: currency,
      accountBalance: balance,
      accountCreditData: creditData,
    }));
    router.navigate({
      pathname: '/accounts/[accountId]',
      params: { id: id },
    });
  }

  async function handleHideData() {
    try {
      const { status } = await api.patch(`user/${userID}/configs`, {
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
      <ListEmptyComponent text='Nenhuma conta possui transação. Adicione uma transação para visualizar a conta aqui' />
    );
  }

  function getAccountIcon(type: AccountTypes) {
    switch (type) {
      case 'OTHER':
      case 'WALLET':
        return <Wallet color={theme.colors.primary} />;
      case 'CRYPTOCURRENCY WALLET':
        return <CurrencyBtc color={theme.colors.primary} />;
      case 'INVESTMENTS':
      case 'BANK':
        return <Bank color={theme.colors.primary} />;
      case 'CREDIT':
        return <CreditCard color={theme.colors.primary} />;
      default:
        return <Wallet color={theme.colors.primary} />;
    }
  }

  function handleOpenInstitution(institution: InstitutionCardData) {
    useCurrentInstitutionSelected.setState(() => ({
      institutionId: institution.id,
      institutionName: institution.name,
    }));
    router.navigate({
      pathname: '/accounts/institutionDetails',
    });
  }

  type _renderItemProps = {
    item: AccountProps;
    index: number;
  };
  function _renderItem({ item, index }: _renderItemProps) {
    if (item.type !== 'CREDIT' && item.subtype !== 'CREDIT_CARD') {
      return (
        <AccountsContent>
          <AccountListItem
            data={item}
            index={index}
            icon={getAccountIcon(item.type)}
            hideAmount={hideAmount}
            onPress={() =>
              handleOpenAccount(
                String(item.id)!,
                item.name,
                item.type,
                item.subtype || null,
                item.currency,
                String(item.balance),
                null
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
              String(item.id)!,
              item.name,
              item.type,
              item.subtype!,
              item.currency,
              String(item.balance),
              item.creditData || null
            )
          }
        />
      );
    }

    return null;
  }

  type _renderAccountsListItemProps = {
    item:
      | { kind: 'institution'; data: InstitutionCardData }
      | { kind: 'account'; data: AccountProps };
    index: number;
  };
  function _renderAccountsListItem({
    item,
    index,
  }: _renderAccountsListItemProps) {
    if (item.kind === 'institution') {
      return (
        <AccountsContent>
          <InstitutionCard
            data={item.data}
            index={index}
            hideAmount={hideAmount}
            onPress={() => handleOpenInstitution(item.data)}
          />
        </AccountsContent>
      );
    }

    const account = item.data;

    return (
      <AccountsContent>
        <AccountListItem
          data={account}
          index={index}
          icon={getAccountIcon(account.type)}
          hideAmount={hideAmount}
          onPress={() =>
            handleOpenAccount(
              String(account.id)!,
              account.name,
              account.type,
              account.subtype || null,
              account.currency,
              String(account.balance),
              null
            )
          }
        />
      </AccountsContent>
    );
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
          alignSelf='center'
          alignItems='center'
          justifyContent='center'
        >
          <SkeletonPlaceholder.Item width={80} height={25} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    );
  }

  if (isLoadingTransactions || isLoadingAccounts) {
    return (
      <Screen>
        <SkeletonAccountsScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />
        <HeaderContainer>
          <Header>
            <CashFlowContainer>
              <CashFlowTotal>
                {isRefetchingTransactions || isRefetchingAccounts
                  ? _renderSkeletonTotal()
                  : hideAmount
                  ? '•••••'
                  : totalBalanceFormatted}
              </CashFlowTotal>
              <CashFlowDescription>Patrimônio Total</CashFlowDescription>
            </CashFlowContainer>

            <HideDataButton onPress={() => handleHideData()}>
              {!hideAmount ? (
                <EyeSlash size={20} color={theme.colors.primary} />
              ) : (
                <Eye size={20} color={theme.colors.primary} />
              )}
            </HideDataButton>
          </Header>

          <ChartContainer>
            <LineChart
              key={chartData.length}
              data={chartData.map((item) => {
                return { value: item.total };
              })}
              xAxisLabelTexts={chartData.map((item) => {
                return item.date;
              })}
              yAxisLabelTexts={generateYAxisLabelsTotalAssetsChart(chartData)}
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
              initialSpacing={16}
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
              animationDuration={3000}
              animateOnDataChange
              scrollToEnd
            />
          </ChartContainer>
        </HeaderContainer>

        <AccountsContainer>
          {/** ACCOUNTS */}
          <FlatList
            style={{ flex: 1 }}
            data={accountsListData}
            keyExtractor={(item) =>
              item.kind === 'institution'
                ? `institution-${item.data.id}`
                : String(item.data.id)
            }
            renderItem={_renderAccountsListItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefetchingTransactions || isRefetchingAccounts}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 8,
            }}
            ListHeaderComponent={<SectionTitle>Contas</SectionTitle>}
            ListFooterComponent={
              /** CREDIT CARDS */
              processedAccounts.some(
                (account) =>
                  account.type === 'CREDIT' && account.subtype === 'CREDIT_CARD'
              ) ? (
                <>
                  <SectionTitle>Cartões de crédito</SectionTitle>
                  <FlatList
                    data={processedAccounts.filter(
                      (account) =>
                        account.type === 'CREDIT' &&
                        account.subtype === 'CREDIT_CARD'
                    )}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={_renderItem}
                    snapToOffsets={[
                      ...Array(
                        processedAccounts.filter(
                          (account) =>
                            account.type === 'CREDIT' &&
                            account.subtype === 'CREDIT_CARD'
                        ).length
                      ),
                    ].map(
                      (x, i) => i * (SCREEN_WIDTH * 0.8 - 32) + (i - 1) * 32
                    )}
                    refreshControl={
                      <RefreshControl
                        refreshing={
                          isRefetchingTransactions || isRefetchingAccounts
                        }
                        onRefresh={handleRefresh}
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
                </>
              ) : null
            }
            ListEmptyComponent={_renderEmpty}
          />

          {/** SCREEN FOOTER */}
          <Footer bottomTabHeight={Platform.OS === 'ios' ? bottomTabHeight - 54 : bottomTabHeight - 32}>
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
        </AccountsContainer>

        <ModalView
          bottomSheetRef={registerAccountBottomSheetRef}
          snapPoints={['75%']}
          closeModal={handleCloseRegisterAccountModal}
          title='Criar Conta Manual'
        >
          <RegisterAccount
            id=''
            closeAccount={handleCloseRegisterAccountModal}
          />
        </ModalView>
      </Container>
    </Screen>
  );
}
