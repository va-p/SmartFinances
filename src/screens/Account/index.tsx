import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  SectionList,
  Alert,
  Dimensions,
  Platform,
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
  HeaderButtonGroup,
} from './styles';

// Hooks
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useDeleteAccountMutation } from '@hooks/useAccountMutations';
import { useDateNavigation } from '@hooks/useDateNavigation';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { processTransactions } from '@utils/processTransactions';
import { formatTransactions } from '@utils/formatTransactions';
import { buildPeriodRulerDates } from '@utils/buildPeriodRulerDates';
import { formatSectionHeaderTitle } from '@utils/formatSectionHeaderTitle';
import { filterSectionsByQuery } from '@utils/filterSectionsByQuery';

// Dependencies
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { getYear, isValid } from 'date-fns';
import {
  Gesture,
  GestureDetector,
  RectButton,
} from 'react-native-gesture-handler';
import { useTheme } from 'styled-components';
import { useLocalSearchParams } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';
import { useForm } from 'react-hook-form';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';

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
import { SearchBar } from '@components/SearchBar';

// Screens
import { RegisterAccount } from '@screens/RegisterAccount';
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

// Storages
import { useUserConfigs } from '@stores/userConfigsStorage';
import { useSelectedPeriod } from '@stores/selectedPeriodStorage';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { TransactionProps } from '@interfaces/transactions';
import { useAccountDetailQuery } from '@hooks/useAcccountDetailQuery';

const isAndroid = Platform.OS === 'android';
const SCREEN_WIDTH = Dimensions.get('window').width;
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;
const REGISTER_TRANSACTION_TRANSACTION_BUTTON_BOTTOM_POSITION = isAndroid ? 64 : 96;

