import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  StyleSheet,
  BackHandler,
  Dimensions,
  View,
} from 'react-native';
import {
  Container,
  Header,
  CashFlowContainer,
  CashFlowTotal,
  CashFlowDescription,
  HideDataButton,
  FiltersContainer,
  FilterButtonGroup,
  Transactions,
  SearchButton,
  SearchInputContainer,
  ClearSearchButton,
} from './styles';

// Hooks
import { useQuotesQuery } from '@hooks/useQuotesQuery';
import { useSyncTransactions } from '@hooks/useSyncTransactions';
import { useTransactionsQuery } from '@hooks/useTransactionsQuery';
import { useTransactionHandlers } from './hooks/useTransactionHandlers';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useTransactionFiltering } from './hooks/useTransactionFiltering';
import { useHomeAnimations } from './hooks/useHomeAnimations';

// Utils
import { FlashListTransactionItem } from '@utils/flattenTransactionsForFlashList';
import { processTransactions } from '@utils/processTransactions';
import formatDatePtBr from '@utils/formatDatePtBr';
import formatCurrency from '@utils/formatCurrency';

// Dependencies
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  RectButton,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { isFirstDayOfMonth } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
import { FlashList } from '@shopify/flash-list';
import { BarChart } from 'react-native-gifted-charts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Icons
import X from 'phosphor-react-native/src/icons/X';
import Eye from 'phosphor-react-native/src/icons/Eye';
import Plus from 'phosphor-react-native/src/icons/Plus';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import MagnifyingGlass from 'phosphor-react-native/src/icons/MagnifyingGlass';
import PencilSimpleLine from 'phosphor-react-native/src/icons/PencilSimpleLine';

// Components
import { Screen } from '@components/Screen';
import { Gradient } from '@components/Gradient';
import { FilterButton } from '@components/FilterButton';
import { SectionListHeader } from '@components/SectionListHeader';
import TransactionListItem from '@components/TransactionListItem';
import { SkeletonHomeScreen } from '@components/SkeletonHomeScreen';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { ModalViewWithoutHeader } from '@components/Modals/ModalViewWithoutHeader';
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';
import { PeriodRulerList } from './components/PeriodRulerList';
import { CashFlowInsightCard } from './components/CashFlowInsightCard';

// Screens
import { ChartPeriodSelect } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';

// Storages
import { useUser } from '@storage/userStorage';
import { useQuotes } from '@storage/quotesStorage';
import { useUserConfigs } from '@storage/userConfigsStorage';
import { useSelectedPeriod } from '@storage/selectedPeriodStorage';
import { DATABASE_CONFIGS, storageConfig } from '@database/database';
import { useCurrentAccountSelected } from '@storage/currentAccountSelectedStorage';

// Stores
import {
  useSelectedTransactions,
  useClearSelection,
  useSelectedTransactionsCount,
} from '@stores/useTransactionsStore';

// Interfaces
import { ThemeProps } from '@interfaces/theme';
import { CashFlowChartData, TransactionProps } from '@interfaces/transactions';

// APIs
import api from '@api/api';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const FLOATING_BUTTONS_RIGHT_POSITION = 16;
const REGISTER_TRANSACTION_TRANSACTION_BUTTON_BOTTOM_POSITION = 64;
const BULK_EDIT_BUTTON_BOTTOM_POSITION = 117;
// PeriodRulerList Column
const PERIOD_RULER_LIST_COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 6;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const SCREEN_HEIGHT_PERCENT_WITH_INSIGHTS = SCREEN_HEIGHT * 0.48;
const SCREEN_HEIGHT_PERCENT_WITHOUT_INSIGHTS = SCREEN_HEIGHT * 0.32;

const CHART_BAR_SPACING = 40;
const CHART_BAR_WIDTH = 8;

