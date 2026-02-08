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

// Hooks
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useDeleteAccountMutation } from '@hooks/useAccountMutations';

// Utils
import formatCurrency from '@utils/formatCurrency';
import formatDatePtBr from '@utils/formatDatePtBr';
import { processTransactions } from '@utils/processTransactions';

// Dependencies
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
import { useTheme } from 'styled-components';
import { useLocalSearchParams } from 'expo-router';
import Plus from 'phosphor-react-native/src/icons/Plus';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Components
import { Screen } from '@components/Screen';
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

// Screens
import { RegisterAccount } from '@screens/RegisterAccount';
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

// Storages
import { useUser } from '@stores/userStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useSelectedPeriod } from '@stores/selectedPeriodStorage';
import { useCurrentAccountSelected } from '@stores/currentAccountSelectedStorage';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { TransactionProps } from '@interfaces/transactions';
import { useAccountDetailQuery } from '@hooks/useAcccountDetailQuery';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;

export function Account() {
  const theme: ThemeProps = useTheme();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { id: userID } = useUser();
  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const addTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const hideAmount = useUserConfigs((state) => state.hideAmount);
  const { id } = useLocalSearchParams();
  const accountID: number = Number(id);
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

  const {
    data: account,
    isLoading: isLoadingAccountDetails,
    isError,
  } = useAccountDetailQuery(accountID);

  const {
    data: allTransactions,
    isLoading,
    refetch,
    isRefetching,
  } = useTransactionsQuery(userID);

  const { mutate: deleteAccount } = useDeleteAccountMutation();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [theme]
  );

  const processedData = useMemo(() => {
    if (!allTransactions || !accountID) {
      return {
        transactionsFormattedBySelectedPeriod: [],
        cashFlowBySelectedPeriod: formatCurrency('BRL', 0),
      };
    }

    const transactionsForThisAccount = allTransactions.filter(
      (transaction: TransactionProps) => transaction.account.id === accountID
    );

    const transactionsFormattedPtbr = transactionsForThisAccount.map(
      (item: TransactionProps) => {
        const dmy = formatDatePtBr(item.created_at).short();
        return {
          id: item.id,
          created_at: dmy,
          description: item.description || '',
          amount: item.amount,
          amount_formatted: formatCurrency(item.currency.code, item.amount),
          amount_in_account_currency: item.amount_in_account_currency,
          amount_in_account_currency_formatted: item.amount_in_account_currency
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
      }
    );
    const { currentCashFlow, groupedTransactions } = processTransactions(
      transactionsFormattedPtbr,
      selectedPeriod.period,
      selectedDate
    );

    const cashFlowValue = parseFloat(
      currentCashFlow.replace(/[^\d,.-]/g, '').replace(',', '.')
    );
    const isCashFlowPositive = cashFlowValue >= 0;

    return {
      transactionsFormattedBySelectedPeriod: groupedTransactions,
      cashFlowBySelectedPeriod: currentCashFlow,
      cashFlowIsPositive: isCashFlowPositive,
    };
  }, [allTransactions, accountID, selectedPeriod, selectedDate]);

  const _renderPeriodRuler = useCallback(() => {
    let months: any = {};
    for (const item of allTransactions || []) {
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
  }, [selectedDate, allTransactions]);

  if (isLoadingAccountDetails) {
    return <SkeletonAccountsScreen />;
  }

  if (isError || !account) {
    return (
      <Screen>
        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Erro' />
        </Header.Root>
        <ListEmptyComponent text='Não foi possível carregar os detalhes da conta. Tente novamente.' />
      </Screen>
    );
  }

  const {
    name: accountName,
    currency: { code: accountCurrencyCode },
    balance: accountBalance,
    type: accountType,
    subtype: accountSubType,
    creditData: accountCreditData,
  } = account;
  const balanceIsPositive = accountBalance >= 0;
  const isCreditCard =
    accountType === 'CREDIT' && accountSubType === 'CREDIT_CARD';
  const hasCreditCardAvailableLimit =
    accountCreditData?.availableCreditLimit! > 0;

  async function handleRefresh() {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
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
    addTransactionBottomSheetRef.current?.dismiss();
  }

  function handleOpenRegisterTransactionModal() {
    setTransactionId('');
    addTransactionBottomSheetRef.current?.present();
  }

  async function handleClickDeleteAccount() {
    Alert.alert(
      'Exclusão de conta',
      'ATENÇÃO! Todas as transações desta conta também serão excluídas. Tem certeza que deseja excluir a conta?',
      [
        { text: 'Cancelar' },
        {
          text: 'Sim, Excluir',
          style: 'destructive',
          onPress: () =>
            deleteAccount(accountID!, {
              onError: (error: any) => {
                Alert.alert(
                  'Exclusão de Conta',
                  error?.response?.data?.message,
                  [
                    { text: 'Tentar novamente' },
                    {
                      text: 'Voltar para a tela anterior',
                      onPress: handleCloseEditAccount,
                    },
                  ]
                );
              },
            }),
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

  if (isLoading) {
    return <SkeletonAccountsScreen />;
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Animated.View style={[headerStyleAnimation, dynamicStyles.header]}>
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
                {!hideAmount
                  ? formatCurrency(accountCurrencyCode, accountBalance)
                  : '•••••'}
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
                  !isCreditCard
                    ? processedData.cashFlowIsPositive
                    : hasCreditCardAvailableLimit
                }
              >
                {!isCreditCard
                  ? !hideAmount
                    ? processedData.cashFlowBySelectedPeriod
                    : '•••••'
                  : !hideAmount
                  ? formatCurrency(
                      accountCurrencyCode,
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
            sections={processedData.transactionsFormattedBySelectedPeriod}
            keyExtractor={(item: any) => item.id}
            renderItem={_renderItem}
            renderSectionHeader={({ section }: any) => (
              <SectionListHeader data={section} />
            )}
            ListEmptyComponent={_renderEmpty}
            initialNumToRender={2000}
            refreshControl={
              <RefreshControl
                refreshing={isManualRefreshing}
                onRefresh={handleRefresh}
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
              style={dynamicStyles.animatedButton}
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
          <RegisterAccount
            id={String(accountID)}
            closeAccount={handleCloseEditAccount}
          />
        </ModalView>

        <ModalViewWithoutHeader
          bottomSheetRef={addTransactionBottomSheetRef}
          snapPoints={['100%']}
        >
          <RegisterTransaction
            id={transactionId}
            resetId={ClearTransactionId}
            closeRegisterTransaction={handleCloseTransaction}
          />
        </ModalViewWithoutHeader>
      </Container>
    </Screen>
  );
}
