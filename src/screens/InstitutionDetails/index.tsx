import React, { useMemo, useState } from 'react';
import { SectionList, RefreshControl, FlatList, useWindowDimensions } from 'react-native';
import {
  Container,
  SummaryContainer,
  TotalBalance,
  TotalBalanceDescription,
  AccountsList,
  SectionTitle,
  SeeAllButton,
  SeeAllText,
} from './styles';

// Hooks
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import {
  filterInvestmentGroups,
  filterSectionsByQuery,
} from '@utils/filterSectionsByQuery';
import {
  InvestmentAccount,
  InvestmentGroup,
  groupInvestments,
} from '@utils/groupInvestments';

// Dependencies
import Decimal from 'decimal.js';
import { useTheme } from 'styled-components';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

// Icons
import { BankIcon } from 'phosphor-react-native/src/icons/Bank';
import { WalletIcon } from 'phosphor-react-native/src/icons/Wallet';
import { CreditCardIcon } from 'phosphor-react-native/src/icons/CreditCard';
import { CurrencyBtcIcon } from 'phosphor-react-native/src/icons/CurrencyBtc';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { AccountListItem } from '@components/AccountListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { SearchBar } from '@components/SearchBar';

// Stores
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';
import { useCurrentInstitutionSelected } from '@stores/currentInstitutionSelectedStorage';

// Interfaces
import { AccountProps, AccountTypes } from '@interfaces/accounts';
import { ThemeProps } from '@interfaces/theme';
import { CreditCardListItem } from '@components/CreditCardListItem';
import { InvestmentGroupListItem } from '@components/InvestmentGroupListItem';

type SectionKey =
  | 'CHECKING'
  | 'SAVINGS'
  | 'INVESTMENTS'
  | 'WALLET'
  | 'CRYPTO'
  | 'CREDIT';

const SECTION_TITLES: Record<SectionKey, string> = {
  CHECKING: 'Contas',
  SAVINGS: 'Poupança',
  INVESTMENTS: 'Investimentos',
  WALLET: 'Carteira',
  CRYPTO: 'Criptomoedas',
  CREDIT: 'Cartões de Crédito',
};

// Section order per AC14.4 — omit empty sections
const SECTION_ORDER: SectionKey[] = [
  'CHECKING',
  'SAVINGS',
  'INVESTMENTS',
  'WALLET',
  'CRYPTO',
  'CREDIT',
];

function getSectionKey(account: AccountProps): SectionKey {
  if (account.type === 'CREDIT' || account.subtype === 'CREDIT_CARD') {
    return 'CREDIT';
  }
  if (account.subtype === 'SAVINGS_ACCOUNT') {
    return 'SAVINGS';
  }
  if (account.subtype === 'CHECKING_ACCOUNT') {
    return 'CHECKING';
  }
  if (account.type === 'INVESTMENTS') {
    return 'INVESTMENTS';
  }
  if (account.type === 'CRYPTOCURRENCY_WALLET') {
    return 'CRYPTO';
  }
  if (account.type === 'BANK') {
    // Older BANK accounts without a subtype fall back to the checking bucket
    return 'CHECKING';
  }
  // WALLET and OTHER both fall back to the "Carteira" bucket, mirroring the
  // shared Wallet icon already used for both types on the main Accounts list
  return 'WALLET';
}

/**
 * URL-safe id for a group key (INV-03). Keys only ever contain
 * uppercase alphanumerics and `|` (see buildInvestmentGroupKey), so
 * swapping the separator keeps the id injective and readable. The
 * full key travels in the store payload; the id is never reversed.
 */
function groupRouteId(key: string): string {
  return `group:${key.replace(/\|/g, '-')}`;
}

function isInvestmentGroup(item: unknown): item is InvestmentGroup {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as InvestmentGroup).members !== undefined
  );
}