export function Home() {
  const theme = useTheme() as ThemeProps;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { id: userID } = useUser();
  const selectedTransactions = useSelectedTransactions();
  const clearSelection = useClearSelection();
  const selectedCount = useSelectedTransactionsCount();

  const {
    setBrlQuoteBtc,
    setBrlQuoteEur,
    setBrlQuoteUsd,
    setBtcQuoteBrl,
    setBtcQuoteEur,
    setBtcQuoteUsd,
    setEurQuoteBrl,
    setEurQuoteBtc,
    setEurQuoteUsd,
    setUsdQuoteBrl,
    setUsdQuoteBtc,
    setUsdQuoteEur,
  } = useQuotes();

  const { hideAmount, setHideAmount, insights } = useUserConfigs();
  const { setAccountId: setAccountID, setAccountName } =
    useCurrentAccountSelected();

  const [showInsights, setShowInsights] = useState(true);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const { control, watch, reset } = useForm();
  const searchQuery = watch('search', '');

  const chartPeriodSelectedBottomSheetRef = useRef<BottomSheetModal>(null);
  const registerTransactionBottomSheetRef = useRef<BottomSheetModal>(null);

  const { selectedPeriod, selectedDate, setSelectedDate } = useSelectedPeriod();
  const cashFlows = useRef<CashFlowChartData[]>([]);
  const cashFlowTotalBySelectedPeriod = useRef('');
  const firstDayOfMonth: boolean = isFirstDayOfMonth(new Date());

  // Animated header, chart and insights container
  const scrollY = useSharedValue(0);
  const scrollHandlerToTop = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Animation styles
  const {
    headerStyleAnimation,
    chartStyleAnimationOpacity,
    insightsStyleAnimationOpacity,
  } = useHomeAnimations({
    scrollY,
    insights,
    showInsights,
    firstDayOfMonth,
  });

  // Animated Flash List
  const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

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
  const bulkEditionButtonPositionX = useSharedValue(0);
  const bulkEditionButtonPositionY = useSharedValue(0);

  const bulkEditionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: bulkEditionButtonPositionX.value },
        { translateY: bulkEditionButtonPositionY.value },
      ],
    };
  });

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

      bulkEditionButtonPositionX.value = initialX.current + e.translationX;
      bulkEditionButtonPositionY.value = initialY.current + e.translationY;
    })
    .onEnd(() => {
      registerTransactionButtonPositionX.value = withSpring(0);
      registerTransactionButtonPositionY.value = withSpring(0);

      bulkEditionButtonPositionX.value = withSpring(0);
      bulkEditionButtonPositionY.value = withSpring(0);
    });

  const onMovebulkEditButton = Gesture.Pan()
    .onStart(() => {
      initialX.current = registerTransactionButtonPositionX.value;
      initialY.current = registerTransactionButtonPositionY.value;
    })
    .onUpdate((e) => {
      bulkEditionButtonPositionX.value = initialX.current + e.translationX;
      bulkEditionButtonPositionY.value = initialY.current + e.translationY;

      registerTransactionButtonPositionX.value =
        initialX.current + e.translationX;
      registerTransactionButtonPositionY.value =
        initialY.current + e.translationY;
    })
    .onEnd(() => {
      bulkEditionButtonPositionX.value = withSpring(0);
      bulkEditionButtonPositionY.value = withSpring(0);

      registerTransactionButtonPositionX.value = withSpring(0);
      registerTransactionButtonPositionY.value = withSpring(0);
    });

  const { data: quotesData, isLoading: isLoadingQuotes } = useQuotesQuery();

  const {
    data: transactions,
    isLoading,
    isError,
  } = useTransactionsQuery(userID);

  const { mutate: syncTransactions, isPending: isSyncing } =
    useSyncTransactions();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          overflow: 'hidden',
          backgroundColor: theme.colors.backgroundCardHeader,
          borderBottomRightRadius: 75,
          borderBottomLeftRadius: 75,
        },
        insightCard: {
          minHeight: 30,
          marginTop: -8,
          marginBottom: 16,
        },
        animatedButton: {
          width: 45,
          height: 45,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
          borderRadius: 23,
        },
        bulkEditButton: {
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
    if (!transactions) {
      return {
        cashFlowChartData: [],
        currentCashFlow: 'R$ 0,00',
        groupedTransactions: [],
      };
    }

    const transactionsFormattedPtbr = transactions.map((item: any) => {
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
    });

    return processTransactions(
      transactionsFormattedPtbr,
      selectedPeriod.period,
      selectedDate
    );
  }, [transactions, selectedPeriod.period, selectedDate]);

  cashFlowTotalBySelectedPeriod.current = processedData.currentCashFlow;
  cashFlows.current = processedData.cashFlowChartData;
  const transactionsFormattedBySelectedPeriod =
    processedData.groupedTransactions;

  // Transaction filtering with search
  const { filteredTransactions } = useTransactionFiltering({
    searchQuery,
    transactionsGrouped: transactionsFormattedBySelectedPeriod,
  });

  // Transaction handlers
  const {
    handleOpenTransaction,
    handleLongPress,
    handleOpenBulkEditModal,
    clearTransactionId,
  } = useTransactionHandlers({
    registerTransactionBottomSheetRef,
    setTransactionId,
  });

  // Date navigation
  const { handleDateChange, handlePressDate } = useDateNavigation({
    selectedPeriod,
    selectedDate,
    setSelectedDate,
  });

  function handleRefresh() {
    if (!!userID) {
      syncTransactions(userID);
    }
  }

  function handleOpenPeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.present();
  }

  function handleClosePeriodSelectedModal() {
    chartPeriodSelectedBottomSheetRef.current?.dismiss();
  }

  function handleOpenRegisterTransactionModal() {
    setTransactionId('');
    clearSelection();
    registerTransactionBottomSheetRef.current?.present();
  }

  function handleCloseRegisterTransactionModal() {
    setTransactionId('');
    setAccountID(null);
    setAccountName(null);
    clearSelection();
    registerTransactionBottomSheetRef.current?.dismiss();
  }

  async function handleHideData() {
    try {
      const { status } = await api.post('user_config/edit_hide_amount', {
        user_id: userID,
        hide_amount: !hideAmount,
      });

      if (status === 200) {
        storageConfig.set(`${DATABASE_CONFIGS}.hideAmount`, !hideAmount);
        setHideAmount(!hideAmount);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Não foi possível salvar suas configurações. Por favor, tente novamente.'
      );
    }
  }

  function handleHideCashFlowInsights() {
    setShowInsights(false);
  }

  function _renderEmpty() {
    return <ListEmptyComponent />;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
  }, []);

  useEffect(() => {
    if (!!quotesData) {
      setBrlQuoteBtc(quotesData.brlToBtc);
      setBrlQuoteEur(quotesData.brlToEur);
      setBrlQuoteUsd(quotesData.brlToUsd);

      setBtcQuoteBrl(quotesData.btcToBrl);
      setBtcQuoteEur(quotesData.btcToEur);
      setBtcQuoteUsd(quotesData.btcToUsd);

      setEurQuoteBrl(quotesData.eurToBrl);
      setEurQuoteBtc(quotesData.eurToBtc);
      setEurQuoteUsd(quotesData.eurToUsd);

      setUsdQuoteBrl(quotesData.usdToBrl);
      setUsdQuoteBtc(quotesData.usdToBtc);
      setUsdQuoteEur(quotesData.usdToEur);
    }
  }, [quotesData]);

  if (isLoading && !transactions) {
    return (
      <Screen>
        <SkeletonHomeScreen />
      </Screen>
    );
  }

  if (isError) {
    Alert.alert(
      'Erro',
      'Não foi possível carregar suas transações. Por favor, tente novamente'
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Animated.View style={[headerStyleAnimation, dynamicStyles.header]}>
          <Header>
            <CashFlowContainer>
              <CashFlowTotal>
                {!hideAmount ? cashFlowTotalBySelectedPeriod.current : '•••••'}
              </CashFlowTotal>
              <CashFlowDescription>Fluxo de Caixa</CashFlowDescription>
            </CashFlowContainer>

            <SearchButton
              onPress={() => setShowSearchInput((prevState) => !prevState)}
            >
              <MagnifyingGlass size={20} color={theme.colors.primary} />
            </SearchButton>

            <HideDataButton onPress={() => handleHideData()}>
              {!hideAmount ? (
                <EyeSlash size={20} color={theme.colors.primary} />
              ) : (
                <Eye size={20} color={theme.colors.primary} />
              )}
            </HideDataButton>
          </Header>

          <FiltersContainer>
            <FilterButtonGroup>
              <FilterButton
                title={`Por ${selectedPeriod.name}`}
                onPress={handleOpenPeriodSelectedModal}
              />
            </FilterButtonGroup>
          </FiltersContainer>

          <Animated.View style={chartStyleAnimationOpacity}>
            <BarChart
              data={cashFlows.current}
              width={SCREEN_WIDTH - 40}
              height={80}
              barWidth={CHART_BAR_WIDTH}
              spacing={CHART_BAR_SPACING}
              roundedTop
              labelWidth={30}
              xAxisThickness={1}
              yAxisThickness={0}
              noOfSections={3}
              xAxisTextNumberOfLines={2}
              scrollToEnd
              isAnimated
              formatYLabel={(label: string) => {
                const value = Number(label);
                const k = Math.floor(value / 1000);
                return k > 0 ? `${k}k` : '0';
              }}
              yAxisTextStyle={{
                fontSize: 10,
                color: theme.colors.textPlaceholder,
              }}
              xAxisLabelTextStyle={{ fontSize: 10, color: '#90A4AE' }}
            />
          </Animated.View>

          <Animated.View>
            <PeriodRulerList
              cashFlows={cashFlows.current}
              selectedPeriod={selectedPeriod}
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
              handlePressDate={handlePressDate}
              periodRulerListColumnWidth={PERIOD_RULER_LIST_COLUMN_WIDTH}
            />
          </Animated.View>

          {insights && showInsights && firstDayOfMonth && (
            <Animated.View
              style={[insightsStyleAnimationOpacity, dynamicStyles.insightCard]}
            >
              <CashFlowInsightCard
                cashFlows={cashFlows.current}
                selectedDate={selectedDate}
                onClose={handleHideCashFlowInsights}
              />
            </Animated.View>
          )}
        </Animated.View>

        {showSearchInput && (
          <Animated.View
            entering={FadeInUp.easing(Easing.bounce).duration(500)}
            exiting={FadeOutUp.easing(Easing.linear)}
          >
            <SearchInputContainer>
              <ControlledInputWithIcon
                icon={<MagnifyingGlass color={theme.colors.primary} />}
                placeholder='Pesquisar...'
                autoCorrect={false}
                name='search'
                control={control}
              />
              <ClearSearchButton onPress={() => reset()}>
                <X size={20} color={theme.colors.primary} />
              </ClearSearchButton>
            </SearchInputContainer>
          </Animated.View>
        )}

        <Transactions>
          <AnimatedFlashList
            data={filteredTransactions}
            keyExtractor={(item: any) => {
              return item.isHeader
                ? String(item.headerTitle!)
                : String(item.id);
            }}
            renderItem={({ item, index }: any) => {
              if (item.isHeader) {
                return (
                  <SectionListHeader
                    data={{
                      title: item.headerTitle,
                      total: item.headerTotal,
                    }}
                  />
                );
              }
              return (
                <TransactionListItem
                  key={item.id}
                  data={item}
                  index={index}
                  hideAmount={hideAmount}
                  onPress={() => handleOpenTransaction(item.id)}
                  onLongPress={() => handleLongPress(item.id)}
                />
              );
            }}
            getItemType={(item) =>
              (item as FlashListTransactionItem).isHeader
                ? 'sectionHeader'
                : 'row'
            }
            estimatedItemSize={100}
            ListEmptyComponent={_renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isSyncing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandlerToTop}
            scrollEventThrottle={16}
            ItemSeparatorComponent={() => (
              <View style={{ minHeight: 8, maxHeight: 8 }} />
            )}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: bottomTabBarHeight + 8,
            }}
          />
        </Transactions>

        {selectedTransactions.length > 0 && (
          <GestureDetector gesture={onMovebulkEditButton}>
            <Animated.View
              entering={FadeInUp.duration(300)}
              exiting={FadeOutUp.duration(300)}
              style={[
                bulkEditionButtonStyle,
                {
                  position: 'absolute',
                  right: FLOATING_BUTTONS_RIGHT_POSITION,
                  bottom: BULK_EDIT_BUTTON_BOTTOM_POSITION,
                },
              ]}
            >
              <ButtonAnimated
                onPress={handleOpenBulkEditModal}
                style={dynamicStyles.bulkEditButton}
              >
                <PencilSimpleLine size={24} color={theme.colors.background} />
              </ButtonAnimated>
            </Animated.View>
          </GestureDetector>
        )}

        <GestureDetector gesture={onMoveRegisterTransactionButton}>
          <Animated.View
            style={[
              registerTransactionButtonStyle,
              {
                position: 'absolute',
                right: FLOATING_BUTTONS_RIGHT_POSITION,
                bottom: REGISTER_TRANSACTION_TRANSACTION_BUTTON_BOTTOM_POSITION,
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
          bottomSheetRef={chartPeriodSelectedBottomSheetRef}
          snapPoints={['50%']}
        >
          <ChartPeriodSelect
            period={selectedPeriod}
            closeSelectPeriod={handleClosePeriodSelectedModal}
          />
        </ModalViewSelection>

        <ModalViewWithoutHeader
          bottomSheetRef={registerTransactionBottomSheetRef}
          snapPoints={['90%']}
        >
          <RegisterTransaction
            id={transactionId}
            resetId={clearTransactionId}
            closeRegisterTransaction={handleCloseRegisterTransactionModal}
            isBulkEdit={transactionId === 'bulk-edit'}
            selectedTransactionIds={selectedTransactions}
          />
        </ModalViewWithoutHeader>
      </Container>
    </Screen>
  );
}
