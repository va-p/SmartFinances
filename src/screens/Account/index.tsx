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

import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';
import getTransactions from '@utils/getTransactions';
import { processTransactions } from '@utils/processTransactions';
import { GroupedTransactionProps } from '@utils/groupTransactionsByDate';

import axios from 'axios';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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
import {
  Gesture,
  GestureDetector,
  RectButton,
} from 'react-native-gesture-handler';
import { ptBR } from 'date-fns/locale';
import Plus from 'phosphor-react-native/src/icons/Plus';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { PeriodRuler } from '@components/PeriodRuler';
import { FilterButton } from '@components/FilterButton';
import { ModalView } from '@components/Modals/ModalView';
import TransactionListItem from '@components/TransactionListItem';
import { SectionListHeader } from '@components/SectionListHeader';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { ModalViewWithoutHeader } from '@components/Modals/ModalViewWithoutHeader';

import { RegisterAccount } from '@screens/RegisterAccount';
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

import { useUser } from '@storage/userStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

import { TransactionProps } from '@interfaces/transactions';

import api from '@api/api';

import theme from '@themes/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;

export function Account() {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const { id: userID } = useUser();
  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [
    transactionsFormattedBySelectedPeriod,
    setTransactionsFormattedBySelectedPeriod,
  ] = useState<GroupedTransactionProps[]>([]);
  const optimizedTransactions = useMemo(
    () => transactionsFormattedBySelectedPeriod,
    [transactionsFormattedBySelectedPeriod]
  );
  const [cashFlowBySelectedPeriod, setCashFlowBySelectedPeriod] =
    useState('R$ 0,00');
  const [cashFlowIsPositive, setCashFlowIsPositive] = useState(true);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const addTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const navigation = useNavigation();
  const hideAmount = useUserConfigs((state) => state.hideAmount);
  const {
    accountId: accountID,
    accountName,
    accountBalance,
    accountType,
    accountSubType,
    accountCreditData,
  } = useCurrentAccountSelected();
  const balanceIsPositive =
    parseFloat(accountBalance!.replace(/[^\d,.-]/g, '').replace(',', '.')) > 0; // TODO: Testar com outras moedas que não o real.
  const isCreditCard =
    accountType === 'CREDIT' && accountSubType === 'CREDIT_CARD';
  const hasCreditCardAvailableLimit =
    accountCreditData?.availableCreditLimit! > 0;
  // Animated header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(scrollY.value, [0, 340], [230, 0], Extrapolate.CLAMP),
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
    .onStart((_) => {
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

      // Format transactions
      const transactionsFormattedPtbr = data
        .filter(
          (transaction: TransactionProps) =>
            transaction.account.id === accountID
        )
        .map((item: TransactionProps) => {
          const dmy = formatDatePtBr(item.created_at).short();
          return {
            id: item.id,
            created_at: dmy,
            description: item.description || '',
            amount: item.amount,
            amount_formatted: formatCurrency(item.currency.code, item.amount),
            amount_in_account_currency: item.amount_in_account_currency,
            amount_in_account_currency_formatted:
              item.amount_in_account_currency
                ? formatCurrency(
                    item.account.currency.code,
                    item.amount_in_account_currency
                  )
                : undefined,
            currency: item.currency,
            type: item.type,
            account: item.account,
            category: item.category,
            tags: item.tags,
            user_id: item.user_id,
          };
        });

      // Process transactions
      const { currentCashFlow, groupedTransactions } = processTransactions(
        transactionsFormattedPtbr,
        selectedPeriod.period,
        selectedDate
      );

      // Update refs and states
      setCashFlowBySelectedPeriod(currentCashFlow);
      setTransactionsFormattedBySelectedPeriod(groupedTransactions);
      // TODO: setCashFlowIsPositive

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
      const { status } = await api.delete('account/delete', {
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
        Alert.alert('Edição de Conta', error?.response?.data?.message, [
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

  function handlePressDate(): void {}

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

    return (
      <PeriodRuler
        dates={dates}
        handleDateChange={handleDateChange}
        periodRulerListColumnWidth={PERIOD_RULER_LIST_COLUMN_WIDTH}
        handlePressDate={handlePressDate}
        horizontalPadding={16}
      />
    );
  }, [selectedDate, transactions]);

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
      <Gradient />

      <Animated.View style={[headerStyleAnimation, styles.header]}>
        <HeaderContainer>
          <Header.Root>
            <Header.BackButton />
            <Header.Title title={accountName || ''} />
            <Header.Icon onPress={handleOpenEditAccount} />
          </Header.Root>
        </HeaderContainer>

        <FiltersContainer>
          <FilterButtonGroup>
            <FilterButton
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
              {!isCreditCard && 'Saldo da conta'}
              {isCreditCard && 'Saldo do cartão'}
            </AccountBalanceDescription>
          </AccountBalanceGroup>

          <AccountBalanceSeparator />

          <AccountBalanceGroup>
            <AccountCashFlow
              balanceIsPositive={
                !isCreditCard ? cashFlowIsPositive : hasCreditCardAvailableLimit
              }
            >
              {!isCreditCard
                ? !hideAmount
                  ? cashFlowBySelectedPeriod
                  : '•••••'
                : !hideAmount
                ? formatCurrency(
                    'BRL',
                    accountCreditData?.availableCreditLimit!
                  )
                : '•••••'}
            </AccountCashFlow>
            <AccountCashFlowDescription>
              {!isCreditCard && 'Fluxo de caixa'}
              {isCreditCard && 'Limite disponível'}
            </AccountCashFlowDescription>
          </AccountBalanceGroup>
        </AccountBalanceContainer>
        <Animated.View>{_renderPeriodRuler()}</Animated.View>
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
          contentContainerStyle={{
            rowGap: 8,
            paddingBottom: bottomTabBarHeight + 16,
          }}
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
              bottom: 64,
              right: 16,
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
          closeSelectPeriod={handleClosePeriodSelectedModal}
        />
      </ModalViewSelection>

      <ModalView
        type={'secondary'}
        title={`Editar Conta ${accountName}`}
        bottomSheetRef={editAccountBottomSheetRef}
        snapPoints={['75%']}
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
