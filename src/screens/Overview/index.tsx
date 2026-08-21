import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Text, RefreshControl } from 'react-native';
import {
  Container,
  ScrollContent,
  CashFlowSection,
  CategoriesSection,
  SectionTitle,
  FiltersContainer,
  FilterButtonGroup,
  CategoriesContainer,
  ChartContainer,
} from './styles';

// Hooks
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useCategoriesQuery } from '@hooks/useCategoriesQuery';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import { buildNetWorthEvolution } from '@utils/buildNetWorthEvolution';

// Dependencies
import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import { Text as SvgText } from 'react-native-svg';
import { format, getMonth, getYear } from 'date-fns';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { HistoryCard } from '@components/HistoryCard';
import { FilterButton } from '@components/FilterButton';
import { TabButtons, TabButtonType } from '@components/TabButtons';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

// Screens
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';

// Storages
import { useQuotes } from '@stores/quotesStorage';
import { useSelectedPeriod } from '@stores/selectedPeriodStorage';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HORIZONTAL_PADDING = 80;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING;

enum CustomTab {
  Tab1,
  Tab2,
}

interface CategoryData extends CategoryProps {
  total: number;
  totalFormatted: string;
  percent: string;
}

export function Overview() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
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

  const [selectedTabCashFlowSection, setSelectedTabCashFlowSection] =
    useState<CustomTab>(CustomTab.Tab1);
  const [selectedTabCategoriesSection, setSelectedTabCategoriesSection] =
    useState<CustomTab>(CustomTab.Tab1);

  const { selectedPeriod, selectedDate } = useSelectedPeriod();
  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions,
  } = useTransactionsQuery();
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isRefetching: isRefetchingAccounts,
  } = useAccountsQuery();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories,
  } = useCategoriesQuery();

  const processedData = useMemo(() => {
    if (!transactions || !accounts || !categories) {
      return {
        totalAssets: 0,
        patrimonialEvolution: [],
        revenuesByCategory: [],
        expensesByCategory: [],
      };
    }

    // --- calculateTotalAssets ---
    let totalAssets = 0;
    const filteredAccounts = accounts.filter(
      (account: AccountProps) => !account.hide
    );

    for (const account of filteredAccounts) {
      const convertedBalance = convertCurrency({
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

      totalAssets += convertedBalance;
    }

    // --- calculatePatrimonialEvolution ---
    const isInSelectedPeriod = (transactionDate: Date) => {
      switch (selectedPeriod.period) {
        case 'months':
          return (
            getMonth(transactionDate) === getMonth(selectedDate) &&
            getYear(transactionDate) === getYear(selectedDate)
          );
        case 'years':
          return getYear(transactionDate) === getYear(selectedDate);
        case 'all':
          return true;
      }
    };

    // --- calculateTransactionsByCategories ---
    const transactionsBySelectedPeriod = transactions.filter((t) => {
      const transactionDate = new Date(t.created_at);
      return isInSelectedPeriod(transactionDate);
    });

    const calculateTotals = (type: 'DEBIT' | 'CREDIT'): CategoryData[] => {
      const totalsByCategory: CategoryData[] = [];
      let totalAmountSelectedPeriod = new Decimal(0);
      transactionsBySelectedPeriod
        .filter((t) => t.type === type)
        .forEach((t) => {
          totalAmountSelectedPeriod = totalAmountSelectedPeriod.plus(
            new Decimal(t.amount_in_account_currency ?? t.amount).abs()
          );
        });

      for (const category of categories) {
        let categorySum = new Decimal(0);
        transactionsBySelectedPeriod
          .filter((t) => t.category.id === category.id && t.type === type)
          .forEach((t) => {
            const amount = new Decimal(
              t.amount_in_account_currency ?? t.amount
            );
            categorySum =
              t.account.type === 'CREDIT'
                ? categorySum.minus(amount)
                : categorySum.plus(amount);
          });

        if (!categorySum.isZero()) {
          const percent = `${(
            (Math.abs(Number(categorySum)) /
              Number(totalAmountSelectedPeriod)) *
            100
          ).toFixed(2)}%`;
          const totalFormatted = formatCurrency(
            'BRL',
            categorySum.toNumber(),
            false,
            true
          );
          const totalValue =
            categorySum.toNumber() * (type === 'DEBIT' ? -1 : 1);
          totalsByCategory.push({
            ...category,
            total: totalValue,
            totalFormatted,
            percent,
          });
        }
      }
      return totalsByCategory;
    };

    const revenuesByCategory = calculateTotals('CREDIT');
    const expensesByCategory = calculateTotals('DEBIT');

    // --- patrimonial evolution (net worth chart) ---
    // Extracted to a shared utility — same calculation as the Accounts
    // screen.  Seeds the accumulated total with totalAssets so the final
    // chart point equals the current net worth.
    const patrimonialEvolution = buildNetWorthEvolution({
      transactions,
      totalAssets,
      period: selectedPeriod.period,
    });

    return {
      totalAssets,
      patrimonialEvolution,
      revenuesByCategory,
      expensesByCategory,
    };
  }, [transactions, accounts, categories, selectedPeriod, selectedDate]);

  function handleRefresh() {
    refetchTransactions();
    refetchAccounts();
    refetchCategories();
  }

  function handleOpenPeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.present();
  }

  function handleClosePeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.dismiss();
  }

  function handleOpenCategory(id: string) {
    router.navigate({
      pathname: '/overview/[categoryId]',
      params: { categoryId: id, },
    });
  }

  const curRevenues = processedData.revenuesByCategory.reduce(
    (sum, cat) => sum + cat.total,
    0
  );
  const curExpenses = processedData.expensesByCategory.reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  const cashFlow = [
    {
      value: curRevenues,
      label: format(selectedDate, 'MMMM/yyyy', { locale: ptBR }),
      spacing: 2,
      labelWidth: 200,
      labelTextStyle: { color: 'gray' },
      frontColor: theme.colors.success_light,
    },
    { value: curExpenses, frontColor: theme.colors.attention_light },
  ];

  const cashFlowSectionButtons: TabButtonType[] = [
    {
      title: formatCurrency('BRL', processedData.totalAssets, false),
      description: 'Patrimônio Total',
    },
    {
      title: formatCurrency(
        'BRL',
        Number(curRevenues - curExpenses),
        false,
        true
      ),

      description: 'Fluxo de Caixa atual',
    },
  ];
  const categoriesSectionButtons: TabButtonType[] = [
    {
      title: formatCurrency('BRL', curExpenses, false, true),
      description: 'Despesas',
    },
    {
      title: formatCurrency('BRL', curRevenues, false, true),
      description: 'Receitas',
    },
  ];

  if (isLoadingTransactions || isLoadingAccounts || isLoadingCategories) {
    return (
      <Screen>
        <Gradient />
        <Text
          style={{
            textAlign: 'center',
            color: theme.colors.text,
            marginTop: 50,
          }}
        >
          Carregando...
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root style={{ justifyContent: 'center' }}>
          <Header.Title title={'Resumo'} />
        </Header.Root>

        <ScrollContent
          refreshControl={
            <RefreshControl
              refreshing={
                isRefetchingTransactions ||
                isRefetchingAccounts ||
                isRefetchingCategories
              }
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <FiltersContainer>
            <FilterButtonGroup>
              <FilterButton
                title={`Por ${selectedPeriod.name}`}
                onPress={handleOpenPeriodSelectedModal}
              />
            </FilterButtonGroup>
          </FiltersContainer>

          <CashFlowSection>
            <TabButtons
              buttons={cashFlowSectionButtons}
              selectedTab={selectedTabCashFlowSection}
              setSelectedTab={setSelectedTabCashFlowSection}
            />

            {/* Patrimonial Evolution */}
            {selectedTabCashFlowSection === 0 && (
              <LineChart
                key={processedData.patrimonialEvolution.length}
                data={processedData.patrimonialEvolution.map((item) => {
                  return { value: item.total };
                })}
                xAxisLabelTexts={processedData.patrimonialEvolution.map(
                  (item) => {
                    return String(item.date);
                  }
                )}
                width={GRAPH_WIDTH}
                height={180}
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
            )}

            {/* CashFlow Chart */}
            {selectedTabCashFlowSection === 1 && (
              <BarChart
                data={cashFlow}
                barWidth={8}
                spacing={104}
                roundedTop
                roundedBottom
                xAxisThickness={1}
                yAxisThickness={0}
                yAxisTextStyle={{ color: theme.colors.textPlaceholder }}
                noOfSections={4}
                formatYLabel={(label: string) => {
                  const value = Number(label);
                  const k = Math.floor(value / 1000);
                  return k > 0 ? `${k}k` : '0';
                }}
              />
            )}
          </CashFlowSection>

          <CategoriesSection>
            <SectionTitle>Categorias</SectionTitle>
            <TabButtons
              buttons={categoriesSectionButtons}
              selectedTab={selectedTabCategoriesSection}
              setSelectedTab={setSelectedTabCategoriesSection}
            />

            {selectedTabCategoriesSection === 0 && (
              <CategoriesContainer>
                <ChartContainer>
                  <PieChart
                    data={processedData.expensesByCategory.map((item) => ({
                      value: item.total,
                      color: item.color.color_code,
                      text: item.percent,
                    }))}
                    donut
                    radius={140}
                    innerCircleColor={theme.colors.backgroundNav}
                    focusOnPress
                    showExternalLabels
                    externalLabelComponent={(item) => (
                      <SvgText fill={theme.colors.text}>{item?.text}</SvgText>
                    )}
                    labelLineConfig={{
                      color: theme.colors.textPlaceholder,
                      thickness: 2,
                      length: 2,
                    }}
                  />
                </ChartContainer>

                {processedData.expensesByCategory.map((item) => (
                  <HistoryCard
                    key={item.id}
                    icon={item.icon.name}
                    name={item.name}
                    amount={item.totalFormatted}
                    color={item.color.color_code}
                    onPress={() => handleOpenCategory(item.id)}
                  />
                ))}
              </CategoriesContainer>
            )}

            {selectedTabCategoriesSection === 1 && (
              <CategoriesContainer>
                <ChartContainer>
                  <PieChart
                    data={processedData.revenuesByCategory.map((item) => ({
                      value: item.total,
                      color: item.color.color_code,
                      text: item.percent,
                    }))}
                    donut
                    radius={140}
                    innerCircleColor={theme.colors.backgroundNav}
                    focusOnPress
                    showExternalLabels
                    externalLabelComponent={(item) => (
                      <SvgText fill={theme.colors.text}>{item?.text}</SvgText>
                    )}
                    labelLineConfig={{
                      color: theme.colors.textPlaceholder,
                      thickness: 2,
                      length: 2,
                    }}
                  />
                </ChartContainer>

                {processedData.revenuesByCategory.map((item) => (
                  <HistoryCard
                    key={item.id}
                    icon={item.icon.name}
                    name={item.name}
                    amount={item.totalFormatted}
                    color={item.color.color_code}
                    onPress={() => handleOpenCategory(item.id)}
                  />
                ))}
              </CategoriesContainer>
            )}
          </CategoriesSection>

          <ModalViewSelection
            title='Selecione o período'
            bottomSheetRef={chartPeriodSelectedBottomSheetRef}
            snapPoints={['30%', '50%']}
          >
            <ChartPeriodSelect
              period={selectedPeriod}
              closeSelectPeriod={handleClosePeriodSelectedModal}
            />
          </ModalViewSelection>
        </ScrollContent>
      </Container>
    </Screen>
  );
}
