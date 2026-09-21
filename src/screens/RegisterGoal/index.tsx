import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  Container,
  AmountContainer,
  AmountGroup,
  CurrencyGroup,
  CurrencyStatic,
  CurrencyStaticText,
  ClearDeadlineButton,
  ClearDeadlineText,
  Footer,
} from './styles';

// hooks
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
} from '@hooks/useGoalMutations';
import { useCurrenciesQuery } from '@hooks/useCurrenciesQuery';
import { useGoalDetailQuery } from '@hooks/useGoalDetailQuery';
import { useAccountsQuery } from '@hooks/useAccountsQuery';

// Dependencies
import * as Yup from 'yup';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
import { format, startOfDay } from 'date-fns';
// @ts-expect-error -- pre-existing: @hookform/resolvers/yup ships no
// resolvable typings (same TS7016 as RegisterBudget/RegisterAccount).
import { yupResolver } from '@hookform/resolvers/yup';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import SelectDropdown from 'react-native-select-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

// Icons
import { MoneyIcon } from 'phosphor-react-native/src/icons/Money';
import { WalletIcon } from 'phosphor-react-native/src/icons/Wallet';
import { CalendarIcon } from 'phosphor-react-native/src/icons/Calendar';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { PencilSimpleIcon } from 'phosphor-react-native/src/icons/PencilSimple';

// Components
import { Button } from '@components/Button';
import { SelectButton } from '@components/SelectButton';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

// Screens
import { GoalAccountSelect } from '@screens/GoalAccountSelect';

// Stores
import { useGoalAccountsSelected } from '@stores/goalAccountsSelected';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { CurrencyProps } from '@interfaces/currencies';

type Props = {
  id: string;
  closeGoal: () => void;
};

type FormData = {
  name: string;
  amount: string;
};

/* Validation Form - Start */
// GOAL-08: blocks empty name / target <= 0 before any API call.
const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome'),
  amount: Yup.number()
    .typeError('Digite um valor numérico')
    .positive('O valor deve ser maior que zero')
    .required('Digite o valor'),
});
/* Validation Form - End */

