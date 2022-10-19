import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Header,
  TitleContainer,
  HeaderRow,
  InputTransactionValueContainer,
  Title,
  TransactionsTypes,
  Footer
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BorderlessButton } from 'react-native-gesture-handler';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import * as Yup from 'yup';

import {
  ControlledInputWithIcon
} from '@components/Form/ControlledInputWithIcon';
import {
  ControlledInputValue
} from '@components/Form/ControlledInputValue';
import { TransactionTypeButton } from '@components/Form/TransactionTypeButton';
import { CategorySelectButton } from '@components/Form/CategorySelectButton';
import { AccountProps, CurrencyProps } from '@components/AccountListItem';
import { CurrencySelectButton } from '@components/CurrencySelectButton';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { CategoryProps } from '@components/CategoryListItem';
import { SelectButton } from '@components/SelectButton';
import { Button } from '@components/Button';

import { AccountDestinationSelect } from '@screens/AccountDestinationSelect';
import { CurrencySelect } from '@screens/CurrencySelect';
import { CategorySelect } from '@screens/CategorySelect';
import { AccountSelect } from '@screens/AccountSelect';

import { selectUserTenantId } from '@slices/userSlice';

import {
  //BRL Quotes
  selectBrlQuoteBtc,
  selectBrlQuoteEur,
  selectBrlQuoteUsd,

  //BTC Quotes
  selectBtcQuoteBrl,
  selectBtcQuoteEur,
  selectBtcQuoteUsd,

  //EUR Quotes
  selectEurQuoteBrl,
  selectEurQuoteBtc,
  selectEurQuoteUsd,

  //USD Quotes
  selectUsdQuoteBrl,
  selectUsdQuoteBtc,
  selectUsdQuoteEur
} from '@slices/quotesSlice';

import { COLLECTION_TRANSACTIONS } from '@configs/database';

import theme from '@themes/theme';

import api from '@api/api';

type Props = {
  closeRegisterTransaction: () => void;
  id: string;
  setId: () => void;
}

type FormData = {
  description: string;
  amount: string;
  category: CategoryProps;
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
    .required("Digite o valor"),
});
/* Validation Form - End */

