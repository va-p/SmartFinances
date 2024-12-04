import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions } from 'react-native';
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

import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';

import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryPie,
  VictoryZoomContainer,
} from 'victory-native';
import { ptBR } from 'date-fns/locale';
import { LineChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  format,
  parse,
  parseISO,
  getMonth,
  subMonths,
  addMonths,
  subYears,
  addYears,
} from 'date-fns';
import { RFValue } from 'react-native-responsive-fontsize';

import { Header } from '@components/Header';
import { ChartSelectButton } from '@components/ChartSelectButton';
import { TabButtons, TabButtonType } from '@components/TabButtons';
import { ModalViewSelection } from '@components/ModalViewSelection';

import { CashFLowData } from '@screens/Home';
import { TotalByMonths } from '@screens/Accounts';
import { ChartPeriodSelect, PeriodProps } from '@screens/ChartPeriodSelect';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';

import theme from '@themes/theme';
import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';

import { TransactionProps } from '@interfaces/transactions';
import { CategoryProps, ColorProps, IconProps } from '@interfaces/categories';

import api from '@api/api';
import { HistoryCard } from '@components/HistoryCard';

export enum CustomTab {
  Tab1,
  Tab2,
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HORIZONTAL_PADDING = 32;
const GRAPH_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2;

interface CategoryData {
  id: string;
  name: string;
  icon: IconProps;
  color: ColorProps;
  tenant_id: string;
  total: number;
  totalFormatted: string;
  percent: string;
}

export function Overview({ navigation }: any) {
  const { tenantId } = useUser();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const { btcQuoteBrl, eurQuoteBrl, usdQuoteBrl } = useQuotes();

  const [selectedTabCashFlowSection, setSelectedTabCashFlowSection] =
    useState<CustomTab>(CustomTab.Tab1);
  const [selectedTabCategoriesSection, setSelectedTabCategoriesSection] =
    useState<CustomTab>(CustomTab.Tab1);

  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const [chartPeriodSelected, setChartPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months',
  });
  const periodFormat =
    chartPeriodSelected.period === 'months' ? 'yyyy-MM' : 'yyyy';
  const [totalRevenues, setTotalRevenues] = useState('R$ 0,00');
  const [totalExpenses, setTotalExpenses] = useState('R$ 0,00');
  const [total, setTotal] = useState('R$0');
  const [cashFlowBySelectedPeriod, setCashFlowBySelectedPeriod] = useState<
    CashFLowData[]
  >([
    {
      date: new Date(),
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0,
      total: 0,
      cashFlow: 'R$ 0,00',
    },
  ]);
  const [
    currentCashFlowTotalBySelectedPeriod,
    setCurrentCashFlowTotalBySelectedPeriod,
  ] = useState<CashFLowData>({
    date: new Date(),
    totalRevenuesByPeriod: 0,
    totalExpensesByPeriod: 0,
    total: 0,
    cashFlow: 'R$ 0,00',
  });

  const [totalExpensesByCategories, setTotalExpensesByCategories] = useState<
    CategoryData[]
  >([]);
  const [totalRevenuesByCategories, setTotalRevenuesByCategories] = useState<
    CategoryData[]
  >([]);
  const CashFlowSectionButtons: TabButtonType[] = [
    {
      title: total,
      description: 'Patrimônio Total',
    },
    {
      title: cashFlowBySelectedPeriod[0].cashFlow
        ? cashFlowBySelectedPeriod[0].cashFlow
        : 'R$ 0,00',
      description: 'Fluxo de Caixa',
    },
  ];
  const categoriesSectionButtons: TabButtonType[] = [
    {
      title: totalExpenses,
      description: 'Despesas',
    },
    {
      title: totalRevenues,
      description: 'Receitas',
    },
  ];

