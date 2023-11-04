import React, { useCallback, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Container, Form, Footer } from './styles';

import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Icon from 'phosphor-react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import SelectDropdown from 'react-native-select-dropdown';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/Button';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ButtonToggle } from '@components/ButtonToggle';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

import { CurrencySelect } from '@screens/CurrencySelect';

import { CurrencyProps } from '@interfaces/currencies';

import { selectUserTenantId } from '@slices/userSlice';

import theme from '@themes/theme';

import api from '@api/api';

type FormData = {
  name: string;
  currency: string;
  initialAmount: number;
};

type Props = {
  id: string;
  closeAccount: () => void;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome da conta'),
  initialAmount: Yup.number()
    .required('Digite o saldo inicial da conta')
    .typeError('Digite somente números e pontos.'),
});
/* Validation Form - End */

export function RegisterAccount({ id, closeAccount }: Props) {
  const tenantId = useSelector(selectUserTenantId);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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
    'Outro',
  ];
  const [typeSelected, setTypeSelected] = useState('');
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);
  const [currencySelected, setCurrencySelected] = useState({
    id: '4',
    name: 'Real Brasileiro',
    code: 'BRL',
    symbol: 'R$',
  } as CurrencyProps);
  const [hideAccount, setHideAccount] = useState(false);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  function handleOpenSelectCurrencyModal() {
    currencyBottomSheetRef.current?.present();
  }

  function handleCloseSelectCurrencyModal() {
    currencyBottomSheetRef.current?.dismiss();
  }

  function handleCloseAccount() {
    reset();
    closeAccount();
  }

  async function handleEditAccount(id: string, form: FormData) {
    const AccountEdited = {
      account_id: id,
      name: form.name,
      type: typeSelected,
      currency_id: currencySelected.id,
      initial_amount: form.initialAmount,
    };
    try {
      const { status } = await api.post('edit_account', AccountEdited);

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
    if (id != '') {
      handleEditAccount(id, form);
    }
    // Add account
    else {
      try {
        const newAccount = {
          name: form.name,
          type: typeSelected,
          currency_id: currencySelected.id,
          initial_amount: form.initialAmount,
          hide: false,
          tenant_id: tenantId,
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
      const { data } = await api.get('single_account', {
        params: {
          account_id: id,
        },
      });

      setName(data.name);
      setInitialAmount(data.initial_amount);
      setTypeSelected(data.type);
      setCurrencySelected(data.currency);
      setHideAccount(data.hide);
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

    const HideAccountOption = {
      account_id: id,
      hide: !hideAccount,
    };
    try {
      const { status } = await api.post('edit_hide_account', HideAccountOption);

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
      if (id != '') {
        fetchAccount();
      }
    }, [id])
  );

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Form>
        <ControlledInputWithIcon
          icon={<Icon.PencilSimple color={theme.colors.primary} />}
          placeholder='Nome'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue={name}
          name='name'
          control={control}
          error={errors.name}
        />

        <ControlledInputWithIcon
          icon={<Icon.Money color={theme.colors.primary} />}
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
          icon={<Icon.Coins color={theme.colors.primary} />}
          onPress={handleOpenSelectCurrencyModal}
        />

        <SelectDropdown
          data={accountTypes}
          onSelect={(selectedItem) => {
            setTypeSelected(selectedItem);
          }}
          defaultButtonText={
            id != '' ? typeSelected : 'Selecione o tipo da conta'
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
            return <Icon.CaretRight size={20} color={theme.colors.text} />;
          }}
          dropdownIconPosition='right'
          rowStyle={{ backgroundColor: theme.colors.background }}
          rowTextStyle={{ color: theme.colors.text }}
          dropdownStyle={{ borderRadius: 10 }}
        />

        {id != '' && (
          <ButtonToggle
            icon={<Icon.EyeSlash color={theme.colors.primary} />}
            title={!hideAccount ? 'Ocultar conta' : 'Exibir conta'}
            onValueChange={handleHideAccount}
            value={hideAccount}
            isEnabled={hideAccount}
          />
        )}
      </Form>

      <Footer>
        <Button
          type='secondary'
          title={id != '' ? 'Editar Conta' : 'Criar Conta'}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterAccount)}
        />
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
    </Container>
  );
}
