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

import axios from 'axios';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSelector } from 'react-redux';
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
  selectUsdQuoteEur,
} from '@slices/quotesSlice';
import { useUser } from '@stores/userStore';

import api from '@api/api';

import theme from '@themes/theme';

import { AccountProps } from '@interfaces/accounts';
import { CategoryProps } from '@interfaces/categories';
import { CurrencyProps } from '@interfaces/currencies';

type Props = {
  id: string;
  resetId: () => void;
  account?: AccountProps;
  closeRegisterTransaction: () => void;
  closeModal?: () => void;
};

type FormData = {
  description: string;
  amount: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  description: Yup.string().required('Digite a descrição'),
  amount: Yup.number()
    .typeError('Digite um valor numérico')
    .positive('O valor não pode ser negativo')
    .required('Digite o valor'),
});
/* Validation Form - End */

export function RegisterTransaction({
  id,
  resetId,
  account = {
    id: '',
    name: 'Selecione a conta',
    currency: {
      id: '4',
      name: 'Real Brasileiro',
      code: 'BRL',
      symbol: 'R$',
    },
    initialAmount: 0,
    tenantId: null,
  },
  closeRegisterTransaction,
  closeModal,
}: Props) {
  const tenantId = useUser((state) => state.tenantId);
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
  const [amount, setAmount] = useState('');
  const [amountNotConverted, setAmountNotConverted] = useState();
  const [currencySelected, setCurrencySelected] = useState({
    id: '4',
    name: 'Real Brasileiro',
    code: 'BRL',
    symbol: 'R$',
  } as CurrencyProps);
  const [accountSelected, setAccountSelected] = useState(account);
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
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [tags, setTags] = useState<TagProps[]>([]);
  const [tagsSelected, setTagsSelected] = useState<TagProps[]>([]);
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openImage, setOpenImage] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  async function fetchTags() {
    setButtonIsLoading(true);

    try {
      const { data } = await api.get('tag', {
        params: {
          tenant_id: tenantId,
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

  function handleTransactionsTypeSelect(type: 'credit' | 'debit' | 'transfer') {
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
    resetId();
    reset();
    setTransactionType('');
    setAccountSelected({
      id: '',
      name: 'Selecione a conta',
      currency: {
        id: '',
        name: '',
        code: '',
        symbol: '',
      },
      initialAmount: 0,
      tenantId: null,
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

    let imageResponse: any = null;
    let transaction_image_id: number | null = null;
    if (image !== '') {
      const newImage = {
        file: `data:image/jpeg;base64,${image}`,
        tenant_id: tenantId,
      };
      const uploadImage = await api.post('upload/transaction_image', newImage);
      if (uploadImage.status === 200) {
        imageResponse = await api.get('single_transaction_image_get_id', {
          params: {
            tenant_id: tenantId,
          },
        });
        transaction_image_id = imageResponse.data.id;
      }
    }

    // Need conversion
    if (currencySelected.code !== accountSelected.currency.code) {
      let amountConverted = 0;

      switch (accountSelected.currency.code) {
        // Converted BTC
        case 'BTC':
          switch (currencySelected.code) {
            case 'BRL':
              amountConverted = Number(form.amount) * brlQuoteBtc.price;
              break;
            case 'EUR':
              amountConverted = Number(form.amount) * eurQuoteBtc.price;
              break;
            case 'USD':
              amountConverted = Number(form.amount) * usdQuoteBtc.price;
              break;
          }
          break;
        // Converted BRL
        case 'BRL':
          switch (currencySelected.code) {
            case 'BTC':
              amountConverted = Number(form.amount) * btcQuoteBrl.price;
              break;
            case 'EUR':
              amountConverted = Number(form.amount) * eurQuoteBrl.price;
              break;
            case 'USD':
              amountConverted = Number(form.amount) * usdQuoteBrl.price;
              break;
          }
          break;
        // Converted EUR
        case 'EUR':
          switch (currencySelected.code) {
            case 'BTC':
              amountConverted = Number(form.amount) * btcQuoteEur.price;
              break;
            case 'BRL':
              amountConverted = Number(form.amount) * brlQuoteEur.price;
              break;
            case 'USD':
              amountConverted = Number(form.amount) * usdQuoteEur.price;
              break;
          }
          break;
        // Converted USD
        case 'USD':
          switch (currencySelected.code) {
            case 'BTC':
              amountConverted = Number(form.amount) * btcQuoteUsd.price;
              break;
            case 'BRL':
              amountConverted = Number(form.amount) * brlQuoteUsd.price;
              break;
            case 'EUR':
              amountConverted = Number(form.amount) * eurQuoteUsd.price;
              break;
          }
          break;
      }

      try {
        const transactionEdited = {
          transaction_id: id,
          created_at: date,
          description: form.description,
          amount: amountConverted,
          amount_not_converted: form.amount,
          currency_id: currencySelected.id,
          type: transactionType,
          account_id: accountSelected.id,
          category_id: categorySelected.id,
          tags: tagsList,
          transaction_image_id,
          tenant_id: tenantId,
        };

        const { status } = await api.post(
          'edit_transaction',
          transactionEdited
        );
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
          Alert.alert('Edição de Transação', error.response?.data.message, [
            { text: 'Tentar novamente' },
            {
              text: 'Voltar para a tela anterior',
              onPress: handleCloseRegisterTransaction,
            },
          ]);
        }
      } finally {
        reset();
        setTransactionType('');
        setAccountSelected({
          id: '',
          name: 'Selecione a conta',
          currency: {
            id: '',
            name: '',
            code: '',
            symbol: '',
          },
          initialAmount: 0,
          tenantId: null,
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
          tenant_id: '',
        });
        setTagsSelected([]);
        tagsList = [];
        setImage('');

        setButtonIsLoading(false);
      }
    }
    // No need conversion
    else {
      try {
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
          tags: tagsList,
          transaction_image_id,
          tenant_id: tenantId,
        };

        const { status } = await api.post(
          'edit_transaction',
          transactionEdited
        );
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
          Alert.alert('Edição de Transação', error.response?.data.message, [
            { text: 'Tentar novamente' },
            {
              text: 'Voltar para a tela anterior',
              onPress: handleCloseRegisterTransaction,
            },
          ]);
        }
      } finally {
        setButtonIsLoading(false);

        reset();
        setTransactionType('');
        setAccountSelected({
          id: '',
          name: 'Selecione a conta',
          currency: {
            id: '',
            name: '',
            code: '',
            symbol: '',
          },
          initialAmount: 0,
          tenantId: null,
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
          tenant_id: '',
        });
        setTagsSelected([]);
        tagsList = [];
        setImage('');
      }
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

    if (accountSelected.id === '') {
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

    if (transactionType === 'transfer') {
      if (accountDestinationSelected.id === '')
        return Alert.alert(
          'Cadastro de Transação',
          'Selecione a conta de destino da transação',
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
        tenant_id: tenantId,
      };
      const { data, status } = await api.post(
        'upload/transaction_image',
        newImage
      );
      if (status === 200) {
        transaction_image_id = data.id;
      }
    }

    // Add Transaction
    if (transactionType !== 'transfer') {
      // Need conversion
      if (currencySelected.code !== accountSelected.currency.code) {
        let amountConverted = 0;
        switch (accountSelected.currency.code) {
          // Converted BTC
          case 'BTC':
            switch (currencySelected.code) {
              case 'BRL':
                amountConverted = Number(form.amount) * brlQuoteBtc.price;
                break;
              case 'EUR':
                amountConverted = Number(form.amount) * eurQuoteBtc.price;
                break;
              case 'USD':
                amountConverted = Number(form.amount) * usdQuoteBtc.price;
                break;
            }
            break;
          // Converted BRL
          case 'BRL':
            switch (currencySelected.code) {
              case 'BTC':
                amountConverted = Number(form.amount) * btcQuoteBrl.price;
                break;
              case 'EUR':
                amountConverted = Number(form.amount) * eurQuoteBrl.price;
                break;
              case 'USD':
                amountConverted = Number(form.amount) * usdQuoteBrl.price;
                break;
            }
            break;
          // Converted EUR
          case 'EUR':
            switch (currencySelected.code) {
              case 'BTC':
                amountConverted = Number(form.amount) * btcQuoteEur.price;
                break;
              case 'BRL':
                amountConverted = Number(form.amount) * brlQuoteEur.price;
                break;
              case 'USD':
                amountConverted = Number(form.amount) * usdQuoteEur.price;
                break;
            }
            break;
          // Converted USD
          case 'USD':
            switch (currencySelected.code) {
              case 'BTC':
                amountConverted = Number(form.amount) * btcQuoteUsd.price;
                break;
              case 'BRL':
                amountConverted = Number(form.amount) * brlQuoteUsd.price;
                break;
              case 'EUR':
                amountConverted = Number(form.amount) * eurQuoteUsd.price;
                break;
            }
            break;
        }

        try {
          const accountResponse = await api.get('single_account_get_id', {
            params: {
              tenant_id: tenantId,
              name: accountSelected.name,
            },
          });

          const newTransaction = {
            created_at: date,
            description: form.description,
            amount: amountConverted,
            amount_not_converted: form.amount,
            currency_id: currencySelected.id,
            type: transactionType,
            account_id: accountResponse.data.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            tenant_id: tenantId,
          };
          const { status } = await api.post('transaction', newTransaction);
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
        } catch (error) {
          if (axios.isAxiosError(error)) {
            Alert.alert('Cadastro de Transação', error.response?.data.message, [
              { text: 'Tentar novamente' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]);
          }
        } finally {
          reset();
          setTransactionType('');
          setAccountSelected({
            id: '',
            name: 'Selecione a conta',
            currency: {
              id: '',
              name: '',
              code: '',
              symbol: '',
            },
            initialAmount: 0,
            tenantId: null,
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
            tenant_id: '',
          });
          setTagsSelected([]);
          tagsList = [];
          setImage('');
          setImageUrl('');

          setButtonIsLoading(false);
        }
      }
      // No need conversion
      else {
        try {
          const accountResponse = await api.get('single_account_get_id', {
            params: {
              tenant_id: tenantId,
              name: accountSelected.name,
            },
          });

          const newTransaction = {
            created_at: date,
            description: form.description,
            amount: form.amount,
            amount_not_converted: null,
            currency_id: currencySelected.id,
            type: transactionType,
            account_id: accountResponse.data.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            tenant_id: tenantId,
          };
          const { status } = await api.post('transaction', newTransaction);
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
        } catch (error) {
          if (axios.isAxiosError(error)) {
            Alert.alert('Cadastro de Transação', error.response?.data.message, [
              { text: 'Tentar novamente' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]);
          }
        } finally {
          reset();
          setTransactionType('');
          setAccountSelected({
            id: '',
            name: 'Selecione a conta',
            currency: {
              id: '',
              name: '',
              code: '',
              symbol: '',
            },
            initialAmount: 0,
            tenantId: null,
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
            tenant_id: '',
          });
          setTagsSelected([]);
          tagsList = [];
          setImage('');
          setImageUrl('');

          setButtonIsLoading(false);
        }
      }
      return;
    }

    // Transfer Transaction
    if (transactionType === 'transfer') {
      // Need conversion
      if (
        accountSelected.currency.code !==
        accountDestinationSelected.currency.code
      ) {
        let amountConverted = 0;
        switch (accountSelected.currency.code) {
          // Converted BTC
          case 'BTC':
            switch (accountDestinationSelected.currency.code) {
              case 'BRL':
                amountConverted = Number(form.amount) * btcQuoteBrl.price;
                break;
              case 'EUR':
                amountConverted = Number(form.amount) * btcQuoteEur.price;
                break;
              case 'USD':
                amountConverted = Number(form.amount) * btcQuoteUsd.price;
                break;
            }
            break;
          // Converted BRL
          case 'BRL':
            switch (accountDestinationSelected.currency.code) {
              case 'BTC':
                amountConverted = Number(form.amount) * brlQuoteBtc.price;

                console.log('brlQuoteBtc.price >>>', brlQuoteBtc.price);
                console.log('amountConverted >>>', amountConverted);
                break;
              case 'EUR':
                amountConverted = Number(form.amount) * brlQuoteEur.price;
                break;
              case 'USD':
                amountConverted = Number(form.amount) * brlQuoteUsd.price;
                break;
            }
            break;
          // Converted EUR
          case 'EUR':
            switch (accountDestinationSelected.currency.code) {
              case 'BTC':
                amountConverted = Number(form.amount) * eurQuoteBtc.price;
                break;
              case 'BRL':
                amountConverted = Number(form.amount) * eurQuoteBrl.price;
                break;
              case 'USD':
                amountConverted = Number(form.amount) * eurQuoteUsd.price;
                break;
            }
            break;
          // Converted USD
          case 'USD':
            switch (accountDestinationSelected.currency.code) {
              case 'BTC':
                amountConverted = Number(form.amount) * usdQuoteBtc.price;
                break;
              case 'BRL':
                amountConverted = Number(form.amount) * usdQuoteBrl.price;
                break;
              case 'EUR':
                amountConverted = Number(form.amount) * usdQuoteEur.price;
                break;
            }
            break;
        }

        try {
          const accountResponse = await api.get('single_account_get_id', {
            params: {
              tenant_id: tenantId,
              name: accountSelected.name,
            },
          });
          const accountDestinationResponse = await api.get(
            'single_account_get_id',
            {
              params: {
                tenant_id: tenantId,
                name: accountDestinationSelected.name,
              },
            }
          );
          if (
            accountResponse.status &&
            accountDestinationResponse.status !== 200
          ) {
            Alert.alert(
              'Conta',
              'Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.'
            );
          }

          const transferDebit = {
            created_at: date,
            description: form.description,
            amount: form.amount,
            amount_not_converted: null,
            currency_id: currencySelected.id,
            type: 'transferDebit',
            account_id: accountResponse.data.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            tenant_id: tenantId,
          };

          const transferCredit = {
            created_at: date,
            description: form.description,
            amount: amountConverted,
            amount_not_converted: form.amount,
            currency_id: accountDestinationResponse.data.currency_id,
            type: 'transferCredit',
            account_id: accountDestinationResponse.data.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            tenant_id: tenantId,
          };

          const transferDebitResponse = await api.post(
            'transaction',
            transferDebit
          );
          const transferCreditResponse = await api.post(
            'transaction',
            transferCredit
          );
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
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            Alert.alert('Cadastro de Transação', error.response?.data.message, [
              { text: 'Tentar novamente' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]);
          }
        } finally {
          reset();
          setTransactionType('');
          setAccountSelected({
            id: '',
            name: 'Selecione a conta',
            currency: {
              id: '',
              name: '',
              code: '',
              symbol: '',
            },
            initialAmount: 0,
            tenantId: null,
          });
          setAccountDestinationSelected({
            id: '',
            name: 'Selecione a conta de destino',
            currency: {
              id: '',
              name: '',
              code: '',
              symbol: '',
            },
            initialAmount: 0,
            tenantId: null,
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
            tenant_id: '',
          });
          setTagsSelected([]);
          tagsList = [];
          setImage('');
          setImageUrl('');

          setButtonIsLoading(false);
        }
      }
      // No need conversion
      else {
        try {
          const accountResponse = await api.get('single_account_get_id', {
            params: {
              tenant_id: tenantId,
              name: accountSelected.name,
            },
          });
          const accountDestinationResponse = await api.get(
            'single_account_get_id',
            {
              params: {
                tenant_id: tenantId,
                name: accountDestinationSelected.name,
              },
            }
          );
          if (
            accountResponse.status &&
            accountDestinationResponse.status !== 200
          ) {
            Alert.alert(
              'Conta',
              'Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.'
            );
          }

          const transferDebit = {
            created_at: date,
            description: form.description,
            amount: form.amount,
            amount_not_converted: null,
            currency_id: currencySelected.id,
            type: 'transferDebit',
            account_id: accountResponse.data.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            tenant_id: tenantId,
          };

          const transferCredit = {
            created_at: date,
            description: form.description,
            amount: form.amount,
            amount_not_converted: null,
            currency_id: accountDestinationResponse.data.currency_id,
            type: 'transferCredit',
            account_id: accountDestinationResponse.data.id,
            category_id: categorySelected.id,
            tags: tagsList,
            transaction_image_id,
            tenant_id: tenantId,
          };

          const transferDebitResponse = await api.post(
            'transaction',
            transferDebit
          );
          const transferCreditResponse = await api.post(
            'transaction',
            transferCredit
          );
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
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            Alert.alert('Cadastro de Transação', error.response?.data.message, [
              { text: 'Tentar novamente' },
              {
                text: 'Voltar para a tela anterior',
                onPress: closeRegisterTransaction,
              },
            ]);
          }
        } finally {
          reset();
          setTransactionType('');
          setAccountSelected({
            id: '',
            name: 'Selecione a conta',
            currency: {
              id: '',
              name: '',
              code: '',
              symbol: '',
            },
            initialAmount: 0,
            tenantId: null,
          });
          setAccountDestinationSelected({
            id: '',
            name: 'Selecione a conta de destino',
            currency: {
              id: '',
              name: '',
              code: '',
              symbol: '',
            },
            initialAmount: 0,
            tenantId: null,
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
            tenant_id: '',
          });
          setTagsSelected([]);
          tagsList = [];
          setImage('');
          setImageUrl('');

          setButtonIsLoading(false);
        }
      }

      return;
    }
  }

  async function fetchTransaction() {
    setButtonIsLoading(true);

    try {
      const { data } = await api.get('single_transaction', {
        params: {
          transaction_id: id,
        },
      });
      setCategorySelected(data.category);
      setAmount(data.amount);
      setAmountNotConverted(data.amount_not_converted);
      setCurrencySelected(data.currency);
      setAccountSelected(data.account);
      const parsedDate = new Date(data.created_at);
      setDate(parsedDate);
      setDescription(data.description);
      setTagsSelected(data.tags);
      {
        data.image && setImageUrl(data.image.url);
      }
      setTransactionType(data.type);
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
      await api.delete('delete_transaction', {
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
                ? `Editar Transação \n ${description}`
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
                defaultValue={
                  amountNotConverted
                    ? String(amountNotConverted)
                    : String(amount)
                }
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
            title={accountSelected.name}
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
            defaultValue={description}
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
              onPress={() => handleTransactionsTypeSelect('credit')}
              isActive={
                transactionType === 'credit' ||
                transactionType === 'transferCredit'
              }
            />
            <TransactionTypeButton
              type='swap'
              title='Transf'
              onPress={() => handleTransactionsTypeSelect('transfer')}
              isActive={transactionType === 'transfer'}
            />
            <TransactionTypeButton
              type='up'
              title='Débito'
              onPress={() => handleTransactionsTypeSelect('debit')}
              isActive={
                transactionType === 'debit' ||
                transactionType === 'transferDebit'
              }
            />
          </TransactionsTypes>
        </ContentScroll>
      </MainContent>

      <Footer>
        <Button
          type='secondary'
          title={id !== '' ? 'Editar Transação' : 'Adicionar Transação'}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterTransaction)}
        />
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
          account={accountSelected}
          setAccount={setAccountSelected}
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
