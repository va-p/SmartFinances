import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  AmountContainer,
  AmountGroup,
  CurrencyGroup,
  Footer,
} from './styles';

import DateTimePicker from '@react-native-community/datetimepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import * as Yup from 'yup';
import axios from 'axios';

import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';
import { CategorySelect } from '@screens/CategorySelect';
import { SelectButton } from '@components/SelectButton';
import { AccountSelect } from '@screens/AccountSelect';
import { Button } from '@components/Button';

import {
  BudgetPeriodSelect,
  ChartPeriodProps,
} from '@screens/BudgetPeriodSelect';

import { selectUserTenantId } from '@slices/userSlice';

import theme from '@themes/theme';

import api from '@api/api';

type Props = {
  id: string;
  closeBudget: () => void;
};

type FormData = {
  name: string;
  amount: string;
};

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome'),
  amount: Yup.number()
    .typeError('Digite um valor númerico')
    .positive('O valor não pode ser negativo')
    .required('Digite o valor'),
});
/* Validation Form - End */

export function RegisterBudget({ id, closeBudget }: Props) {
  const tenantId = useSelector(selectUserTenantId);
  const [startDate, setStartDate] = useState(new Date());
  const formattedDate = format(startDate, 'dd MMMM, yyyy', { locale: ptBR });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (_: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setStartDate(currentDate);
  };
  const accountBottomSheetRef = useRef<BottomSheetModal>(null);
  const [accountSelected, setAccountSelected] = useState({
    id: '',
    name: 'Todas as contas',
    currency: {
      symbol: 'R$',
    },
  } as AccountProps);
  const categoryBottomSheetRef = useRef<BottomSheetModal>(null);
  const [categorySelected, setCategorySelected] = useState({
    id: '',
    name: 'Todas as categorias',
    color: {
      hex: theme.colors.primary,
    },
  } as CategoryProps);
  const periodBottomSheetRef = useRef<BottomSheetModal>(null);
  const [budgetPeriodSelected, setBudgetPeriodSelected] =
    useState<ChartPeriodProps>({
      id: '4',
      name: 'Mensalmente',
      period: 'monthly',
    });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const currencies = [
    'BRL - Real Brasileiro',
    'BTC - Bitcoin',
    'EUR - Euro',
    'USD - Dólar Americano',
  ];
  const [currencySelected, setCurrencySelected] = useState('');

  function handleOpenSelectAccountModal() {
    accountBottomSheetRef.current?.present();
  }

  function handleCloseSelectAccountModal() {
    accountBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectCategoryModal() {
    categoryBottomSheetRef.current?.present();
  }

  function handleCloseSelectCategoryModal() {
    categoryBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectChartPeriodModal() {
    periodBottomSheetRef.current?.present();
  }

  function handleCloseSelectChartPeriodModal() {
    periodBottomSheetRef.current?.dismiss();
  }

  async function handleRegisterBudget(form: FormData) {
    setButtonIsLoading(true);

    try {
      const newBudget = {
        name: form.name,
        amount: form.amount,
        currency_id: 4,
        account_id: accountSelected.id,
        category_id: categorySelected.id,
        start_date: startDate,
        recurrence: budgetPeriodSelected.period,
        tenant_id: tenantId,
      };

      const { status } = await api.post('budget', newBudget);
      if (status === 200) {
        Alert.alert(
          'Cadastro de Orçamento',
          'Orçamento cadastrado com sucesso!',
          [
            { text: 'Cadastrar novo orçamento' },
            {
              text: 'Voltar para a tela anterior',
              onPress: closeBudget,
            },
          ]
        );
        reset();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Cadastro de Orçamento', error.response?.data.message, [
          { text: 'Tentar novamente' },
          {
            text: 'Voltar para a tela anterior',
            onPress: closeBudget,
          },
        ]);
      }
    } finally {
      setButtonIsLoading(false);
    }
  }

  return (
    <Container>
      <ControlledInputWithIcon
        icon='pencil'
        color={categorySelected.color.hex}
        placeholder='Nome do orçamento'
        autoCapitalize='sentences'
        autoCorrect={false}
        defaultValue=''
        name='name'
        control={control}
        error={errors.name}
      />

      <AmountContainer>
        <AmountGroup>
          <ControlledInputWithIcon
            icon='cash'
            color={categorySelected.color.hex}
            placeholder='Valor do orçamento'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue=''
            name='amount'
            control={control}
            error={errors.amount}
          />
        </AmountGroup>

        <CurrencyGroup>
          <SelectDropdown
            data={currencies}
            onSelect={(selectedItem) => {
              setCurrencySelected(selectedItem);
            }}
            defaultButtonText='Moeda'
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
              return (
                <Ionicons
                  name='chevron-down-outline'
                  size={20}
                  color={theme.colors.text}
                />
              );
            }}
            dropdownIconPosition='right'
            rowStyle={{ backgroundColor: theme.colors.background }}
            rowTextStyle={{ color: theme.colors.text }}
            dropdownStyle={{ borderRadius: 10 }}
          />
        </CurrencyGroup>
      </AmountContainer>

      <SelectButton
        title='Orçamento para'
        subTitle={categorySelected.name}
        icon='apps'
        color={categorySelected.color.hex}
        onPress={handleOpenSelectCategoryModal}
      />

      <SelectButton
        title='Data de início'
        subTitle={formattedDate}
        icon='calendar'
        color={categorySelected.color.hex}
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          testID='dateTimePicker'
          value={startDate}
          mode='date'
          is24Hour={true}
          onChange={onChangeDate}
          dateFormat='day month year'
          textColor={theme.colors.text}
        />
      )}

      <SelectButton
        title='Repetir'
        subTitle={budgetPeriodSelected.name}
        icon='repeat'
        color={categorySelected.color.hex}
        onPress={handleOpenSelectChartPeriodModal}
      />

      <Footer>
        <Button
          type='secondary'
          title='Criar orçamento'
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterBudget)}
        />
      </Footer>

      <ModalViewSelection
        title='Contas'
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
        title='Categorias'
        bottomSheetRef={categoryBottomSheetRef}
        snapPoints={['50%']}
      >
        <CategorySelect
          category={categorySelected}
          setCategory={setCategorySelected}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        title='Período do orçamento'
        bottomSheetRef={periodBottomSheetRef}
        snapPoints={['30%', '50%']}
      >
        <BudgetPeriodSelect
          period={budgetPeriodSelected}
          setPeriod={setBudgetPeriodSelected}
          closeSelectPeriod={handleCloseSelectChartPeriodModal}
        />
      </ModalViewSelection>
    </Container>
  );
}
