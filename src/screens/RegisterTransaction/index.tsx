import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import {
  Container,
  MainContent,
  Header,
  TitleContainer,
  Title,
  HeaderRow,
  InputTransactionValueContainer,
  ContentScroll,
  TransactionImageContainer,
  TransactionImage,
  TransactionsTypes,
  Footer,
} from './styles';

import { convertCurrency } from '@utils/convertCurrency';

import axios from 'axios';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import * as Icon from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageView from 'react-native-image-viewing';
import { yupResolver } from '@hookform/resolvers/yup';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { BorderlessButton } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@components/Button';
import { TagProps } from '@components/TagListItem';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { CurrencySelectButton } from '@components/CurrencySelectButton';
import { CategorySelectButton } from '@components/Form/CategorySelectButton';
import { ControlledInputValue } from '@components/Form/ControlledInputValue';
import { TransactionTypeButton } from '@components/Form/TransactionTypeButton';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { TagListItemRegisterTransaction } from '@components/TagListItemRegisterTransaction';

import { AccountSelect } from '@screens/AccountSelect';
import { CategorySelect } from '@screens/CategorySelect';
import { CurrencySelect } from '@screens/CurrencySelect';
import { AccountDestinationSelect } from '@screens/AccountDestinationSelect';

import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import api from '@api/api';

import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';
import { CurrencyProps } from '@interfaces/currencies';

import theme from '@themes/theme';

type Props = {
  id: string;
  resetId: () => void;
  closeRegisterTransaction: () => void;
  closeModal?: () => void;
};

type FormData = {
  description: string;
  amount: number;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  description: Yup.string().required('Digite a descrição'),
  amount: Yup.number()
    .typeError('Digite um valor numérico')
    .required('Digite o valor'),
});
/* Validation Form - End */

