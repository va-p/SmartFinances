import React, { useMemo } from 'react';
import { SectionList, RefreshControl } from 'react-native';
import {
  Container,
  SummaryContainer,
  TotalBalance,
  TotalBalanceDescription,
  AccountsList,
  SectionTitle,
} from './styles';

// Hooks
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';

// Dependencies
import Decimal from 'decimal.js';
import { useTheme } from 'styled-components';
import { useRouter } from 'expo-router';

// Icons
import Bank from 'phosphor-react-native/src/icons/Bank';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import CreditCard from 'phosphor-react-native/src/icons/CreditCard';
import CurrencyBtc from 'phosphor-react-native/src/icons/CurrencyBtc';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { AccountListItem } from '@components/AccountListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';

// Stores
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';
import { useCurrentInstitutionSelected } from '@stores/currentInstitutionSelectedStorage';

// Interfaces
import { AccountProps, AccountTypes } from '@interfaces/accounts';
import { ThemeProps } from '@interfaces/theme';

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
  if (account.type === 'CRYPTOCURRENCY WALLET') {
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

export function InstitutionDetails() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const bottomTabHeight = useBottomTabBarHeight();
  const { institutionId, institutionName } = useCurrentInstitutionSelected();
  const { hideAmount } = useUserConfigs();
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
      return { totalBalanceFormatted: formatCurrency('BRL', 0, false), sections: [] };
    }

    // Filters the already-fetched accounts cache client-side by institution
    // (AC14.3) — no new network round-trip. Includes credit cards, unlike
    // the main Accounts screen list.
    const institutionAccounts = rawAccounts.filter(
      (account: AccountProps) =>
        !account.hide && account.institution?.id === institutionId
    );

    let totalBalance = new Decimal(0);
    const accountsBySection = new Map<
      SectionKey,
      ReturnType<typeof buildProcessedAccount>[]
    >();

    function buildProcessedAccount(
      account: AccountProps,
      accountBalanceConvertedToBRL: number
    ) {
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
      };
    }

    institutionAccounts.forEach((account) => {
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

      const processedAccount = buildProcessedAccount(
        account,
        accountBalanceConvertedToBRL
      );

      // Non-credit-card total, matching T20's institution card aggregation
      // (AC13.3) — recomputed here from the filtered list to avoid staleness
      // (design.md §7 "InstitutionDetails staleness").
      if (account.type !== 'CREDIT' && account.subtype !== 'CREDIT_CARD') {
        totalBalance = totalBalance.plus(accountBalanceConvertedToBRL);
      }

      const sectionKey = getSectionKey(account);
      if (!accountsBySection.has(sectionKey)) {
        accountsBySection.set(sectionKey, []);
      }
      accountsBySection.get(sectionKey)!.push(processedAccount);
    });

    const sections = SECTION_ORDER.filter((key) =>
      accountsBySection.has(key)
    ).map((key) => ({
      title: SECTION_TITLES[key],
      data: accountsBySection.get(key)!,
    }));

    return {
      totalBalanceFormatted: formatCurrency(
        'BRL',
        totalBalance.toNumber(),
        false
      ),
      sections,
    };
  }, [
    rawAccounts,
    institutionId,
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

  const { totalBalanceFormatted, sections } = processedData;

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
    }));
    router.navigate({
      pathname: '/accounts/[accountId]',
      params: { id: String(account.id) },
    });
  }

  type _renderItemProps = {
    item: AccountProps;
    index: number;
  };
  function _renderItem({ item, index }: _renderItemProps) {
    return (
      <AccountListItem
        data={item}
        index={index}
        icon={getAccountIcon(item.type)}
        hideAmount={hideAmount}
        onPress={() => handleOpenAccount(item)}
      />
    );
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
        </Header.Root>

        <SummaryContainer>
          <TotalBalance>
            {!hideAmount ? totalBalanceFormatted : '•••••'}
          </TotalBalance>
          <TotalBalanceDescription>
            Patrimônio na instituição
          </TotalBalanceDescription>
        </SummaryContainer>

        <AccountsList>
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            renderItem={_renderItem}
            renderSectionHeader={({ section }) => (
              <SectionTitle>{section.title}</SectionTitle>
            )}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListEmptyComponent={() => (
              <ListEmptyComponent text='Nenhuma conta encontrada nesta instituição' />
            )}
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
