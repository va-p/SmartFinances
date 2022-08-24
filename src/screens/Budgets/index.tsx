import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { BudgetListItem, BudgetProps } from '@components/BudgetListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { RegisterBudget } from '@screens/RegisterBudget';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export function Budgets() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const tenantId = useSelector(selectUserTenantId);
  const [budgets, setBudgets] = useState<BudgetProps[]>([]);
  const [registerBudgetModalOpen, setRegisterBudgetModalOpen] = useState(false);

  async function fetchBudgets() {
    setLoading(true);

    try {
      const { data } = await api.get('budget', {
        params: {
          tenant_id: tenantId
        }
      });

      if (!data) {
      } else {
        setRefreshing(false);
        setBudgets(data);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("Orçamentos", "Não foi possível buscar seus orçamntos. Verifique sua conexão com a internet e tente novamente.")
    }
  };

  function handleOpenRegisterBudgetModal() {
    setRegisterBudgetModalOpen(true);
  }

  function handleCloseRegisterBudgetModal() {
    setRegisterBudgetModalOpen(false);
  }

  useFocusEffect(useCallback(() => {
    fetchBudgets();
  }, []));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header type='secondary' title='Orçamentos' />

      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BudgetListItem data={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchBudgets} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20
        }}
      />

      <Footer>
        <Button type='secondary' title='Criar novo orçamento' onPress={handleOpenRegisterBudgetModal} />
      </Footer>

      <ModalView
        visible={registerBudgetModalOpen}
        closeModal={handleCloseRegisterBudgetModal}
        title='Criar novo orçamento'
      >
        <RegisterBudget />
      </ModalView>
    </Container>
  );
}