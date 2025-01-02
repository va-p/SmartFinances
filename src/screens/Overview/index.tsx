import React, { useEffect, useRef, useState } from 'react';
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
import { HistoryCard } from '@components/HistoryCard';
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
import Decimal from 'decimal.js';
import getAccounts from '@utils/getAccounts';
import { AccountProps } from '@interfaces/accounts';
import { convertCurrency } from '@utils/convertCurrency';

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
  const { tenantId: tenantID, id: userID } = useUser();
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
  const [total, setTotal] = useState('R$ 0,00');
  const [cashFlowsBySelectedPeriod, setCashFlowsBySelectedPeriod] = useState<
    any[]
  >([
    {
      date: String(new Date()),
      // total: 'R$ 0,00',
      total: 0,
      // cashFlow: 'R$ 0,00',
    },
  ]);
  const [
    currentCashFlowTotalBySelectedPeriod,
    setCurrentCashFlowTotalBySelectedPeriod,
  ] = useState({
    date: String(new Date()),
    total: 'R$ 0,00',
    // cashFlow: 'R$ 0,00',
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
      title: currentCashFlowTotalBySelectedPeriod.total
        ? currentCashFlowTotalBySelectedPeriod.total
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
  ) {
    for (const item of transactions) {
      if (new Date(item.created_at) <= new Date()) {
        if (chartPeriodSelected.period === 'all') {
          const allHistoryCashFlow: CashFLowData = {
            date: 'Todo o \n histórico',
            totalRevenuesByPeriod: new Decimal(0),
            totalExpensesByPeriod: new Decimal(0),
            total: new Decimal(0),
            cashFlow: 'R$ 0,00',
          };

          for (const item of transactions) {
            if (new Date(item.created_at) < new Date()) {
              // Credit card
              if (
                item.account.type === 'CREDIT' &&
                item.type !== 'TRANSFER_CREDIT' &&
                item.type !== 'TRANSFER_DEBIT'
              ) {
                allHistoryCashFlow.totalRevenuesByPeriod.minus(item.amount); // Créditos no cartão de crédito DIMINUEM o saldo devedor
              }
              // Other account types
              if (
                item.account.type !== 'CREDIT' &&
                item.type !== 'TRANSFER_CREDIT' &&
                item.type !== 'TRANSFER_DEBIT'
              ) {
                allHistoryCashFlow.totalExpensesByPeriod.plus(item.amount); // Débitos no cartão de crédito AUMENTAM o saldo devedor
              }
            }
          }

          allHistoryCashFlow.total =
            allHistoryCashFlow.totalRevenuesByPeriod.minus(
              allHistoryCashFlow.totalExpensesByPeriod
            );

          allHistoryCashFlow.cashFlow = formatCurrency(
            'BRL',
            allHistoryCashFlow.total.toNumber(),
            false
          );

          return [allHistoryCashFlow];
        }

        /**
         * Totals Grouped By Months - Start
         */
        let totalsByMonths: any = [];

        for (const transaction of transactions) {
          const ym = format(transaction.created_at, `yyyy-MM`, {
            locale: ptBR,
          });
          if (!totalsByMonths.hasOwnProperty(ym)) {
            // refatorar

            totalsByMonths.push({
              date: ym,
              // totalRevenuesByPeriod: new Decimal(0),
              // totalExpensesByPeriod: new Decimal(0),
              total: new Decimal(0), // Inicializa com Decimal
            });
          }

          const transactionAmountBRL = transaction.amount_in_account_currency
            ? transaction.amount_in_account_currency
            : transaction.amount;

          // Credit card
          if (
            transaction.account.type === 'CREDIT' &&
            transaction.type !== 'TRANSFER_CREDIT' &&
            transaction.type !== 'TRANSFER_DEBIT'
          ) {
            totalsByMonths[ym].total =
              totalsByMonths[ym].total.minus(transactionAmountBRL); // Créditos no cartão de crédito DIMINUEM o saldo devedor
          }
          // Other account types
          if (
            transaction.account.type !== 'CREDIT' &&
            transaction.type !== 'TRANSFER_CREDIT' &&
            transaction.type !== 'TRANSFER_DEBIT'
          ) {
            totalsByMonths[ym].total =
              totalsByMonths[ym].total.plus(transactionAmountBRL); // Débitos no cartão de crédito AUMENTAM o saldo devedor
          }
        }

        console.log('totalsByMonths ====>', totalsByMonths);

        setCashFlowsBySelectedPeriod(totalsByMonths);

        const formattedTotalByMonths = Object.values(totalsByMonths).map(
          (monthData: any) => ({
            date: format(
              parse(`${monthData.date}-01`, 'yyyy-MM-dd', new Date()),
              "MMM '\n' yyyy"
            ),
            total: formatCurrency('BRL', Number(monthData.total), false),
          })
        );
        setCurrentCashFlowTotalBySelectedPeriod(formattedTotalByMonths[0]);
        return formattedTotalByMonths;
        /**
         * Totals Grouped By Months - End
         */
      }
    }
  }

  async function fetchCategories(tenantID: string): Promise<CategoryProps[]> {
    try {
      const { data } = await api.get('category', {
        params: {
          tenant_id: tenantID,
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
    transactionType: 'DEBIT' | 'CREDIT'
  ): CategoryData[] {
    const totalsByCategory: CategoryData[] = [];
    const totalAmountByMonth = transactions.reduce((sum, transaction) => {
      if (transaction.type === transactionType) {
        // Credit card
        if (transaction.account.type === 'CREDIT') {
          return (sum -= Number(transaction.amount)); // Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
        }
        // Other account types
        else {
          return (sum += Number(transaction.amount));
        }
      }
      return sum;
    }, 0);

    categories.forEach((category) => {
      const categoryTransactions = transactions.filter(
        (transaction) =>
          transaction.category.id === category.id &&
          transaction.type === transactionType
      );

      const categorySum = categoryTransactions.reduce((sum, transaction) => {
        if (transaction.account.type === 'CREDIT') {
          return (sum -= Number(transaction.amount)); // Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
        }
        // Other account types
        else {
          return (sum += Number(transaction.amount));
        }
      }, 0);

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
      const categories: CategoryProps[] = await fetchCategories(userID); // Busca as categorias

      const transactionsBySelectedMonth = transactionsData.filter(
        filterTransactionsByMonth(selectedPeriod)
      );

      const expensesByCategory = calculateTotalsByCategory(
        categories,
        transactionsBySelectedMonth,
        'DEBIT'
      );
      const revenuesByCategory = calculateTotalsByCategory(
        categories,
        transactionsBySelectedMonth,
        'CREDIT'
      );

      setTotalExpensesByCategories(expensesByCategory);
      setTotalRevenuesByCategories(revenuesByCategory);

      return { expensesByCategory, revenuesByCategory };
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categorias',
        'Não foi possível buscar as categorias ou calcular os totais.'
      );
    }
  }

  async function calculateTotalAssets(transactions: TransactionProps[]) {
    let totalExpensesBRL = new Decimal(0);
    let totalRevenuesBRL = new Decimal(0);

    const transactionsBySelectedMonth = transactions.filter(
      filterTransactionsByMonth(selectedPeriod)
    );

    for (const transaction of transactionsBySelectedMonth) {
      const transactionAmountBRL = transaction.amount_in_account_currency
        ? transaction.amount_in_account_currency
        : transaction.amount;

      // Credit card
      if (
        transaction.account.type === 'CREDIT' &&
        transaction.type === 'CREDIT'
      ) {
        totalRevenuesBRL.minus(transactionAmountBRL); // Lógica invertida para Cartão de Crédito
      }
      if (
        transaction.account.type === 'CREDIT' &&
        transaction.type === 'DEBIT'
      ) {
        totalExpensesBRL.plus(transactionAmountBRL); // Lógica invertida para Cartão de Crédito
      }

      // Other account types
      if (
        transaction.account.type !== 'CREDIT' &&
        transaction.type === 'CREDIT'
      ) {
        totalRevenuesBRL.plus(transactionAmountBRL);
      }
      if (
        transaction.account.type !== 'CREDIT' &&
        transaction.type === 'DEBIT'
      ) {
        totalExpensesBRL.minus(transactionAmountBRL);
      }
    }

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

        setTotalRevenues(
          formatCurrency('BRL', totalRevenuesBRL.toNumber(), false)
        );
        setTotalExpenses(
          formatCurrency('BRL', totalExpensesBRL.toNumber(), false)
        );
        setTotal(formatCurrency('BRL', totalAccountsBalance, false));
      }
    }
  }

  async function fetchDataForCharts() {
    try {
      setLoading(true);
      const data: TransactionProps[] = await getTransactions(userID);

      // 1. Valores de Receitas e Despesas e valor de patrimônio total
      await calculateTotalAssets(data);

      // 2. Valores para o gráfico de fluxos de caixa
      calculateCashFlowsBySelectedPeriod(data);

      //3. Dados para o gráfico de despesas por categoria
      await calculateTransactionsByCategories(data);
    } catch (error) {
      console.error('fetchDataForCharts =>', error);
      Alert.alert('Erro', 'Falha ao buscar dados. Verifique sua conexão.');
      throw error;
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Container>
        <Text style={{ color: theme.colors.text }}>Carregando...</Text>
      </Container>
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
          buttons={CashFlowSectionButtons}
          selectedTab={selectedTabCashFlowSection}
          setSelectedTab={setSelectedTabCashFlowSection}
        />

        {/* Total Amount Chart */}
        {selectedTabCashFlowSection === 0 && (
          <ChartContainer>
            <LineChart
              data={cashFlowsBySelectedPeriod
                .map((item) => {
                  console.log('item ====>', item);

                  return { value: item.total };
                })
                .reverse()}
              xAxisLabelTexts={cashFlowsBySelectedPeriod
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