function EmptyList() {
  return <ListEmptyComponent text='Nenhuma conta encontrada nesta instituição' />;
}
export function InstitutionDetails() {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const bottomTabHeight = useBottomTabBarHeight();
  const { institutionId, institutionName } = useCurrentInstitutionSelected();
  const { hideAmount, baseCurrency } = useUserConfigs();

  // Search form (Home-screen pattern: query via react-hook-form)
  const [showSearchInput, setShowSearchInput] = useState(false);
  // Expanded (collapsible) investment group keys (INV-01, Q1).
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }
  const { control, watch, reset } = useForm();
  const searchQuery = watch('search', '');
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
    data: rawAccounts,
    isLoading,
    isRefetching,
    refetch,
  } = useAccountsQuery();

  const processedData = useMemo(() => {
    if (!rawAccounts) {
      return {
        totalBalanceFormatted: formatCurrency(baseCurrency.code, 0, false),
        sections: [],
        baseById: new Map<number, number>(),
      };
    }

    // Filters the already-fetched accounts cache client-side by institution
    // (AC14.3) — no new network round-trip.
    const institutionAccounts = rawAccounts.filter(
      (account: AccountProps) =>
        !account.hide && account.institution?.id === institutionId
    );

    function buildProcessedAccount(
      account: AccountProps,
      accountBalanceConvertedToBase: number
    ) {
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
      };
    }

    let totalBalance = new Decimal(0);
    const accountsBySection = new Map<
      SectionKey,
      ReturnType<typeof buildProcessedAccount>[]
    >();
    // Numeric base-currency balance per account id for group headers.
    // Processed balances are formatted strings, so the grouping sum
    // reads from this lookup instead (same conversion path as totals).
    const baseById = new Map<number, number>();

    institutionAccounts.forEach((account) => {
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

      const processedAccount = buildProcessedAccount(
        account,
        accountBalanceConvertedToBase
      );

      baseById.set(Number(account.id), accountBalanceConvertedToBase);

      // Non-credit-card total, matching T20's institution card aggregation
      // (AC13.3) — recomputed here from the filtered list to avoid staleness
      // (design.md §7 "InstitutionDetails staleness").
      if (account.type !== 'CREDIT' && account.subtype !== 'CREDIT_CARD') {
        totalBalance = totalBalance.plus(accountBalanceConvertedToBase);
      }

      const sectionKey = getSectionKey(account);
      const sectionAccounts = accountsBySection.get(sectionKey);
      if (sectionAccounts) {
        sectionAccounts.push(processedAccount);
      } else {
        accountsBySection.set(sectionKey, [processedAccount]);
      }
    });

    const sections = SECTION_ORDER.filter((key) =>
      accountsBySection.has(key)
    ).map((key) => ({
      title: SECTION_TITLES[key],
      data: accountsBySection.get(key) ?? [],
    }));

    return {
      totalBalanceFormatted: formatCurrency(
        baseCurrency.code,
        totalBalance.toNumber(),
        false
      ),
      sections,
      baseById,
    };
  }, [
    rawAccounts,
    institutionId,
    baseCurrency.code,
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
  ]);

  const { totalBalanceFormatted, sections, baseById } = processedData;

  // Account filtering with search
  const filteredSections = useMemo(
    () => filterSectionsByQuery(sections, searchQuery, (account) => account.name),
    [sections, searchQuery]
  );

  // Same-product investment groups, always derived from the unfiltered
  // list so header sums and counts stay stable; the query narrows by
  // whole group (INV-08). The API payload carries investmentData at
  // runtime (T1); the cast keeps AccountProps untouched until widened.
  const visibleInvestmentGroups = useMemo(() => {
    const investments = sections.find(
      (section) => section.title === SECTION_TITLES.INVESTMENTS
    );
    if (!investments) {
      return [];
    }
    const members = investments.data as unknown as InvestmentAccount[];
    const allGroups = groupInvestments(
      members,
      (account) => baseById.get(Number(account.id)) ?? 0
    );
    return filterInvestmentGroups(allGroups, searchQuery);
  }, [sections, searchQuery, baseById]);

  // INVESTMENTS renders from the whole-group match (INV-08), never from
  // the name-filtered leftovers: singletons keep rendering exactly as
  // today, other sections are byte-identical, order follows SECTION_ORDER.
  const displaySections = useMemo(() => {
    const byTitle = new Map(
      filteredSections.map((section) => [section.title, section])
    );
    const ordered: { title: string; data: AccountProps[] }[] = [];
    SECTION_ORDER.forEach((key) => {
      const title = SECTION_TITLES[key];
      if (title === SECTION_TITLES.INVESTMENTS) {
        if (visibleInvestmentGroups.length > 0) {
          ordered.push({
            title,
            data: visibleInvestmentGroups.flatMap<
              InvestmentGroup | InvestmentAccount
            >((group) =>
              group.count > 1 ? [group] : group.members
            ) as unknown as AccountProps[],
          });
        }
        return;
      }
      const section = byTitle.get(title);
      if (section) {
        ordered.push(section);
      }
    });
    return ordered;
  }, [filteredSections, visibleInvestmentGroups]);

  // Credit card carousel: sorted alphabetically by name,
  // a flat sort, no sub-grouping or headers.
  const creditCardAccounts = useMemo(() => sections
    .filter(
      (section) =>
        !section.data.isVirtual &&
          section.data.type === 'CREDIT' &&
          section.data.subtype === 'CREDIT_CARD'
    )
    .sort((a, b) => {
      const nameA = a.data?.name;
      const nameB = b.data?.name;

      if (nameA && nameB) {
        const institutionComparison =
            nameA.localeCompare(nameB);
        if (institutionComparison !== 0) return institutionComparison;
      } else if (nameA && !nameB) {
        return -1;
      } else if (!nameA && nameB) {
        return 1;
      }

      return a.data.name.localeCompare(b.data.name);
    }), [sections]);

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

  // Navigates to the existing Account screen, exactly as handleOpenAccount
  // does on the main Accounts screen (AC14.5)
  function handleOpenAccount(account: AccountProps) {
    useCurrentAccountSelected.setState(() => ({
      accountId: String(account.id),
      accountName: account.name,
      accountType: account.type,
      accountSubType: account.subtype || null,
      accountCurrency: account.currency,
      accountBalance: String(account.balance),
      accountCreditData: account.creditData || null,
      // Opening a single account always exits group mode (INV-03).
      accountGroupKey: null,
      accountGroupMemberIds: null,
    }));
    router.navigate({
      pathname: '/accounts/[accountId]',
      params: { id: String(account.id) },
    });
  }

  // Opens a group like any normal account (INV-03): the Account screen
  // renders the member list in group mode (T6).
  function handleOpenGroup(group: InvestmentGroup) {
    const routeId = groupRouteId(group.key);
    useCurrentAccountSelected.setState(() => ({
      accountId: routeId,
      accountName: group.label,
      accountType: 'INVESTMENTS',
      accountSubType: null,
      accountCurrency: baseCurrency,
      accountBalance: String(group.totalBalanceBase),
      accountCreditData: null,
      accountGroupKey: group.key,
      accountGroupMemberIds: group.members.map((member) =>
        String(member.id)
      ),
    }));
    router.navigate({
      pathname: '/accounts/[accountId]',
      params: { id: routeId },
    });
  }

  type _renderItemProps = {
    item: AccountProps;
    index: number;
  };
  type _renderInvestmentGroupProps = {
    group: InvestmentGroup;
    index: number;
  };
  function renderInvestmentGroup({
    group,
    index,
  }: _renderInvestmentGroupProps) {
    const expanded = expandedGroups.has(group.key);
    const preview = expanded ? group.members.slice(0, 3) : [];
    return (
      <>
        <InvestmentGroupListItem
          data={group}
          index={index}
          currencyCode={baseCurrency.code}
          hideAmount={hideAmount}
          expanded={expanded}
          testID={`investment-group-${group.key}`}
          onPress={() => toggleGroup(group.key)}
        />
        {preview.map((member, memberIndex) => (
          <AccountListItem
            key={String(member.id)}
            data={member}
            index={memberIndex}
            icon={getAccountIcon(member.type)}
            hideAmount={hideAmount}
            testID={`investment-group-member-${member.id}`}
            onPress={() => handleOpenAccount(member)}
          />
        ))}
        {expanded && (
          <SeeAllButton
            testID="investment-group-see-all"
            onPress={() => handleOpenGroup(group)}
          >
            <SeeAllText>
              Ver todas as {group.count} contas
            </SeeAllText>
          </SeeAllButton>
        )}
      </>
    );
  }
  function renderItem({ item, index }: _renderItemProps) {
    if (isInvestmentGroup(item)) {
      return renderInvestmentGroup({ group: item, index });
    }
    if (item.type !== 'CREDIT' && item.subtype !== 'CREDIT_CARD') {
      return (
        <AccountListItem
          data={item}
          index={index}
          icon={getAccountIcon(item.type)}
          hideAmount={hideAmount}
          testID={`account-row-${item.id}`}
          onPress={() => handleOpenAccount(item)}
        />
      );
    }

    if (item.type === 'CREDIT' && item.subtype === 'CREDIT_CARD') {
      return (
        <CreditCardListItem
          data={item}
          index={index}
          hideAmount={hideAmount}
          onPress={() => handleOpenAccount(item)}
        />
      );
    }

    return null;
  }

  if (isLoading) {
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

        <Header.Root>
          <Header.BackButton />
          <Header.Title title={institutionName || 'Instituição'} />
          <Header.SearchButton
            testID="institution-search-button"
            onPress={() => setShowSearchInput((prevState) => !prevState)}
          />
        </Header.Root>

        <SummaryContainer>
          <TotalBalance>
            {!hideAmount ? totalBalanceFormatted : '•••••'}
          </TotalBalance>
          <TotalBalanceDescription>
            Patrimônio na instituição
          </TotalBalanceDescription>
        </SummaryContainer>

        {showSearchInput && (
          <SearchBar
            control={control}
            onClear={() => reset()}
            style={{ marginHorizontal: 0 }}
          />
        )}

        <AccountsList>
          <SectionList
            sections={displaySections}
            keyExtractor={(item) =>
              String(
                (item as unknown as InvestmentGroup).key ?? item.id
              )
            }
            renderItem={({ item, index }: _renderItemProps) =>
              renderItem({ item, index })}
            renderSectionHeader={({ section }) => (
              <SectionTitle>{section.title}</SectionTitle>
            )}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListFooterComponent={
              /** CREDIT CARDS */
              creditCardAccounts.length > 0 ? (
                <>
                  <SectionTitle>Cartões de crédito</SectionTitle>
                  <FlatList
                    data={creditCardAccounts}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }: _renderItemProps) =>
                      renderItem({ item, index })}
                    snapToOffsets={[
                      ...Array(creditCardAccounts.length),
                    ].map(
                      (x, i) => i * (SCREEN_WIDTH * 0.8 - 32) + (i - 1) * 32
                    )}
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
            ListEmptyComponent={EmptyList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottomTabHeight + 16,
            }}
            stickySectionHeadersEnabled={false}
          />
        </AccountsList>
      </Container>
    </Screen>
  );
}
