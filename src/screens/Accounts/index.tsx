import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl } from 'react-native';
import {
  Container,
  AccountsContainer,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AccountListItem, AccountProps } from '@components/AccountListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';
import { RegisterAccount } from '@screens/RegisterAccount';

type FormData = {
  name: string;
  currency: string;
  initialAmount: number;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required("Digite o nome da conta"),
  initialAmount: Yup.number().required("Digite o saldo inicial da conta").typeError("Digite somente números e pontos."),
});
/* Validation Form - End */

export function Accounts({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [registerAccountModalOpen, setRegisterAccountModalOpen] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const currencies = ['BRL', 'BTC'];
  const [currencySelected, setCurrencySelected] = useState('');
  const [simbol, setSimbol] = useState('');

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
            paddingHorizontal: 24
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