  function calculateCashFlowsBySelectedPeriod(
    transactions: TransactionProps[]
  ): CashFLowData[] {
    const cashFlows: { [key: string]: CashFLowData } = {};

    for (const item of transactions) {
      if (new Date(item.created_at) <= new Date()) {
        if (chartPeriodSelected.period === 'all') {
          const allHistoryCashFlow: CashFLowData = {
            date: 'Todo o \n histórico',
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0,
            total: 0,
            cashFlow: 'R$ 0,00',
          };

          for (const item of transactions) {
            if (new Date(item.created_at) < new Date()) {
              if (item.type === 'credit') {
                allHistoryCashFlow.totalRevenuesByPeriod = parseFloat(
                  (
                    allHistoryCashFlow.totalRevenuesByPeriod + item.amount
                  ).toFixed(2)
                ); // Arredonda e converte para número
              } else if (item.type === 'debit') {
                allHistoryCashFlow.totalExpensesByPeriod = parseFloat(
                  (
                    allHistoryCashFlow.totalExpensesByPeriod + item.amount
                  ).toFixed(2)
                ); // Arredonda e converte para número
              }
            }
          }

          allHistoryCashFlow.total = parseFloat(
            (
              allHistoryCashFlow.totalRevenuesByPeriod -
              allHistoryCashFlow.totalExpensesByPeriod
            ).toFixed(2)
          );

          allHistoryCashFlow.cashFlow = formatCurrency(
            'BRL',
            allHistoryCashFlow.totalRevenuesByPeriod -
              allHistoryCashFlow.totalExpensesByPeriod,
            false
          );

          return [allHistoryCashFlow];
        }

        const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });

        if (!cashFlows.hasOwnProperty(ym)) {
          cashFlows[ym] = {
            date: format(parseISO(String(ym)), `MMM '\n' yyyy`, {
              locale: ptBR,
            }),
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0,
            total: 0,
            cashFlow: 'R$ 0,00',
          };
        }

        switch (item.type) {
          case 'credit':
            cashFlows[ym].totalRevenuesByPeriod = parseFloat(
              (cashFlows[ym].totalRevenuesByPeriod + item.amount).toFixed(2)
            );
            break;
          case 'debit':
            cashFlows[ym].totalExpensesByPeriod = parseFloat(
              (cashFlows[ym].totalExpensesByPeriod + item.amount).toFixed(2)
            );
            break;
        }

        cashFlows[ym].cashFlow = formatCurrency(
          'BRL',
          cashFlows[ym].totalRevenuesByPeriod -
            cashFlows[ym].totalExpensesByPeriod,
          false
        );
      }
    }

    const cashFlowsArray: CashFLowData[] = Object.values(cashFlows);

    let total = 0;
    for (let i = cashFlowsArray.length - 1; i >= 0; i--) {
      total += parseFloat(
        (
          cashFlowsArray[i].totalRevenuesByPeriod -
          cashFlowsArray[i].totalExpensesByPeriod
        ).toFixed(2)
      );
      cashFlowsArray[i].total = total;
    }

    const sortedcashFlows = cashFlowsArray.sort((a, b) => {
      const dateA = parse(String(a.date), periodFormat, new Date());
      const dateB = parse(String(b.date), periodFormat, new Date());
      return dateA.getTime() - dateB.getTime();
    });

    return sortedcashFlows;
  }

  function calculateTotalAndCashFlow(data: TransactionProps[]): {
    total: string;
    cashFlowsBySelectedPeriod: CashFLowData[];
  } {
    let totalRevenuesBRL = 0;
    let totalExpensesBRL = 0;

    for (const item of data) {
      if (new Date(item.created_at) <= new Date()) {
        switch (item.account.currency.code) {
          case 'BRL':
            switch (item.type) {
              case 'credit':
              case 'transferCredit':
                totalRevenuesBRL += item.amount;
                break;
              case 'debit':
              case 'transferDebit':
                totalExpensesBRL += item.amount;
                break;
            }
            break;
          case 'BTC':
            switch (item.type) {
              case 'credit':
              case 'transferCredit':
                totalRevenuesBRL += item.amount * btcQuoteBrl.price;
                break;
              case 'debit':
              case 'transferDebit':
                totalExpensesBRL += item.amount * btcQuoteBrl.price;
                break;
            }
          case 'USD':
            switch (item.type) {
              case 'credit':
              case 'transferCredit':
                totalRevenuesBRL += item.amount * usdQuoteBrl.price;
                break;
              case 'debit':
              case 'transferDebit':
                totalExpensesBRL += item.amount * usdQuoteBrl.price;
                break;
            }
            break;
        }
      }
    }

    const totalBRL = totalRevenuesBRL - totalExpensesBRL;
    const totalFormattedPtbr = Number(totalBRL).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    // Calcula fluxos de caixa por período selecionado
    const cashFlowsBySelectedPeriod = calculateCashFlowsBySelectedPeriod(data);

    return {
      total: totalFormattedPtbr,
      cashFlowsBySelectedPeriod,
    };
  }

  async function fetchCategories(tenantId: string): Promise<CategoryProps[]> {
    try {
      const { data } = await api.get('category', {
        params: {
          tenant_id: tenantId,
        },
      });
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  function filterTransactionsByMonth(selectedPeriod: Date) {
    return (transaction: TransactionProps) =>
      new Date(transaction.created_at).getMonth() ===
        selectedPeriod.getMonth() &&
      new Date(transaction.created_at).getFullYear() ===
        selectedPeriod.getFullYear();
  }

  function calculateTotalsByCategory(
    categories: CategoryProps[],
    transactions: TransactionProps[],
    transactionType: 'debit' | 'credit'
  ): CategoryData[] {
    const totalsByCategory: CategoryData[] = [];
    const totalAmountByMonth = transactions.reduce((sum, transaction) => {
      if (transaction.type === transactionType) {
        return sum + Number(transaction.amount);
      }
      return sum;
    }, 0);

    categories.forEach((category) => {
      const categoryTransactions = transactions.filter(
        (transaction) =>
          transaction.category.id === category.id &&
          transaction.type === transactionType
      );

      const categorySum = categoryTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
      );

      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const percent = `${((categorySum / totalAmountByMonth) * 100).toFixed(
          2
        )}%`;

        totalsByCategory.push({
          ...category,
          total: categorySum,
          totalFormatted,
          percent,
        });
      }
    });

    return totalsByCategory;
  }

  async function calculateTransactionsByCategories(
    transactionsData: TransactionProps[]
  ) {
    try {
      const categories: CategoryProps[] = await fetchCategories(tenantId); // Busca as categorias

      const transactionsBySelectedMonth = transactionsData.filter(
        filterTransactionsByMonth(selectedPeriod)
      );

      const expensesByCategory = calculateTotalsByCategory(
        categories,
        transactionsBySelectedMonth,
        'debit'
      );

      const revenuesByCategory = calculateTotalsByCategory(
        categories,
        transactionsBySelectedMonth,
        'credit'
      );

      return { expensesByCategory, revenuesByCategory };
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categorias',
        'Não foi possível buscar as categorias ou calcular os totais.'
      );
    }
  }

  async function fetchDataForCharts() {
    try {
      const data: TransactionProps[] = await getTransactions(tenantId);

      let totalExpensesBRL = 0;
      let totalRevenuesBRL = 0;

      const transactionsBySelectedMonth = data.filter(
        filterTransactionsByMonth(selectedPeriod)
      );

      for (const transaction of transactionsBySelectedMonth) {
        if (transaction.type === 'debit') {
          totalExpensesBRL += transaction.amount;
        } else if (transaction.type === 'credit') {
          totalRevenuesBRL += transaction.amount;
        }
      }

      setTotalExpenses(formatCurrency('BRL', totalExpensesBRL * -1, false));
      setTotalRevenues(formatCurrency('BRL', totalRevenuesBRL, false));

      // 1. Dados para o gráfico de patrimônio total e fluxo de caixa (Contas e Home)
      const totalAndCashFlowData = calculateTotalAndCashFlow(data);
      console.warn(
        'totalAndCashFlowData.cashFlowsBySelectedPeriod ==>',
        totalAndCashFlowData.cashFlowsBySelectedPeriod
      );
      setTotal(totalAndCashFlowData.total);
      setCashFlowBySelectedPeriod(
        totalAndCashFlowData.cashFlowsBySelectedPeriod
      );
      setCurrentCashFlowTotalBySelectedPeriod(
        totalAndCashFlowData.cashFlowsBySelectedPeriod[0]
      );

      //2. Dados para o gráfico de despesas por categoria
      const res = await calculateTransactionsByCategories(data);
      setTotalExpensesByCategories(res!.expensesByCategory);
      setTotalRevenuesByCategories(res!.revenuesByCategory);

      return { totalAndCashFlowData };
    } catch (error) {
      console.error('fetchDataForCharts =>', error);
      Alert.alert('Erro', 'Falha ao buscar dados. Verifique sua conexão.');
      throw error;
    }
  }

  function handleDateChange(action: 'prev' | 'next'): void {
    switch (chartPeriodSelected.period) {
      case 'months':
        switch (action) {
          case 'prev':
            setSelectedPeriod(subMonths(selectedPeriod, 1));
            break;
          case 'next':
            setSelectedPeriod(addMonths(selectedPeriod, 1));
            break;
        }
        break;
      case 'years':
        switch (action) {
          case 'prev':
            setSelectedPeriod(subYears(selectedPeriod, 1));
            break;
          case 'next':
            setSelectedPeriod(addYears(selectedPeriod, 1));
            break;
        }
        break;
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

  useEffect(() => {
    fetchDataForCharts();
  }, [
    selectedPeriod,
    chartPeriodSelected.period,
    selectedTabCashFlowSection,
    selectedTabCategoriesSection,
  ]);

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
          buttons={CashFlowSectionButtons}
          selectedTab={selectedTabCashFlowSection}
          setSelectedTab={setSelectedTabCashFlowSection}
        />

        {/* Total Amount Chart */}
        {selectedTabCashFlowSection === 0 && (
          <ChartContainer>
            <LineChart
              data={cashFlowBySelectedPeriod
                .map((item) => {
                  return { value: item.total };
                })
                .reverse()}
              xAxisLabelTexts={cashFlowBySelectedPeriod
                .map((item) => {
                  return String(item.date);
                })
                .reverse()}
              height={180}
              width={GRAPH_WIDTH}
              xAxisColor='#455A64'
              yAxisColor='#455A64'
              areaChart
              curved
              showVerticalLines
              verticalLinesUptoDataPoint
              initialSpacing={16}
              endSpacing={0}
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
        )}

        {/* CashFlow Chart */}
        {selectedTabCashFlowSection === 1 && (
          <ChartContainer>
            <VictoryChart
              height={200}
              padding={{ top: 16, right: 40, bottom: 32, left: 56 }}
              theme={smartFinancesChartTheme}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(tick) => formatCurrency('BRL', tick, false)}
              />
              <VictoryAxis tickFormat={(tick) => tick} />
              <VictoryGroup offset={16}>
                <VictoryBar
                  data={[currentCashFlowTotalBySelectedPeriod]}
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
                    onEnter: { duration: 3000 },
                    easing: 'backOut',
                  }}
                />
                <VictoryBar
                  data={[currentCashFlowTotalBySelectedPeriod]}
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
                    onLoad: { duration: 3000 },
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
              innerRadius={80}
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
              innerRadius={80}
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
