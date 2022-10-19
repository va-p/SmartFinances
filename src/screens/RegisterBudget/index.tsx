import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  AmountContainer,
  AmountGroup,
  CurrencyGroup,
  Footer
} from './styles';

import DateTimePicker from '@react-native-community/datetimepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import * as Yup from 'yup';

import {
  ControlledInputWithIcon
} from '@components/Form/ControlledInputWithIcon';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';
import { CategorySelect } from '@screens/CategorySelect';
import { SelectButton } from '@components/SelectButton';
import { AccountSelect } from '@screens/AccountSelect';
import { Button } from '@components/Button';

import { BudgetPeriodSelect, ChartPeriodProps } from '@screens/BudgetPeriodSelect';

import { selectUserTenantId } from '@slices/userSlice';

import theme from '@themes/theme';

import api from '@api/api';

type FormData = {
  name: string;
  amount: string;
  //recurrence: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  name: Yup
    .string()
    .required("Digite o nome"),
  amount: Yup
    .number()
    .typeError("Digite um valor númerico")
    .positive("O valor não pode ser negativo")
    .required("Digite o valor")
});
/* Validation Form - End */

export function RegisterBudget({ navigation }: any) {
  const tenantId = useSelector(selectUserTenantId);
  const [startDate, setStartDate] = useState(new Date());
  const formattedDate = format(startDate, 'dd MMMM, yyyy', { locale: ptBR });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setStartDate(currentDate);
  };
  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountSelected, setAccountSelected] = useState({
    id: '',
    name: 'Todas as contas',
    currency: {
      symbol: 'R$'
    }
  } as AccountProps);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState({
    id: '',
    name: 'Todas as categorias',
    color: {
      hex: theme.colors.primary
    }
  } as CategoryProps);
  const [budgetPeriodModalOpen, setBudgetPeriodModalOpen] = useState(false);
  const [budgetPeriodSelected, setBudgetPeriodSelected] = useState<ChartPeriodProps>({
    id: '4',
    name: 'Mensalmente',
    period: 'monthly'
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const currencies = [
    'BRL - Real Brasileiro',
    'BTC - Bitcoin',
    'EUR - Euro',
    'USD - Dólar Americano'
  ];
  const [currencySelected, setCurrencySelected] = useState('');
  /*const [simbol, setSimbol] = useState('');

  switch (currencySelected) {
    case 'BRL - Real Brasileiro':
      setSimbol('R$')
      break;
    case 'BTC - Bitcoin':
      setSimbol('₿')
      break;
    case 'EUR - Euro':
      setSimbol('€')
      break;
    case 'USD - Dólar Americano':
      setSimbol('US$')
      break;
    default: 'BRL - Real Brasileiro'
      break;
  };*/

  function iconSelectDropdown() {
    return (
      <Ionicons
        name='chevron-down-outline'
        size={20}
        color={theme.colors.text}
      />
    )
  };

  function handleOpenSelectAccountModal() {
    setAccountModalOpen(true);
  };

  function handleCloseSelectAccountModal() {
    setAccountModalOpen(false);
  };

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  };

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  };

  function handleOpenSelectChartPeriodModal() {
    setBudgetPeriodModalOpen(true);
  };

  function handleCloseSelectChartPeriodModal() {
    setBudgetPeriodModalOpen(false);
  };

  async function handleRegisterBudget(form: FormData) {
    setButtonIsLoading(true);

    try {
      const newBudget = {
        name: form.name,
        amount_limit: form.amount,
        amount_spent: 0,
        currency_id: 4,
        account_id: accountSelected.id,
        category_id: categorySelected.id,
        recurrence: budgetPeriodSelected.period,
        start_date: startDate,
        tenant_id: tenantId
      }

      const { status } = await api.post('budget', newBudget);
      if (status === 200) {
        Alert.alert("Cadastro de Orçamento", "Orçamento cadastrado com sucesso!", [{ text: "Cadastrar novo orçamento" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Dashboard') }]);

        reset();
      };

      setButtonIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Cadastro de Orçamento", "Não foi possível cadastrar o orçamento. Verifique sua conexão com a internet e tente novamente.");

      setButtonIsLoading(false);
    }
  };

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
            buttonTextAfterSelection={(selectedItem) => {
              return selectedItem
            }}
            rowTextForSelection={(item) => {
              return item
            }}
            defaultButtonText="Selecione a moeda"
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
              textAlign: 'left'
            }}
            dropdownStyle={{
              borderRadius: 10,
            }}
          />
        </CurrencyGroup>
      </AmountContainer>

      <SelectButton
        title='Contas'
        subTitle={accountSelected.name}
        icon='wallet'
        color={categorySelected.color.hex}
        onPress={handleOpenSelectAccountModal}
      />

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
        onPress={showDatepicker}
      />
      {
        showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={startDate}
            mode='date'
            is24Hour={true}
            onChange={onChangeDate}
            display='spinner'
            dateFormat='day month year'
            textColor='#000'
          />
        )
      }

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
          title="Criar orçamento"
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterBudget)}
        />
      </Footer>

      <ModalViewSelection
        visible={accountModalOpen}
        closeModal={handleCloseSelectAccountModal}
        title='Contas'
      >
        <AccountSelect
          account={accountSelected}
          setAccount={setAccountSelected}
          closeSelectAccount={handleCloseSelectAccountModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        visible={categoryModalOpen}
        closeModal={handleCloseSelectCategoryModal}
        title='Categorias'
      >
        <CategorySelect
          category={categorySelected}
          setCategory={setCategorySelected}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </ModalViewSelection>

      <ModalViewSelection
        visible={budgetPeriodModalOpen}
        closeModal={handleCloseSelectChartPeriodModal}
        title='Período do orçamento'
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