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

import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { CurrencyProps } from '@components/AccountListItem';
import { Button } from '@components/Form/Button';

import { CurrencySelect } from '@screens/CurrencySelect';

import { selectUserTenantId } from '@slices/userSlice';

import theme from '@themes/theme';

import api from '@api/api';
import { SelectButton } from '@components/SelectButton';

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
  const accountTypes = [
    'Carteira',
    'Carteira de Criptomoedas',
    'Conta Corrente',
    'Investimentos',
    'Poupança',
    'Outro'
  ];
  const [typeSelected, setTypeSelected] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencySelected, setCurrencySelected] = useState({
    id: '4',
    name: 'Real Brasileiro',
    code: 'BRL',
    symbol: 'R$'
  } as CurrencyProps);
  const [simbol, setSimbol] = useState('');
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function iconSelectDropdown() {
    return (
      <Ionicons
        name='chevron-down-outline'
        size={20}
        color={theme.colors.text}
      />
    )
  }

  function handleOpenSelectCurrencyModal() {
    setCurrencyModalOpen(true);
  }

  function handleCloseSelectCurrencyModal() {
    setCurrencyModalOpen(false);
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

    try {
      const newAccount = {
        name: form.name,
        type: typeSelected,
        currency_id: currencySelected.id,
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

        <SelectButton
          title={currencySelected.name}
          icon='wallet'
          color={theme.colors.primary}
          onPress={handleOpenSelectCurrencyModal}
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
      </Form>

      <Footer>
        <Button
          type='secondary'
          title='Criar conta'
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleAccountRegister)}
        />
      </Footer>

      <ModalViewSelection
        visible={currencyModalOpen}
        closeModal={handleCloseSelectCurrencyModal}
        title='Selecione a moeda'
      >
        <CurrencySelect
          currency={currencySelected}
          setCurrency={setCurrencySelected}
          closeSelectCurrency={handleCloseSelectCurrencyModal}
        />
      </ModalViewSelection>
    </Container>
  );
}