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
import { GoalLinkedAccountProps, GoalProps } from '@interfaces/goals';
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
  const linkedAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const [accountSelected, setAccountSelected] = useState<AccountProps | null>(
    null
  );
  const [linkedAccountSelected, setLinkedAccountSelected] =
    useState<GoalLinkedAccountProps | null>(null);

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

  // Reserve-less goals move money directly in/out of a linked account
  // (GOAL-46/47): auto-select it when the goal has exactly one, and drop the
  // selection if an edit unlinked it while the sheet is mounted.
  const hasReserve = !!goal?.reserve_account;
  useEffect(() => {
    if (hasReserve) {
      return;
    }
    if (
      linkedAccountSelected &&
      !goal.linked_accounts.some(
        (account) => account.id === linkedAccountSelected.id
      )
    ) {
      setLinkedAccountSelected(null);
      return;
    }
    if (!linkedAccountSelected && goal.linked_accounts.length === 1) {
      setLinkedAccountSelected(goal.linked_accounts[0]);
    }
  }, [hasReserve, goal.linked_accounts, linkedAccountSelected]);

  // GOAL-14: withdrawals are bounded by the chosen source — the reserve
  // balance, or the chosen linked account's balance on reserve-less goals.
  const withdrawSourceBalance = hasReserve
    ? Number(goal.reserve_account?.balance ?? 0)
    : linkedAccountSelected
      ? Number(linkedAccountSelected.balance)
      : null;

  /* Validation Form - Start */
  const schema = useMemo(() => {
    let amount = Yup.number()
      .typeError('Digite um valor numérico')
      .positive('O valor deve ser maior que zero')
      .required('Digite o valor');

    if (type === 'withdraw' && withdrawSourceBalance !== null) {
      amount = amount.max(
        withdrawSourceBalance,
        hasReserve
          ? 'Saldo da reserva insuficiente'
          : 'Saldo da conta vinculada insuficiente'
      );
    }

    return Yup.object().shape({ amount });
  }, [type, withdrawSourceBalance, hasReserve]);
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

  // GOAL-16: per-leg account-currency amounts for multi-currency transfers.
  const convertToAccountCurrency = (targetCode?: string): number | null => {
    if (!targetCode || targetCode === goal.currency.code || amountValue <= 0) {
      return null;
    }
    try {
      return convertCurrency({
        amount: amountValue,
        fromCurrency: goal.currency.code,
        toCurrency: targetCode,
        accountCurrency: goal.currency.code,
        quotes,
      });
    } catch {
      return null;
    }
  };

  // When the picked account's currency differs from the goal currency, the
  // transfer runs with per-leg account-currency amounts (same math as the
  // regular multi-currency transfer flow). The reserve shares the goal
  // currency, so the reserve path only converts the real-account leg; the
  // reserve-less path converts both legs (GOAL-46/47).
  const amountInAccountCurrency = hasReserve
    ? convertToAccountCurrency(accountSelected?.currency.code)
    : null;
  const amountInSourceCurrency = !hasReserve
    ? convertToAccountCurrency(
        type === 'deposit'
          ? accountSelected?.currency.code
          : linkedAccountSelected?.currency.code
      )
    : null;
  const amountInTargetCurrency = !hasReserve
    ? convertToAccountCurrency(
        type === 'deposit'
          ? linkedAccountSelected?.currency.code
          : accountSelected?.currency.code
      )
    : null;

  const isMultiCurrency = amountInAccountCurrency !== null;

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

  function handleOpenSelectLinkedAccountModal() {
    linkedAccountBottomSheetRef.current?.present();
  }

  function handleCloseSelectLinkedAccountModal() {
    linkedAccountBottomSheetRef.current?.dismiss();
  }

  function handleLinkedAccountSelect(account: GoalLinkedAccountProps) {
    setLinkedAccountSelected(account);
    handleCloseSelectLinkedAccountModal();
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

    if (!hasReserve && !linkedAccountSelected) {
      Alert.alert(
        type === 'deposit' ? 'Depósito na meta' : 'Saque da meta',
        'Selecione a conta vinculada'
      );
      return;
    }

    const amount = Number(form.amount);
    const sharedPayload = {
      goalId,
      amount,
      // Reserve path: single legacy field covers the real-account leg (the
      // reserve leg shares the goal currency). Reserve-less path: explicit
      // per-leg conversions (GOAL-16/46/47).
      ...(hasReserve
        ? { amount_in_account_currency: amountInAccountCurrency }
        : {
            linked_account_id: linkedAccountSelected?.id,
            amount_in_source_currency: amountInSourceCurrency,
            amount_in_target_currency: amountInTargetCurrency,
          }),
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

  // Picker order follows the money flow: deposit = origem → vinculada;
  // withdraw = vinculada → destino.
  const linkedAccountButton = !hasReserve && (
    <SelectButton
      title={linkedAccountSelected?.name || 'Selecione a conta vinculada'}
      subTitle={
        type === 'deposit'
          ? 'Conta vinculada (destino)'
          : 'Conta vinculada (origem)'
      }
      icon={<WalletIcon color={theme.colors.primary} />}
      onPress={handleOpenSelectLinkedAccountModal}
    />
  );

  return (
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

        {type === 'withdraw' && linkedAccountButton}

        <SelectButton
          title={accountSelected?.name || 'Selecione a conta'}
          subTitle={type === 'deposit' ? 'Conta de origem' : 'Conta de destino'}
          icon={<WalletIcon color={theme.colors.primary} />}
          onPress={handleOpenSelectAccountModal}
        />

        {type === 'deposit' && linkedAccountButton}

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

        {!hasReserve &&
          type === 'deposit' &&
          accountSelected &&
          amountInSourceCurrency !== null && (
            <ConversionNote>
              {`≈ ${formatCurrency(
                accountSelected.currency.code,
                amountInSourceCurrency
              )} serão debitados de ${
                accountSelected.name
              } (conversão pela cotação atual).`}
            </ConversionNote>
          )}

        {!hasReserve &&
          type === 'deposit' &&
          linkedAccountSelected &&
          amountInTargetCurrency !== null && (
            <ConversionNote>
              {`≈ ${formatCurrency(
                linkedAccountSelected.currency.code,
                amountInTargetCurrency
              )} serão creditados em ${
                linkedAccountSelected.name
              } (conversão pela cotação atual).`}
            </ConversionNote>
          )}

        {!hasReserve &&
          type === 'withdraw' &&
          linkedAccountSelected &&
          amountInSourceCurrency !== null && (
            <ConversionNote>
              {`≈ ${formatCurrency(
                linkedAccountSelected.currency.code,
                amountInSourceCurrency
              )} serão debitados de ${
                linkedAccountSelected.name
              } (conversão pela cotação atual).`}
            </ConversionNote>
          )}

        {!hasReserve &&
          type === 'withdraw' &&
          accountSelected &&
          amountInTargetCurrency !== null && (
            <ConversionNote>
              {`≈ ${formatCurrency(
                accountSelected.currency.code,
                amountInTargetCurrency
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

        <ModalViewSelection
          $modal
          title='Selecione a conta vinculada'
          bottomSheetRef={linkedAccountBottomSheetRef}
          snapPoints={['75%']}
          onClose={handleCloseSelectLinkedAccountModal}
        >
          <PickerContainer>
            <FlatList
              data={goal.linked_accounts}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <ListItem
                  data={item}
                  isActive={linkedAccountSelected?.id === item.id}
                  onPress={() => handleLinkedAccountSelect(item)}
                />
              )}
              ItemSeparatorComponent={() => <ListSeparator />}
              ListEmptyComponent={() => (
                <ListEmptyComponent text='Nenhuma conta vinculada a esta meta.' />
              )}
              style={{ flex: 1, width: '100%' }}
            />
          </PickerContainer>
        </ModalViewSelection>
      </Container>
    </TouchableWithoutFeedback>
  );
}
