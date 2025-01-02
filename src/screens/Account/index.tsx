import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  SectionList,
  Alert,
  Dimensions,
} from 'react-native';
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
import {
  addMonths,
  addYears,
  format,
  getMonth,
  getYear,
  isValid,
  parse,
  parseISO,
  subMonths,
  subYears,
} from 'date-fns';
import { Plus } from 'phosphor-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Gesture,
  GestureDetector,
  RectButton,
} from 'react-native-gesture-handler';

import { Header } from '@components/Header';
import { ModalView } from '@components/ModalView';
import { PeriodRuler } from '@components/PeriodRuler';
import { ChartSelectButton } from '@components/ChartSelectButton';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { ModalViewWithoutHeader } from '@components/ModalViewWithoutHeader';

import { RegisterAccount } from '@screens/RegisterAccount';
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

import formatCurrency from '@utils/formatCurrency';
import getTransactions from '@utils/getTransactions';
import groupTransactionsByDate from '@utils/groupTransactionsByDate';

import { useUser } from '@storage/userStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import api from '@api/api';

import theme from '@themes/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;

export function Account() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const { id: userID } = useUser();
  const { selectedPeriod, setSelectedPeriod, selectedDate, setSelectedDate } =
    useSelectedPeriod();
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [
    transactionsFormattedBySelectedPeriod,
    setTransactionsFormattedBySelectedPeriod,
  ] = useState([]);
  const optimizedTransactions = useMemo(
    () => transactionsFormattedBySelectedPeriod,
    [transactionsFormattedBySelectedPeriod]
  );
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

  async function fetchTransactions() {
    setLoading(true);

    try {
      const data = await getTransactions(userID);
      setTransactions(data);

      /**
       * All Transactions By Account Formatted in pt-BR - Start
       */
      let totalAccountBalance = 0;

      const transactionsByAccountFormattedPtbr = data
        .filter((transaction: any) => transaction.account.id === accountID)
        .map((item: any) => {
          const formattedAmount = formatCurrency(
            item.account.currency.code, // Moeda da conta
            item.amount
          );

          return {
            ...item,
            amount_formatted: formattedAmount,
            created_at: format(item.created_at, 'dd/MM/yyyy', { locale: ptBR }),
          };
        })
        .sort((a: any, b: any) => {
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
          // Credit card
          if (cur.account.type === 'CREDIT') {
            totalAccountBalance -= cur.amount; // Créditos no cartão de crédito DIMINUEM o saldo devedor, ou seja, são valores negativos na API da Pluggy. Débitos no cartão de crédito AUMENTAM o saldo devedor, ou seja, são positivos na API da Pluggy
          }
          // Other account types
          if (cur.account.type !== 'CREDIT') {
            totalAccountBalance += cur.amount;
          }
        });

      totalAccountBalance >= 0
        ? setBalanceIsPositive(true)
        : setBalanceIsPositive(false);

      const totalAccountBalanceFormatted = Number(
        totalAccountBalance
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

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

      let cashFlowByMonth = 0;
      for (const item of transactionsByMonthsFormattedPtbr) {
        const cleanTotal = item.total.replace(/[R$\s.]/g, '').replace(',', '.');
        cashFlowByMonth += parseFloat(cleanTotal);
      }

      if (selectedPeriod.period === 'months') {
        cashFlowByMonth >= 0
          ? setCashFlowIsPositive(true)
          : setCashFlowIsPositive(false);
      }

      const cashFlowFormattedPtbrByMonth = Number(
        cashFlowByMonth
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

      if (selectedPeriod.period === 'years') {
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
      switch (selectedPeriod.period) {
        case 'months':
          setCashFlowBySelectedPeriod(cashFlowFormattedPtbrByMonth);
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

  function handleDateChange(action: 'prev' | 'next'): void {
    switch (selectedPeriod.period) {
      case 'months':
        switch (action) {
          case 'prev':
            setSelectedDate(subMonths(selectedDate, 1));
            break;
          case 'next':
            setSelectedDate(addMonths(selectedDate, 1));
            break;
        }
        break;
      case 'years':
        switch (action) {
          case 'prev':
            setSelectedDate(subYears(selectedDate, 1));
            break;
          case 'next':
            setSelectedDate(addYears(selectedDate, 1));
            break;
        }
        break;
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [selectedPeriod, selectedDate])
  );

  const _renderPeriodRuler = useCallback(() => {
    let months: any = {};
    for (const item of transactions) {
      const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });

      if (!months.hasOwnProperty(ym)) {
        months[ym] = {
          date: ym,
        };
      }
    }

    months = Object.values(months).sort((a: any, b: any) => {
      const firstDateParsed = parse(a.date, 'yyyy-MM', new Date());
      const secondDateParsed = parse(b.date, 'yyyy-MM', new Date());
      return secondDateParsed.getTime() - firstDateParsed.getTime();
    });

    for (let i = months.length - 1; i >= 0; i--) {
      months[i].date = format(parseISO(months[i].date), `MMM '\n' yyyy`, {
        locale: ptBR,
      });
    }

    const dates = months?.map((item: any) => {
      const dateSplit = item.date.split('\n');
      const trimmedDateParts = dateSplit.map((part: string) => part.trim());
      const dateAux = trimmedDateParts.join(' ');

      let parsedDate: Date | null = null;
      try {
        parsedDate = parse(dateAux, 'MMM yyyy', selectedDate, {
          locale: ptBR,
        });
        if (!isValid(parsedDate)) {
          console.warn('Data inválida:', dateAux);
        }
      } catch (error) {
        console.error('Erro ao converter data, _renderPeriodRuler:', error);
      }

      const isActive = parsedDate
        ? getYear(selectedDate) === getYear(parsedDate) &&
          getMonth(selectedDate) === getMonth(parsedDate)
        : false;

      return {
        date: item.date,
        isActive,
      };
    });

    console.log('renderizou!!');

    return (
      <PeriodRuler
        dates={dates}
        handleDateChange={handleDateChange}
        periodRulerListColumnWidth={PERIOD_RULER_LIST_COLUMN_WIDTH}
      />
    );
  }, [selectedDate]);

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
              title={`Por ${selectedPeriod.name}`}
              onPress={handleOpenPeriodSelectedModal}
            />
          </FilterButtonGroup>
        </FiltersContainer>

        <AccountBalanceContainer>
          <AccountBalanceGroup>
            <AccountBalance balanceIsPositive={balanceIsPositive}>
              {!hideAmount ? accountBalance : '•••••'}
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
            <AccountCashFlowDescription>{`Fluxo de caixa por ${selectedPeriod.name}`}</AccountCashFlowDescription>
          </AccountBalanceGroup>
        </AccountBalanceContainer>
      </Animated.View>

      <Animated.View>{_renderPeriodRuler()}</Animated.View>

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
          period={selectedPeriod}
          setPeriod={setSelectedPeriod}
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
