import React, { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, Dimensions, Platform } from 'react-native';
import {
  Container,
  Header,
  CashFlowContainer,
  CashFlowTotal,
  CashFlowDescription,
  HideDataButton,
  SearchButton,
  ChartContainer,
  AccountsContainer,
  AccountsContent,
  Footer,
  ButtonGroup,
  HeaderContainer,
  SectionTitle,
  SectionTitleAndFilterContainer,
} from './styles';

// Hooks
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useScreenTrace } from '@hooks/useScreenTrace';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import { buildNetWorthEvolution } from '@utils/buildNetWorthEvolution';
import { filterItemsByQuery } from '@utils/filterItemsByQuery';

// Dependencies
import Decimal from 'decimal.js';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import { useForm } from 'react-hook-form';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// Icons
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { BankIcon } from 'phosphor-react-native/src/icons/Bank';
import { WalletIcon } from 'phosphor-react-native/src/icons/Wallet';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { CreditCardIcon } from 'phosphor-react-native/src/icons/CreditCard';
import { CurrencyBtcIcon } from 'phosphor-react-native/src/icons/CurrencyBtc';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';

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
import { SortFilterButton } from '@components/SortFilterButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { CreditCardListItem } from '@components/CreditCardListItem';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { SearchBar } from '@components/SearchBar';

// Screens
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
const SCREEN_HORIZONTAL_PADDING = 80;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING;

