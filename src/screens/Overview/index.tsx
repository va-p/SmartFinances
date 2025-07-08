import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Text } from 'react-native';
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

import { useTransactions } from '@hooks/useTransactions';
import { useAccountsQuery } from '@hooks/useAccountsQuery';
import { useCategoriesQuery } from '@hooks/useCategoriesQuery';

import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import generateYAxisLabelsTotalAssetsChart from '@utils/generateYAxisLabelsForLineChart';

import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { Text as SvgText } from 'react-native-svg';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';

import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { HistoryCard } from '@components/HistoryCard';
import { FilterButton } from '@components/FilterButton';
import { TabButtons, TabButtonType } from '@components/TabButtons';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

import { ChartPeriodSelect, PeriodProps } from '@screens/ChartPeriodSelect';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';

import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';

import theme from '@themes/theme';
import { RefreshControl } from 'react-native';

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

export function Overview({ navigation }: any) {
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

  const [selectedTabCashFlowSection, setSelectedTabCashFlowSection] =
    useState<CustomTab>(CustomTab.Tab1);
  const [selectedTabCategoriesSection, setSelectedTabCategoriesSection] =
    useState<CustomTab>(CustomTab.Tab1);

  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const { selectedPeriod, selectedDate } = useSelectedPeriod();
  const [chartPeriodSelected, setChartPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months',
  });

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions,
  } = useTransactions(userID);
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isRefetching: isRefetchingAccounts,
  } = useAccountsQuery(userID);
  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories,
  } = useCategoriesQuery(userID);

  const processedData = useMemo(() => {
    if (!transactions || !accounts || !categories) {
      return {
        totalAssets: 0,
        patrimonialEvolution: [],
        revenuesByCategory: [],
        expensesByCategory: [],
      };
    }

    // calculateTotalAssets ---
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
    let totalsByMonths: any = {};
    let accumulatedTotal = new Decimal(0);
    for (const transaction of transactions) {
      if (new Date(transaction.created_at) <= new Date()) {
        const ym = format(transaction.created_at, `yyyy-MM`, { locale: ptBR });
        if (!totalsByMonths.hasOwnProperty(ym)) {
          totalsByMonths[ym] = { date: ym, total: new Decimal(0) };
        }
        const transactionAmountBRL =
          transaction.amount_in_account_currency ?? transaction.amount;
        if (
          transaction.type === 'TRANSFER_CREDIT' ||
          transaction.type === 'TRANSFER_DEBIT'
        )
          continue;
        if (transaction.account.type === 'CREDIT') {
          totalsByMonths[ym].total =
            totalsByMonths[ym].total.minus(transactionAmountBRL);
        } else {
          totalsByMonths[ym].total =
            totalsByMonths[ym].total.plus(transactionAmountBRL);
        }
      }
    }
    const sortedMonths = Object.keys(totalsByMonths).sort(
      (a, b) =>
        parse(a, 'yyyy-MM', new Date()).getTime() -
        parse(b, 'yyyy-MM', new Date()).getTime()
    );
    const patrimonialEvolution = sortedMonths.map((monthYear) => {
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

    // --- calculateTransactionsByCategories ---
    const transactionsBySelectedMonth = transactions.filter(
      (t) =>
        new Date(t.created_at).getMonth() === selectedDate.getMonth() &&
        new Date(t.created_at).getFullYear() === selectedDate.getFullYear()
    );

    const calculateTotals = (type: 'DEBIT' | 'CREDIT'): CategoryData[] => {
      const totalsByCategory: CategoryData[] = [];
      let totalAmountByMonth = new Decimal(0);
      transactionsBySelectedMonth
        .filter((t) => t.type === type)
        .forEach((t) => {
          totalAmountByMonth = totalAmountByMonth.plus(
            new Decimal(t.amount_in_account_currency ?? t.amount).abs()
          );
        });

      for (const category of categories) {
        let categorySum = new Decimal(0);
        transactionsBySelectedMonth
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
            (Math.abs(Number(categorySum)) / Number(totalAmountByMonth)) *
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

    // All data calculated
    return {
      totalAssets,
      patrimonialEvolution,
      revenuesByCategory,
      expensesByCategory,
    };
  }, [transactions, accounts, categories, selectedDate]);

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
    navigation.navigate('Transações Por Categoria', { id });
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
                title={`Por ${chartPeriodSelected.name}`}
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
                yAxisLabelTexts={generateYAxisLabelsTotalAssetsChart(
                  processedData.patrimonialEvolution
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
                    focusOnPress
                    textColor='black'
                    showExternalLabels
                    externalLabelComponent={(item) => (
                      <SvgText>{item?.text}</SvgText>
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
                      value: item.total * -1,
                      color: item.color.color_code,
                      text: item.percent,
                    }))}
                    donut
                    radius={140}
                    focusOnPress
                    textColor='black'
                    showExternalLabels
                    externalLabelComponent={(item) => (
                      <SvgText>{item?.text}</SvgText>
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
              period={chartPeriodSelected}
              closeSelectPeriod={handleClosePeriodSelectedModal}
            />
          </ModalViewSelection>
        </ScrollContent>
      </Container>
    </Screen>
  );
}
