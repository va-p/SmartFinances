import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  Container,
  Form,
  Footer
} from './styles';

import SelectDropdown from 'react-native-select-dropdown';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { ControlledInput } from '@components/Form/ControlledInput';
import { Button } from '@components/Form/Button';

import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

type FormData = {
  name: string;
  currency: string;
  initialAmount: number;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup
    .string()
    .required("Digite o nome da conta"),
  initialAmount: Yup
    .number()
    .required("Digite o saldo inicial da conta")
    .typeError("Digite somente números e pontos."),
});
/* Validation Form - End */

export function RegisterAccount({ navigation }: any) {
  const tenantId = useSelector(selectUserTenantId);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const accountTypes = [
    'Carteira',
    'Carteira de Criptomoedas',
    'Conta Corrente',
    'Investimentos',
    'Poupança',
    'Outro'
  ];
  const [typeSelected, setTypeSelected] = useState('');
  const currencies = [
    'BRL - Real Brasileiro',
    'BTC - Bitcoin',
    'EUR - Euro',
    'USD - Dólar Americano'
  ];
  const [currencySelected, setCurrencySelected] = useState('');
  const [simbol, setSimbol] = useState('');

  function iconSelectDropdown() {
    return (
      <Ionicons
        name='chevron-down-outline'
        size={20}
        color={theme.colors.text}
      />
    )
  }

  async function handleAccountRegister(form: FormData) {
    setButtonIsLoading(true);

    if (!typeSelected) {
      return Alert.alert("Cadastro de Conta", "Selecione o tipo da conta", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    }

    if (!currencySelected) {
      return Alert.alert("Cadastro de Conta", "Selecione a moeda da conta", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    }

    switch (currencySelected) {
      case 'BRL - Real Brasileiro':
        setSimbol('R$')
        break;
      case 'BTC - Bitcoin':
        setSimbol('₿')
        break;
      case 'EUR - Euro':
        setSimbol('€')
        break;
      case 'USD - Dólar Americano':
        setSimbol('US$')
        break;
      default: 'BRL - Real Brasileiro'
        break;
    }

    try {
      const newAccount = {
        name: form.name,
        type: typeSelected,
        currency: currencySelected,
        simbol: simbol,
        initial_amount: form.initialAmount,
        tenant_id: tenantId
      }
      const { status } = await api.post('account', newAccount);
      if (status === 200) {
        Alert.alert("Cadastro de Conta", "Conta cadastrada com sucesso!", [{ text: "Cadastrar nova conta" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);
      };

      setButtonIsLoading(false);
    } catch (error) {
      Alert.alert("Cadastro de Conta", "Conta já cadastrada. Por favor, digite outro nome para a conta.", [{ text: "Tentar novamente" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);
      setButtonIsLoading(false);
    };
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Form>
        <ControlledInputWithIcon
          icon='pencil'
          color={theme.colors.primary}
          placeholder='Nome'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue=''
          name='name'
          control={control}
          error={errors.name}
        />

        <ControlledInputWithIcon
          icon='cash'
          color={theme.colors.primary}
          placeholder='Saldo inicial'
          keyboardType='numeric'
          name='initialAmount'
          control={control}
          error={errors.initialAmount}
        />

        <SelectDropdown
          data={accountTypes}
          onSelect={(selectedItem) => {
            setTypeSelected(selectedItem);
          }}
          buttonTextAfterSelection={(selectedItem) => {
            return selectedItem
          }}
          rowTextForSelection={(item) => {
            return item
          }}
          defaultButtonText="Selecione o tipo da conta"
          renderDropdownIcon={iconSelectDropdown}
          dropdownIconPosition='right'
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
          renderDropdownIcon={iconSelectDropdown}
          dropdownIconPosition='right'
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
        <Footer>
          <Button
            type='secondary'
            title='Criar conta'
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleAccountRegister)}
          />
        </Footer>
      </Form>
    </Container>
  );
}