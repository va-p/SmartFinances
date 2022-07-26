import React, { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month
} from './styles';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { addMonths, subMonths, format } from 'date-fns';
import { useTheme } from 'styled-components';
import { VictoryPie } from 'victory-native';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';

import { CategoryProps, ColorProps, IconProps } from '@components/CategoryListItem';
import { TransactionProps } from '@components/TransactionListItem';
import { HistoryCard } from '@components/HistoryCard';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import {
  COLLECTION_TRANSACTIONS
} from '@configs/database';

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

export function Charts() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const tenantId = useSelector(selectUserTenantId);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

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
      } const expenses = data
        .filter((expense: TransactionProps) =>
          expense.type == 'outcome' &&
        new Date(expense.created_at).getMonth() === selectedDate.getMonth() &&
        new Date(expense.created_at).getFullYear() === selectedDate.getFullYear()
        );

      const expensesTotal = expenses
        .reduce((acumullator: number, expense: TransactionProps) => {
          return acumullator + Number(expense.amount);
        }, 0);

      const totalByCategory: CategoryData[] = [];

      categories.forEach(category => {
        let categorySum = 0;

        expenses.forEach((expense: TransactionProps) => {
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

          const percent = `${(categorySum / expensesTotal * 100).toFixed(0)}%`;

          totalByCategory.push({
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

      setTotalByCategories(totalByCategory);
      setLoading(false);
    }
    catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  useFocusEffect(useCallback(() => {
    fetchTransactions();
    fetchCategories();
  }, [selectedDate]));

  /*useEffect(() => {
    fetchCategories();
  }, []);*/

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header title='Despesas por categoria' />

      <Content
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: useBottomTabBarHeight(),
        }}
      >

        <MonthSelect>
          <MonthSelectButton onPress={() => handleDateChange('prev')}>
            <MonthSelectIcon name="chevron-left" />
          </MonthSelectButton>

          <Month>
            {format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}
          </Month>

          <MonthSelectButton onPress={() => handleDateChange('next')}>
            <MonthSelectIcon name="chevron-right" />
          </MonthSelectButton>
        </MonthSelect>


        <ChartContainer>
          <VictoryPie
            data={totalByCategories}
            colorScale={totalByCategories.map(category => category.color.hex)}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: 'bold',
                fill: theme.colors.shape
              }
            }}
            labelRadius={50}
            x="percent"
            y="total"
          />
        </ChartContainer>

        {
          totalByCategories.map(item => (
            <HistoryCard
              key={item.id}
              title={item.name}
              amount={item.totalFormatted}
              color={item.color.hex}
            />
          ))
        }
      </Content>
    </Container>
  )
}