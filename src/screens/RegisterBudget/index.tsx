import React, { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  AmountContainer,
  AmountGroup,
  CurrencyGroup,
  Footer,
} from './styles';

import axios from 'axios';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import * as Icon from 'phosphor-react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SelectDropdown from 'react-native-select-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@components/Button';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { BudgetCategorySelect } from '@screens/BudgetCategorySelect';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

import {
  BudgetPeriodSelect,
  ChartPeriodProps,
} from '@screens/BudgetPeriodSelect';

import { useUser } from '@stores/userStore';
import { useBudgetCategoriesSelected } from '@stores/budgetCategoriesSelected';

import api from '@api/api';

import { BudgetProps } from '@interfaces/budget';

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
    .typeError('Digite um valor numérico')
    .positive('O valor não pode ser negativo')
    .required('Digite o valor'),
});
/* Validation Form - End */

export function RegisterBudget({ id, closeBudget }: Props) {
  const tenantId = useUser((state) => state.tenantId);
  const [budget, setBudget] = useState<BudgetProps>();
  const categoryBottomSheetRef = useRef<BottomSheetModal>(null);
  const budgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.budgetCategoriesSelected
  );
  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );

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
  const [currencySelected, setCurrencySelected] = useState('');

  function handleOpenSelectCategoryModal() {
    categoryBottomSheetRef.current?.present();
  }

  function handleCloseSelectCategoryModal() {
    setBudgetCategoriesSelected([]);
  }

  function handleOpenSelectRecurrencePeriodModal() {
    periodBottomSheetRef.current?.present();
  }

  function handleCloseSelectRecurrencePeriodModal() {
    periodBottomSheetRef.current?.dismiss();
  }

  async function fetchBudget() {
    let totalByDate = { id: '4', name: 'Mensalmente', period: 'monthly' };

    setButtonIsLoading(true);

    try {
      const { data } = await api.get('single_budget', {
        params: {
          budget_id: id,
        },
      });
      setBudget(data);
      setCurrencySelected(data.currency_id);
      setStartDate(new Date(data.start_date));
      switch (data.recurrence) {
        case 'daily':
          totalByDate = {
            id: '1',
            name: 'Diariamente',
            period: 'monthly',
          };
          break;
        case 'weekly':
          totalByDate = {
            id: '2',
            name: 'Semanalmente',
            period: 'monthly',
          };
          break;
        case 'biweekly':
          totalByDate = {
            id: '3',
            name: 'Quinzenalmente',
            period: 'monthly',
          };
          break;
        case 'monthly':
          totalByDate = {
            id: '4',
            name: 'Mensalmente',
            period: 'monthly',
          };
          break;
        case 'semiannually':
          totalByDate = {
            id: '5',
            name: 'Semestralmente',
            period: 'monthly',
          };
          break;
        case 'monthly':
          totalByDate = {
            id: '6',
            name: 'Anualmente',
            period: 'monthly',
          };
          break;
      }
      setBudgetPeriodSelected(totalByDate);
      setBudgetCategoriesSelected(data.categories);
    } catch (error) {
      console.error('Error fetching budget', error);
    } finally {
      setButtonIsLoading(false);
    }
  }

  async function handleEditBudget(id: string, form: FormData) {
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
      const editedBudget = {
        budget_id: id,
        name: form.name,
        amount: form.amount,
        currency_id: 4,
        categories: categoriesList,
        start_date: startDate,
        recurrence: budgetPeriodSelected.period,
      };

      const { status } = await api.post('edit_budget', editedBudget);
      if (status === 200) {
        Alert.alert('Edição de Orçamento', 'Orçamento editado com sucesso!', [
          {
            text: 'Voltar para a tela anterior',
            onPress: closeBudget,
          },
        ]);
        reset();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Edição de Orçamento', error.response?.data.message, [
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

  async function handleRegisterBudget(form: FormData) {
    setButtonIsLoading(true);

    if (id !== '') {
      handleEditBudget(id, form);
      return;
    }

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

  useFocusEffect(
    useCallback(() => {
      if (id !== '') {
        fetchBudget();
      }
    }, [id])
  );

  return (
    <Container>
      <ControlledInputWithIcon
        icon={<Icon.PencilSimple color={theme.colors.primary} />}
        placeholder='Nome do orçamento'
        autoCapitalize='sentences'
        autoCorrect={false}
        defaultValue={budget?.name || ''}
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
            defaultValue={id !== '' ? String(budget?.amount) : ''}
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
            // defaultValue={currencySelected}
            defaultButtonText='Moeda'
            buttonTextAfterSelection={(selectedItem) => {
              return selectedItem;
            }}
            rowTextForSelection={(item) => {
              return item;
            }}
            buttonStyle={{
              width: '90%',
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
        title='Orçamento para'
        subTitle={
          budgetCategoriesSelected[0]
            ? budgetCategoriesSelected.length > 1
              ? `${budgetCategoriesSelected.length} categorias`
              : `${budgetCategoriesSelected.length} categoria`
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
        onPress={handleOpenSelectRecurrencePeriodModal}
      />

      <Footer>
        <Button
          type='secondary'
          title={id !== '' ? 'Editar Orçamento' : 'Criar Novo Orçamento'}
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleRegisterBudget)}
        />
      </Footer>

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
        snapPoints={['50%']}
      >
        <BudgetPeriodSelect
          period={budgetPeriodSelected}
          setPeriod={setBudgetPeriodSelected}
          closeSelectPeriod={handleCloseSelectRecurrencePeriodModal}
        />
      </ModalViewSelection>
    </Container>
  );
}
