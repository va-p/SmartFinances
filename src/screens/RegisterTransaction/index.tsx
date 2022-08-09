import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Form,
  Fields,
  TransactionsTypes,
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import { TransactionTypeButton } from '@components/Form/TransactionTypeButton';
import { CategorySelectButton } from '@components/Form/CategorySelectButton';
import { AccountSelectButton } from '@components/Form/AccountSelectButton';
import { ControlledInput } from '@components/Form/ControlledInput';
import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Header } from '@components/Header';

import { CategorySelect } from '@screens/CategorySelect';
import { AccountSelect } from '@screens/AccountSelect';

import { selectUserTenantId } from '@slices/userSlice';

import { COLLECTION_TRANSACTIONS } from '@configs/database';

import api from '@api/api';

type FormData = {
  description: string;
  amount: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  description: Yup
    .string()
    .required("Digite a descrição"),
  amount: Yup
    .number()
    .typeError("Digite um valor númerico")
    .positive("O valor não pode ser negativo")
    .required("Digite o valor")
});
/* Validation Form - End */

export function RegisterTransaction({ navigation }: any) {
  const tenantId = useSelector(selectUserTenantId);
  const [transactionType, setTransactionType] = useState('');
  const [date, setDate] = useState(new Date());
  const [modeDatePicker, setModeDatePicker] = useState('date');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setDate(currentDate);
  };
  const showMode = (currentMode: string) => {
    setModeDatePicker(currentMode);
    setShowDatePicker(true);
  };
  const showDatepicker = () => {
    showMode('date');
  };
  const showTimepicker = () => {
    showMode('time');
  };
  
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountSelected, setAccountSelected] = useState({
    id: '',
    name: 'Selecione a conta'
  } as AccountProps);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState({
    id: '',
    name: 'Selecione a categoria'
  } as CategoryProps);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function handleTransactionsTypeSelect(type: 'income' | 'outcome' | 'transfer') {
    setTransactionType(type);
  };

  function handleOpenSelectAccountModal() {
    setAccountModalOpen(true);
  }

  function handleCloseSelectAccountModal() {
    setAccountModalOpen(false);
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  };

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  };

  async function handleTransactionRegister(form: FormData) {
    setButtonIsLoading(true);

    if (!transactionType)
      return Alert.alert("Cadastro de Transação", "Selecione o tipo da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    if (accountSelected === undefined)
      return Alert.alert("Cadastro de Transação", "Selecione a conta da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    if (categorySelected.id === '')
      return Alert.alert("Cadastro de Transação", "Selecione a categoria da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    try {
      const accountDataResponse = await api.get('single_account', {
        params: {
          tenant_id: tenantId,
          name: accountSelected.name
        }
      });
      if (accountDataResponse.status !== 200) {
        Alert.alert("Conta", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.")
      }

      const newTransaction = {
        created_at: date,
        description: form.description,
        amount: form.amount,
        type: transactionType,
        account_id: accountDataResponse.data.id,
        category_id: categorySelected.id,
        tenant_id: tenantId
      }

      const { status } = await api.post('transaction', newTransaction);
      if (status === 200) {
        Alert.alert("Cadastro de Transação", "Transação cadastrada com sucesso!", [{ text: "Cadastrar nova transação" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Timeline') }]);

        const data = await AsyncStorage.getItem(COLLECTION_TRANSACTIONS);
        const currentData = data ? JSON.parse(data) : [];

        const dataFormatted = [
          ...currentData,
          newTransaction
        ];
        await AsyncStorage.setItem(COLLECTION_TRANSACTIONS, JSON.stringify(dataFormatted));

        reset();
        setTransactionType('')
        setAccountSelected({
          created_at: '',
          id: '',
          name: 'Selecione a conta',
          currency: '',
          simbol: '',
          initial_amount: 0,
          tenant_id: ''
        });
        setCategorySelected({
          id: '',
          created_at: '',
          name: 'Selecione a categoria',
          icon: {
            id: '',
            title: '',
            name: '',
          },
          color: {
            id: '',
            name: '',
            hex: '',
          },
          tenant_id: ''
        });
      };

      setButtonIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Transação", "Não foi possível cadastrar a transação. Verifique sua conexão com a internet e tente novamente.");

      setButtonIsLoading(false);
    }
  }

  return (
    <Container>
      <Header type='secondary'title='Cadastro de transação' />

      <Form>
        <Fields>
          <ControlledInput
            type='primary'
            placeholder='Descrição'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue=''
            name='description'
            control={control}
            error={errors.description}
          />

          <ControlledInput
            type='primary'
            placeholder='Valor'
            keyboardType='numeric'
            defaultValue=''
            name='amount'
            control={control}
            error={errors.amount}
          />

          <TransactionsTypes>
            <TransactionTypeButton
              type='up'
              title='Entrada'
              onPress={() => handleTransactionsTypeSelect('income')}
              isActive={transactionType === 'income'}
            />
            <TransactionTypeButton
              type='down'
              title='Saída'
              onPress={() => handleTransactionsTypeSelect('outcome')}
              isActive={transactionType === 'outcome'}
            />
          </TransactionsTypes>

          <Button
            type='primary'
            title={date ? `${date}` : 'Selecione a data'}
            onPress={showDatepicker}
          />
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={modeDatePicker}
              is24Hour={true}
              onChange={onChangeDate}
              display='spinner'
              dateFormat='day month year'              
            />
          )}
          
          <AccountSelectButton 
            title={accountSelected.name}
            onPress={handleOpenSelectAccountModal}
          />          

          <CategorySelectButton
            title={categorySelected.name}
            icon={categorySelected.icon?.name}
            onPress={handleOpenSelectCategoryModal}
          />
        </Fields>

        <Button
          type='secondary'
          title="Cadastrar transação"
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleTransactionRegister)}
        />
      </Form>

      <ModalView
        visible={accountModalOpen}
        closeModal={handleCloseSelectAccountModal}
        title='Contas'
      >
        <AccountSelect 
          account={accountSelected}
          setAccount={setAccountSelected}
          closeSelectAccount={handleCloseSelectAccountModal}
        />
      </ModalView>

      <ModalView
        visible={categoryModalOpen}
        closeModal={handleCloseSelectCategoryModal}
        title='Categorias'
      >
        <CategorySelect
          category={categorySelected}
          setCategory={setCategorySelected}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </ModalView>
    </Container>
  );
}