export function RegisterGoal({ id, closeGoal }: Props) {
  const theme = useTheme() as ThemeProps;
  const accountBottomSheetRef = useRef<BottomSheetModal>(null);
  const goalAccountsSelected = useGoalAccountsSelected(
    (state) => state.goalAccountsSelected
  );
  const setGoalAccountsSelected = useGoalAccountsSelected(
    (state) => state.setGoalAccountsSelected
  );

  const [currencySelected, setCurrencySelected] =
    useState<CurrencyProps | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (_: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

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

  const { data: currenciesData, isLoading: isLoadingCurrencies } =
    useCurrenciesQuery();
  const currencies: CurrencyProps[] = currenciesData ?? [];

  const { data: accountsData } = useAccountsQuery();

  const { mutateAsync: createGoalAsync, isPending: isCreating } =
    useCreateGoalMutation();
  const { mutateAsync: updateGoalAsync, isPending: isUpdating } =
    useUpdateGoalMutation();
  const { data: goalData, isLoading: isLoadingDetails } =
    useGoalDetailQuery(id);

  useEffect(() => {
    if (!!goalData) {
      setValue('name', goalData.name);
      setValue('amount', String(Number(goalData.target_amount)));
      // The goal DTO currency has no `name`; resolve the full CurrencyProps
      // from the currencies cache by id.
      setCurrencySelected(
        currencies.find((currency) => currency.id === goalData.currency.id) ??
          (goalData.currency as CurrencyProps)
      );
      setDeadline(goalData.deadline ? new Date(goalData.deadline) : null);

      // Pre-fill the linked-accounts store with full AccountProps objects
      // matched from the accounts cache by id.
      const linkedIds = goalData.linked_accounts.map((account) => account.id);
      setGoalAccountsSelected(
        (accountsData ?? []).filter((account) => linkedIds.includes(account.id))
      );
    } else {
      reset({ name: '', amount: '0' });
      setDeadline(null);
    }
  }, [goalData, accountsData, currenciesData, id, setValue, reset]);

  async function onSubmit(form: FormData) {
    // GOAL-10: deadline, when set, must be today or later — blocked before
    // any API call.
    if (deadline && startOfDay(deadline) < startOfDay(new Date())) {
      Alert.alert(
        'Data limite',
        'A data limite não pode ser no passado. Escolha hoje ou uma data futura.'
      );
      return;
    }

    const linkedAccountIds = goalAccountsSelected.map((account) => account.id);

    if (!!id) {
      // --- Update goal (currency is immutable after creation) ---
      const editedGoal = {
        goalId: id,
        name: form.name,
        target_amount: Number(form.amount),
        deadline: deadline ? deadline.toISOString() : null,
        linked_account_ids: linkedAccountIds,
      };

      try {
        await updateGoalAsync(editedGoal);
        Alert.alert('Edição de Meta', 'Meta atualizada com sucesso!', [
          {
            text: 'Voltar para a tela anterior',
            onPress: closeGoal,
          },
        ]);
      } catch {
        Alert.alert(
          'Erro',
          'Não foi possível atualizar a meta. Verifique os dados e tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // --- Create goal ---
      const newGoal = {
        name: form.name,
        target_amount: Number(form.amount),
        currency_id: currencySelected?.id || 4,
        deadline: deadline ? deadline.toISOString() : null,
        linked_account_ids: linkedAccountIds,
      };

      try {
        await createGoalAsync(newGoal);
        Alert.alert('Cadastro de Meta', 'Meta criada com sucesso!', [
          {
            text: 'Voltar para a tela anterior',
            onPress: closeGoal,
          },
        ]);
      } catch {
        Alert.alert(
          'Erro',
          'Não foi possível criar a meta. Verifique os dados e tente novamente.',
          [{ text: 'OK' }]
        );
      }
    }
  }

  function handleOpenSelectAccountModal() {
    accountBottomSheetRef.current?.present();
  }

  if (isLoadingDetails || isLoadingCurrencies) {
    return (
        <SkeletonAccountsScreen />
    );
  }

  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ControlledInputWithIcon
            icon={<PencilSimpleIcon color={theme.colors.primary} />}
            placeholder='Nome da meta'
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
                icon={<MoneyIcon color={theme.colors.primary} />}
                placeholder='Valor da meta'
                keyboardType='decimal-pad'
                defaultValue={getValues('amount')}
                name='amount'
                control={control}
                error={errors.amount}
              />
            </AmountGroup>

            <CurrencyGroup>
              {!!id ? (
                <CurrencyStatic>
                  <CurrencyStaticText>
                    {currencySelected?.name}
                  </CurrencyStaticText>
                </CurrencyStatic>
              ) : (
                <SelectDropdown
                  data={currencies}
                  onSelect={(selectedItem) => {
                    setCurrencySelected(selectedItem);
                  }}
                  defaultButtonText='Moeda'
                  buttonTextAfterSelection={(selectedItem) => {
                    return selectedItem.name;
                  }}
                  rowTextForSelection={(item) => {
                    return item.name;
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
                    return (
                      <CaretDownIcon color={theme.colors.text} size={16} />
                    );
                  }}
                  dropdownIconPosition='right'
                  rowStyle={{ backgroundColor: theme.colors.background }}
                  rowTextStyle={{ color: theme.colors.text }}
                  dropdownStyle={{ borderRadius: 10 }}
                />
              )}
            </CurrencyGroup>
          </AmountContainer>

          <SelectButton
            title='Contas vinculadas'
            subTitle={
              goalAccountsSelected[0]
                ? goalAccountsSelected.length > 1
                  ? `${goalAccountsSelected.length} contas`
                  : `${goalAccountsSelected.length} conta`
                : 'Selecione as contas (opcional)'
            }
            icon={<WalletIcon color={theme.colors.primary} />}
            onPress={handleOpenSelectAccountModal}
          />

          <SelectButton
            title='Data limite (opcional)'
            subTitle={
              deadline
                ? format(deadline, 'dd MMMM, yyyy', { locale: ptBR })
                : 'Não definida'
            }
            icon={<CalendarIcon color={theme.colors.primary} />}
            onPress={() => setShowDatePicker(true)}
          />
          {deadline && (
            <ClearDeadlineButton onPress={() => setDeadline(null)}>
              <ClearDeadlineText>Remover data limite</ClearDeadlineText>
            </ClearDeadlineButton>
          )}
          {showDatePicker && (
            <DateTimePicker
              testID='dateTimePicker'
              value={deadline ?? new Date()}
              mode='date'
              is24Hour={true}
              onValueChange={onChangeDate}
              dateFormat='day month year'
              textColor={theme.colors.text}
            />
          )}

          <Footer>
            <Button.Root
              type='secondary'
              isLoading={isCreating || isUpdating}
              onPress={() => handleSubmit(onSubmit)()}
            >
              <Button.Text text={id ? 'Editar Meta' : 'Criar Nova Meta'} />
            </Button.Root>
          </Footer>

          <ModalViewSelection
            $modal
            title='Contas vinculadas'
            bottomSheetRef={accountBottomSheetRef}
            snapPoints={['75%']}
          >
            <GoalAccountSelect />
          </ModalViewSelection>
        </Container>
      </TouchableWithoutFeedback>
  );
}
