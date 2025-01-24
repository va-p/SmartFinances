import React, { useCallback, useRef, useState } from 'react';
import { Alert, Dimensions, Text } from 'react-native';
import {
  Container,
  CashFlowSection,
  CategoriesSection,
  SectionTitle,
  FiltersContainer,
  FilterButtonGroup,
  CategoriesContainer,
  ChartContainer,
} from './styles';

import getAccounts from '@utils/getAccounts';
import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import { convertCurrency } from '@utils/convertCurrency';
import generateYAxisLabelsTotalAssetsChart from '@utils/generateYAxisLabelsForLineChart';

import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryPie,
} from 'victory-native';
import Decimal from 'decimal.js';
import { ptBR } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';

import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { HistoryCard } from '@components/HistoryCard';
import { ChartSelectButton } from '@components/ChartSelectButton';
import { TabButtons, TabButtonType } from '@components/TabButtons';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

import { CashFLowData } from '@screens/Home';
import { ChartPeriodSelect, PeriodProps } from '@screens/ChartPeriodSelect';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';

import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';
import { TransactionProps } from '@interfaces/transactions';

import api from '@api/api';

import theme from '@themes/theme';
import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HORIZONTAL_PADDING = 80;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING;

export enum CustomTab {
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
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

  const [total, setTotal] = useState('R$ 0,00');
  const [
    patrimonialEvolutionBySelectedPeriod,
    setPatrimonialEvolutionBySelectedPeriod,
  ] = useState<any[]>([
    {
      date: String(new Date()),
      total: 0,
    },
  ]);

  const [totalExpensesByCategories, setTotalExpensesByCategories] = useState<
    CategoryData[]
  >([]);
  const [totalRevenuesByCategories, setTotalRevenuesByCategories] = useState<
    CategoryData[]
  >([]);

