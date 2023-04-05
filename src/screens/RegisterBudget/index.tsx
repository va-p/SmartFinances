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
import * as Icon from 'phosphor-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import * as Yup from 'yup';
import axios from 'axios';

import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { BudgetCategorySelect } from '@screens/BudgetCategorySelect';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { AccountProps } from '@components/AccountListItem';
import { SelectButton } from '@components/SelectButton';
import { AccountSelect } from '@screens/AccountSelect';
import { Button } from '@components/Button';

import {
  BudgetPeriodSelect,
  ChartPeriodProps,
} from '@screens/BudgetPeriodSelect';

import {
  selectBudgetCategoriesSelected,
  setBudgetCategoriesSelected,
} from '@slices/budgetCategoriesSelectedSlice';
import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';

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

export function RegisterBudget({ closeBudget }: Props) {
  const tenantId = useSelector(selectUserTenantId);
  const accountBottomSheetRef = useRef<BottomSheetModal>(null);
  const [accountSelected, setAccountSelected] = useState({
    id: '',
    name: 'Todas as contas',
    currency: {
      symbol: 'R$',
    },
  } as AccountProps);
  const categoryBottomSheetRef = useRef<BottomSheetModal>(null);
  const budgetCategoriesSelected = useSelector(selectBudgetCategoriesSelected);
  const [startDate, setStartDate] = useState(new Date());
  const formattedDate = format(startDate, 'dd MMMM, yyyy', { locale: ptBR });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (_: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setStartDate(currentDate);
  };
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
  //const [currencySelected, setCurrencySelected] = useState('');

  const dispatch = useDispatch();

  /*function handleOpenSelectAccountModal() {
    accountBottomSheetRef.current?.present();
  }*/

  function handleCloseSelectAccountModal() {
    accountBottomSheetRef.current?.dismiss();
  }

  function handleOpenSelectCategoryModal() {
    categoryBottomSheetRef.current?.present();
  }

  function handleCloseSelectCategoryModal() {
    dispatch(setBudgetCategoriesSelected([]));
  }

  function handleOpenSelectRecurrencyPeriodModal() {
    periodBottomSheetRef.current?.present();
  }

  function handleCloseSelectRecurrencyPeriodModal() {
    periodBottomSheetRef.current?.dismiss();
  }

  async function handleRegisterBudget(form: FormData) {
    setButtonIsLoading(true);

    let categoriesList: any = [];
    for (const item of budgetCategoriesSelected) {
      const category_id = item.id;

      if (!categoriesList.hasOwnProperty(category_id)) {
        categoriesList[category_id] = {
          category_id: item.id,
        };
      }
    }
    categoriesList = Object.values(categoriesList);

    try {
      const newBudget = {
        name: form.name,
        amount: form.amount,
        currency_id: 4,
        //account_id: accountSelected.id,
        categories: categoriesList,
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
        icon={<Icon.PencilSimple color={theme.colors.primary} />}
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
            icon={<Icon.Money color={theme.colors.primary} />}
            placeholder='Valor do orçamento'
            keyboardType='numeric'
            defaultValue=''
            name='amount'
            control={control}
            error={errors.amount}
          />
        </AmountGroup>

        <CurrencyGroup>
          <SelectDropdown
            data={currencies}
            onSelect={() => {
              //setCurrencySelected(selectedItem);
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
              return <Icon.CaretDown color={theme.colors.text} size={16} />;
            }}
            dropdownIconPosition='right'
            rowStyle={{ backgroundColor: theme.colors.background }}
            rowTextStyle={{ color: theme.colors.text }}
            dropdownStyle={{ borderRadius: 10 }}
          />
        </CurrencyGroup>
      </AmountContainer>

      <SelectButton
        title='Orçamento para:'
        subTitle={
          budgetCategoriesSelected[0]
            ? `${budgetCategoriesSelected.length} categorias`
            : 'Selecione as categorias'
        }
        icon={<Icon.CirclesFour color={theme.colors.primary} />}
        onPress={handleOpenSelectCategoryModal}
      />

      <SelectButton
        title='Data de início'
        subTitle={formattedDate}
        icon={<Icon.Calendar color={theme.colors.primary} />}
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
        icon={<Icon.Repeat color={theme.colors.primary} />}
        onPress={handleOpenSelectRecurrencyPeriodModal}
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
        $modal
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
        $modal
        title='Categorias'
        bottomSheetRef={categoryBottomSheetRef}
        snapPoints={['50%']}
        onClose={handleCloseSelectCategoryModal}
      >
        <BudgetCategorySelect />
      </ModalViewSelection>

      <ModalViewSelection
        title='Período do orçamento'
        bottomSheetRef={periodBottomSheetRef}
        snapPoints={['30%', '50%']}
      >
        <BudgetPeriodSelect
          period={budgetPeriodSelected}
          setPeriod={setBudgetPeriodSelected}
          closeSelectPeriod={handleCloseSelectRecurrencyPeriodModal}
        />
      </ModalViewSelection>
    </Container>
  );
}