export function RegisterTransaction({ closeRegisterTransaction, id, setId }: Props) {
  const tenantId = useSelector(selectUserTenantId);
  const brlQuoteBtc = useSelector(selectBrlQuoteBtc);
  const brlQuoteEur = useSelector(selectBrlQuoteEur);
  const brlQuoteUsd = useSelector(selectBrlQuoteUsd);
  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);
  const btcQuoteEur = useSelector(selectBtcQuoteEur);
  const btcQuoteUsd = useSelector(selectBtcQuoteUsd);
  const eurQuoteBrl = useSelector(selectEurQuoteBrl);
  const eurQuoteBtc = useSelector(selectEurQuoteBtc);
  const eurQuoteUsd = useSelector(selectEurQuoteUsd);
  const usdQuoteBrl = useSelector(selectUsdQuoteBrl);
  const usdQuoteBtc = useSelector(selectUsdQuoteBtc);
  const usdQuoteEur = useSelector(selectUsdQuoteEur);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState({
    id: '',
    name: 'Selecione a categoria',
    color: {
      hex: theme.colors.primary
    }
  } as CategoryProps);
  const [amount, setAmount] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencySelected, setCurrencySelected] = useState({
    id: '4',
    name: 'Real Brasileiro',
    code: 'BRL',
    symbol: 'R$'
  } as CurrencyProps);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountSelected, setAccountSelected] = useState({
    id: '',
    name: 'Selecione a conta',
    currency: {
      symbol: 'R$'
    }
  } as AccountProps);
  const [accountDestinationModalOpen, setAccountDestinationModalOpen] = useState(false);
  const [accountDestinationSelected, setAccountDestinationSelected] = useState({
    id: '',
    name: 'Selecione a conta de destino'
  } as AccountProps);
  const [date, setDate] = useState(new Date());
  const formattedDate = format(date, 'dd MMMM, yyyy', { locale: ptBR });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setDate(currentDate);
  };
  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState('');
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

  function handleOpenSelectCurrencyModal() {
    setCurrencyModalOpen(true);
  };

  function handleCloseSelectCurrencyModal() {
    setCurrencyModalOpen(false);
  };

  function handleOpenSelectAccountModal() {
    setAccountModalOpen(true);
  };

  function handleCloseSelectAccountModal() {
    setAccountModalOpen(false);
  };

  function handleOpenSelectAccountDestinationModal() {
    setAccountDestinationModalOpen(true);
  };

  function handleCloseSelectAccountDestinationModal() {
    setAccountDestinationModalOpen(false);
  };

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  };

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  };

  async function handleTransactionRegister(form: FormData) {
    setButtonIsLoading(true);

    /* Validation Form - Start */
    if (!transactionType) {
      return Alert.alert("Cadastro de Transação", "Selecione o tipo da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);
    };

    if (accountSelected.id === '') {
      return Alert.alert("Cadastro de Transação", "Selecione a conta da transação", [{
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
    /* Validation Form - End */


    // Edit Transaction
    if (id != '') {
      handleEditTransaction(id, form);
    }
    // Add Transaction
    else {
      // Income or outcome Transaction
      if (transactionType != 'transfer') {
        // Need conversion
        if (currencySelected.code !== accountSelected.currency.code) {
          let amountConverted = 0;

          // Converted BRL
          if (currencySelected.code === 'BTC' && accountSelected.currency.code === 'BRL') {
            amountConverted = Number(form.amount) * btcQuoteBrl.price;
          }
          if (currencySelected.code === 'EUR' && accountSelected.currency.code === 'BRL') {
            amountConverted = Number(form.amount) * eurQuoteBrl.price;
          }
          if (currencySelected.code === 'USD' && accountSelected.currency.code === 'BRL') {
            amountConverted = Number(form.amount) * usdQuoteBrl.price;
          }

          // Converted BTC
          if (currencySelected.code === 'BRL' && accountSelected.currency.code === 'BTC') {
            amountConverted = Number(form.amount) * brlQuoteBtc.price;
          }
          if (currencySelected.code === 'EUR' && accountSelected.currency.code === 'BTC') {
            amountConverted = Number(form.amount) * eurQuoteBtc.price;
          }
          if (currencySelected.code === 'USD' && accountSelected.currency.code === 'BTC') {
            amountConverted = Number(form.amount) * usdQuoteBtc.price;
          }

          // Converted EUR
          if (currencySelected.code === 'BRL' && accountSelected.currency.code === 'EUR') {
            amountConverted = Number(form.amount) * brlQuoteEur.price;
          }
          if (currencySelected.code === 'BTC' && accountSelected.currency.code === 'EUR') {
            amountConverted = Number(form.amount) * btcQuoteEur.price;
          }
          if (currencySelected.code === 'USD' && accountSelected.currency.code === 'EUR') {
            amountConverted = Number(form.amount) * usdQuoteEur.price;
          }

          // Converted USD
          if (currencySelected.code === 'BRL' && accountSelected.currency.code === 'USD') {
            amountConverted = Number(form.amount) * brlQuoteUsd.price;
          }
          if (currencySelected.code === 'BTC' && accountSelected.currency.code === 'USD') {
            amountConverted = Number(form.amount) * btcQuoteUsd.price;
          }
          if (currencySelected.code === 'EUR' && accountSelected.currency.code === 'USD') {
            amountConverted = Number(form.amount) * eurQuoteUsd.price;
          }

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
              amount: amountConverted,
              amount_not_converted: form.amount,
              currency_id: currencySelected.id,
              type: transactionType,
              account_id: accountDataResponse.data.id,
              category_id: categorySelected.id,
              tenant_id: tenantId
            }

            const { status } = await api.post('transaction', newTransaction);
            if (status === 200) {
              Alert.alert("Cadastro de Transação", "Transação cadastrada com sucesso!", [{ text: "Cadastrar nova transação" }, { text: "Voltar para a home", onPress: closeRegisterTransaction }]);

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
                id: '',
                name: 'Selecione a conta',
                currency: {
                  id: '',
                  name: '',
                  code: '',
                  symbol: ''
                },
                initial_amount: 0,
                tenant_id: ''
              });
              setCategorySelected({
                id: '',
                name: 'Selecione a categoria',
                icon: {
                  id: '',
                  title: '',
                  name: '',
                },
                color: {
                  id: '',
                  name: '',
                  hex: theme.colors.primary,
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
        // No need conversion
        else {
          try {
            const accountResponse = await api.get('single_account', {
              params: {
                tenant_id: tenantId,
                name: accountSelected.name
              }
            });
            if (accountResponse.status !== 200) {
              Alert.alert("Conta", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.")
            }

            const newTransaction = {
              created_at: date,
              description: form.description,
              amount: form.amount,
              currency_id: currencySelected.id,
              type: transactionType,
              account_id: accountResponse.data.id,
              category_id: categorySelected.id,
              tenant_id: tenantId
            }

            const { status } = await api.post('transaction', newTransaction);
            if (status === 200) {
              Alert.alert("Cadastro de Transação", "Transação cadastrada com sucesso!", [{ text: "Cadastrar nova transação" }, { text: "Voltar para a home", onPress: closeRegisterTransaction }]);

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
                id: '',
                name: 'Selecione a conta',
                currency: {
                  id: '',
                  name: '',
                  code: '',
                  symbol: ''
                },
                initial_amount: 0,
                tenant_id: ''
              });
              setCategorySelected({
                id: '',
                name: 'Selecione a categoria',
                icon: {
                  id: '',
                  title: '',
                  name: '',
                },
                color: {
                  id: '',
                  name: '',
                  hex: theme.colors.primary,
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
      }
      // Transfer Transaction
      else {
        let amountConverted = 0;

        // Need conversion
        if (accountSelected.currency.code !== accountDestinationSelected.currency.code) {

          //Converted BRL
          if (accountSelected.currency.code === 'BRL' &&
            accountDestinationSelected.currency.code === 'BTC') {
            amountConverted = Number(form.amount) * brlQuoteBtc.price
          };
          if (accountSelected.currency.code === 'BRL' &&
            accountDestinationSelected.currency.code === 'EUR') {
            amountConverted = Number(form.amount) * brlQuoteEur.price
          };
          if (accountSelected.currency.code === 'BRL' &&
            accountDestinationSelected.currency.code === 'USD') {
            amountConverted = Number(form.amount) * brlQuoteUsd.price
          };

          //Converted BTC
          if (accountSelected.currency.code === 'BTC' &&
            accountDestinationSelected.currency.code === 'BRL') {
            amountConverted = Number(form.amount) * btcQuoteBrl.price
          };
          if (accountSelected.currency.code === 'BTC' &&
            accountDestinationSelected.currency.code === 'EUR') {
            amountConverted = Number(form.amount) * btcQuoteEur.price
          };
          if (accountSelected.currency.code === 'BTC' &&
            accountDestinationSelected.currency.code === 'USD') {
            amountConverted = Number(form.amount) * btcQuoteUsd.price
          };

          //Converted EUR
          if (accountSelected.currency.code === 'EUR' &&
            accountDestinationSelected.currency.code === 'BTC') {
            amountConverted = Number(form.amount) * eurQuoteBtc.price
          };
          if (accountSelected.currency.code === 'EUR' &&
            accountDestinationSelected.currency.code === 'BRL') {
            amountConverted = Number(form.amount) * eurQuoteBrl.price
          };
          if (accountSelected.currency.code === 'EUR' &&
            accountDestinationSelected.currency.code === 'USD') {
            amountConverted = Number(form.amount) * eurQuoteUsd.price
          };

          //Converted USD
          if (accountSelected.currency.code === 'USD' &&
            accountDestinationSelected.currency.code === 'BTC') {
            amountConverted = Number(form.amount) * usdQuoteBtc.price
          };
          if (accountSelected.currency.code === 'USD' &&
            accountDestinationSelected.currency.code === 'BRL') {
            amountConverted = Number(form.amount) * usdQuoteBrl.price
          };
          if (accountSelected.currency.code === 'USD' &&
            accountDestinationSelected.currency.code === 'EUR') {
            amountConverted = Number(form.amount) * usdQuoteEur.price
          };
        }
        // No need conversion        
        else {
          amountConverted = Number(form.amount)
        };

        try {
          const accountResponse = await api.get('single_account', {
            params: {
              tenant_id: tenantId,
              name: accountSelected.name
            }
          });
          const accountDestinationResponse = await api.get('single_account', {
            params: {
              tenant_id: tenantId,
              name: accountDestinationSelected.name
            }
          });
          if (accountResponse.status && accountDestinationResponse.status !== 200) {
            Alert.alert("Conta", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.")
          }

          const transferOut = {
            created_at: date,
            description: form.description,
            amount: form.amount,
            currency_id: currencySelected.id,
            type: 'transferOut',
            account_id: accountResponse.data.id,
            category_id: categorySelected.id,
            tenant_id: tenantId
          }

          const transferIn = {
            created_at: date,
            description: form.description,
            amount: amountConverted,
            currency_id: currencySelected.id,
            type: 'transferIn',
            account_id: accountDestinationResponse.data.id,
            category_id: categorySelected.id,
            tenant_id: tenantId
          }

          const transferOutResponse = await api.post('transaction', transferOut);
          const transferInResponse = await api.post('transaction', transferIn);

          if (transferOutResponse.status && transferInResponse.status === 200) {
            Alert.alert("Cadastro de Transação", "Transação cadastrada com sucesso!", [{ text: "Cadastrar nova transação" }, { text: "Voltar para a home", onPress: closeRegisterTransaction }]);

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
              id: '',
              name: 'Selecione a conta',
              currency: {
                id: '',
                name: '',
                code: '',
                symbol: '',
              },
              initial_amount: 0,
              tenant_id: ''
            });
            setAccountDestinationSelected({
              id: '',
              name: 'Selecione a conta de destino',
              currency: {
                id: '',
                name: '',
                code: '',
                symbol: ''
              },
              initial_amount: 0,
              tenant_id: ''
            });
            setCategorySelected({
              id: '',
              name: 'Selecione a categoria',
              icon: {
                id: '',
                title: '',
                name: '',
              },
              color: {
                id: '',
                name: '',
                hex: theme.colors.primary,
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
  };

  async function fetchTransaction() {
    try {
      const { data } = await api.get('single_transaction', {
        params: {
          transaction_id: id
        }
      })
      setCategorySelected(data.category);
      setAmount(data.amount);
      setCurrencySelected(data.currency);
      setAccountSelected(data.account);
      setDate(data.created_at);
      setDescription(data.description);
      setTransactionType(data.type);
    } catch (error) {
      console.error(error);
      Alert.alert("Transação", "Não foi possível buscar a transação. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  async function handleEditTransaction(id: string, form: FormData) {
    setButtonIsLoading(true);

    const transactionEdited = {
      transaction_id: id,
      created_at: date,
      description: form.description,
      amount: form.amount,
      amount_not_converted: null,
      currency_id: currencySelected.id,
      type: transactionType,
      account_id: accountSelected.id,
      category_id: categorySelected.id,
      tenant_id: tenantId
    }

    try {
      const { status } = await api.post('edit_transaction', transactionEdited);

      if (status === 200) {
        Alert.alert("Edição de Transação", "Transação editada com sucesso!", [{ text: "Voltar para a home", onPress: closeRegisterTransaction }]);
      }

      setId();
      setButtonIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Edição de Transação", "Não foi possível editar a transação. Verifique sua conexão com a internet e tente novamente.")

      setButtonIsLoading(false);
    }
  };

  async function handleClickDeleteTransaction(id: string) {
    Alert.alert("Exclusão de transação", "Tem certeza que deseja excluir a transação?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a transação.", onPress: () => handleDeleteTransaction(id) }])
  };

  async function handleDeleteTransaction(id: string) {
    try {
      await api.delete('delete_transaction', {
        params: {
          transaction_id: id
        }
      });

      Alert.alert("Exclusão de transação", "Transação excluída com sucesso!");
      handleCloseRegisterTransaction();
    } catch (error) {
      Alert.alert("Exclusão de transação", `${error}`);
    }
  };

  function handleCloseRegisterTransaction() {
    setId();
    reset();
    setTransactionType('')
    setAccountSelected({
      id: '',
      name: 'Selecione a conta',
      currency: {
        id: '',
        name: '',
        code: '',
        symbol: ''
      },
      initial_amount: 0,
      tenant_id: ''
    });
    setCategorySelected({
      id: '',
      name: 'Selecione a categoria',
      icon: {
        id: '',
        title: '',
        name: '',
      },
      color: {
        id: '',
        name: '',
        hex: theme.colors.primary,
      },
      tenant_id: ''
    });
    closeRegisterTransaction();
  };

  useFocusEffect(useCallback(() => {
    if (id != '') {
      fetchTransaction();
    }
  }, [id]));

  return (
    <Container>
      <Header color={categorySelected.color.hex}>
        <TitleContainer>
          <BorderlessButton onPress={() => handleCloseRegisterTransaction()}>
            <Ionicons name='close' size={26} color={theme.colors.background} />
          </BorderlessButton>
          <Title>
            {
              id != '' ?
                'Editar Transação' :
                'Adicionar Transação'
            }
          </Title>
          {
            id != '' ?
              <BorderlessButton onPress={() => handleClickDeleteTransaction(id)}>
                <Ionicons name='trash-outline' size={26} color={theme.colors.background} />
              </BorderlessButton> :
              <Ionicons name='trash-outline' size={26} color={categorySelected.color.hex} />
          }
        </TitleContainer>

        <HeaderRow>
          <CategorySelectButton
            categorySelected={categorySelected}
            icon={categorySelected.icon?.name}
            color={categorySelected.color.hex}
            onPress={handleOpenSelectCategoryModal}
          />

          <InputTransactionValueContainer>
            <ControlledInputValue
              placeholder='0'
              keyboardType='numeric'
              textAlign='right'
              name='amount'
              control={control}
              error={errors.amount}
            />

            <CurrencySelectButton
              title={currencySelected.symbol}
              onPress={handleOpenSelectCurrencyModal}
            />
          </InputTransactionValueContainer>
        </HeaderRow>
      </Header>

      <SelectButton
        title={accountSelected.name}
        icon='wallet'
        color={categorySelected.color.hex}
        onPress={handleOpenSelectAccountModal}
      />
      {
        transactionType === 'transfer' &&
        <SelectButton
          title={accountDestinationSelected.name}
          icon='wallet'
          color={categorySelected.color.hex}
          onPress={handleOpenSelectAccountDestinationModal}
        />
      }

      <SelectButton
        title={formattedDate}
        icon='calendar'
        color={categorySelected.color.hex}
        onPress={showDatepicker}
      />
      {
        showDatePicker && (
          <DateTimePicker
            testID='dateTimePicker'
            value={date}
            mode='date'
            is24Hour={true}
            onChange={onChangeDate}
            display='spinner'
            dateFormat='day month year'
            textColor='#000'
          />
        )
      }
      <ControlledInputWithIcon
        icon='pencil'
        color={categorySelected.color.hex}
        placeholder='Descrição'
        autoCapitalize='sentences'
        autoCorrect={false}
        defaultValue={description}
        name='description'
        control={control}
        error={errors.description}
      />

      <TransactionsTypes>
        <TransactionTypeButton
          type='up'
          title='Entrada'
          onPress={() => handleTransactionsTypeSelect('income')}
          isActive={transactionType === 'income' || transactionType === 'transferIn'}
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
          isActive={transactionType === 'outcome' || transactionType === 'transferOut'}
        />
      </TransactionsTypes>

      <Footer>
        <Button
          type='secondary'
          title={id != '' ? 'Editar transação' : 'Adicionar Transação'}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleTransactionRegister)}
        />
      </Footer>

      <ModalViewSelection
        visible={categoryModalOpen}
        closeModal={handleCloseSelectCategoryModal}
        title='Selecione a categoria'
      >
        <CategorySelect
          category={categorySelected}
          setCategory={setCategorySelected}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </ModalViewSelection>

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

      <ModalViewSelection
        visible={accountModalOpen}
        closeModal={handleCloseSelectAccountModal}
        title='Selecione a conta'
      >
        <AccountSelect
          account={accountSelected}
          setAccount={setAccountSelected}
          closeSelectAccount={handleCloseSelectAccountModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        visible={accountDestinationModalOpen}
        closeModal={handleCloseSelectAccountDestinationModal}
        title='Selecione a conta de destino'
      >
        <AccountDestinationSelect
          accountDestination={accountDestinationSelected}
          setAccountDestination={setAccountDestinationSelected}
          closeSelectAccountDestination={handleCloseSelectAccountDestinationModal}
        />
      </ModalViewSelection>
    </Container>
  );
}