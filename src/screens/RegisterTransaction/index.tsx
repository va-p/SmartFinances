import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import {
  Container,
  MainContent,
  Header,
  TitleContainer,
  Title,
  HeaderRow,
  ContentScroll,
  TransactionImageContainer,
  TransactionImage,
  TransactionsTypes,
  Footer,
  InputTransactionValuesContainer,
  InputTransactionValueGroup,
} from './styles';

// Hooks
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from '@hooks/useTransactionMutations';
import { useTransactionDetailQuery } from '@hooks/useTransactionDetailQuery';

// Utils
import { convertCurrency } from '@utils/convertCurrency';

// Dependencies
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import ImageView from 'react-native-image-viewing';
import { yupResolver } from '@hookform/resolvers/yup';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BorderlessButton } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

// Icons
import X from 'phosphor-react-native/src/icons/X';
import Tag from 'phosphor-react-native/src/icons/Tag';
import Trash from 'phosphor-react-native/src/icons/Trash';
import Image from 'phosphor-react-native/src/icons/Image';
import Wallet from 'phosphor-react-native/src/icons/Wallet';
import Calendar from 'phosphor-react-native/src/icons/Calendar';
import PencilSimple from 'phosphor-react-native/src/icons/PencilSimple';

// Components
import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { TagProps } from '@components/TagListItem';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { ControlledInputValue } from '@components/Form/ControlledInputValue';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { CurrencySelectButton } from '@screens/RegisterTransaction/components/CurrencySelectButton';
import { CategorySelectButton } from '@screens/RegisterTransaction/components/CategorySelectButton';
import { TransactionTypeButton } from '@components/TransactionListItem/components/TransactionTypeButton';
import { TagListItemRegisterTransaction } from '@screens/RegisterTransaction/components/TagListItemRegisterTransaction';

// Screens
import { AccountSelect } from '@screens/AccountSelect';
import { CategorySelect } from '@screens/CategorySelect';
import { CurrencySelect } from '@screens/CurrencySelect';
import { AccountDestinationSelect } from '@screens/AccountDestinationSelect';

// Storages
import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

// APIs
import api from '@api/api';

// Interfaces
import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';
import { CurrencyProps } from '@interfaces/currencies';

import theme from '@themes/theme';
import { useTagsQuery } from '@hooks/useTagsQuery';

type Props = {
  id: string;
  resetId: () => void;
  closeRegisterTransaction: () => void;
  closeModal?: () => void;
};

type FormData = {
  description: string;
  amount: number;
  amountInAccountCurrency?: number | null;
};

enum CustomTab {
  Credit,
  Transfer,
  Debit,
}

type TransactionTypeButton = {
  title: string;
};

type TransactionTabType = 'CREDIT' | 'DEBIT' | 'TRANSFER' | '';