export function Account() {
  const theme  = useTheme() as ThemeProps;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const addTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const hideAmount = useUserConfigs((state) => state.hideAmount);
  const { id } = useLocalSearchParams();
  const accountID = Number(id);
  // Animated header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 340], [230, 0], Extrapolation.CLAMP),
    opacity: interpolate(scrollY.value, [0, 310], [1, 0], Extrapolation.CLAMP),
  }));
  // Animated section list
  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
  // Animated button register transaction
  const registerTransactionButtonPositionX = useSharedValue(0);
  const registerTransactionButtonPositionY = useSharedValue(0);
  const initialX = useRef(0);
  const initialY = useRef(0);
  const ButtonAnimated = Animated.createAnimatedComponent(RectButton);
  const registerTransactionButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: registerTransactionButtonPositionX.value },
      { translateY: registerTransactionButtonPositionY.value },
    ],
  }));

  const onMoveRegisterTransactionButton = Gesture.Pan()
    .onStart(() => {
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
  } = useTransactionsQuery();

  const { mutate: deleteAccount } = useDeleteAccountMutation();

  // Search form (Home-screen pattern: query via react-hook-form)
  const { control, watch, reset } = useForm();
  const searchQuery = watch('search', '');

  // Date navigation
  const { handleDateChange, handlePressDate } = useDateNavigation({
    selectedPeriod,
    selectedDate,
    setSelectedDate,
  });

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

    const transactionsFormattedPtbr = formatTransactions(
      transactionsForThisAccount
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

  // Transaction filtering with search
  const filteredTransactions = useMemo(
    () =>
      filterSectionsByQuery(
        processedData.transactionsFormattedBySelectedPeriod,
        searchQuery,
        (transaction: TransactionProps) => transaction.description
      ),
    [processedData.transactionsFormattedBySelectedPeriod, searchQuery]
  );

  const renderPeriodRuler = useCallback(() => {
    // Years source for the 'years' ruler: the user's transaction years.
    // Other period modes ignore the years param.
    const years = new Set<number>();
    if (selectedPeriod.period === 'years') {
      (allTransactions || []).forEach((item) => {
        const transactionDate = new Date(item.created_at);
        if (isValid(transactionDate)) {
          years.add(getYear(transactionDate));
        }
      });
    }

    const dates = buildPeriodRulerDates({
      period: selectedPeriod.period,
      selectedDate,
      years: Array.from(years),
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
  }, [
    selectedDate,
    allTransactions,
    selectedPeriod.period,
    handleDateChange,
    handlePressDate,
  ]);

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
  const balanceIsPositive = Number(accountBalance) >= 0;
  const isCreditCard =
    accountType === 'CREDIT' && accountSubType === 'CREDIT_CARD';
  const hasCreditCardAvailableLimit =
    (accountCreditData?.availableCreditLimit ?? 0) > 0;

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

  function handleOpenTransaction(idAux: string) {
    setTransactionId(idAux);
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
            deleteAccount(String(accountID), {
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

  function renderEmpty() {
    return <ListEmptyComponent />;
  }

  function renderItem({ item, index }: any) {
    return (
      <TransactionListItem
        data={item}
        index={index}
        hideAmount={hideAmount}
        onPress={() => handleOpenTransaction(item.id)}
      />
    );
  }

  function renderSectionHeader({ section }: any) {
    return (
      <SectionListHeader
        data={{
          title: formatSectionHeaderTitle(section.title),
          total: section.total,
        }}
      />
    );
  }

  if (isLoading) {
    return <SkeletonAccountsScreen />;
  }

  function getDisplayedCashFlow() {
    if (!hideAmount) {
      if (isCreditCard) {
        return formatCurrency(
          accountCurrencyCode,
          accountCreditData?.availableCreditLimit ?? 0
        );
      }

      return processedData.cashFlowBySelectedPeriod;
    }

    return '•••••';
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
              <HeaderButtonGroup>
                <Header.SearchButton
                  onPress={() => setShowSearchInput((prevState) => !prevState)}
                />
                <Header.Icon onPress={() => handleOpenEditAccount()} />
              </HeaderButtonGroup>
            </Header.Root>
          </HeaderContainer>

          <FiltersContainer>
            <FilterButtonGroup>
              <FilterButton
                title={`Por ${selectedPeriod.name}`}
                onPress={() => handleOpenPeriodSelectedModal()}
              />
            </FilterButtonGroup>
          </FiltersContainer>

          <AccountBalanceContainer>
            <AccountBalanceGroup>
              <AccountBalance balanceIsPositive={balanceIsPositive}>
                {!hideAmount
                  ? formatCurrency(accountCurrencyCode, Number(accountBalance))
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
                    ? processedData.cashFlowIsPositive ?? false
                    : hasCreditCardAvailableLimit
                }
              >
                {getDisplayedCashFlow()}
              </AccountCashFlow>
              <AccountCashFlowDescription>
                {!isCreditCard && 'Fluxo de caixa'}
                {isCreditCard && 'Limite disponível'}
              </AccountCashFlowDescription>
            </AccountBalanceGroup>
          </AccountBalanceContainer>
          <Animated.View>{renderPeriodRuler()}</Animated.View>
        </Animated.View>

        {showSearchInput && (
          <SearchBar control={control} onClear={() => reset()} />
        )}

        <Transactions>
          <AnimatedSectionList
            sections={filteredTransactions}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item, index }: any) => renderItem({ item, index })}
            renderSectionHeader={({ section }: any) => renderSectionHeader({ section })}
            ListEmptyComponent={() => renderEmpty()}
            initialNumToRender={2000}
            refreshControl={
              <RefreshControl
                refreshing={isManualRefreshing}
                onRefresh={() => handleRefresh()}
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
                bottom: REGISTER_TRANSACTION_TRANSACTION_BUTTON_BOTTOM_POSITION,
                right: 16,
              },
            ]}
          >
            <ButtonAnimated
              onPress={() => handleOpenRegisterTransactionModal()}
              style={dynamicStyles.animatedButton}
            >
              <PlusIcon size={24} color={theme.colors.background} />
            </ButtonAnimated>
          </Animated.View>
        </GestureDetector>

        <ModalViewSelection
          title='Selecione o período'
          bottomSheetRef={periodSelectBottomSheetRef}
          snapPoints={['30%', '50%']}
          onClose={() => handleClosePeriodSelectedModal()}
        >
          <ChartPeriodSelect
            period={selectedPeriod}
            closeSelectPeriod={() => handleClosePeriodSelectedModal()}
          />
        </ModalViewSelection>

        <ModalView
          type="secondary"
          title={`Editar Conta ${accountName}`}
          bottomSheetRef={editAccountBottomSheetRef}
          snapPoints={['75%']}
          closeModal={() => handleCloseEditAccount()}
          deleteChildren={() => handleClickDeleteAccount()}
        >
          <RegisterAccount
            id={String(accountID)}
            closeAccount={() => handleCloseEditAccount()}
          />
        </ModalView>

        <ModalViewWithoutHeader
          bottomSheetRef={addTransactionBottomSheetRef}
          snapPoints={['100%']}
        >
          <RegisterTransaction
            id={transactionId}
            resetId={() => ClearTransactionId()}
            closeRegisterTransaction={() => handleCloseTransaction()}
          />
        </ModalViewWithoutHeader>
      </Container>
    </Screen>
  );
}
