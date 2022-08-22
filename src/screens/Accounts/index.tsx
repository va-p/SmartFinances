import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl } from 'react-native';
import {
  Container,
  AccountsContainer,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { AccountListItem, AccountProps } from '@components/AccountListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { RegisterAccount } from '@screens/RegisterAccount';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

export function Accounts() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [registerAccountModalOpen, setRegisterAccountModalOpen] = useState(false);

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('account', {
        params: {
          tenant_id: tenantId
        }
      });
      if (!data) {
      } else {
        setRefreshing(false);
        setAccounts(data);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Contas", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleOpenRegisterAccountModal() {
    setRegisterAccountModalOpen(true);
  }

  function handleCloseRegisterAccountModal() {
    setRegisterAccountModalOpen(false);
  }

  async function handleAccountSwipeLeft(id: string) {
    Alert.alert("Exclusão de transação", "Tem certeza que deseja excluir a conta?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a conta.", onPress: () => handleDeleteAccount(id) }])
  };

  async function handleDeleteAccount(id: string) {
    try {
      await api.delete('delete_account', {
        params: {
          account_id: id
        }
      });
      fetchAccounts();
      Alert.alert("Exclusão de conta", "Conta excluída com sucesso!")
    } catch (error) {
      Alert.alert("Exclusão de conta", `${error}`)
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header type='primary' title='Contas' />
      <AccountsContainer>
        <FlatList
          data={accounts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <AccountListItem
              data={item}
              onSwipeableLeftOpen={() => handleAccountSwipeLeft(item.id)}
            />
          )}
          initialNumToRender={50}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20
          }}
        />
      </AccountsContainer>

      <Footer>
        <Button
          type='secondary'
          title='Criar nova conta'
          onPress={handleOpenRegisterAccountModal}
        />
      </Footer>

      <ModalView
        visible={registerAccountModalOpen}
        closeModal={handleCloseRegisterAccountModal}
        title='Criar Nova Conta'
      >
        <RegisterAccount />
      </ModalView>
    </Container>
  );
}