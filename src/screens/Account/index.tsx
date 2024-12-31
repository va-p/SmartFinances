import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, SectionList, Alert } from 'react-native';
import {
  Container,
  FiltersContainer,
  FilterButtonGroup,
  AccountBalanceContainer,
  AccountBalanceGroup,
  AccountBalanceSeparator,
  AccountBalance,
  AccountBalanceDescription,
  AccountCashFlow,
  AccountCashFlowDescription,
  Transactions,
  HeaderContainer,
} from './styles';

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ptBR } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { Plus } from 'phosphor-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Gesture,
  GestureDetector,
  RectButton,
} from 'react-native-gesture-handler';

import { Header } from '@components/Header';
import { ModalView } from '@components/ModalView';
import { ChartSelectButton } from '@components/ChartSelectButton';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { ModalViewWithoutHeader } from '@components/ModalViewWithoutHeader';

import { RegisterAccount } from '@screens/RegisterAccount';
import { RegisterTransaction } from '@screens/RegisterTransaction';
import { ChartPeriodSelect, PeriodProps } from '@screens/ChartPeriodSelect';

import { useUser } from 'src/storage/userStorage';
import { useUserConfigs } from 'src/storage/userConfigsStorage';

import api from '@api/api';

import theme from '@themes/theme';
import getTransactions from '@utils/getTransactions';
import groupTransactionsByDate from '@utils/groupTransactionsByDate';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';
import formatCurrency from '@utils/formatCurrency';