export function Accounts() {
  useScreenTrace('accounts_screen');

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
  const { hideAmount, setHideAmount, sortingOption, setSortingOption, baseCurrency } =
    useUserConfigs();
  const registerAccountBottomSheetRef = useRef<BottomSheetModal>(null);

  // Search form (Home-screen pattern: query via react-hook-form)
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { control, watch, reset } = useForm();
  const searchQuery = watch('search', '');

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
    // Net worth must include virtual goal reserves (GOAL-25); list render
    // paths still filter them out below.
  } = useAccountsQuery(true);

  const processedData = useMemo(() => {
    if (!rawAccounts || !transactions) {
      return {
        totalBalanceFormatted: formatCurrency(baseCurrency.code, 0, false),
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
      const accountBalanceConvertedToBase = convertCurrency({
        amount: Number(account.balance),
        fromCurrency: account.currency.code,
        toCurrency: baseCurrency.code,
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
        accountBalanceConvertedToBase
      );

      return {
        ...account,
        balance: formatCurrency(
          account.currency.code,
          Number(account.balance),
          false
        ),
        totalAccountAmountConverted:
          account.currency.code !== baseCurrency.code
            ? formatCurrency(
              baseCurrency.code,
              accountBalanceConvertedToBase,
              false
            )
            : undefined,
        // Raw numeric balance preserved for sorting by balance value.
        rawBalance: Number(account.balance),
        // Raw base-currency-converted balance (not formatted) reused below to
        // build per-institution aggregated totals without re-implementing
        // currency conversion (AC13.1 / design.md §6 "Accounts screen changes")
        accountBalanceConvertedToBase,
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
          // Virtual goal reserves stay in the total above but never render
          // in the accounts list (GOAL-24).
          !account.isVirtual &&
          account.type !== 'CREDIT' &&
          account.subtype !== 'CREDIT_CARD'
      )
      .forEach((account) => {
        const institutionId = account.institution?.id;

        if (!institutionId) {
          standaloneAccounts.push(account);
          return;
        }

        const group = institutionGroups.get(institutionId);
        if (group) {
          group.push(account);
        } else {
          institutionGroups.set(institutionId, [account]);
        }
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

      const { institution } = accounts[0];
      if (!institution) {
        standaloneAccounts.push(...accounts);
        return;
      }

      const totalConverted = accounts.reduce(
        (sum, account) =>
          sum.plus(account.accountBalanceConvertedToBase ?? 0),
        new Decimal(0)
      );

      institutionCards.push({
        id: institution.id,
        name: institution.name,
        totalFormatted: formatCurrency(
          baseCurrency.code,
          totalConverted.toNumber(),
          false
        ),
        accountCount: accounts.length,
        totalRaw: totalConverted.toNumber(),
      });
    });

    // ── Net Worth Chart Data ──────────────────────────────────────────────
    // Extracted to a shared utility — same calculation as the Overview
    // screen.  Seeds the accumulated total with the current net worth so
    // the final chart point equals totalBalanceFormatted.
    const chartData = buildNetWorthEvolution({
      transactions,
      totalAssets: totalAccountsBalance.toNumber(),
      period: 'months',
    });

    return {
      totalBalanceFormatted: formatCurrency(
        baseCurrency.code,
        totalAccountsBalance.toNumber(),
        false
      ),
      processedAccounts,
      chartData,
      institutionCards,
      standaloneAccounts,
    };
  }, [rawAccounts, transactions, baseCurrency.code]);

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

    const pickInstitutionCmp = () => {
      if (sortingOption === 'name-asc') {
        return byNameAsc;
      }

      if (sortingOption === 'name-desc') {
        return byNameDesc;
      }

      if (sortingOption === 'balance-asc') {
        return (a: InstitutionCardData, b: InstitutionCardData) =>
          a.totalRaw - b.totalRaw;
      }

      return (a: InstitutionCardData, b: InstitutionCardData) =>
        b.totalRaw - a.totalRaw;
    };
    const institutionCmp = pickInstitutionCmp();

    const pickAccountCmp = () => {
      if (sortingOption === 'name-asc') {
        return byNameAsc;
      }

      if (sortingOption === 'name-desc') {
        return byNameDesc;
      }

      if (sortingOption === 'balance-asc') {
        return (
          a: typeof processedAccounts[number],
          b: typeof processedAccounts[number]
        ) => a.accountBalanceConvertedToBase - b.accountBalanceConvertedToBase;
      }

      return (
        a: typeof processedAccounts[number],
        b: typeof processedAccounts[number]
      ) => b.accountBalanceConvertedToBase - a.accountBalanceConvertedToBase;
    };
    const accountCmp = pickAccountCmp();

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

  // Credit card carousel: sorted alphabetically by name,
  // a flat sort, no sub-grouping or headers (AC15.3).
  const creditCardAccounts: AccountProps[] = useMemo(() => processedAccounts
    .filter(
      (account) =>
        !account.isVirtual &&
          account.type === 'CREDIT' &&
          account.subtype === 'CREDIT_CARD'
    )
    .sort((a, b) => {
      const nameA = a.name;
      const nameB = b.name;

      if (nameA && nameB) {
        const institutionComparison =
            nameA.localeCompare(nameB);
        if (institutionComparison !== 0) return institutionComparison;
      } else if (nameA && !nameB) {
        return -1;
      } else if (!nameA && nameB) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    }), [processedAccounts]);

  // Account filtering with search — applies after the existing sorting, so
  // the sort choice is preserved while the query narrows the rendered list.
  const filteredAccountsListData = useMemo(
    () =>
      filterItemsByQuery(
        accountsListData,
        searchQuery,
        (item) => item.data.name
      ),
    [accountsListData, searchQuery]
  );

  const filteredCreditCardAccounts = useMemo(
    () =>
      filterItemsByQuery(
        creditCardAccounts,
        searchQuery,
        (account) => account.name
      ),
    [creditCardAccounts, searchQuery]
  );

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
      params: { id },
    });
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
      Alert.alert(
        'Não foi possível salvar suas configurações. Por favor, tente novamente.'
      );
    }
  }

  function renderEmpty() {
    return (
      <ListEmptyComponent text='Nenhuma conta possui transação. Adicione uma transação para visualizar a conta aqui' />
    );
  }

  function getAccountIcon(type: AccountTypes) {
    switch (type) {
      case 'OTHER':
      case 'WALLET':
        return <WalletIcon color={theme.colors.primary} />;
      case 'CRYPTOCURRENCY_WALLET':
        return <CurrencyBtcIcon color={theme.colors.primary} />;
      case 'INVESTMENTS':
      case 'BANK':
        return <BankIcon color={theme.colors.primary} />;
      case 'CREDIT':
        return <CreditCardIcon color={theme.colors.primary} />;
      default:
        return <WalletIcon color={theme.colors.primary} />;
    }
  }

  function handleSelectSorting(option: typeof sortingOption) {
    setSortingOption(option);
    storageConfig.set(`${DATABASE_CONFIGS}.sortingOption`, option);
  }

  type _renderItemProps = {
    item: AccountProps;
    index: number;
  };
  function renderItem({ item, index }: _renderItemProps) {
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
                String(item.id),
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
              String(item.id),
              item.name,
              item.type,
              item.subtype ?? null,
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
  function renderAccountsListItem({
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
              String(account.id),
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

  function renderSkeletonTotal() {
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

  function getDisplayedTotalBalance() {
    if (isRefetchingTransactions || isRefetchingAccounts) {
      return renderSkeletonTotal();
    }

    if (hideAmount) {
      return '•••••';
    }

    return totalBalanceFormatted;
  }

  return (
    <Screen>
      <Container>
        <Gradient />
        <HeaderContainer>
          <Header>
            <CashFlowContainer>
              <CashFlowTotal>{getDisplayedTotalBalance()}</CashFlowTotal>
              <CashFlowDescription>Patrimônio Total</CashFlowDescription>
            </CashFlowContainer>

            <SearchButton
              onPress={() => setShowSearchInput((prevState) => !prevState)}
            >
              <MagnifyingGlassIcon size={20} color={theme.colors.primary} />
            </SearchButton>

            <HideDataButton onPress={() => handleHideData()}>
              {!hideAmount ? (
                <EyeSlashIcon size={20} color={theme.colors.primary} />
              ) : (
                <EyeIcon size={20} color={theme.colors.primary} />
              )}
            </HideDataButton>
          </Header>

          <ChartContainer>
            <LineChart
              key={chartData.length}
              data={chartData.map((item) => ({ value: item.total }))}
              xAxisLabelTexts={chartData.map((item) => item.date)}
              width={GRAPH_WIDTH}
              height={128}
              noOfSections={5}
              mostNegativeValue={0}
              xAxisColor={theme.colors.xAxisColor}
              yAxisColor={theme.colors.xAxisColor}
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
                color: theme.colors.xAxisLabel,
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

                if (Number.isNaN(value)) return s;
                const k = Math.floor(value / 1000);
                return k > 0 ? `${k}k` : '0';
              }}
              yAxisTextStyle={{ fontSize: 11, color: theme.colors.xAxisLabel }}
              verticalLinesColor={theme.colors.xAxisColor}
              rulesThickness={1}
              rulesColor={theme.colors.chartRule}
              color1={theme.colors.primary}
              dataPointsColor1={theme.colors.primary}
              startFillColor1={theme.colors.primary}
              startOpacity={0.6}
              endOpacity={0.1}
              isAnimated
              animationDuration={1000}
              animateOnDataChange
              scrollToEnd
            />
          </ChartContainer>
        </HeaderContainer>

        {showSearchInput && (
          <SearchBar control={control} onClear={() => reset()} />
        )}

        <AccountsContainer>
          {/** ACCOUNTS */}
          <FlatList
            style={{ flex: 1 }}
            data={filteredAccountsListData}
            keyExtractor={(item) =>
              item.kind === 'institution'
                ? `institution-${item.data.id}`
                : String(item.data.id)
            }
            renderItem={({
              item,
              index,
            }: _renderAccountsListItemProps) =>
              renderAccountsListItem({ item, index })}
            refreshControl={
              <RefreshControl
                refreshing={isRefetchingTransactions || isRefetchingAccounts}
                onRefresh={() => handleRefresh()}
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
                <SortFilterButton
                  selectedOption={sortingOption}
                  onSelect={(option: typeof sortingOption) =>
                    handleSelectSorting(option)}
                />
              </SectionTitleAndFilterContainer>
            }
            ListFooterComponent={
              /** CREDIT CARDS */
              filteredCreditCardAccounts.length > 0 ? (
                <>
                  <SectionTitle>Cartões de crédito</SectionTitle>
                  <FlatList
                    data={filteredCreditCardAccounts}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }: _renderItemProps) =>
                      renderItem({ item, index })}
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
                        onRefresh={() => handleRefresh()}
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
            ListEmptyComponent={() => renderEmpty()}
          />

          {/** SCREEN FOOTER */}
          <Footer bottomTabHeight={Platform.OS === 'ios' ? bottomTabHeight - 32 : bottomTabHeight - 32}>
            <ButtonGroup>
              <AddAccountButton
                icon='card'
                title='Integrações Bancárias'
                onPress={() => handleTouchConnectAccount()}
              />
            </ButtonGroup>

            <ButtonGroup>
              <AddAccountButton
                icon='wallet'
                title='Criar Conta Manual'
                onPress={() => handleOpenRegisterAccountModal()}
              />
            </ButtonGroup>
          </Footer>
        </AccountsContainer>

        <ModalView
          bottomSheetRef={registerAccountBottomSheetRef}
          snapPoints={['75%']}
          closeModal={() => handleCloseRegisterAccountModal()}
          title='Criar Conta Manual'
        >
          <RegisterAccount
            id=''
            closeAccount={() => handleCloseRegisterAccountModal()}
          />
        </ModalView>
      </Container>
    </Screen>
  );
}
