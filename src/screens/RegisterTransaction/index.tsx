import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Form,
  Fields,
  TransactionsTypes,
  Footer
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

import { AccountDestinationSelect } from '@screens/AccountDestinationSelect';
import { CategorySelect } from '@screens/CategorySelect';
import { AccountSelect } from '@screens/AccountSelect';

import { selectUserTenantId } from '@slices/userSlice';

import {
  selectBrlQuoteBtc,
  selectBrlQuoteEur,
  selectBrlQuoteUsd,
  selectBtcQuoteBrl,
  selectEurQuoteBrl,
  selectUsdQuoteBrl
} from '@slices/quotesBrlSlice';

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
  const brlQuoteBtc = useSelector(selectBrlQuoteBtc);
  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);
  const brlQuoteEur = useSelector(selectBrlQuoteEur);
  const eurQuoteBrl = useSelector(selectEurQuoteBrl);
  const brlQuoteUsd = useSelector(selectBrlQuoteUsd);
  const usdQuoteBrl = useSelector(selectUsdQuoteBrl);
  const [transactionType, setTransactionType] = useState('');
  const [date, setDate] = useState(new Date());
  const [modeDatePicker, setModeDatePicker] = useState('date');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (event: any, selectedDate: any) => {
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
  const [accountDestinationModalOpen, setAccountDestinationModalOpen] = useState(false);
  const [accountDestinationSelected, setAccountDestinationSelected] = useState({
    id: '',
    name: 'Selecione a conta de destino'
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

  function handleOpenSelectAccountDestinationModal() {
    setAccountDestinationModalOpen(true);
  }

  function handleCloseSelectAccountDestinationModal() {
    setAccountDestinationModalOpen(false);
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  };

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  };

  async function handleTransactionRegister(form: FormData) {
    setButtonIsLoading(true);

    if (!transactionType) {
      return Alert.alert("Cadastro de Transação", "Selecione o tipo da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    };

    if (accountSelected.id === '') {
      return Alert.alert("Cadastro de Transação", "Selecione a conta de origem da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    };

    if (transactionType === 'transfer') {
      if (accountDestinationSelected.id === '')
        return Alert.alert("Cadastro de Transação", "Selecione a conta de destino da transação", [{
          text: "OK", onPress: () => setButtonIsLoading(false)
        }]);
    };

    if (categorySelected.id === '') {
      return Alert.alert("Cadastro de Transação", "Selecione a categoria da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    };

    if (transactionType != 'transfer') {
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
    else {
      let amountConverted = 0;

      try {
        if (accountSelected.currency != accountDestinationSelected.currency) {
          //Converted BRL
          if (accountSelected.currency === 'BTC - Bitcoin' &&
            accountDestinationSelected.currency === 'BRL - Real Brasileiro') {
            amountConverted = Number(form.amount) * btcQuoteBrl.price
          };
          if (accountSelected.currency === 'EUR - Euro' &&
            accountDestinationSelected.currency === 'BRL - Real Brasileiro') {
            amountConverted = Number(form.amount) * eurQuoteBrl.price
          };
          if (accountSelected.currency === 'USD - Dólar Americano' &&
            accountDestinationSelected.currency === 'BRL - Real Brasileiro') {
            amountConverted = Number(form.amount) * usdQuoteBrl.price
          };
          if (accountSelected.currency === 'BRL - Real Brasileiro' &&
            accountDestinationSelected.currency === 'BTC - Bitcoin') {
            amountConverted = Number(form.amount) * brlQuoteBtc.price
          };
          if (accountSelected.currency === 'BRL - Real Brasileiro' &&
            accountDestinationSelected.currency === 'EUR - Euro') {
            amountConverted = Number(form.amount) * brlQuoteEur.price
          };
          if (accountSelected.currency === 'BRL - Real Brasileiro' &&
            accountDestinationSelected.currency === 'USD - Dólar Americano') {
            amountConverted = Number(form.amount) * brlQuoteUsd.price
          };
        } else {
          amountConverted = Number(form.amount)
        };

        const accountDataResponse = await api.get('single_account', {
          params: {
            tenant_id: tenantId,
            name: accountSelected.name
          }
        });
        const accountDestinationDataResponse = await api.get('single_account', {
          params: {
            tenant_id: tenantId,
            name: accountDestinationSelected.name
          }
        });
        if (accountDataResponse.status && accountDestinationDataResponse.status !== 200) {
          Alert.alert("Conta", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.")
        }

        const transferOut = {
          created_at: date,
          description: form.description,
          amount: form.amount,
          type: transactionType,
          account_id: accountDataResponse.data.id,
          category_id: categorySelected.id,
          tenant_id: tenantId
        }

        const transferIn = {
          created_at: date,
          description: form.description,
          amount: amountConverted,
          type: transactionType,
          account_id: accountDestinationDataResponse.data.id,
          category_id: categorySelected.id,
          tenant_id: tenantId
        }

        const transferOutDataResponse = await api.post('transaction', transferOut);
        const transferInDataResponse = await api.post('transaction', transferIn);

        if (transferInDataResponse.response === 200) {
          Alert.alert("Cadastro de Transação", "Transação cadastrada com sucesso!", [{ text: "Cadastrar nova transação" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Timeline') }]);

          const data = await AsyncStorage.getItem(COLLECTION_TRANSACTIONS);
          const currentData = data ? JSON.parse(data) : [];

          const dataFormatted = [
            ...currentData,
            transferOut,
            transferIn
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
          setAccountDestinationSelected({
            created_at: '',
            id: '',
            name: 'Selecione a conta de destino',
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
  };

  return (
    <Container>
      <Header type='secondary' title='Cadastro de transação' />

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
              type='swap'
              title='Transf'
              onPress={() => handleTransactionsTypeSelect('transfer')}
              isActive={transactionType === 'transfer'}
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
              mode='date'
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

          {
            transactionType === 'transfer' ?
              <AccountSelectButton
                title={accountDestinationSelected.name}
                onPress={handleOpenSelectAccountDestinationModal}
              /> :
              <></>
          }

          <CategorySelectButton
            title={categorySelected.name}
            icon={categorySelected.icon?.name}
            onPress={handleOpenSelectCategoryModal}
          />
        </Fields>
      </Form>

      <Footer>
        <Button
          type='secondary'
          title="Cadastrar transação"
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleTransactionRegister)}
        />
      </Footer>

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
        visible={accountDestinationModalOpen}
        closeModal={handleCloseSelectAccountDestinationModal}
        title='Contas'
      >
        <AccountDestinationSelect
          accountDestination={accountDestinationSelected}
          setAccountDestination={setAccountDestinationSelected}
          closeSelectAccountDestination={handleCloseSelectAccountDestinationModal}
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