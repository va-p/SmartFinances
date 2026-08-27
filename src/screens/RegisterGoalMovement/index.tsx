import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Container, ConversionNote, PickerContainer, Footer } from './styles';

import formatCurrency from '@utils/formatCurrency';
import { convertCurrency } from '@utils/convertCurrency';
import { pickDefaultAccount } from '@utils/pickDefaultAccount';

// Hooks
import {
  useGoalDepositMutation,
  useGoalWithdrawMutation,
} from '@hooks/useGoalMovementMutations';
import { useAccountsQuery } from '@hooks/useAccountsQuery';

// Dependencies
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
// @ts-expect-error -- pre-existing: @hookform/resolvers/yup ships no
// resolvable typings (same TS7016 as RegisterBudget/RegisterAccount).
import { yupResolver } from '@hookform/resolvers/yup';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';

// Icons
import { MoneyIcon } from 'phosphor-react-native/src/icons/Money';
import { WalletIcon } from 'phosphor-react-native/src/icons/Wallet';

// Components
import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { ListItem } from '@components/ListItem';
import { ListSeparator } from '@components/ListSeparator';
import { SelectButton } from '@components/SelectButton';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

// Storages
import { useQuotes } from '@stores/quotesStorage';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { GoalProps } from '@interfaces/goals';
import { AccountProps } from '@interfaces/accounts';

type Props = {
  goalId: string;
  type: 'deposit' | 'withdraw';
  goal: GoalProps;
  closeMovement: () => void;
};

type FormData = {
  amount: string;
};

