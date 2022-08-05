import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl } from 'react-native';
import {
  Container,
  AccountsContainer,
  Title,
  ContentScroll,
  Form,
  Footer
} from './styles';

import SelectDropdown from 'react-native-select-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AccountListItem, AccountProps } from '@components/AccountListItem';
import { ControlledInput } from '@components/Form/ControlledInput';
import { Button } from '@components/Form/Button';
import { Divider } from '@components/Divider';
import { Load } from '@components/Load';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';

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

export function RegisterAccount({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
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

  async function handleAccountRegister(form: FormData) {
    setButtonIsLoading(true);

    if (!currencySelected) {
      return Alert.alert("Cadastro de Conta", "Selecione a moeda da conta", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    }

    if (currencySelected === 'BRL') {
      setSimbol('R$')
    } else {
      setSimbol('₿')
    }

    try {
      const newAccount = {
        name: form.name,
        currency: currencySelected,
        simbol: simbol,
        initial_amount: form.initialAmount,
        tenant_id: tenantId
      }
      const { status } = await api.post('account', newAccount);
      if (status === 200) {
        Alert.alert("Cadastro de Conta", "Conta cadastrada com sucesso!", [{ text: "Cadastrar nova conta" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);
      };
      
      fetchAccounts();
      setButtonIsLoading(false);
    } catch (error) {
      Alert.alert("Cadastro de Conta", "Conta já cadastrada. Por favor, digite outro nome para a conta.", [{ text: "Tentar novamente" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);
      setButtonIsLoading(false);
    };
  };

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
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AccountsContainer>
        <Title>Contas cadastradas</Title>
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

      <Divider />

      <ContentScroll>
        <Form>
          <Title>Cadastrar nova conta</Title>
          <ControlledInput
            type='primary'
            placeholder='Nome da conta'
            autoCapitalize='sentences'
            autoCorrect={false}
            name='name'
            control={control}
            error={errors.name}
          />

          <SelectDropdown
            data={currencies}
            onSelect={(selectedItem) => {
              setCurrencySelected(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem) => {
              return selectedItem
            }}
            rowTextForSelection={(item) => {
              return item
            }}
            defaultButtonText="Selecione a moeda"
            buttonStyle={{
              width: '100%',
              minHeight: 56,
              maxHeight: 56,
              marginTop: 10,
              backgroundColor: theme.colors.shape,
              borderRadius: 10
            }}
            buttonTextStyle={{
              fontFamily: theme.fonts.regular,
              fontSize: 15,
              textAlign: 'left'
            }}
            dropdownStyle={{
              borderRadius: 10,
            }}
          />

          <ControlledInput
            type='primary'
            placeholder='Saldo inicial da conta'
            keyboardType='numeric'
            name='initialAmount'
            control={control}
            error={errors.initialAmount}
          />
          <Footer>
            <Button
              type='secondary'
              title='Cadastrar conta'
              isLoading={buttonIsLoading}
              onPress={handleSubmit(handleAccountRegister)}
            />
          </Footer>
        </Form>
      </ContentScroll>
    </Container>
  );
}