/* Validation Form - Start */
const schema = Yup.object().shape({
  description: Yup.string().required('Digite a descrição'),
  amount: Yup.number()
    .typeError('Digite um valor numérico')
    .required('Digite o valor'),
  amountInAccountCurrency: Yup.number().nullable(),
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
      color_code: theme.colors.primary,
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
  const [bankTransactionID, setBankTransactionID] = useState(null);
  const [transactionDate, setTransactionDate] = useState('');
  const [relatedTransactionID, setRelatedTransactionID] = useState(null);
  const [transactionType, setTransactionType] =
    useState<TransactionTabType>('CREDIT');
  const [selectedTransactionTab, setSelectedTransactionTab] =
    useState<CustomTab>(CustomTab.Credit);
  // const [tags, setTags] = useState<TagProps[]>([]);
  const [tagsSelected, setTagsSelected] = useState<TagProps[]>([]);
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openImage, setOpenImage] = useState(false);

  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransactionMutation();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateTransactionMutation();
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransactionMutation();

  const { data: tagsData, isLoading: isLoadingTags } = useTagsQuery(userID);
  const { data: transactionData, isLoading: isLoadingDetails } =
    useTransactionDetailQuery(id);

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
      amountInAccountCurrency: null,
    },
  });
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

  const categoriesSectionButtons: TransactionTypeButton[] = [
    {
      title: 'Crédito',
    },
    {
      title: 'Transf',
    },
    {
      title: 'Débito',
    },
  ];

  function handleTransactionsTypeSelect(tabIdx: number) {
    let transactionType: TransactionTabType;
    switch (tabIdx) {
      case 0:
        transactionType = 'CREDIT';
        break;
      case 1:
        transactionType = 'TRANSFER';
        break;
      case 2:
        transactionType = 'DEBIT';
        break;
      default:
        transactionType = 'CREDIT';
        break;
    }

    setSelectedTransactionTab(tabIdx);
    setTransactionType(transactionType);
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

  async function handleEditTransaction(form: FormData) {
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

    const fromCurrency = currencySelected.code; // Moeda selecionada

    let amountConverted = form.amount;
    amountConverted = convertCurrency({
      amount: form.amount,
      fromCurrency: currencySelected.code,
      toCurrency:
        transactionType === 'TRANSFER' && accountDestinationSelected.id !== ''
          ? accountDestinationSelected.currency.code
          : accountCurrency!.code,
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

    // --- Transfer Transaction ---
    if (transactionType === 'TRANSFER') {
      const transactionType =
        form.amount > 0 ? 'TRANSFER_CREDIT' : 'TRANSFER_DEBIT';
      const relatedTransactionType =
        transactionType === 'TRANSFER_CREDIT'
          ? 'TRANSFER_DEBIT'
          : 'TRANSFER_CREDIT';
      const amountInAccountCurrencyRelatedTransaction =
        fromCurrency !== accountDestinationSelected.currency!.code // If transaction currency is different to account currency
          ? relatedTransactionType === 'TRANSFER_CREDIT'
            ? Math.abs(amountConverted)
            : amountConverted
          : null;

      const transferEditedPayload = {
        transaction_id: id,
        created_at: date,
        bank_transaction_id: bankTransactionID,
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
        // Informações para o backend lidar com a contrapartida
        related_transaction_account_id: accountDestinationSelected.id,
        related_transaction_type: relatedTransactionType,
        amount_in_account_currency_related_transaction:
          amountInAccountCurrencyRelatedTransaction,
        user_id: userID,
      };

      updateTransaction(transferEditedPayload, {
        onSuccess: () => {
          Alert.alert('Edição de Transação', 'Transação editada com sucesso!', [
            {
              text: 'Voltar para a tela anterior',
              onPress: closeRegisterTransaction,
            },
          ]);
        },
      });
      return;
    }

    // --- Plain Transaction, NO transfer ---
    const transactionEditedPayload = {
      transaction_id: id,
      created_at: date,
      bank_transaction_id: bankTransactionID,
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

    updateTransaction(transactionEditedPayload, {
      onSuccess: () => {
        Alert.alert('Edição de Transação', 'Transação editada com sucesso!', [
          {
            text: 'Voltar para a tela anterior',
            onPress: closeRegisterTransaction,
          },
        ]);
        closeModal?.();
      },
    });
  }

  async function handleRegisterTransaction(form: FormData) {
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

    let amountConverted = form.amount;

    // --- Transfer transaction ---
    if (transactionType === 'TRANSFER') {
      const fromCurrency = currencySelected.code; // Moeda selecionada
      const toCurrency = accountDestinationSelected.currency.code; // Moeda da conta de destino
      const transactionType =
        form.amount > 0 ? 'TRANSFER_CREDIT' : 'TRANSFER_DEBIT';
      const relatedTransactionType =
        transactionType === 'TRANSFER_CREDIT'
          ? 'TRANSFER_DEBIT'
          : 'TRANSFER_CREDIT';

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

      const amountInAccountCurrencyRelatedTransaction =
        fromCurrency !== accountDestinationSelected.currency!.code // If transaction currency is different to account currency
          ? relatedTransactionType === 'TRANSFER_CREDIT'
            ? Math.abs(amountConverted)
            : amountConverted
          : null;

      const transferPayload = {
        created_at: date,
        description: form.description,
        amount: form.amount,
        amount_in_account_currency:
          fromCurrency !== accountCurrency!.code // If transaction currency is different to account currency
            ? amountConverted
            : null,
        currency_id: currencySelected.id,
        type: transactionType,
        account_id: accountID,
        category_id: categorySelected.id,
        tags: tagsList,
        transaction_image_id,
        related_transaction_account_id: accountDestinationSelected.id,
        amount_in_account_currency_related_transaction:
          amountInAccountCurrencyRelatedTransaction,
        related_transaction_type: relatedTransactionType,
        user_id: userID,
      };

      createTransaction(transferPayload, {
        onSuccess: () => {
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
          reset();
          return;
        },
      });
      return;
    }

    // --- Plain Transaction, NO transfer ---
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

    const transactionPayload = {
      created_at: date,
      description: form.description,
      amount: form.amount,
      amount_in_account_currency:
        currencySelected.code !== accountCurrency!.code // If transaction currency is different to account currency
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

    createTransaction(transactionPayload, {
      onSuccess: () => {
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
        reset();
      },
    });
    return;
  }

  async function onSubmit(form: FormData) {
    // --- Validation Form - Start ---
    if (!transactionType) {
      return Alert.alert(
        'Cadastro de Transação',
        'Selecione o tipo da transação',
        [
          {
            text: 'OK',
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
          },
        ]
      );
    }
    // --- Validation Form - End ---

    // --- Edit Transaction ---
    if (id !== '') {
      handleEditTransaction(form);
    }
    // --- Register Transaction ---
    else {
      handleRegisterTransaction(form);
    }
  }

  async function handleDeleteTransaction(id: string) {
    try {
      deleteTransaction(id, {
        onSuccess: () => {
          resetId();
          closeRegisterTransaction();
        },
      });
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

  useEffect(() => {
    if (transactionData && id !== '') {
      setCategorySelected(transactionData.category);
      setValue('amount', transactionData.amount);
      setValue(
        'amountInAccountCurrency',
        transactionData.amount_in_account_currency
      );
      setCurrencySelected(transactionData.currency);
      setAccountID(transactionData.account.id);
      setAccountName(transactionData.account.name);
      setAccountCurrency(transactionData.account.currency);
      setAccountType(transactionData.account.type);
      const parsedDate = new Date(transactionData.created_at);
      setDate(parsedDate);
      setValue('description', transactionData.description);
      setTagsSelected(transactionData.tags);
      {
        transactionData.image && setImageUrl(transactionData.image.url);
      }
      setTransactionType(transactionData.type);
      let transactionTab: number;
      switch (transactionData.type) {
        case 'CREDIT':
          transactionTab = 0;
          break;
        case 'TRANSFER_CREDIT':
        case 'TRANSFER_DEBIT':
          transactionTab = 1;
          break;
        case 'DEBIT':
          transactionTab = 2;
          break;
        default:
          transactionTab = 0;
          break;
      }
      setSelectedTransactionTab(transactionTab);
      setTransactionDate(transactionData.date);
      setBankTransactionID(transactionData.bank_transaction_id);
      setRelatedTransactionID(transactionData.related_transaction_id);
    }
  }, [transactionData]);

  if (isLoadingTags || isLoadingDetails) {
    return false;
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <MainContent>
          <Header color={categorySelected.color.color_code}>
            <TitleContainer>
              <BorderlessButton
                onPress={closeModal}
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <X size={24} color={theme.colors.text} weight='bold' />
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
                  <Trash size={24} color={theme.colors.text} weight='bold' />
                </BorderlessButton>
              )}
            </TitleContainer>

            <HeaderRow>
              <CategorySelectButton
                categorySelected={categorySelected}
                icon={categorySelected.icon?.name}
                color={categorySelected.color.color_code}
                onPress={handleOpenSelectCategoryModal}
              />

              <InputTransactionValuesContainer>
                <InputTransactionValueGroup>
                  <ControlledInputValue
                    placeholder={String(getValues('amount'))}
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
                </InputTransactionValueGroup>

                {getValues('amountInAccountCurrency') !== null && (
                  <InputTransactionValueGroup>
                    <ControlledInputValue
                      keyboardType='numeric'
                      textAlign='right'
                      style={{ minHeight: 32, maxHeight: 32, fontSize: 14 }}
                      defaultValue={String(
                        getValues('amountInAccountCurrency')
                      )}
                      name='amountInAccountCurrency'
                      control={control}
                      error={errors.amountInAccountCurrency}
                    />

                    <CurrencySelectButton
                      title={accountCurrency?.symbol || ''}
                      iconSize={10}
                      hideArrow
                      style={{ width: 25, minHeight: 20, maxHeight: 20 }}
                    />
                  </InputTransactionValueGroup>
                )}
              </InputTransactionValuesContainer>
            </HeaderRow>
          </Header>

          <ContentScroll>
            <SelectButton
              title={accountName || 'Selecione a conta'}
              icon={<Wallet color={categorySelected.color.color_code} />}
              onPress={handleOpenSelectAccountModal}
            />
            {transactionType === 'TRANSFER' && (
              <SelectButton
                title={accountDestinationSelected.name}
                icon={<Wallet color={categorySelected.color.color_code} />}
                onPress={handleOpenSelectAccountDestinationModal}
              />
            )}

            <SelectButton
              title={formattedDate}
              icon={<Calendar color={categorySelected.color.color_code} />}
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
              icon={<PencilSimple color={categorySelected.color.color_code} />}
              placeholder='Descrição'
              numberOfLines={2}
              autoCapitalize='sentences'
              autoCorrect={false}
              returnKeyType='go'
              defaultValue={String(getValues('description'))}
              name='description'
              control={control}
              error={errors.description}
              onSubmitEditing={handleSubmit(onSubmit)}
            />

            <SelectButton
              title='Etiquetas'
              icon={<Tag color={categorySelected.color.color_code} />}
            />
            <FlatList
              data={tagsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: any) => (
                <TagListItemRegisterTransaction
                  data={item}
                  isChecked={tagsSelected.includes(item)}
                  color={categorySelected.color.color_code}
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
              icon={<Image color={categorySelected.color.color_code} />}
              onPress={handleClickSelectImage}
            />
            {imageUrl !== '' && (
              <TransactionImageContainer onPress={handleOpenImage}>
                <TransactionImage source={{ uri: imageUrl }} />
              </TransactionImageContainer>
            )}

            <TransactionsTypes>
              <TransactionTypeButton
                buttons={categoriesSectionButtons}
                selectedTab={selectedTransactionTab}
                setSelectedTab={handleTransactionsTypeSelect}
              />
            </TransactionsTypes>
          </ContentScroll>
        </MainContent>

        <Footer>
          <Button.Root
            isLoading={isCreating || isUpdating || isDeleting}
            onPress={handleSubmit(onSubmit)}
          >
            <Button.Text
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
          snapPoints={['75%']}
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
              balance: '0',
              initialAmount: accountInitialAmount,
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
          snapPoints={['75%']}
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
    </Screen>
  );
}
