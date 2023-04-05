import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  ContentScroll,
  MonthSelect,
  MonthSelectButton,
  Month,
  PieChartContainer,
} from './styles';

import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect } from '@react-navigation/native';
import { addMonths, subMonths, format } from 'date-fns';
import { useTheme } from 'styled-components';
import { VictoryPie } from 'victory-native';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';

import {
  CategoryProps,
  ColorProps,
  IconProps,
} from '@components/CategoryListItem';
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

export function OverviewRevenues({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalRevenuesByCategories, setTotalRevenuesByCategories] = useState<
    CategoryData[]
  >([]);
  const theme = useTheme();

  function handleDateChange(action: 'next' | 'prev'): void {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  }

  async function fetchTransactions() {
    setLoading(true);

    // Fetch Categories
    let categories: CategoryProps[] = [];

    try {
      const { data } = await api.get('category', {
        params: {
          tenant_id: tenantId,
        },
      });
      if (data) {
        categories = data;
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Categorias',
        'Não foi possível buscar as categorias. Verifique sua conexão com a internet e tente novamente.'
      );
    }

    // Fetch Transactions
    let transactions: TransactionProps[] = [];

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId,
        },
      });
      if (data) {
        transactions = data;
      }

      /*const revenues = transactions.filter((transaction: TransactionProps) => {
        transaction.type == 'credit';
      });*/

      /**
       * Revenues by Selected Month - Start
       */
      const revenuesBySelectedMonth = transactions.filter(
        (transaction: TransactionProps) =>
          transaction.type === 'credit' &&
          new Date(transaction.created_at).getMonth() ===
            selectedDate.getMonth() &&
          new Date(transaction.created_at).getFullYear() ===
            selectedDate.getFullYear()
      );
      const revenuesTotalBySelectedMonth = revenuesBySelectedMonth.reduce(
        (acc: number, revenue: TransactionProps) => {
          return (acc += Number(revenue.amount));
        },
        0
      );
      /**
       * Revenues by Selected Month - End
       */

      /**
       * Revenues by Category - Start
       */
      const totalRevenuesByCategory: CategoryData[] = [];

      categories.forEach((category) => {
        let categorySum = 0;

        revenuesBySelectedMonth.forEach((revenue: TransactionProps) => {
          if (revenue.category.id === category.id) {
            categorySum += Number(revenue.amount);
          }
        });

        if (categorySum > 0) {
          const totalFormatted = categorySum.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });

          const percent = `${(
            (categorySum / revenuesTotalBySelectedMonth) *
            100
          ).toFixed(2)}%`;

          totalRevenuesByCategory.push({
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            tenant_id: category.tenant_id,
            total: categorySum,
            totalFormatted,
            percent,
          });
        }
      });

      setTotalRevenuesByCategories(totalRevenuesByCategory);
      /**
       * Revenues by Category - End
       */
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Transações',
        'Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCategory(id: string) {
    navigation.navigate('Transações Por Categoria', { id });
  }

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [selectedDate])
  );

  if (loading) {
    return <SkeletonOverviewScreen />;
  }

  return (
    <Container>
      <MonthSelect>
        <MonthSelectButton onPress={() => handleDateChange('prev')}>
          <CaretLeft size={20} color={theme.colors.text} />
        </MonthSelectButton>

        <Month>{format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}</Month>

        <MonthSelectButton onPress={() => handleDateChange('next')}>
          <CaretRight size={20} color={theme.colors.text} />
        </MonthSelectButton>
      </MonthSelect>

      <ContentScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: getBottomSpace(),
        }}
      >
        <PieChartContainer>
          <VictoryPie
            data={totalRevenuesByCategories}
            colorScale={totalRevenuesByCategories.map(
              (category) => category.color.hex
            )}
            x='percent'
            y='total'
            innerRadius={80}
            animate={{
              duration: 2000,
              easing: 'backOut',
            }}
            theme={smartFinancesChartTheme}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: 'bold',
                fill: theme.colors.primary,
              },
              data: {
                stroke: 'none',
              },
            }}
            labelRadius={150}
          />
        </PieChartContainer>
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
      </ContentScroll>
    </Container>
  );
}
