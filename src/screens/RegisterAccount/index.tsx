import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native';
import { Container, Form, Footer, ErrorMessage } from './styles';

// Dependencies
import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { yupResolver } from '@hookform/resolvers/yup';
import SelectDropdown from 'react-native-select-dropdown';
import { useFocusEffect } from 'expo-router';

// Icons
import Bank from 'phosphor-react-native/src/icons/Bank';
import Money from 'phosphor-react-native/src/icons/Money';
import Coins from 'phosphor-react-native/src/icons/Coins';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';
import PencilSimple from 'phosphor-react-native/src/icons/PencilSimple';

// Components
import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

// Screens
import { CurrencySelect } from '@screens/CurrencySelect';
import { InstitutionSelect } from '@screens/InstitutionSelect';

// Storages
import { useUser } from '@stores/userStorage';
import { useCurrenciesStore } from '@storage/currenciesStore';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { AccountTypes } from '@interfaces/accounts';
import { CurrencyProps } from '@interfaces/currencies';
import { InstitutionProps } from '@interfaces/institutions';

import api from '@api/api';

type FormData = {
  name: string;
  currency: string;
  balance: number;
  type?: string;
  institution_id?: string | null;
};

type Props = {
  id: string | null;
  closeAccount: () => void;
};

// Account types that, in practice, always have a real financial institution
// behind them (per context.md decision #2 / AC11.3) — the institution field
// is required for these, optional for the rest (AC11.4).
const ACCOUNT_TYPES_REQUIRING_INSTITUTION = ['BANK', 'INVESTMENTS', 'CREDIT'];

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome da conta'),
  balance: Yup.number()
    .required('Digite o saldo da conta')
    .typeError('Digite um valor numérico'),
  type: Yup.string(),
  institution_id: Yup.string()
    .nullable()
    .when('type', {
      is: (type: string) =>
        ACCOUNT_TYPES_REQUIRING_INSTITUTION.includes(type),
      then: (currentSchema) =>
        currentSchema.required('Selecione a instituição financeira'),
    }),
});
/* Validation Form - End */