  async function calculateTotalAssets() {
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

        totalAccountsBalance += accountBalanceConvertedToBRL;

        setTotal(formatCurrency('BRL', totalAccountsBalance, false));
      }
    }
  }

  function calculatePatrimonialEvolution(transactions: TransactionProps[]) {
    if (chartPeriodSelected.period === 'all') {
      let allHistoryCashFlow: CashFLowData = {
        date: 'Todo o \n histórico',
        totalRevenuesByPeriod: new Decimal(0),
        totalExpensesByPeriod: new Decimal(0),
        total: new Decimal(0),
      };

      let allHistoryTotal = new Decimal(0);

      for (const item of transactions) {
        if (new Date(item.created_at) > new Date()) continue;

        const amount = new Decimal(item.amount);
        let transactionValue = new Decimal(0);

        if (item.account.type === 'CREDIT') {
          if (item.type === 'CREDIT') {
            allHistoryCashFlow.totalRevenuesByPeriod =
              allHistoryCashFlow.totalRevenuesByPeriod.minus(amount); // Lógica invertida para Cartão de Crédito
          } else if (item.type === 'DEBIT') {
            allHistoryCashFlow.totalExpensesByPeriod =
              allHistoryCashFlow.totalExpensesByPeriod.plus(amount); // Lógica invertida para Cartão de Crédito
          }
        } else {
          // Outras contas
          if (item.type === 'CREDIT') {
            allHistoryCashFlow.totalRevenuesByPeriod =
              allHistoryCashFlow.totalRevenuesByPeriod.plus(amount);
          } else if (item.type === 'DEBIT') {
            allHistoryCashFlow.totalExpensesByPeriod =
              allHistoryCashFlow.totalExpensesByPeriod.minus(amount);
          }
        }

        allHistoryTotal = allHistoryTotal.plus(transactionValue);
      }

      setPatrimonialEvolutionBySelectedPeriod([allHistoryCashFlow]);
    }

    /**
     * Totals Grouped By Months - Start
     */
    let totalsByMonths: any = {};
    let accumulatedTotal = new Decimal(0);

    for (const transaction of transactions) {
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

        const transactionAmountBRL = transaction.amount_in_account_currency
          ? transaction.amount_in_account_currency
          : transaction.amount; // TODO: Considerar outrar moedas

        if (
          transaction.type === 'TRANSFER_CREDIT' ||
          transaction.type === 'TRANSFER_DEBIT'
        ) {
          continue;
        }

        if (transaction.account.type === 'CREDIT') {
          totalsByMonths[ym].total =
            totalsByMonths[ym].total.minus(transactionAmountBRL); // Credit card - less
        } else {
          totalsByMonths[ym].total =
            totalsByMonths[ym].total.plus(transactionAmountBRL); // Others accounts - more
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

    setPatrimonialEvolutionBySelectedPeriod(formattedTotalByMonths);
    /**
     * Totals Grouped By Months - End
     */
    return;
  }

  async function fetchCategories(): Promise<CategoryProps[]> {
    try {
      const { data } = await api.get('category', {
        params: {
          user_id: userID,
        },
      });
      return data || [];
    } catch (error) {
      console.error(
        'Erro ao buscar categorias:',
        error,
        'Por favor, tente novamente.'
      );
      return [];
    }
  }

  function filterTransactionsByMonth() {
    return (transaction: TransactionProps) =>
      new Date(transaction.created_at).getMonth() === selectedDate.getMonth() &&
      new Date(transaction.created_at).getFullYear() ===
        selectedDate.getFullYear();
  }

  function calculateTotalsByCategory(
    categories: CategoryProps[],
    transactions: TransactionProps[],
    transactionType: 'DEBIT' | 'CREDIT'
  ): CategoryData[] {
    const totalsByCategory: CategoryData[] = [];
    let totalAmountByMonth = new Decimal(0);

    for (const transaction of transactions) {
      if (transaction.type !== transactionType) {
        continue;
      }

      const transactionAmountBRL = new Decimal(
        transaction.amount_in_account_currency || transaction.amount
      ); // TODO: Considerar contas de outras moedas!!!

      totalAmountByMonth = totalAmountByMonth.plus(transactionAmountBRL.abs());
    }

    for (const category of categories) {
      let categorySum = new Decimal(0);

      for (const transaction of transactions) {
        if (
          transaction.category.id !== category.id ||
          transaction.type !== transactionType
        ) {
          continue;
        }

        const transactionAmountBRL = new Decimal(
          transaction.amount_in_account_currency || transaction.amount
        ); // TODO: Considerar contas de outras moedas!!!

        if (transaction.account.type === 'CREDIT') {
          categorySum = categorySum.minus(transactionAmountBRL); // Cartão de crédito - less
        } else {
          categorySum = categorySum.plus(transactionAmountBRL); // Outras contas - more
        }
      }

      if (!categorySum.isZero()) {
        const percent = `${(
          (Number(categorySum) / Number(totalAmountByMonth)) *
          100
        ).toFixed(2)}%`;

        const totalFormatted = formatCurrency(
          'BRL',
          categorySum.toNumber(),
          false,
          true
        );

        totalsByCategory.push({
          ...category,
          total: Number(categorySum) * -1,
          totalFormatted,
          percent,
        });
      }
    }

    return totalsByCategory;
  }

  async function calculateTransactionsByCategories(
    transactionsData: TransactionProps[]
  ) {
    try {
      const categories: CategoryProps[] = await fetchCategories();

      const transactionsBySelectedMonth = transactionsData.filter(
        filterTransactionsByMonth()
      );

      const revenuesByCategory = calculateTotalsByCategory(
        categories,
        transactionsBySelectedMonth,
        'CREDIT'
      );
      const expensesByCategory = calculateTotalsByCategory(
        categories,
        transactionsBySelectedMonth,
        'DEBIT'
      );

      setTotalRevenuesByCategories(revenuesByCategory);
      setTotalExpensesByCategories(expensesByCategory);

      return { expensesByCategory, revenuesByCategory };
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categorias',
        'Não foi possível buscar as categorias ou calcular os totais.'
      );
    }
  }

  function calculateExpensesAndRevenuesByCategory(
    type: 'Despesas' | 'Receitas'
  ) {
    let categorySum = 0;
    if (type === 'Despesas') {
      for (const categoryData of totalExpensesByCategories) {
        categorySum -= categoryData.total;
      }
    }

    if (type === 'Receitas') {
      for (const categoryData of totalRevenuesByCategories) {
        categorySum -= categoryData.total;
      }
    }
    return categorySum;
  }

  async function fetchDataForCharts() {
    try {
      setLoading(true);
      const data: TransactionProps[] = await getTransactions(userID);

      // 1. Patrmônio total - OK
      await calculateTotalAssets();

      // 2. Valores para o gráfico de evolução patrimonial - OK
      calculatePatrimonialEvolution(data);

      //3. Dados para os gráficos de despesas e receitas por categoria - NOok
      await calculateTransactionsByCategories(data);
    } catch (error) {
      console.error('fetchDataForCharts =>', error);
      Alert.alert('Erro', 'Falha ao buscar dados. Verifique sua conexão.');
      throw error;
    } finally {
      setLoading(false);
    }
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

  useFocusEffect(
    useCallback(() => {
      fetchDataForCharts();
    }, [selectedPeriod, chartPeriodSelected.period])
  );

  const curRevenues = calculateExpensesAndRevenuesByCategory('Receitas');
  const curExpenses = calculateExpensesAndRevenuesByCategory('Despesas') * -1;
  const cashFlow = {
    date: format(selectedDate, 'MMMM/yyyy', { locale: ptBR }),
    totalRevenuesByPeriod: curRevenues,
    totalExpensesByPeriod: curExpenses,
    total: curRevenues - curExpenses,
  };

  const cashFlowSectionButtons: TabButtonType[] = [
    {
      title: total,
      description: 'Patrimônio Total',
    },
    {
      title: formatCurrency('BRL', Number(cashFlow.total), false, true),

      description: 'Fluxo de Caixa atual',
    },
  ];
  const categoriesSectionButtons: TabButtonType[] = [
    {
      title: formatCurrency(
        'BRL',
        calculateExpensesAndRevenuesByCategory('Despesas'),
        false,
        true
      ),
      description: 'Despesas',
    },
    {
      title: formatCurrency(
        'BRL',
        calculateExpensesAndRevenuesByCategory('Receitas'),
        false,
        true
      ),
      description: 'Receitas',
    },
  ];

  if (loading) {
    return (
      <>
        <Gradient />

        <Text
          style={{
            textAlign: 'center',
            color: theme.colors.text,
          }}
        >
          Carregando...
        </Text>
      </>
    );
  }

  return (
    <Container>
      <Header.Root>
        <Header.Title title={'Resumo'} />
      </Header.Root>

      <FiltersContainer>
        <FilterButtonGroup>
          <ChartSelectButton
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
          <ChartContainer>
            <LineChart
              key={patrimonialEvolutionBySelectedPeriod.length}
              data={patrimonialEvolutionBySelectedPeriod.map((item) => {
                return { value: item.total };
              })}
              xAxisLabelTexts={patrimonialEvolutionBySelectedPeriod.map(
                (item) => {
                  return String(item.date);
                }
              )}
              yAxisLabelTexts={generateYAxisLabelsTotalAssetsChart(
                patrimonialEvolutionBySelectedPeriod
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
          </ChartContainer>
        )}

        {/* CashFlow Chart */}
        {selectedTabCashFlowSection === 1 && (
          <ChartContainer>
            <VictoryChart
              height={200}
              padding={{ top: 16, right: 40, bottom: 32, left: 32 }}
              theme={smartFinancesChartTheme}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(tick) =>
                  tick.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    notation: 'compact',
                    compactDisplay: 'short',
                  })
                }
              />
              <VictoryAxis tickFormat={(tick) => tick} />
              <VictoryGroup offset={16}>
                <VictoryBar
                  data={[cashFlow]}
                  x='date'
                  y='totalRevenuesByPeriod'
                  sortKey='x'
                  sortOrder='descending'
                  alignment='middle'
                  style={{
                    data: {
                      width: 10,
                      fill: theme.colors.success_light,
                    },
                  }}
                  cornerRadius={{ top: 2, bottom: 2 }}
                  animate={{
                    onLoad: { duration: 2000 },
                    easing: 'backOut',
                  }}
                />
                <VictoryBar
                  data={[cashFlow]}
                  x='date'
                  y='totalExpensesByPeriod'
                  sortOrder='descending'
                  alignment='middle'
                  style={{
                    data: {
                      width: 10,
                      fill: theme.colors.attention_light,
                    },
                  }}
                  cornerRadius={{ top: 2, bottom: 2 }}
                  animate={{
                    onLoad: { duration: 2000 },
                    easing: 'backOut',
                  }}
                />
              </VictoryGroup>
            </VictoryChart>
          </ChartContainer>
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
            <VictoryPie
              data={totalExpensesByCategories}
              colorScale={totalExpensesByCategories.map(
                (category) => category.color.hex
              )}
              x='percent'
              y='total'
              width={384}
              innerRadius={60}
              labelRadius={150}
              animate={{
                duration: 2000,
                easing: 'backOut',
              }}
              theme={smartFinancesChartTheme}
              style={{
                labels: {
                  fontSize: RFValue(12),
                  fontWeight: 'bold',
                  fill: theme.colors.primary,
                },
                data: {
                  stroke: 'none',
                },
              }}
            />

            {totalExpensesByCategories.map((item) => (
              <HistoryCard
                key={item.id}
                icon={item.icon.name}
                name={item.name}
                amount={item.totalFormatted}
                color={item.color.hex}
                onPress={() => handleOpenCategory(item.id)}
              />
            ))}
          </CategoriesContainer>
        )}

        {selectedTabCategoriesSection === 1 && (
          <CategoriesContainer>
            <VictoryPie
              data={totalRevenuesByCategories}
              colorScale={totalRevenuesByCategories.map(
                (category) => category.color.hex
              )}
              x='percent'
              y='total'
              width={384}
              innerRadius={60}
              labelRadius={150}
              animate={{
                duration: 2000,
                easing: 'backOut',
              }}
              theme={smartFinancesChartTheme}
              style={{
                labels: {
                  fontSize: RFValue(12),
                  fontWeight: 'bold',
                  fill: theme.colors.primary,
                },
                data: {
                  stroke: 'none',
                },
              }}
            />

            {totalRevenuesByCategories.map((item) => (
              <HistoryCard
                key={item.id}
                icon={item.icon.name}
                name={item.name}
                amount={item.totalFormatted}
                color={item.color.hex}
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
          setPeriod={setChartPeriodSelected}
          closeSelectPeriod={handleClosePeriodSelectedModal}
        />
      </ModalViewSelection>
    </Container>
  );
}
