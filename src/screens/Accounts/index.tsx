import React, { useMemo, useRef, useState } from 'react';
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
  SectionTitleAndFilterContainer,
  SortingButton,
} from './styles';

// Hooks
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';

// Dependencies
import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { format, parse } from 'date-fns';
import { useTheme } from 'styled-components';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// Icons
import Eye from 'phosphor-react-native/src/icons/Eye';
import Bank from 'phosphor-react-native/src/icons/Bank';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import FunnelIcon from 'phosphor-react-native/src/icons/Funnel';
import CreditCard from 'phosphor-react-native/src/icons/CreditCard';
import CurrencyBtc from 'phosphor-react-native/src/icons/CurrencyBtc';

// Components
import {
  InstitutionCard,
  InstitutionCardData,
} from '@components/InstitutionCard';
import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';
import { ModalView } from '@components/Modals/ModalView';
import { AccountListItem } from '@components/AccountListItem';
import { AddAccountButton } from '@components/AddAccountButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CreditCardListItem } from '@components/CreditCardListItem';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

// Screens
import { SortingOptions } from '@screens/SortingOptions';
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
  const sortingBottomSheetRef = useRef<BottomSheetModal>(null);

  type SortingOption = 'name-asc' | 'name-desc' | 'balance-asc' | 'balance-desc';
  const [sortingOption, setSortingOption] = useState<SortingOption>('name-asc');

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
        // Raw numeric balance preserved for sorting by balance value.
        rawBalance: Number(account.balance),
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
      totalRaw: number;
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
        totalRaw: totalConverted.toNumber(),
      });
    });

    // ── Net Worth Chart Data ────────────────────────────────────────────
    // Monthly flows: DEBIT reduces net worth, CREDIT increases it.
    // Sign is derived from the transaction type to handle both old
    // (all-positive) and new (DEBIT-negative) data consistently.
    let totalsByMonths: Record<string, Decimal> = {};

    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.created_at);
      if (isNaN(transactionDate.getTime())) continue;
      if (transactionDate > new Date()) continue;

      // Skip transfers — they move money between accounts, not net worth.
      if (
        transaction.type === 'TRANSFER_CREDIT' ||
        transaction.type === 'TRANSFER_DEBIT'
      ) {
        continue;
      }

      const rawAmount =
        transaction.amount_in_account_currency ?? transaction.amount;
      const isDebit = transaction.type === 'DEBIT';
      const signedAmount = isDebit
        ? -Math.abs(Number(rawAmount))
        : Math.abs(Number(rawAmount));

      const ym = format(transactionDate, 'yyyy-MM', { locale: ptBR });

      if (!totalsByMonths[ym]) {
        totalsByMonths[ym] = new Decimal(0);
      }
      totalsByMonths[ym] = totalsByMonths[ym].plus(signedAmount);
    }

    // Sum of all monthly flows so we can back-calculate initial net worth.
    let sumOfAllFlows = new Decimal(0);
    for (const monthlyTotal of Object.values(totalsByMonths)) {
      sumOfAllFlows = sumOfAllFlows.plus(monthlyTotal);
    }

    // Seed starting point so the final point equals totalAccountsBalance.
    let accumulatedTotal = totalAccountsBalance.minus(sumOfAllFlows);

    const sortedMonths = Object.keys(totalsByMonths).sort((a, b) =>
      a.localeCompare(b)
    );
    const chartData = sortedMonths.map((monthYear) => {
      accumulatedTotal = accumulatedTotal.plus(totalsByMonths[monthYear]);

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
      chartData: chartData,
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
    // Comparator factories: given a sort option, return a comparator for
    // institution cards (sorted by name/aggregate balance) or standalone
    // accounts (sorted by name/rawBalance).
    const byNameAsc = (a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name);
    const byNameDesc = (a: { name: string }, b: { name: string }) =>
      b.name.localeCompare(a.name);

    const institutionCmp =
      sortingOption === 'name-asc'
        ? byNameAsc
        : sortingOption === 'name-desc'
          ? byNameDesc
          : sortingOption === 'balance-asc'
            ? (a: InstitutionCardData, b: InstitutionCardData) => a.totalRaw - b.totalRaw
            : (a: InstitutionCardData, b: InstitutionCardData) => b.totalRaw - a.totalRaw;

    const accountCmp =
      sortingOption === 'name-asc'
        ? byNameAsc
        : sortingOption === 'name-desc'
          ? byNameDesc
          : sortingOption === 'balance-asc'
            ? (a: typeof processedAccounts[number], b: typeof processedAccounts[number]) => a.rawBalance - b.rawBalance
            : (a: typeof processedAccounts[number], b: typeof processedAccounts[number]) => b.rawBalance - a.rawBalance;

    const sortedInstitutionCards = [...institutionCards].sort(institutionCmp);
    const sortedStandaloneAccounts = [...standaloneAccounts].sort(accountCmp);

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
  }, [institutionCards, standaloneAccounts, sortingOption]);

  // Credit card carousel: sorted alphabetically by institution name (cards
  // without an institution sort last), account name as tiebreaker/fallback
  // (AC15.2) — a flat sort, no sub-grouping or headers (AC15.3).
  const creditCardAccounts = useMemo(() => {
    return processedAccounts
      .filter(
        (account) =>
          account.type === 'CREDIT' && account.subtype === 'CREDIT_CARD'
      )
      .sort((a, b) => {
        const institutionA = a.institution?.name;
        const institutionB = b.institution?.name;

        if (institutionA && institutionB) {
          const institutionComparison =
            institutionA.localeCompare(institutionB);
          if (institutionComparison !== 0) return institutionComparison;
        } else if (institutionA && !institutionB) {
          return -1;
        } else if (!institutionA && institutionB) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      });
  }, [processedAccounts]);

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

  function handleSortingPress() {
    sortingBottomSheetRef.current?.present();
  }

  function handleCloseSortingModal() {
    sortingBottomSheetRef.current?.dismiss();
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
              formatYLabel={(label: string) => {
                // The chart library formats labels according to the device
                // locale.  Detect whether comma or dot is the decimal
                // separator, then normalize to a plain JS number.
                const s = String(label);
                const lastComma = s.lastIndexOf(',');
                const lastDot = s.lastIndexOf('.');

                let value: number;
                if (lastComma > lastDot) {
                  // pt-BR style: dot=thousands, comma=decimal
                  // "6.667,4" → 6667.4
                  value = Number(s.replace(/\./g, '').replace(',', '.'));
                } else if (lastDot > lastComma) {
                  // US/UK style: comma=thousands, dot=decimal
                  // "6,667.4" → 6667.4
                  value = Number(s.replace(/,/g, ''));
                } else {
                  // Plain number or already formatted (e.g. "6.7K")
                  value = Number(s.replace(/,/g, ''));
                }

                if (isNaN(value)) return s;
                const k = Math.floor(value / 1000);
                return k > 0 ? `${k}k` : '0';
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
            ListHeaderComponent={
              <SectionTitleAndFilterContainer>
                <SectionTitle>Contas</SectionTitle>
                <SortingButton onPress={handleSortingPress}>
                  <FunnelIcon size={20} color={theme.colors.primary} />
                </SortingButton>
              </SectionTitleAndFilterContainer>
            }
            ListFooterComponent={
              /** CREDIT CARDS */
              creditCardAccounts.length > 0 ? (
                <>
                  <SectionTitle>Cartões de crédito</SectionTitle>
                  <FlatList
                    data={creditCardAccounts}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={_renderItem}
                    snapToOffsets={[
                      ...Array(creditCardAccounts.length),
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

        <ModalViewSelection
          title='Selecione a ordenação'
          bottomSheetRef={sortingBottomSheetRef}
          snapPoints={['50%']}
        >
          <SortingOptions
            selectedOption={sortingOption}
            onSelect={setSortingOption}
            handleClose={handleCloseSortingModal}
          />
        </ModalViewSelection>
      </Container>
    </Screen>
  );
}