export function RegisterAccount({ id, closeAccount }: Props) {
  const theme = useTheme() as ThemeProps;
  const { id: userID } = useUser();
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
      name: '',
      balance: 0,
      type: '',
      institution_id: null,
    },
  });
  const accountTypes: AccountTypes[] = [
    'Cartão de Crédito',
    'Carteira',
    'Carteira de Criptomoedas',
    'Conta Corrente',
    'Investimentos',
    'Poupança',
    'Outro',
  ];
  const [typeSelected, setTypeSelected] = useState('');
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);
  const currencies = useCurrenciesStore((state) => state.currencies);
  const [currencySelected, setCurrencySelected] = useState<CurrencyProps>(
    () => currencies.find((c) => c.code === 'BRL') || ({
      id: 0,
      name: '',
      code: 'BRL' as CurrencyProps['code'],
      symbol: '',
    })
  );
  const [hideAccount, setHideAccount] = useState(false);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const institutionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [institutionSelected, setInstitutionSelected] =
    useState<InstitutionProps | null>(null);

  // When creating a new account, pre-select BRL as the base currency.
  // The currency list is fetched globally in _layout and stored in Zustand.
  useEffect(() => {
    if (id === '' && currencies.length > 0 && !currencySelected.id) {
      const brl = currencies.find((c) => c.code === 'BRL');
      if (brl) {
        setCurrencySelected(brl);
      }
    }
  }, [currencies, id, currencySelected.id]);

  const accountTypeMap: Record<string, string> = {
    CREDIT: 'Cartão de Crédito',
    WALLET: 'Carteira',
    'CRYPTOCURRENCY WALLET': 'Carteira de Criptomoedas',
    BANK: 'Conta Corrente',
    INVESTMENTS: 'Investimentos',
    OTHER: 'Outro',
  };

  const institutionIsOptional = !ACCOUNT_TYPES_REQUIRING_INSTITUTION.includes(
    typeSelected
  );
  const institutionLabel = institutionIsOptional
    ? 'Instituição financeira (opcional)'
    : 'Instituição financeira';

  function handleOpenSelectCurrencyModal() {
    currencyBottomSheetRef.current?.present();
  }

  function handleCloseSelectCurrencyModal() {
    currencyBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectInstitutionModal() {
    institutionBottomSheetRef.current?.present();
  }

  function handleCloseSelectInstitutionModal() {
    institutionBottomSheetRef.current?.dismiss();
  }

  function handleSetType(type: string) {
    setTypeSelected(type);
    setValue('type', type, { shouldValidate: true });
  }

  function handleSetInstitution(institution: InstitutionProps | null) {
    setInstitutionSelected(institution);
    setValue('institution_id', institution?.id ?? null, {
      shouldValidate: true,
    });
  }

  function handleCloseAccount() {
    reset();
    closeAccount();
  }

  async function handleEditAccount(id: string | null, form: FormData) {
    const AccountEdited = {
      account_id: id,
      name: form.name,
      type: typeSelected,
      currency_id: currencySelected.id, // TODO: only if is manual account
      balance: form.balance,
      hide: hideAccount,
      institution_id: institutionSelected?.id ?? null,
    };
    try {
      const { status } = await api.patch('account/edit', AccountEdited);

      if (status === 200) {
        Alert.alert('Edição de Conta', 'Conta editada com sucesso!', [
          { text: 'Ok', onPress: handleCloseAccount },
        ]);
      }
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Edição de Conta', error.response?.data.message, [
          { text: 'Tentar novamente' },
          { text: 'Voltar para a tela anterior', onPress: handleCloseAccount },
        ]);
      }
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleRegisterAccount(form: FormData) {
    setButtonIsLoading(true);

    /* Validation Form - Start */
    if (!typeSelected) {
      return Alert.alert('Cadastro de Conta', 'Selecione o tipo da conta', [
        {
          text: 'OK',
          onPress: () => setButtonIsLoading(false),
        },
      ]);
    }

    if (!currencySelected) {
      return Alert.alert('Cadastro de Conta', 'Selecione a moeda da conta', [
        {
          text: 'OK',
          onPress: () => setButtonIsLoading(false),
        },
      ]);
    }
    /* Validation Form - End */

    // Edit account
    if (id !== '') {
      handleEditAccount(id, form);
    }
    // Add account
    else {
      try {
        const newAccount = {
          name: form.name,
          type: typeSelected,
          currency_id: currencySelected.id,
          balance: form.balance,
          hide: false,
          user_id: userID,
          institution_id: institutionSelected?.id ?? null,
        };
        const { status } = await api.post('account', newAccount);
        if (status === 200) {
          Alert.alert('Cadastro de Conta', 'Conta cadastrada com sucesso!', [
            { text: 'Cadastrar nova conta' },
            {
              text: 'Voltar para a tela anterior',
              onPress: () => handleCloseAccount,
            },
          ]);
        }
        reset();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Alert.alert('Cadastro de Conta', error.response?.data.message, [
            { text: 'Tentar novamente' },
            {
              text: 'Voltar para a tela anterior',
              onPress: handleCloseAccount,
            },
          ]);
        }
      } finally {
        setButtonIsLoading(false);
      }
    }
  }

  async function fetchAccount() {
    try {
      const { data } = await api.get(`account/${id}`);

      setValue('name', data.name);
      setValue('balance', data.balance);
      handleSetType(data.type);
      setCurrencySelected(data.currency);
      setHideAccount(data.hide);
      handleSetInstitution(data.institution ?? null);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Conta',
        'Não foi possível buscar a conta. Verifique sua conexão com a internet e tente novamente.'
      );
    }
  }

  async function handleHideAccount() {
    setButtonIsLoading(true);

    try {
      const { status } = await api.patch(`account/${id}`, {
        hide: !hideAccount,
      });

      if (status === 200) {
        Alert.alert('Edição de Conta', 'Conta editada com sucesso!');
        setHideAccount((prevState) => !prevState);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Edição de Conta',
        'Erro ao editar a conta. Por favor, tente novamente.'
      );
    } finally {
      setButtonIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (id !== '') {
        fetchAccount();
      }
    }, [id])
  );

  return (
    <Screen>
      <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }}>
        <Form>
          <ControlledInputWithIcon
            icon={<PencilSimple color={theme.colors.primary} />}
            placeholder='Nome da conta'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue={String(getValues('name'))}
            name='name'
            control={control}
            error={errors.name}
          />

          <ControlledInputWithIcon
            icon={<Money color={theme.colors.primary} />}
            placeholder='Saldo da conta'
            keyboardType='decimal-pad'
            returnKeyType='go'
            defaultValue={String(getValues('balance'))}
            name='balance'
            control={control}
            error={errors.balance}
            onSubmitEditing={handleSubmit(handleRegisterAccount)}
          />

          <SelectButton
            title={currencySelected.name}
            icon={<Coins color={theme.colors.primary} />}
            onPress={handleOpenSelectCurrencyModal}
          />

          <SelectDropdown
            data={accountTypes}
            onSelect={(selectedItem) => {
              switch (selectedItem) {
                case 'Cartão de Crédito':
                  handleSetType('CREDIT');
                  break;
                case 'Carteira':
                  handleSetType('WALLET');
                  break;
                case 'Carteira de Criptomoedas':
                  handleSetType('CRYPTOCURRENCY WALLET');
                  break;
                case 'Conta Corrente':
                  handleSetType('BANK');
                  break;
                case 'Investimentos':
                case 'Poupança':
                  handleSetType('INVESTMENTS');
                  break;
                case 'Outro':
                  handleSetType('OTHER');
                  break;
                default:
                  handleSetType('WALLET');
              }
            }}
            defaultButtonText={
              id !== ''
                ? accountTypeMap[typeSelected]
                : 'Selecione o tipo da conta'
            }
            buttonTextAfterSelection={(selectedItem) => {
              return selectedItem;
            }}
            rowTextForSelection={(item) => {
              return item;
            }}
            buttonStyle={{
              width: '100%',
              minHeight: 40,
              maxHeight: 40,
              marginTop: 10,
              backgroundColor: theme.colors.shape,
              borderRadius: 10,
            }}
            buttonTextStyle={{
              fontFamily: theme.fonts.regular,
              fontSize: 15,
              textAlign: 'left',
              color: theme.colors.text,
            }}
            renderDropdownIcon={() => {
              return <CaretRight size={20} color={theme.colors.text} />;
            }}
            dropdownIconPosition='right'
            rowStyle={{ backgroundColor: theme.colors.background }}
            rowTextStyle={{ color: theme.colors.text }}
            dropdownStyle={{ borderRadius: 10 }}
          />

          <SelectButton
            title={institutionLabel}
            subTitle={institutionSelected?.name ?? 'Selecione a instituição'}
            icon={<Bank color={theme.colors.primary} />}
            onPress={handleOpenSelectInstitutionModal}
          />
          {errors.institution_id && (
            <ErrorMessage>{errors.institution_id.message}</ErrorMessage>
          )}

          {id !== '' && (
            <ButtonToggle
              icon={<EyeSlash color={theme.colors.primary} />}
              title={!hideAccount ? 'Ocultar conta' : 'Exibir conta'}
              onValueChange={handleHideAccount}
              value={hideAccount}
              isEnabled={hideAccount}
            />
          )}
        </Form>

        <Footer>
          <Button.Root
            type='secondary'
            isLoading={buttonIsLoading}
            onPress={handleSubmit(handleRegisterAccount)}
          >
            <Button.Text text={id !== '' ? 'Editar Conta' : 'Criar Conta'} />
          </Button.Root>
        </Footer>

        <ModalViewSelection
          $modal
          title='Selecione a moeda'
          bottomSheetRef={currencyBottomSheetRef}
          snapPoints={['75%']}
        >
          <CurrencySelect
            currency={currencySelected}
            setCurrency={setCurrencySelected}
            closeSelectCurrency={handleCloseSelectCurrencyModal}
          />
        </ModalViewSelection>

        <ModalViewSelection
          $modal
          title='Selecione a instituição'
          bottomSheetRef={institutionBottomSheetRef}
          snapPoints={['75%']}
        >
          <InstitutionSelect
            institutionSelected={institutionSelected}
            setInstitution={handleSetInstitution}
            closeSelectInstitution={handleCloseSelectInstitutionModal}
          />
        </ModalViewSelection>
          </View>
        </TouchableWithoutFeedback>
      </Container>
    </Screen>
  );
}