export function RegisterGoalMovement({
  goalId,
  type,
  goal,
  closeMovement,
}: Props) {
  const theme = useTheme() as ThemeProps;
  const accountBottomSheetRef = useRef<BottomSheetModal>(null);
  const [accountSelected, setAccountSelected] = useState<AccountProps | null>(
    null
  );

  const quotes = useQuotes();

  const { data: accountsData } = useAccountsQuery();
  const { mutate: depositToGoal, isPending: isDepositing } =
    useGoalDepositMutation();
  const { mutate: withdrawFromGoal, isPending: isWithdrawing } =
    useGoalWithdrawMutation();

  // Movements only run between the reserve and REAL accounts (GOAL-26).
  const selectableAccounts = useMemo(
    () => (accountsData ?? []).filter((account) => !account.isVirtual),
    [accountsData]
  );

  // Pre-select the user's default account as source/destination.
  useEffect(() => {
    if (accountSelected) {
      return;
    }
    const defaultAccount = pickDefaultAccount(selectableAccounts);
    if (defaultAccount) {
      setAccountSelected(defaultAccount);
    }
  }, [selectableAccounts, accountSelected]);

  const reserveBalance = Number(goal.reserve_account.balance);

  /* Validation Form - Start */
  // GOAL-14: withdrawals are bounded by the reserve balance client-side.
  const schema = useMemo(() => {
    let amount = Yup.number()
      .typeError('Digite um valor numérico')
      .positive('O valor deve ser maior que zero')
      .required('Digite o valor');

    if (type === 'withdraw') {
      amount = amount.max(reserveBalance, 'Saldo da reserva insuficiente');
    }

    return Yup.object().shape({ amount });
  }, [type, reserveBalance]);
  /* Validation Form - End */

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: '0',
    },
  });

  const amountValue = Number(watch('amount')) || 0;

  // GOAL-16: when the picked account's currency differs from the goal
  // currency, the transfer runs with a per-leg amount_in_account_currency
  // (same math as the regular multi-currency transfer flow).
  const isMultiCurrency =
    !!accountSelected && accountSelected.currency.code !== goal.currency.code;

  let amountInAccountCurrency: number | null = null;
  if (isMultiCurrency && amountValue > 0 && accountSelected) {
    try {
      amountInAccountCurrency = convertCurrency({
        amount: amountValue,
        fromCurrency: goal.currency.code,
        toCurrency: accountSelected.currency.code,
        accountCurrency: goal.currency.code,
        quotes,
      });
    } catch {
      amountInAccountCurrency = null;
    }
  }

  function handleOpenSelectAccountModal() {
    accountBottomSheetRef.current?.present();
  }

  function handleCloseSelectAccountModal() {
    accountBottomSheetRef.current?.dismiss();
  }

  function handleAccountSelect(account: AccountProps) {
    setAccountSelected(account);
    handleCloseSelectAccountModal();
  }

  async function onSubmit(form: FormData) {
    if (!accountSelected) {
      Alert.alert(
        type === 'deposit' ? 'Depósito na meta' : 'Saque da meta',
        type === 'deposit'
          ? 'Selecione a conta de origem'
          : 'Selecione a conta de destino'
      );
      return;
    }

    const amount = Number(form.amount);
    const sharedPayload = {
      goalId,
      amount,
      amount_in_account_currency: amountInAccountCurrency,
    };

    if (type === 'deposit') {
      depositToGoal(
        { ...sharedPayload, source_account_id: accountSelected.id },
        {
          onSuccess: () => {
            Alert.alert('Depósito na meta', 'Depósito realizado com sucesso!');
            closeMovement();
          },
        }
      );
      return;
    }

    withdrawFromGoal(
      { ...sharedPayload, destination_account_id: accountSelected.id },
      {
        onSuccess: () => {
          Alert.alert('Saque da meta', 'Saque realizado com sucesso!');
          closeMovement();
        },
      }
    );
  }

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ControlledInputWithIcon
            icon={<MoneyIcon color={theme.colors.primary} />}
            placeholder={`Valor em ${goal.currency.code}`}
            keyboardType='decimal-pad'
            name='amount'
            control={control}
            error={errors.amount}
          />

          <SelectButton
            title={accountSelected?.name || 'Selecione a conta'}
            subTitle={
              type === 'deposit' ? 'Conta de origem' : 'Conta de destino'
            }
            icon={<WalletIcon color={theme.colors.primary} />}
            onPress={handleOpenSelectAccountModal}
          />

          {isMultiCurrency &&
            amountInAccountCurrency !== null &&
            accountSelected && (
              <ConversionNote>
                {type === 'deposit'
                  ? `≈ ${formatCurrency(
                      accountSelected.currency.code,
                      amountInAccountCurrency
                    )} serão debitados de ${
                      accountSelected.name
                    } (conversão pela cotação atual).`
                  : `≈ ${formatCurrency(
                      accountSelected.currency.code,
                      amountInAccountCurrency
                    )} serão creditados em ${
                      accountSelected.name
                    } (conversão pela cotação atual).`}
              </ConversionNote>
            )}

          <Footer>
            <Button.Root
              isLoading={isDepositing || isWithdrawing}
              onPress={() => handleSubmit(onSubmit)()}
            >
              <Button.Text
                text={
                  type === 'deposit' ? 'Confirmar depósito' : 'Confirmar saque'
                }
              />
            </Button.Root>
          </Footer>

          <ModalViewSelection
            $modal
            title={
              type === 'deposit'
                ? 'Selecione a conta de origem'
                : 'Selecione a conta de destino'
            }
            bottomSheetRef={accountBottomSheetRef}
            snapPoints={['75%']}
            onClose={handleCloseSelectAccountModal}
          >
            <PickerContainer>
              <FlatList
                data={selectableAccounts}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <ListItem
                    data={item}
                    isActive={accountSelected?.id === item.id}
                    onPress={() => handleAccountSelect(item)}
                  />
                )}
                ItemSeparatorComponent={() => <ListSeparator />}
                ListEmptyComponent={() => (
                  <ListEmptyComponent text='Nenhuma conta disponível. Crie contas antes de movimentar a meta.' />
                )}
                style={{ flex: 1, width: '100%' }}
              />
            </PickerContainer>
          </ModalViewSelection>
        </Container>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
