import React, { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  Container,
  Form,
  Footer
} from './styles';

import { useFocusEffect } from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import axios from 'axios';

import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { CurrencyProps } from '@components/AccountListItem';
import { SelectButton } from '@components/SelectButton';
import { Button } from '@components/Button';

import { CurrencySelect } from '@screens/CurrencySelect';

import { selectUserTenantId } from '@slices/userSlice';

import theme from '@themes/theme';

import api from '@api/api';

type FormData = {
  name: string;
  currency: string;
  initialAmount: number;
}

type Props = {
  id: string;
  closeAccount: () => void;
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

export function RegisterAccount({ id, closeAccount }: Props) {
  const tenantId = useSelector(selectUserTenantId);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const accountTypes = [
    'Cartão de Crédito',
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
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function iconSelectDropdown() {
    return (
      <Ionicons
        name='chevron-down-outline'
        size={20}
        color={theme.colors.text}
      />
    )
  };

  function handleOpenSelectCurrencyModal() {
    setCurrencyModalOpen(true);
  };

  function handleCloseSelectCurrencyModal() {
    setCurrencyModalOpen(false);
  };

  async function handleRegisterAccount(form: FormData) {
    setButtonIsLoading(true);

    /* Validation Form - Start */
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
    /* Validation Form - End */


    // Edit account
    if (id != '') {
      handleEditAccount(id, form);
    }
    // Add Transaction
    else {
      try {
        const newAccount = {
          name: form.name,
          type: typeSelected,
          currency_id: currencySelected.id,
          initial_amount: form.initialAmount,
          tenant_id: tenantId
        }
        const { status } = await api.post('account', newAccount);
        if (status === 200) {
          Alert.alert("Cadastro de Conta", "Conta cadastrada com sucesso!", [{ text: "Cadastrar nova conta" }, { text: "Voltar para a tela anterior", onPress: () => handleCloseAccount }]);
        };
        reset();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert("Cadastro de Conta", error.response?.data.message, [{ text: "Tentar novamente" }, { text: "Voltar para a tela anterior", onPress: handleCloseAccount }]);
        }
      } finally {
        setButtonIsLoading(false);
      };
    }
  };

  async function fetchAccount() {
    try {
      const { data } = await api.get('single_account', {
        params: {
          account_id: id
        }
      })

      setName(data.name);
      setInitialAmount(data.initial_amount);
      setTypeSelected(data.type);
      setCurrencySelected(data.currency);
    } catch (error) {
      console.error(error);
      Alert.alert("Conta", "Não foi possível buscar a conta. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  async function handleEditAccount(id: string, form: FormData) {
    const AccountEdited = {
      account_id: id,
      name: form.name,
      type: typeSelected,
      currency_id: currencySelected.id,
      initial_amount: form.initialAmount
    }
    try {
      const { status } = await api.post('edit_account', AccountEdited);

      if (status === 200) {
        Alert.alert("Edição de Conta", "Conta editada com sucesso!", [{ text: "Ok", onPress: handleCloseAccount }]);
      }
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Edição de Conta", error.response?.data.message, [{ text: "Tentar novamente" }, { text: "Voltar para a tela anterior", onPress: handleCloseAccount }]);
      }
    } finally {
      setButtonIsLoading(false);
    }
  };

  function handleCloseAccount() {
    reset();
    closeAccount();
  };

  useFocusEffect(useCallback(() => {
    if (id != '') {
      fetchAccount();
    }
  }, [id]));

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Form>
        <ControlledInputWithIcon
          icon='pencil'
          color={theme.colors.primary}
          placeholder='Nome'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue={name}
          name='name'
          control={control}
          error={errors.name}
        />

        <ControlledInputWithIcon
          icon='cash'
          color={theme.colors.primary}
          placeholder='Saldo inicial'
          keyboardType='numeric'
          returnKeyType='go'
          defaultValue={initialAmount}
          name='initialAmount'
          control={control}
          error={errors.initialAmount}
          onSubmitEditing={handleSubmit(handleRegisterAccount)}
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
          defaultButtonText={id != '' ? typeSelected : "Selecione o tipo da conta"}
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
            textAlign: 'left',
            color: theme.colors.text
          }}
          dropdownStyle={{
            borderRadius: 10,
          }}
        />
      </Form>

      <Footer>
        <Button
          type='secondary'
          title={id != '' ? "Editar Conta" : "Criar Conta"}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterAccount)}
        />
      </Footer>

      <ModalViewSelection
        visible={currencyModalOpen}
        closeModal={handleCloseSelectCurrencyModal}
        title="Selecione a moeda"
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