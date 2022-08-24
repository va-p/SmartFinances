import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Content,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  PieChartContainer
} from './styles';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { VictoryPie, VictoryTooltip } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { addMonths, subMonths, format } from 'date-fns';
import { useTheme } from 'styled-components';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';

import { CategoryProps, ColorProps, IconProps } from '@components/CategoryListItem';
import { TransactionProps } from '@components/TransactionListItem';
import { HistoryCard } from '@components/HistoryCard';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

interface CategoryData {
  id: string;
  created_at: string;
  name: string;
  icon: IconProps;
  color: ColorProps;
  tenant_id: string;
  total: number;
  totalFormatted: string;
  percent: string;
}

interface MonthData {
  //created_at: string;
  monthName: string;
  monthFormatted: number;
  //yearFormatted: number;
  totalExpensesFormatted: string;
  totalRevenuesFormatted: string;
}

export function Charts() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [expenses, setExpenses] = useState<TransactionProps[]>([]);
  const [revenues, setRevenues] = useState<TransactionProps[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalExpensesByCategories, setTotalExpensesByCategories] = useState<CategoryData[]>([]);
  const [categorySelected, setCategorySelected] = useState('');

  const theme = useTheme();

  function handleDateChange(action: 'next' | 'prev'): void {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  async function fetchCategories() {
    setLoading(true);

    try {
      const { data } = await api.get('category', {
        params: {
          tenant_id: tenantId
        }
      });

      if (!data) {
      } else {
        setCategories(data);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Categorias", "Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  async function fetchTransactions() {
    setLoading(true);

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      })
      if (!data) {
      } else {
        setTransactions(data);
      }

      const expenses = transactions
        .filter((expense: TransactionProps) =>
          expense.type == 'outcome'
        );
      setExpenses(expenses);

      const revenues = transactions
        .filter((revenue: TransactionProps) => {
          revenue.type == 'income'
        });
      setRevenues(revenues);

      /**
       * Expenses by Selected Month - Start
       */
      const expensesBySelectedMonth = transactions
        .filter((expense: TransactionProps) =>
          expense.type == 'outcome' &&
          new Date(expense.created_at).getMonth() === selectedDate.getMonth() &&
          new Date(expense.created_at).getFullYear() === selectedDate.getFullYear()
        );
      const expensesTotalBySelectedMonth = expensesBySelectedMonth
        .reduce((acc: number, expense: TransactionProps) => {
          return acc + Number(expense.amount);
        }, 0);
      /**
       * Expenses by Selected Month - End
       */

      /**
       * Expenses by Category - Start
       */
      const totalExpensesByCategory: CategoryData[] = [];

      categories.forEach(category => {
        let categorySum = 0;

        expensesBySelectedMonth.forEach((expense: TransactionProps) => {
          if (expense.category.id === category.id) {
            categorySum += Number(expense.amount);
          }
        });

        if (categorySum > 0) {
          const totalFormatted = categorySum
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })

          const percent = `${(categorySum / expensesTotalBySelectedMonth * 100).toFixed(0)}%`;

          totalExpensesByCategory.push({
            id: category.id,
            created_at: category.created_at,
            name: category.name,
            icon: category.icon,
            color: category.color,
            tenant_id: category.tenant_id,
            total: categorySum,
            totalFormatted,
            percent
          });
        }
      });

      setTotalExpensesByCategories(totalExpensesByCategory);
      /**
       * Expenses by Category - End
       */

      /**
       * Revenues by Selected Month - Start
       */
      const revenuesBySelectedMonth = transactions
        .filter((revenue: TransactionProps) =>
          revenue.type == 'outcome' &&
          new Date(revenue.created_at).getMonth() === selectedDate.getMonth() &&
          new Date(revenue.created_at).getFullYear() === selectedDate.getFullYear()
        );
      const revenuesTotalBySelectedMonth = revenuesBySelectedMonth
        .reduce((acc: number, revenue: TransactionProps) => {
          return acc + Number(revenue.amount);
        }, 0);
      /**
       * Revenues by Selected Month - End
       */

      //const dateTest = new Date(1658411143409).getMonth();
      //console.log();
      setLoading(false);
    }
    catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleCategoryOnPress(id: string) {
    setCategorySelected(prev => prev === id ? '' : id);
  }

  useFocusEffect(useCallback(() => {
    fetchTransactions();
    fetchCategories();
  }, [selectedDate]));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header type='secondary' title='Resumo' />

      <Content
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: useBottomTabBarHeight(),
        }}
      >

        <MonthSelect>
          <MonthSelectButton onPress={() => handleDateChange('prev')}>
            <MonthSelectIcon name="chevron-back" />
          </MonthSelectButton>

          <Month>
            {format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}
          </Month>

          <MonthSelectButton onPress={() => handleDateChange('next')}>
            <MonthSelectIcon name="chevron-forward" />
          </MonthSelectButton>
        </MonthSelect>

        <PieChartContainer>
          <VictoryPie
            data={totalExpensesByCategories}
            colorScale={totalExpensesByCategories.map(category => category.color.hex)}
            x='percent'
            y='total'
            innerRadius={80}
            animate={{
              duration: 2000,
              easing: 'backOut'
            }}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: 'bold',
                fill: theme.colors.secondary
              },
              data: {
                fillOpacity: ({ datum }) => (datum.id === categorySelected || categorySelected === '') ? 1 : 0.2,
                stroke: ({ datum }) => datum.id === categorySelected ? datum.color.hex : 'none',
                strokeOpacity: 0.5,
                strokeWidth: 10
              }
            }}
            labelRadius={50}
          />
        </PieChartContainer>

        {
          totalExpensesByCategories.map(item => (
            <HistoryCard
              key={item.id}
              icon={item.icon.name}
              name={item.name}
              amount={item.totalFormatted}
              color={item.color.hex}
              onPress={() => handleCategoryOnPress(item.id)}
            />
          ))
        }
      </Content>
    </Container>
  )
}