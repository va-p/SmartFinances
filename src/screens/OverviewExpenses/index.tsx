import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  ScrollContent,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  PieChartContainer
} from './styles';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { addMonths, subMonths, format } from 'date-fns';
import { useTheme } from 'styled-components';
import { VictoryPie } from 'victory-native';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';

import { CategoryProps, ColorProps, IconProps } from '@components/CategoryListItem';
import { SkeletonOverviewScreen } from '@components/SkeletonOverviewScreen';
import { TransactionProps } from '@components/TransactionListItem';
import { HistoryCard } from '@components/HistoryCard';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import smartFinancesChartTheme from '@themes/smartFinancesChartTheme';

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

export function OverviewExpenses() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [expenses, setExpenses] = useState<TransactionProps[]>([]);
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
    } catch (error) {
      console.error(error);
      Alert.alert("Categorias", "Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.");
    } finally {
      setLoading(false);
    };
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
        .filter((transaction: TransactionProps) =>
          transaction.type == 'debit'
        );
      setExpenses(expenses);

      /**
       * Expenses by Selected Month - Start
       */
      const expensesBySelectedMonth = transactions
        .filter((transaction: TransactionProps) =>
          transaction.type === 'debit' &&
          new Date(transaction.created_at).getMonth() === selectedDate.getMonth() &&
          new Date(transaction.created_at).getFullYear() === selectedDate.getFullYear()
        );
      const expensesTotalBySelectedMonth = expensesBySelectedMonth
        .reduce((acc: number, expense: TransactionProps) => {
          return acc += Number(expense.amount);
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

          const percent = `${(categorySum / expensesTotalBySelectedMonth * 100).toFixed(2)}%`;

          totalExpensesByCategory.push({
            id: category.id,
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
    }
    catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    } finally {
      setLoading(false);
    };
  };

  function handleCategoryOnPress(id: string) {
    setCategorySelected(prev => prev === id ? '' : id);
  };

  useFocusEffect(useCallback(() => {
    fetchCategories();
    fetchTransactions();
  }, [selectedDate]));

  if (loading) {
    return <SkeletonOverviewScreen />
  }

  return (
    <Container>
      <MonthSelect>
        <MonthSelectButton onPress={() => handleDateChange('prev')}>
          <MonthSelectIcon name='chevron-back' />
        </MonthSelectButton>

        <Month>
          {format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}
        </Month>

        <MonthSelectButton onPress={() => handleDateChange('next')}>
          <MonthSelectIcon name='chevron-forward' />
        </MonthSelectButton>
      </MonthSelect>

      <ScrollContent
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: useBottomTabBarHeight(),
        }}
      >
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
            theme={smartFinancesChartTheme}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: 'bold',
                fill: theme.colors.primary
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
      </ScrollContent>
    </Container>
  )
}