export function Account() {
  const [loading, setLoading] = useState(false);
  const { tenantId: tenantID, id: userID } = useUser();
  const [refreshing, setRefreshing] = useState(true);
  const [periodSelected, setPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months',
  });
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [
    transactionsFormattedBySelectedPeriod,
    setTransactionsFormattedBySelectedPeriod,
  ] = useState([]);
  const optimizedTransactions = useMemo(
    () => transactionsFormattedBySelectedPeriod,
    [transactionsFormattedBySelectedPeriod]
  );
  const [totalAccountBalance, setTotalAccountBalance] = useState('');
  const [cashFlowBySelectedPeriod, setCashFlowBySelectedPeriod] = useState('');
  const [cashFlowIsPositive, setCashFlowIsPositive] = useState(true);
  const [balanceIsPositive, setBalanceIsPositive] = useState(true);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const addTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const navigation = useNavigation();
  const hideAmount = useUserConfigs((state) => state.hideAmount);
  const {
    accountId: accountID,
    accountName,
    accountBalance,
  } = useCurrentAccountSelected();
  // const accountInitialAmount = useCurrentAccountSelected(
  //   (state) => state.accountInitialAmount
  // );
  // Animated header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(scrollY.value, [0, 340], [200, 0], Extrapolate.CLAMP),
      opacity: interpolate(scrollY.value, [0, 310], [1, 0], Extrapolate.CLAMP),
    };
  });
  // Animated section list
  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
  // Animated button register transaction
  const registerTransactionButtonPositionX = useSharedValue(0);
  const registerTransactionButtonPositionY = useSharedValue(0);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const ButtonAnimated = Animated.createAnimatedComponent(RectButton);
  const registerTransactionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: registerTransactionButtonPositionX.value },
        { translateY: registerTransactionButtonPositionY.value },
      ],
    };
  });

  const onMoveRegisterTransactionButton = Gesture.Pan()
    .onStart((e) => {
      initialX.current = registerTransactionButtonPositionX.value;
      initialY.current = registerTransactionButtonPositionY.value;
    })
    .onUpdate((e) => {
      registerTransactionButtonPositionX.value =
        initialX.current + e.translationX;
      registerTransactionButtonPositionY.value =
        initialY.current + e.translationY;
    })
    .onEnd(() => {
      registerTransactionButtonPositionX.value = withSpring(0);
      registerTransactionButtonPositionY.value = withSpring(0);
    });

  console.log('accountID ===>', accountID);

  async function fetchTransactions() {
    setLoading(true);

    try {
      const data = await getTransactions(tenantID, userID);

      /**
       * All Transactions By Account Formatted in pt-BR - Start
       */
      let totalRevenues = 0;
      let totalExpenses = 0;
      let totalAccountBalance = 0;

      const transactionsByAccountFormattedPtbr = data
        .filter((transaction: any) => transaction.account.id === accountID)
        .map((item: any) => {
          const formattedAmount = formatCurrency(
            item.account.currency.code, // Moeda da conta
            item.amount
          );

          const formattedAmountNotConverted = item.amount_not_converted
            ? formatCurrency(
                item.currency.code, // Moeda original da transação
                item.amount_not_converted,
                false // Indica que é o valor não convertido
              )
            : '';

          return {
            ...item,
            amount_formatted: formattedAmount,
            amount_not_converted: formattedAmountNotConverted,
            created_at: format(item.created_at, 'dd/MM/yyyy', { locale: ptBR }),
          };
        })
        .sort((a: any, b: any) => {
          // ... (lógica de ordenação)
          const firstDateParsed = parse(a.created_at, 'dd/MM/yyyy', new Date());
          const secondDateParsed = parse(
            b.created_at,
            'dd/MM/yyyy',
            new Date()
          );
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        });

      transactionsByAccountFormattedPtbr
        .filter(
          (filteredTransaction: any) =>
            parse(filteredTransaction.created_at, 'dd/MM/yyyy', new Date()) <=
            new Date()
        )
        .forEach((cur: any) => {
          // switch (cur.type) {
          //   case 'CREDIT':
          //   case 'transferCredit':
          //   case 'TRANSFER_CREDIT':
          //     totalRevenues += cur.amount;
          //     break;
          //   case 'DEBIT':
          //   case 'transferDebit':
          //   case 'TRANSFER_DEBIT':
          //     totalExpenses += cur.amount;
          //     break;
          // }
          // Credit card
          if (cur.account.type === 'CREDIT') {
            totalAccountBalance -= cur.amount; // Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
          }
          // Other account types
          if (cur.account.type !== 'CREDIT') {
            totalAccountBalance += cur.amount;
          }
        });
      // const total = accountInitialAmount + totalRevenues - totalExpenses;

      totalAccountBalance >= 0
        ? setBalanceIsPositive(true)
        : setBalanceIsPositive(false);

      const totalAccountBalanceFormatted = Number(
        totalAccountBalance
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      setTotalAccountBalance(totalAccountBalanceFormatted);

      const transactionsFormattedPtbrGroupedByDate = groupTransactionsByDate(
        transactionsByAccountFormattedPtbr
      );
      /**
       * All Transactions By Account Formatted in pt-BR - End
       */

      /**
       * Transactions By Months Formatted in pt-BR - Start
       */
      const transactionsByMonthsFormattedPtbr =
        transactionsFormattedPtbrGroupedByDate.filter(
          (transactionByMonthsPtBr: any) =>
            parse(
              transactionByMonthsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getMonth() === selectedDate.getMonth() &&
            parse(
              transactionByMonthsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getFullYear() === selectedDate.getFullYear()
        );

      let totalRevenuesByMonths = 0;
      let totalExpensesByMonths = 0;

      for (const item of transactionsByMonthsFormattedPtbr) {
        item.data.forEach((cur: any) => {
          if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date()) {
            switch (cur.type) {
              case 'CREDIT':
              case 'TRANSFER_CREDIT':
              case 'transferCredit':
                totalRevenuesByMonths += cur.amount;
                break;
              case 'DEBIT':
              case 'TRANSFER_DEBIT':
              case 'transferDebit':
                totalExpensesByMonths += cur.amount;
                break;
            }
          }
        });
      }

      const cashFlowByMonths = totalRevenuesByMonths - totalExpensesByMonths;

      if (periodSelected.period === 'months') {
        cashFlowByMonths >= 0
          ? setCashFlowIsPositive(true)
          : setCashFlowIsPositive(false);
      }

      const cashFlowFormattedPtbrByMonths = Number(
        cashFlowByMonths
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      /**
       * Transactions By Months Formatted in pt-BR - End
       */

      /**
       * Transactions By Years Formatted in pt-BR - Start
       */
      const transactionsByYearsFormattedPtbr =
        transactionsFormattedPtbrGroupedByDate.filter(
          (transactionByYearsPtBr: any) =>
            parse(
              transactionByYearsPtBr.title,
              'dd/MM/yyyy',
              new Date()
            ).getFullYear() === selectedDate.getFullYear()
        );

      let totalRevenuesByYears = 0;
      let totalExpensesByYears = 0;

      for (const item of transactionsByYearsFormattedPtbr) {
        item.data.forEach((cur: any) => {
          if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date()) {
            switch (cur.type) {
              case 'CREDIT':
              case 'TRANSFER_CREDIT':
              case 'transferCredit':
                totalRevenuesByYears += cur.amount;
                break;
              case 'DEBIT':
              case 'TRANSFER_DEBIT':
              case 'transferDebit':
                totalExpensesByYears += cur.amount;
                break;
            }
          }
        });
      }

      const cashFlowByYears = totalRevenuesByYears - totalExpensesByYears;

      if (periodSelected.period === 'years') {
        cashFlowByYears >= 0
          ? setCashFlowIsPositive(true)
          : setCashFlowIsPositive(false);
      }

      const cashFlowFormattedPtbrByYears = Number(
        cashFlowByYears
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      /**
       * Transactions By Years Formatted in pt-BR - End
       */

      /**
       * Set Transactions and Totals by Selected Period - Start
       */
      switch (periodSelected.period) {
        case 'months':
          setCashFlowBySelectedPeriod(cashFlowFormattedPtbrByMonths);
          setTransactionsFormattedBySelectedPeriod(
            transactionsByMonthsFormattedPtbr
          );
          break;
        case 'years':
          setCashFlowBySelectedPeriod(cashFlowFormattedPtbrByYears);
          setTransactionsFormattedBySelectedPeriod(
            transactionsByYearsFormattedPtbr
          );
          break;
        case 'all':
          setCashFlowBySelectedPeriod(totalAccountBalanceFormatted);
          setTransactionsFormattedBySelectedPeriod(
            transactionsFormattedPtbrGroupedByDate
          );
          break;
      }
      /**
       * Set Transactions and Totals by Selected Period  - End
       */
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenEditAccount() {
    editAccountBottomSheetRef.current?.present();
  }

  function handleCloseEditAccount() {
    editAccountBottomSheetRef.current?.dismiss();
  }

  function handleOpenPeriodSelectedModal() {
    periodSelectBottomSheetRef.current?.present();
  }

  function handleClosePeriodSelectedModal() {
    periodSelectBottomSheetRef.current?.dismiss();
  }

  function handleOpenTransaction(id: string) {
    setTransactionId(id);
    addTransactionBottomSheetRef.current?.present();
  }

  function handleCloseTransaction() {
    fetchTransactions();
    addTransactionBottomSheetRef.current?.dismiss();
  }

  function handleOpenRegisterTransactionModal() {
    setTransactionId('');
    addTransactionBottomSheetRef.current?.present();
  }

  async function handleDeleteAccount(id: string | null) {
    try {
      const { status } = await api.delete('delete_account', {
        params: {
          account_id: id,
        },
      });
      if (status === 200) {
        Alert.alert('Exclusão de conta', 'Conta excluída com sucesso!');
      }
      handleCloseEditAccount();
      navigation.goBack();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Edição de Conta', error.response?.data.message, [
          { text: 'Tentar novamente' },
          {
            text: 'Voltar para a tela anterior',
            onPress: handleCloseEditAccount,
          },
        ]);
      }
    }
  }

  async function handleClickDeleteAccount() {
    Alert.alert(
      'Exclusão de conta',
      'ATENÇÃO! Todas as transações desta conta também serão excluídas. Tem certeza que deseja excluir a conta?',
      [
        { text: 'Não, cancelar a exclusão' },
        {
          text: 'Sim, excluir a conta',
          onPress: () => handleDeleteAccount(accountID),
        },
      ]
    );
  }

  function ClearTransactionId() {
    setTransactionId('');
  }

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [periodSelected])
  );

  function _renderEmpty() {
    return <ListEmptyComponent />;
  }

  function _renderItem({ item, index }: any) {
    return (
      <TransactionListItem
        data={item}
        index={index}
        hideAmount={hideAmount}
        onPress={() => handleOpenTransaction(item.id)}
      />
    );
  }

  //if (loading) {
  //  return <SkeletonAccountsScreen />;
  //}

  return (
    <Container>
      <Animated.View style={[headerStyleAnimation, styles.header]}>
        <HeaderContainer>
          <Header.Root>
            <Header.BackButton />
            <Header.Title
              title={accountName || ''}
              description={'Transações'}
            />
            <Header.Icon onPress={handleOpenEditAccount} />
          </Header.Root>
        </HeaderContainer>

        <FiltersContainer>
          <FilterButtonGroup>
            <ChartSelectButton
              title={`Por ${periodSelected.name}`}
              onPress={handleOpenPeriodSelectedModal}
            />
          </FilterButtonGroup>
        </FiltersContainer>

        <AccountBalanceContainer>
          <AccountBalanceGroup>
            <AccountBalance balanceIsPositive={balanceIsPositive}>
              {/* {!hideAmount ? totalAccountBalance : '•••••'} */}
              {!hideAmount
                ? Number(accountBalance).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : '•••••'}
            </AccountBalance>
            <AccountBalanceDescription>
              Saldo da conta
            </AccountBalanceDescription>
          </AccountBalanceGroup>

          <AccountBalanceSeparator />

          <AccountBalanceGroup>
            <AccountCashFlow balanceIsPositive={cashFlowIsPositive}>
              {!hideAmount ? cashFlowBySelectedPeriod : '•••••'}
            </AccountCashFlow>
            <AccountCashFlowDescription>{`Fluxo de caixa por ${periodSelected.name}`}</AccountCashFlowDescription>
          </AccountBalanceGroup>
        </AccountBalanceContainer>
      </Animated.View>

      <Transactions>
        <AnimatedSectionList
          sections={optimizedTransactions}
          keyExtractor={(item: any) => item.id}
          renderItem={_renderItem}
          renderSectionHeader={({ section }: any) => (
            <SectionListHeader data={section} />
          )}
          ListEmptyComponent={_renderEmpty}
          initialNumToRender={2000}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTransactions}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{}}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      </Transactions>

      <GestureDetector gesture={onMoveRegisterTransactionButton}>
        <Animated.View
          style={[
            registerTransactionButtonStyle,
            {
              position: 'absolute',
              bottom: 22,
              right: 22,
            },
          ]}
        >
          <ButtonAnimated
            onPress={handleOpenRegisterTransactionModal}
            style={styles.animatedButton}
          >
            <Plus size={24} color={theme.colors.background} />
          </ButtonAnimated>
        </Animated.View>
      </GestureDetector>

      <ModalViewSelection
        title='Selecione o período'
        bottomSheetRef={periodSelectBottomSheetRef}
        snapPoints={['30%', '50%']}
        onClose={handleClosePeriodSelectedModal}
      >
        <ChartPeriodSelect
          period={periodSelected}
          setPeriod={setPeriodSelected}
          closeSelectPeriod={handleClosePeriodSelectedModal}
        />
      </ModalViewSelection>

      <ModalView
        type={'secondary'}
        title={`Editar Conta ${accountName}`}
        bottomSheetRef={editAccountBottomSheetRef}
        snapPoints={['50%', '75%']}
        closeModal={handleCloseEditAccount}
        deleteChildren={handleClickDeleteAccount}
      >
        <RegisterAccount id={accountID} closeAccount={handleCloseEditAccount} />
      </ModalView>

      <ModalViewWithoutHeader
        bottomSheetRef={addTransactionBottomSheetRef}
        snapPoints={['100%']}
      >
        <RegisterTransaction
          id={transactionId}
          resetId={ClearTransactionId}
          closeRegisterTransaction={handleCloseTransaction}
          closeModal={() => addTransactionBottomSheetRef.current?.dismiss()}
        />
      </ModalViewWithoutHeader>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
  },
  animatedButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 23,
  },
});