export function RegisterTransaction({
  id,
  resetId,
  closeRegisterTransaction,
  closeModal,
}: Props) {
  const { id: userID } = useUser();
  const categoryBottomSheetRef = useRef<BottomSheetModal>(null);
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);
  const accountBottomSheetRef = useRef<BottomSheetModal>(null);
  const accountDestinationBottomSheetRef = useRef<BottomSheetModal>(null);
  const [categorySelected, setCategorySelected] = useState({
    id: '',
    name: 'Selecione a categoria',
    color: {
      hex: theme.colors.primary,
    },
  } as CategoryProps);
  const [currencySelected, setCurrencySelected] = useState({
    id: '4',
    name: 'Real Brasileiro',
    code: 'BRL',
    symbol: 'R$',
  } as CurrencyProps);
  const {
    accountId: accountID,
    accountName,
    accountCurrency,
    accountType,
    accountInitialAmount,
    accountTenantId: accountTenantID,
    setAccountId: setAccountID,
    setAccountName,
    setAccountCurrency,
    setAccountType,
    setAccountInitialAmount,
  } = useCurrentAccountSelected();
  const [accountDestinationSelected, setAccountDestinationSelected] = useState({
    id: '',
    name: 'Selecione a conta de destino',
  } as AccountProps);
  const [date, setDate] = useState(new Date());
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (_: any, selectedDate: any) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };
  const [bankTransactionID, setBankTransactionID] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [tags, setTags] = useState<TagProps[]>([]);
  const [tagsSelected, setTagsSelected] = useState<TagProps[]>([]);
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openImage, setOpenImage] = useState(false);
  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  // Currency Quotes
  const {
    brlQuoteBtc,
    brlQuoteEur,
    brlQuoteUsd,
    btcQuoteBrl,
    btcQuoteEur,
    btcQuoteUsd,
    eurQuoteBrl,
    eurQuoteBtc,
    eurQuoteUsd,
    usdQuoteBrl,
    usdQuoteEur,
    usdQuoteBtc,
  } = useQuotes();

  async function fetchTags() {
    setButtonIsLoading(true);

    try {
      const { data } = await api.get('tag', {
        params: {
          user_id: userID,
        },
      });
      if (data) {
        setTags(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Etiquetas',
        'Não foi possível buscar as etiquetas. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setButtonIsLoading(false);
    }
  }

  function handleTransactionsTypeSelect(type: 'CREDIT' | 'DEBIT' | 'transfer') {
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal() {
    categoryBottomSheetRef.current?.present();
  }

  function handleCloseSelectCategoryModal() {
    categoryBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectCurrencyModal() {
    currencyBottomSheetRef.current?.present();
  }

  function handleCloseSelectCurrencyModal() {
    currencyBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectAccountModal() {
    accountBottomSheetRef.current?.present();
  }

  function handleCloseSelectAccountModal() {
    accountBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectAccountDestinationModal() {
    accountDestinationBottomSheetRef.current?.present();
  }

  function handleCloseSelectAccountDestinationModal() {
    accountDestinationBottomSheetRef.current?.dismiss();
  }

  function handleCloseRegisterTransaction() {
    setButtonIsLoading(true);

    resetId();
    reset();
    setTransactionType('');
    setAccountID(null);
    setAccountName(null);
    setAccountCurrency(null);
    // setAccountInitialAmount(0);
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
      tenant_id: '',
    });
    setTagsSelected([]);
    closeRegisterTransaction();
  }

  function handleSelectTag(tag: TagProps) {
    const tagAlreadySelected = tagsSelected.includes(tag);

    if (!tagAlreadySelected) {
      setTagsSelected((prevState) => [...prevState, tag]);
    } else {
      setTagsSelected((prevState) =>
        prevState.filter((item) => item.id !== tag.id)
      );
    }
  }

  async function handleSelectImage() {
    try {
      const imageSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!imageSelected.canceled && imageSelected.assets[0].base64) {
        setImage(imageSelected.assets[0].base64);
        setImageUrl(imageSelected.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTakePhoto() {
    try {
      const photoTacked = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!photoTacked.canceled && photoTacked.assets[0].base64) {
        setImage(photoTacked.assets[0].base64);
        setImageUrl(photoTacked.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleClickSelectImage() {
    Alert.alert('Selecionar Imagem', undefined, [
      { text: 'Tirar foto', onPress: handleTakePhoto },
      { text: 'Selecionar da biblioteca', onPress: handleSelectImage },
    ]);
  }

  function handleOpenImage() {
    setOpenImage(true);
  }

  function handleCloseImage() {
    setOpenImage(false);
  }

  async function handleEditTransaction(id: string, form: FormData) {
    setButtonIsLoading(true);

    let tagsList: any = [];
    for (const tag of tagsSelected) {
      const tag_id = tag.id;
      if (!tagsList.hasOwnProperty(tag_id)) {
        tagsList[tag_id] = {
          tag_id: tag.id,
        };
      }
    }
    tagsList = Object.values(tagsList);

    let transaction_image_id: number | null = null;
    // TODO: Gets current image transaction ID, delete and then adds new
    if (image !== '') {
      const newImage = {
        file: `data:image/jpeg;base64,${image}`,
        user_id: userID,
      };
      const uploadImage = await api.post('transaction/image', newImage);
      if (uploadImage.status === 200) {
        const imageData = uploadImage.data;

        transaction_image_id = imageData.id;
      }
    }

    let amountConverted = form.amount;
    amountConverted = convertCurrency({
      amount: form.amount,
      fromCurrency: currencySelected.code,
      toCurrency: accountCurrency!.code,
      accountCurrency: currencySelected.code, // A moeda da conta deve ser igual a moeda selecionada para não haver dupla conversão,
      quotes: {
        brlQuoteBtc,
        brlQuoteEur,
        brlQuoteUsd,
        btcQuoteBrl,
        btcQuoteEur,
        btcQuoteUsd,
        eurQuoteBrl,
        eurQuoteBtc,
        eurQuoteUsd,
        usdQuoteBrl,
        usdQuoteBtc,
        usdQuoteEur,
      },
    });

    try {
      if (transactionType === 'transfer') {
        const transferEdited = {
          transaction_id: id,
          created_at: date,
          date: transactionDate,
          description: form.description,
          amount: form.amount, // Usar valor original (da transação)
          amount_in_account_currency:
            currencySelected.code !== accountCurrency?.code
              ? amountConverted
              : null,
          currency_id: currencySelected.id,
          type:
            accountType === 'CREDIT' // Credit Card Account
              ? form.amount > 0
                ? 'TRANSFER_DEBIT' // Credit Card with POSITIVE value is DEBIT transaction
                : 'TRANSFER_CREDIT' // Credit Card with NEGATIVE value is CREDIT transaction
              : form.amount > 0 // Another accounts
              ? 'TRANSFER_CREDIT'
              : 'TRANSFER_DEBIT',
          account_id: accountID,
          category_id: categorySelected.id,
          tags: tagsList,
          transaction_image_id,
          user_id: userID,
        };

        const transferEditedResponse = await api.patch(
          'transaction/edit',
          transferEdited
        );

        if (accountDestinationSelected.id !== '') {
          const newTransfer = {
            created_at: date,
            bank_transaction_id: bankTransactionID,
            date: transactionDate,
            description: form.description,
            amount: form.amount, // Usar valor original (da transação)
            amount_in_account_currency:
              currencySelected.code !== accountCurrency?.code
                ? amountConverted
                : null,
            currency_id: currencySelected.id,
            type:
              transferEdited.type === 'TRANSFER_DEBIT'
                ? 'TRANSFER_CREDIT'
                : 'TRANSFER_DEBIT',
            account_id: accountDestinationSelected.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            user_id: userID,
          };

          const newTransferResponse = await api.post(
            'transaction',
            newTransfer
          );

          if (
            transferEditedResponse.status &&
            newTransferResponse.status === 200
          ) {
            Alert.alert(
              'Cadastro de Transação',
              'Transação cadastrada com sucesso!',
              [
                { text: 'Cadastrar nova transação' },
                {
                  text: 'Voltar para a tela anterior',
                  onPress: closeRegisterTransaction,
                },
              ]
            );
          }
          return;
        }

        if (transferEditedResponse.status === 200) {
          Alert.alert(
            'Cadastro de Transação',
            'Transação cadastrada com sucesso!',
            [
              { text: 'Cadastrar nova transação' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]
          );
        }
        return;
      }

      const transactionEdited = {
        transaction_id: id,
        created_at: date,
        date: transactionDate,
        description: form.description,
        amount: form.amount,
        amount_in_account_currency:
          currencySelected.code !== accountCurrency?.code
            ? amountConverted
            : null,
        currency_id: currencySelected.id,
        type: transactionType,
        account_id: accountID,
        category_id: categorySelected.id,
        tags: tagsList,
        transaction_image_id,
        user_id: userID,
      };

      const { status } = await api.patch('transaction/edit', transactionEdited);

      if (status === 200) {
        Alert.alert('Edição de Transação', 'Transação editada com sucesso!', [
          {
            text: 'Voltar para a tela anterior',
            onPress: handleCloseRegisterTransaction,
          },
        ]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('handleEditTransaction error =>', error);
        Alert.alert(
          'Edição de Transação',
          (error.response?.data as { message: string }).message,
          [
            { text: 'Tentar novamente' },
            {
              text: 'Voltar para a tela anterior',
              onPress: handleCloseRegisterTransaction,
            },
          ]
        );
      }
    } finally {
      reset();
      setTransactionType('');
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
        tenant_id: '',
      });
      setTagsSelected([]);
      tagsList = [];
      setImage('');

      setButtonIsLoading(false);
    }
  }

  async function handleRegisterTransaction(form: FormData) {
    setButtonIsLoading(true);

    /* Validation Form - Start */
    if (!transactionType) {
      return Alert.alert(
        'Cadastro de Transação',
        'Selecione o tipo da transação',
        [
          {
            text: 'OK',
            onPress: () => setButtonIsLoading(false),
          },
        ]
      );
    }

    if (accountID === null) {
      return Alert.alert(
        'Cadastro de Transação',
        'Selecione a conta da transação',
        [
          {
            text: 'OK',
            onPress: () => setButtonIsLoading(false),
          },
        ]
      );
    }

    if (categorySelected.id === '') {
      return Alert.alert(
        'Cadastro de Transação',
        'Selecione a categoria da transação',
        [
          {
            text: 'OK',
            onPress: () => setButtonIsLoading(false),
          },
        ]
      );
    }
    /* Validation Form - End */

    // Edit Transaction
    if (id !== '') {
      handleEditTransaction(id, form);
      return;
    }

    let tagsList: any = [];
    for (const tag of tagsSelected) {
      const tag_id = tag.id;
      if (!tagsList.hasOwnProperty(tag_id)) {
        tagsList[tag_id] = {
          tag_id: tag.id,
        };
      }
    }
    tagsList = Object.values(tagsList);

    let transaction_image_id: number | null = null;
    if (image !== '') {
      const newImage = {
        file: `data:image/jpeg;base64,${image}`,
        user_id: userID,
      };
      const { data, status } = await api.post('transaction/image', newImage);
      if (status === 200) {
        transaction_image_id = data.id;
      }
    }

    try {
      let amountConverted = form.amount;

      if (transactionType === 'transfer') {
        const fromCurrency = currencySelected.code; // Moeda selecionada
        const toCurrency = accountDestinationSelected.currency.code; // Moeda da conta de destino

        amountConverted = convertCurrency({
          amount: form.amount,
          fromCurrency,
          toCurrency,
          accountCurrency: accountCurrency!.code,
          quotes: {
            brlQuoteBtc,
            brlQuoteEur,
            brlQuoteUsd,
            btcQuoteBrl,
            btcQuoteEur,
            btcQuoteUsd,
            eurQuoteBrl,
            eurQuoteBtc,
            eurQuoteUsd,
            usdQuoteBrl,
            usdQuoteBtc,
            usdQuoteEur,
          },
        });

        const accountDestinationResponse = await api.get(
          'single_account_get_id',
          {
            params: {
              user_id: userID,
              name: accountDestinationSelected.name,
            },
          }
        );
        if (accountDestinationResponse.status !== 200) {
          Alert.alert(
            'Conta',
            'Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.'
          );
        }

        const transferDebit = {
          created_at: date,
          description: form.description,
          amount: form.amount,
          amount_in_account_currency:
            fromCurrency !== accountCurrency!.code // If transaction currency is different to account currency
              ? amountConverted
              : null,
          currency_id: currencySelected.id,
          type: 'TRANSFER_DEBIT',
          account_id: accountID,
          category_id: categorySelected.id,
          tags: tagsList,
          transaction_image_id,
          user_id: userID,
        };

        const transferCredit = {
          created_at: date,
          description: form.description,
          amount: form.amount,
          amount_in_account_currency:
            fromCurrency !== accountCurrency!.code // If transaction currency is different to account currency
              ? amountConverted
              : null,
          currency_id: currencySelected.id,
          type: 'TRANSFER_CREDIT',
          account_id: accountDestinationSelected.id,
          category_id: categorySelected.id,
          tags: tagsList,
          transaction_image_id,
          user_id: userID,
        };

        const [transferDebitResponse, transferCreditResponse] =
          await Promise.all([
            api.post('transaction', transferDebit),
            api.post('transaction', transferCredit),
          ]);

        if (
          transferDebitResponse.status &&
          transferCreditResponse.status === 200
        ) {
          Alert.alert(
            'Cadastro de Transação',
            'Transação cadastrada com sucesso!',
            [
              { text: 'Cadastrar nova transação' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]
          );
          return;
        }
      } else {
        amountConverted = convertCurrency({
          amount: form.amount,
          fromCurrency: currencySelected.code,
          toCurrency: accountCurrency!.code,
          accountCurrency: currencySelected.code, // A moeda da conta deve ser igual a moeda selecionada para não haver dupla conversão
          quotes: {
            brlQuoteBtc,
            brlQuoteEur,
            brlQuoteUsd,
            btcQuoteBrl,
            btcQuoteEur,
            btcQuoteUsd,
            eurQuoteBrl,
            eurQuoteBtc,
            eurQuoteUsd,
            usdQuoteBrl,
            usdQuoteBtc,
            usdQuoteEur,
          },
        });

        const accountResponse = await api.get('account/single_account_get_id', {
          params: {
            user_id: userID,
            name: accountName,
          },
        });

        const transactionData = {
          created_at: date,
          description: form.description,
          amount: form.amount,
          amount_in_account_currency:
            currencySelected.code !== accountCurrency!.code // If transaction currency is different to account currency
              ? amountConverted
              : null,
          currency_id: currencySelected.id,
          type: transactionType,
          account_id: accountResponse.data.id,
          category_id: categorySelected.id,
          tags: tagsList,
          transaction_image_id,
          user_id: userID,
        };

        const { status } = await api.post('transaction', transactionData);
        if (status === 200) {
          Alert.alert(
            'Cadastro de Transação',
            'Transação cadastrada com sucesso!',
            [
              { text: 'Cadastrar nova transação' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]
          );
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(
          'Cadastro de Transação',
          (error.response?.data as { message: string }).message,
          [
            { text: 'Tentar novamente' },
            {
              text: 'Voltar para a tela anterior',
              onPress: closeRegisterTransaction,
            },
          ]
        );
      }
    } finally {
      reset();
      setTransactionType('');
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
        tenant_id: '',
      });
      setTagsSelected([]);
      tagsList = [];
      setImage('');
      setImageUrl('');

      setButtonIsLoading(false);
    }
  }

  async function fetchTransaction() {
    try {
      setButtonIsLoading(true);

      const { data } = await api.get('transaction/single', {
        params: {
          transaction_id: id,
        },
      });
      setCategorySelected(data.category);
      setValue('amount', data.amount);
      setCurrencySelected(data.account.currency);
      setAccountID(data.account.id);
      setAccountName(data.account.name);
      setAccountCurrency(data.account.currency);
      setAccountType(data.account.type);
      const parsedDate = new Date(data.created_at);
      setDate(parsedDate);
      setValue('description', data.description);
      setTagsSelected(data.tags);
      {
        data.image && setImageUrl(data.image.url);
      }
      setTransactionType(data.type);
      setTransactionDate(data.date);
      setBankTransactionID(data.bank_transaction_id);
      // setValue('amount', data.amount_in_account_currency);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Transação',
        'Não foi possível buscar a transação. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleDeleteTransaction(id: string) {
    try {
      await api.delete('transaction/delete', {
        params: {
          transaction_id: id,
        },
      });
      Alert.alert('Exclusão de transação', 'Transação excluída com sucesso!');
      handleCloseRegisterTransaction();
    } catch (error) {
      Alert.alert('Exclusão de transação', `${error}`);
    }
  }

  async function handleClickDeleteTransaction(id: string) {
    Alert.alert(
      'Exclusão de transação',
      'Tem certeza que deseja excluir a transação?',
      [
        { text: 'Não, cancelar a exclusão' },
        {
          text: 'Sim, excluir a transação',
          onPress: () => handleDeleteTransaction(id),
        },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchTags();

      if (id !== '') {
        fetchTransaction();
      }
    }, [id])
  );

  return (
    <Container>
      <MainContent>
        <Header color={categorySelected.color.hex}>
          <TitleContainer>
            <BorderlessButton
              onPress={closeModal}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <Icon.X size={24} color={theme.colors.background} weight='bold' />
            </BorderlessButton>
            <Title>
              {id !== ''
                ? `Editar Transação \n ${getValues('description')}`
                : 'Adicionar Transação'}
            </Title>
            {id !== '' && (
              <BorderlessButton
                onPress={() => handleClickDeleteTransaction(id)}
                style={{ position: 'absolute', top: 0, right: 0 }}
              >
                <Icon.Trash
                  size={24}
                  color={theme.colors.background}
                  weight='bold'
                />
              </BorderlessButton>
            )}
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
                defaultValue={String(getValues('amount'))}
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

        <ContentScroll>
          <SelectButton
            title={accountName || 'Selecione a conta'}
            icon={<Icon.Wallet color={theme.colors.primary} />}
            onPress={handleOpenSelectAccountModal}
          />
          {transactionType === 'transfer' && (
            <SelectButton
              title={accountDestinationSelected.name}
              icon={<Icon.Wallet color={theme.colors.primary} />}
              onPress={handleOpenSelectAccountDestinationModal}
            />
          )}

          <SelectButton
            title={formattedDate}
            icon={<Icon.Calendar color={theme.colors.primary} />}
            onPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              testID='dateTimePicker'
              value={date}
              mode='date'
              is24Hour={true}
              onChange={onChangeDate}
              dateFormat='day month year'
              textColor={theme.colors.text}
            />
          )}

          <ControlledInputWithIcon
            icon={<Icon.PencilSimple color={theme.colors.primary} />}
            placeholder='Descrição'
            autoCapitalize='sentences'
            autoCorrect={false}
            returnKeyType='go'
            defaultValue={String(getValues('description'))}
            name='description'
            control={control}
            error={errors.description}
            onSubmitEditing={handleSubmit(handleRegisterTransaction)}
          />

          <SelectButton
            title='Etiquetas'
            icon={<Icon.Tag color={theme.colors.primary} />}
          />
          <FlatList
            data={tags}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: any) => (
              <TagListItemRegisterTransaction
                data={item}
                isChecked={tagsSelected.includes(item)}
                color={categorySelected.color.hex}
                onPress={() => handleSelectTag(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 12,
            }}
          />

          <SelectButton
            title={imageUrl !== '' ? 'Alterar imagem' : 'Selecionar imagem'}
            icon={<Icon.Image color={theme.colors.primary} />}
            onPress={handleClickSelectImage}
          />
          {imageUrl !== '' && (
            <TransactionImageContainer onPress={handleOpenImage}>
              <TransactionImage source={{ uri: imageUrl }} />
            </TransactionImageContainer>
          )}

          <TransactionsTypes>
            <TransactionTypeButton
              type='down'
              title='Crédito'
              onPress={() => handleTransactionsTypeSelect('CREDIT')}
              isActive={transactionType === 'CREDIT'}
            />
            <TransactionTypeButton
              type='swap'
              title='Transf'
              onPress={() => handleTransactionsTypeSelect('transfer')}
              isActive={
                transactionType === 'transfer' ||
                transactionType === 'TRANSFER_CREDIT' ||
                transactionType === 'TRANSFER_DEBIT'
              }
            />
            <TransactionTypeButton
              type='up'
              title='Débito'
              onPress={() => handleTransactionsTypeSelect('DEBIT')}
              isActive={transactionType === 'DEBIT'}
            />
          </TransactionsTypes>
        </ContentScroll>
      </MainContent>

      <Footer>
        <Button.Root
          type='secondary'
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterTransaction)}
        >
          <Button.Text
            type='secondary'
            text={id !== '' ? 'Editar Transação' : 'Adicionar Transação'}
          />
        </Button.Root>
      </Footer>

      <ModalViewSelection
        $modal
        title='Selecione a categoria'
        bottomSheetRef={categoryBottomSheetRef}
        snapPoints={['50%']}
      >
        <CategorySelect
          categorySelected={categorySelected}
          setCategory={setCategorySelected}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        $modal
        title='Selecione a moeda'
        bottomSheetRef={currencyBottomSheetRef}
        snapPoints={['50%']}
      >
        <CurrencySelect
          currency={currencySelected}
          setCurrency={setCurrencySelected}
          closeSelectCurrency={handleCloseSelectCurrencyModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        $modal
        title='Selecione a conta'
        bottomSheetRef={accountBottomSheetRef}
        snapPoints={['50%']}
      >
        <AccountSelect
          account={{
            id: accountID,
            name: accountName || 'Selecione a conta',
            currency: accountCurrency || {
              id: '4',
              name: 'Real Brasileiro',
              code: 'BRL',
              symbol: 'R$',
            },
            type: accountType || 'BANK',
            balance: 0,
            initialAmount: accountInitialAmount,
            tenantId: accountTenantID,
          }}
          setAccount={(account: AccountProps) => {
            setAccountID(account.id);
            setAccountName(account.name);
            setAccountCurrency(account.currency);
            setAccountType(account.type);
            setCurrencySelected(account.currency);
            setAccountInitialAmount(account.initialAmount || 0);
          }}
          closeSelectAccount={handleCloseSelectAccountModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        $modal
        title='Selecione a conta de destino'
        bottomSheetRef={accountDestinationBottomSheetRef}
        snapPoints={['50%']}
        onClose={handleCloseSelectAccountDestinationModal}
      >
        <AccountDestinationSelect
          accountDestination={accountDestinationSelected}
          setAccountDestination={setAccountDestinationSelected}
          closeSelectAccountDestination={
            handleCloseSelectAccountDestinationModal
          }
        />
      </ModalViewSelection>

      <ImageView
        images={[{ uri: imageUrl }]}
        imageIndex={0}
        visible={openImage}
        onRequestClose={handleCloseImage}
        swipeToCloseEnabled={false}
      />
    </Container>
  );
}
