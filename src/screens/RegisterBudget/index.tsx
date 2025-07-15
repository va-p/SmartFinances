import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  AmountContainer,
  AmountGroup,
  CurrencyGroup,
  Footer,
} from './styles';

// hooks
import { useBudgetDetailQuery } from '@hooks/useBudgetDetailQuery';
import {
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
} from '@hooks/useBudgetMutations';

// Dependencies
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';

// Icons
import Money from 'phosphor-react-native/src/icons/Money';
import SelectDropdown from 'react-native-select-dropdown';
import Repeat from 'phosphor-react-native/src/icons/Repeat';
import Calendar from 'phosphor-react-native/src/icons/Calendar';
import CaretDown from 'phosphor-react-native/src/icons/CaretDown';
import CirclesFour from 'phosphor-react-native/src/icons/CirclesFour';
import PencilSimple from 'phosphor-react-native/src/icons/PencilSimple';

// Components
import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { BudgetCategorySelect } from '@screens/BudgetCategorySelect';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

import {
  BudgetPeriodSelect,
  ChartPeriodProps,
} from '@screens/BudgetPeriodSelect';

import { useUser } from '@storage/userStorage';
import { useBudgetCategoriesSelected } from '@storage/budgetCategoriesSelected';

import theme from '@themes/theme';
import { CurrencyProps } from '@interfaces/currencies';

type Props = {
  id: string | null;
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
  const userID = useUser((state) => state.id);
  const categoryBottomSheetRef = useRef<BottomSheetModal>(null);
  const budgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.budgetCategoriesSelected
  );
  const setBudgetCategoriesSelected = useBudgetCategoriesSelected(
    (state) => state.setBudgetCategoriesSelected
  );
  const currencies: String[] = [
    'BRL - Real Brasileiro',
    'BTC - Bitcoin',
    'EUR - Euro',
    'USD - Dólar Americano',
  ];
  const currenciesMap: Record<string, CurrencyProps> = {
    'BTC - Bitcoin': {
      id: 1,
      name: 'Bitcoin',
      code: 'BTC',
      symbol: '₿',
    },
    'USD - Dólar Americano': {
      id: 2,
      name: 'Dólar Americano',
      code: 'USD',
      symbol: '$',
    },
    'EUR - Euro': {
      id: 3,
      name: 'Euro',
      code: 'EUR',
      symbol: '€',
    },
    'BRL - Real Brasileiro': {
      id: 4,
      name: 'Real Brasileiro',
      code: 'BRL',
      symbol: 'R$',
    },
  };
  const [currencySelected, setCurrencySelected] = useState<number | null>(null);
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
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: '0',
      name: '',
    },
  });
  const { mutate: createBudget, isPending: isCreating } =
    useCreateBudgetMutation();
  const { mutate: updateBudget, isPending: isUpdating } =
    useUpdateBudgetMutation();
  const { data: budgetData, isLoading: isLoadingDetails } =
    useBudgetDetailQuery(id);

  useEffect(() => {
    if (budgetData) {
      let totalByDate = { id: '4', name: 'Mensalmente', period: 'monthly' };

      setValue('name', budgetData.name);
      setValue('amount', String(budgetData.amount));
      setCurrencySelected(budgetData.currency.id);
      setStartDate(new Date(budgetData.start_date));
      switch (budgetData.recurrence) {
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
      setBudgetCategoriesSelected(budgetData.categories);
    } else {
      reset({ name: '', amount: '0' });
      // TODO: resetar outros estados?!
    }
  }, [budgetData, id, setValue, reset]);

  function onSubmit(form: FormData) {
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

    if (!!id) {
      // --- Update budget ---
      const editedBudget = {
        budget_id: id,
        name: form.name,
        amount: form.amount,
        currency_id: currencySelected || 4,
        categories: categoriesList,
        start_date: startDate,
        recurrence: budgetPeriodSelected.period,
      };
      updateBudget(editedBudget, {
        onSuccess: () => {
          Alert.alert(
            'Edição de Orçamento',
            'Orçamento atualizado com sucesso!',
            [
              {
                text: 'Voltar para a tela anterior',
                onPress: closeBudget,
              },
            ]
          );
          closeBudget();
        },
      });
    } else {
      // --- Create budget ---
      const newBudget = {
        name: form.name,
        amount: form.amount,
        currency_id: currencySelected || 4,
        categories: categoriesList,
        start_date: startDate,
        recurrence: budgetPeriodSelected.period,
        user_id: userID,
      };
      createBudget(newBudget, {
        onSuccess: () => {
          Alert.alert(
            'Cadastro de Orçamento',
            'Orçamento criado com sucesso!',
            [
              {
                text: 'Voltar para a tela anterior',
                onPress: closeBudget,
              },
            ]
          );
          closeBudget();
        },
      });
    }
  }

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

  return (
    <Screen>
      <Container>
        <Gradient />

        <ControlledInputWithIcon
          icon={<PencilSimple color={theme.colors.primary} />}
          placeholder='Nome do orçamento'
          autoCapitalize='sentences'
          autoCorrect={false}
          defaultValue={getValues('name')}
          name='name'
          control={control}
          error={errors.name}
        />

        <AmountContainer>
          <AmountGroup>
            <ControlledInputWithIcon
              icon={<Money color={theme.colors.primary} />}
              placeholder='Valor do orçamento'
              keyboardType='numeric'
              defaultValue={getValues('amount')}
              name='amount'
              control={control}
              error={errors.amount}
            />
          </AmountGroup>

          <CurrencyGroup>
            <SelectDropdown
              data={currencies}
              onSelect={(selectedItem) => {
                const currencySelected = currenciesMap[selectedItem].id;
                setCurrencySelected(currencySelected);
              }}
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
                return <CaretDown color={theme.colors.text} size={16} />;
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
          icon={<CirclesFour color={theme.colors.primary} />}
          onPress={handleOpenSelectCategoryModal}
        />

        <SelectButton
          title='Data de início'
          subTitle={formattedDate}
          icon={<Calendar color={theme.colors.primary} />}
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
          icon={<Repeat color={theme.colors.primary} />}
          onPress={handleOpenSelectRecurrencePeriodModal}
        />

        <Footer>
          <Button.Root
            type='secondary'
            isLoading={isCreating || isUpdating}
            onPress={handleSubmit(onSubmit)}
          >
            <Button.Text
              text={id !== null ? 'Editar Orçamento' : 'Criar Novo Orçamento'}
            />
          </Button.Root>
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
    </Screen>
  );
}
