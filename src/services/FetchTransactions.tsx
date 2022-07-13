import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { TransactionListItemProps } from '@components/TransactionListItem';

import { selectUserTenantId } from '@slices/userSlice';

import {
  COLLECTION_HIGHLIGHTDATA,
  COLLECTION_TRANSACTIONS
} from '@configs/database';

import api from '@api/api';

export interface DataListProps extends TransactionListItemProps {
  id: string;
}

interface HighlightProps {
  amount: string | number;
}

type HighlightData = {
  revenues: HighlightProps;
  expenses: HighlightProps;
  total: HighlightProps;
}

export async function FetchTransactions() {
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);
  const tenantId = useSelector(selectUserTenantId);

  async function fetchTransactions() {
    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      });

      const transactions = data;

      let totalRevenues = 0;
      let totalExpenses = 0;

      const transactionsFormatted: DataListProps[] = transactions
        .map((item: DataListProps) => {
          switch (item.type) {
            case 'positive':
              totalRevenues += Number(item.amount);
              break;
            case 'negative':
              totalExpenses += Number(item.amount);
              break;
            default: 'positive';
              break;
          }
          const amount = Number(item.amount)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });

          const date = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(item.created_at));

          return {
            id: item.id,
            created_at: date,
            description: item.description,
            amount,
            type: item.type,
            account: {
              id: item.account.id,
              date: item.account.created_at,
              name: item.account.name,
              currency: item.account.currency,
              simbol: item.account.simbol,
            },
            category: {
              id: item.category.id,
              date: item.category.created_at,
              name: item.category.name,
              icon: item.category.icon,
              color: item.category.color,
              tenantId: item.category.tenant_id
            },
            tenantId: item.tenant_id
          }
        });

      await AsyncStorage.setItem(COLLECTION_TRANSACTIONS, JSON.stringify(transactionsFormatted));

      const total = totalRevenues - totalExpenses;

      setHighlightData({
        revenues: {
          amount: totalRevenues.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        },
        expenses: {
          amount: totalExpenses.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        },
        total: {
          amount: total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        }
      });

      await AsyncStorage.setItem(COLLECTION_HIGHLIGHTDATA, JSON.stringify(highlightData));

      console.log(
        highlightData.revenues.amount,
        highlightData.expenses.amount,
        highlightData.total.amount
      );

    } catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, []);

  useFocusEffect(useCallback(() => {
    fetchTransactions();
  }, []));
}