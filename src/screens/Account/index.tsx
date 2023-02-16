import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, SectionList, Alert } from 'react-native';
import {
  Container,
  Header,
  BackButton,
  Icon,
  TitleContainer,
  Title,
  Description,
  EditAccountButton,
  FiltersContainer,
  FilterButtonGroup,
  AccountBalanceContainer,
  AccountBalanceGroup,
  AccountBalanceSeparator,
  AccountBalance,
  AccountBalanceDescription,
  AccountCashFlow,
  AccountCashFlowDescription,
  Transactions
} from './styles';

import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { PanGestureHandler, RectButton } from 'react-native-gesture-handler';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { format, parse, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';

import { ModalViewWithoutHeader } from '@components/ModalViewWithoutHeader';
import { SkeletonAccountsScreen } from '@components/SkeletonAccountsScreen';
import { TransactionListItem } from '@components/TransactionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { SectionListHeader } from '@components/SectionListHeader';
import { ChartSelectButton } from '@components/ChartSelectButton';
import { ModalView } from '@components/ModalView';

import { ChartPeriodSelect, PeriodProps } from '@screens/ChartPeriodSelect';
import { RegisterTransaction } from '@screens/RegisterTransaction';
import { RegisterAccount } from '@screens/RegisterAccount';

import {
  selectAccountCurrency,
  selectAccountInitialAmount,
  selectAccountName,
  selectAccountTotalAmount
} from '@slices/accountSlice';
import { selectUserTenantId } from '@slices/userSlice';

import api from '@api/api';

import theme from '@themes/theme';

export function Account() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const [periodSelected, setPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Meses',
    period: 'months'
  });
  const periodSelectBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactionsFormattedBySelectedPeriod, setTransactionsFormattedBySelectedPeriod] = useState([]);
  const [cashFlowTotalBySelectedPeriod, setCashFlowTotalBySelectedPeriod] = useState('');
  const [cashFlowIsPositive, setCashFlowIsPositive] = useState(true);
  const [balanceIsPositive, setBalanceIsPositive] = useState(true);
  const editAccountBottomSheetRef = useRef<BottomSheetModal>(null);
  const addTransactionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const accountId = route.params?.id;
  const accountName = useSelector(selectAccountName);
  const accountCurrency = useSelector(selectAccountCurrency);
  const accountInitialAmount = useSelector(selectAccountInitialAmount);
  const accountTotal = useSelector(selectAccountTotalAmount);
  // Animated header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 200],
        [170, 0],
        Extrapolate.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, 170],
        [1, 0],
        Extrapolate.CLAMP
      )
    }
  });
  // Animated section list
  const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
  // Animated button register transaction
  const registerTransactionButtonPositionX = useSharedValue(0);
  const registerTransactionButtonPositionY = useSharedValue(0);
  const ButtonAnimated = Animated.createAnimatedComponent(RectButton);
  const registerTransactionButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: registerTransactionButtonPositionX.value },
        { translateY: registerTransactionButtonPositionY.value }
      ]
    }
  });
  const OnMoveRegisterTransactionButton = useAnimatedGestureHandler({
    onStart(_, ctx: any) {
      ctx.positionX = registerTransactionButtonPositionX.value;
      ctx.positionY = registerTransactionButtonPositionY.value;
    },
    onActive(event, ctx: any) {
      registerTransactionButtonPositionX.value = ctx.positionX + event.translationX;
      registerTransactionButtonPositionY.value = ctx.positionY + event.translationY;
    },
    onEnd() {
      registerTransactionButtonPositionX.value = withSpring(0);
      registerTransactionButtonPositionY.value = withSpring(0);
    }
  });

  async function fetchTransactions() {
    setLoading(true);

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      })

      /**
       * All Transactions Formatted in pt-BR - Start
       */
      let amount_formatted: any;
      let amountNotConvertedFormatted = '';
      let totalRevenues = 0;
      let totalExpenses = 0;

      let transactionsFormattedPtbr: any = [];
      for (const item of data) {
        // Format the date "dd/MM/yyyy"
        var dmy = format(item.created_at, 'dd/MM/yyyy', { locale: ptBR });
        // Format the currency
        switch (item.account.currency.code) {
          case 'BRL':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              });
            break;
          case 'BTC':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BTC',
                minimumFractionDigits: 8,
                maximumSignificantDigits: 8
              });
            break;
          case 'EUR':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
              });
            break;
          case 'USD':
            amount_formatted = Number(item.amount)
              .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'USD'
              });
        }
        if (item.amount_not_converted && item.currency.code === 'BRL') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
        }
        if (item.amount_not_converted && item.currency.code === 'BTC') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BTC',
              minimumFractionDigits: 8,
              maximumSignificantDigits: 8
            });
        }
        if (item.amount_not_converted && item.currency.code === 'EUR') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'EUR'
            });
        }
        if (item.amount_not_converted && item.currency.code === 'USD') {
          amountNotConvertedFormatted = Number(item.amount_not_converted)
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'USD'
            });
        }
        // Create the objects
        if (!transactionsFormattedPtbr.hasOwnProperty(dmy)) {
          transactionsFormattedPtbr[item.id] = {
            id: item.id,
            created_at: dmy,
            description: item.description,
            amount: item.amount,
            amount_formatted,
            amount_not_converted: amountNotConvertedFormatted,
            currency: {
              id: item.currency.id,
              name: item.currency.name,
              code: item.currency.code,
              symbol: item.currency.symbol
            },
            type: item.type,
            account: {
              id: item.account.id,
              name: item.account.name,
              currency: {
                id: item.account.currency.id,
                name: item.account.currency.name,
                code: item.account.currency.code,
                symbol: item.account.currency.symbol
              },
              initial_amount: item.account.initial_amount,
              totalAccountAmount: 0,
              tenant_id: item.account.tenant_id
            },
            category: {
              id: item.category.id,
              name: item.category.name,
              icon: {
                id: item.category.icon.id,
                title: item.category.icon.title,
                name: item.category.icon.name,
              },
              color: {
                id: item.category.color.id,
                name: item.category.color.name,
                hex: item.category.color.hex,
              },
              tenant_id: item.category.tenant_id
            },
            tenant_id: item.tenant_id,
          };
        }
        // Sum revenues and expenses of all transactions
        if (new Date(item.created_at) <= new Date() && item.type === 'credit') {
          totalRevenues += item.amount
        } else if (new Date(item.created_at) <= new Date() && item.type === 'debit') {
          totalExpenses += item.amount
        }
      };
      transactionsFormattedPtbr = Object.values(transactionsFormattedPtbr)
        .filter((transactionFormattedPtbr: any) =>
          transactionFormattedPtbr.account.id === accountId
        )
        .sort((a: any, b: any) => {
          const firstDateParsed = parse(a.created_at, 'dd/MM/yyyy', new Date());
          const secondDateParsed = parse(b.created_at, 'dd/MM/yyyy', new Date());
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        });

      const total =
        totalRevenues -
        totalExpenses;

      if (total < 0) {
        setBalanceIsPositive(false)
      } else {
        setBalanceIsPositive(true)
      }

      const totalFormattedPtbrByAllHistory = Number(total)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      // Group transactions by date to section list
      const transactionsFormattedPtbrGroupedByDate = transactionsFormattedPtbr
        .reduce((acc: any, cur: any) => {
          const existObj = acc.find(
            (obj: any) => obj.title === cur.created_at
          )

          if (existObj) {
            existObj.data.push(cur)
          } else {
            acc.push({
              title: cur.created_at,
              data: [cur]
            })
          }
          return acc
        }, [])
      /**
       * All Transactions Formatted in pt-BR - End
       */


      /**
       * Transactions By Months Formatted in pt-BR - Start
       */
      const transactionsByMonthsFormattedPtbr = transactionsFormattedPtbrGroupedByDate
        .filter((transactionByMonthsPtBr: any) =>
          parse(transactionByMonthsPtBr.title, 'dd/MM/yyyy', new Date()).getMonth() === selectedDate.getMonth() &&
          parse(transactionByMonthsPtBr.title, 'dd/MM/yyyy', new Date()).getFullYear() === selectedDate.getFullYear()
        );

      // Sum revenues and expenses
      let totalRevenuesByMonths = 0;
      let totalExpensesByMonths = 0;

      for (const item of transactionsByMonthsFormattedPtbr) {
        if (item.data) {
          item.data.forEach((cur: any) => {
            if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'credit') {
              totalRevenuesByMonths += cur.amount;
            } else if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'debit') {
              totalExpensesByMonths += cur.amount;
            }
          })
        }
      };

      const totalByMonths =
        //initialTotalAmountByMonths +
        totalRevenuesByMonths -
        totalExpensesByMonths;

      if (totalByMonths < 0) {
        setCashFlowIsPositive(false)
      } else {
        setBalanceIsPositive(true)
      }

      const totalFormattedPtbrByMonths = Number(totalByMonths)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      /**
       * Transactions By Months Formatted in pt-BR - End
       */


      /**
       * Transactions By Years Formatted in pt-BR - Start
       */
      const transactionsByYearsFormattedPtbr = transactionsFormattedPtbrGroupedByDate
        .filter((transactionByYearsPtBr: any) =>
          parse(transactionByYearsPtBr.title, 'dd/MM/yyyy', new Date()).getFullYear() === selectedDate.getFullYear()
        );

      // Sum revenues and expenses
      let totalRevenuesByYears = 0;
      let totalExpensesByYears = 0;

      for (const item of transactionsByYearsFormattedPtbr) {
        if (item.data) {
          item.data.forEach((cur: any) => {
            if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'credit') {
              totalRevenuesByYears += cur.amount
            } else if (parse(cur.created_at, 'dd/MM/yyyy', new Date()) <= new Date() && cur.type === 'debit') {
              totalExpensesByYears += cur.amount
            }
          })
        }
      };

      const totalBRLByYears =
        //initialTotalAmountBRLByYears +
        totalRevenuesByYears -
        totalExpensesByYears;

      if (totalByMonths < 0) {
        setCashFlowIsPositive(false)
      } else {
        setCashFlowIsPositive(true)
      }

      const totalFormattedPtbrByYears = Number(totalBRLByYears)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      /**
       * Transactions By Years Formatted in pt-BR - End
       */


      /**
       * All Totals Grouped By Months - Start
       */
      let totalsGroupedByMonths: any = [];
      for (const item of data) {
        // Format the date to "yyyy-mm", easier to sort the array
        const ym = format(item.created_at, `yyyy-MM`, { locale: ptBR });
        // Create the objects
        if (!totalsGroupedByMonths.hasOwnProperty(ym)) {
          totalsGroupedByMonths[ym] = { date: ym, totalRevenuesByPeriod: 0, totalExpensesByPeriod: 0 };
        }
        if (item.type === 'credit') {
          totalsGroupedByMonths[ym].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'debit') {
          totalsGroupedByMonths[ym].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByMonths = Object.values(totalsGroupedByMonths);

      // Runs from last to first, formating the date to "MMM yyyy"
      for (var i = totalsGroupedByMonths.length - 1; i >= 0; i--) {
        totalsGroupedByMonths[i].date = format(parseISO(totalsGroupedByMonths[i].date), `MMM '\n' yyyy`, { locale: ptBR });
      };
      /**
       * All Totals Grouped By Months - End
       */


      /**
       * All Totals Grouped By Years - Start
       */
      let totalsGroupedByYears: any = [];
      for (const item of data) {
        // Format the date to "yyyy", easier to sort the array
        const y = format(item.created_at, `yyyy`, { locale: ptBR });
        // Create the objects
        if (!totalsGroupedByYears.hasOwnProperty(y)) {
          totalsGroupedByYears[y] = { date: y, totalRevenuesByPeriod: 0, totalExpensesByPeriod: 0 };
        }
        if (item.type === 'credit') {
          totalsGroupedByYears[y].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'debit') {
          totalsGroupedByYears[y].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByYears = Object.values(totalsGroupedByYears)
        .sort((a: any, b: any) => {
          const firstDateParsed = parse(a.date, 'yyyy', new Date());
          const secondDateParsed = parse(b.date, 'yyyy', new Date());
          return secondDateParsed.getTime() - firstDateParsed.getTime();
        });
      /**
       * All Totals Grouped By Years - End
       */


      /**
       * All Totals Grouped By All History - Start
       */
      let totalsGroupedByAllHistory: any = [];
      for (const item of data) {
        // Format the date to "Todo o \n histórico"
        item.created_at = `Todo o \n histórico`;
        const allHistory = item.created_at;
        // Create the objects
        if (!totalsGroupedByAllHistory.hasOwnProperty(allHistory)) {
          totalsGroupedByAllHistory[allHistory] = { date: allHistory, totalRevenuesByPeriod: 0, totalExpensesByPeriod: 0 };
        }
        if (item.type === 'credit') {
          totalsGroupedByAllHistory[allHistory].totalRevenuesByPeriod += item.amount;
        } else if (item.type === 'debit') {
          totalsGroupedByAllHistory[allHistory].totalExpensesByPeriod += item.amount;
        }
      }
      totalsGroupedByAllHistory = Object.values(totalsGroupedByAllHistory);
      /**
       * All Totals Grouped All History - End
       */


      /**
       * Set Transactions and Totals by Selected Period - Start
       */
      switch (periodSelected.period) {
        case 'months':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByMonths);
          setTransactionsFormattedBySelectedPeriod(transactionsByMonthsFormattedPtbr);
          break;
        case 'years':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByYears);
          setTransactionsFormattedBySelectedPeriod(transactionsByYearsFormattedPtbr);
          break;
        case 'all':
          setCashFlowTotalBySelectedPeriod(totalFormattedPtbrByAllHistory);
          setTransactionsFormattedBySelectedPeriod(transactionsFormattedPtbrGroupedByDate);
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
  };

  function handleClickBackButton() {
    navigation.goBack();
  };

  function handleOpenEditAccount() {
    editAccountBottomSheetRef.current?.present();
  };

  function handleCloseEditAccount() {
    editAccountBottomSheetRef.current?.dismiss();
  };

  function handleOpenPeriodSelectedModal() {
    periodSelectBottomSheetRef.current?.present();
  };

  function handleClosePeriodSelectedModal() {
    periodSelectBottomSheetRef.current?.dismiss();
  };

  function handleOpenTransaction(id: string) {
    setTransactionId(id);
    setTransactionModalOpen(true);
  };

  function handleCloseTransaction() {
    fetchTransactions();
    setTransactionModalOpen(false);
  };

  function handleOpenRegisterTransactionModal() {
    addTransactionBottomSheetRef.current?.present();
  };

  async function handleClickDeleteAccount() {
    Alert.alert("Exclusão de conta", "ATENÇÃO! Todas as transações desta conta também serão excluídas. Tem certeza que deseja excluir a conta?", [{ text: "Não, cancelar a exclusão" }, { text: "Sim, excluir a conta", onPress: () => handleDeleteAccount(accountId) }])
  };

  async function handleDeleteAccount(id: string) {
    try {
      const { status } = await api.delete('delete_account', {
        params: {
          account_id: id
        }
      });
      if (status === 200) {
        Alert.alert("Exclusão de conta", "Conta excluída com sucesso!")
      }
      handleCloseEditAccount();
      navigation.goBack();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Edição de Conta", error.response?.data.message, [{ text: "Tentar novamente" }, { text: "Voltar para a tela anterior", onPress: handleCloseEditAccount }]);
      }
    };
  };

  function ClearTransactionId() {
    setTransactionId('');
  };

  useFocusEffect(useCallback(() => {
    fetchTransactions();
  }, [periodSelected.period]));

  if (loading) {
    return <SkeletonAccountsScreen />
  }

  return (
    <Container>
      <Animated.View style={[headerStyleAnimation, styles.header]}>
        <Header>
          <BackButton onPress={handleClickBackButton}>
            <Icon name='chevron-back-outline' />
          </BackButton>

          <TitleContainer>
            <Title>{accountName}</Title>
            <Description>Transações</Description>
          </TitleContainer>

          <EditAccountButton onPress={handleOpenEditAccount}>
            <Icon name='ellipsis-horizontal-circle-outline' />
          </EditAccountButton>
        </Header>

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
            <AccountBalance balanceIsPositive={balanceIsPositive}>{accountTotal}</AccountBalance>
            <AccountBalanceDescription>Sado da conta</AccountBalanceDescription>
          </AccountBalanceGroup>

          <AccountBalanceSeparator />

          <AccountBalanceGroup>
            <AccountCashFlow balanceIsPositive={cashFlowIsPositive}>{cashFlowTotalBySelectedPeriod}</AccountCashFlow>
            <AccountCashFlowDescription>{`Fluxo de caixa por ${periodSelected.name}`}</AccountCashFlowDescription>
          </AccountBalanceGroup>
        </AccountBalanceContainer>
      </Animated.View>

      <Transactions>
        <AnimatedSectionList
          sections={transactionsFormattedBySelectedPeriod}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <TransactionListItem
              data={item}
              onPress={() => handleOpenTransaction(item.id)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <SectionListHeader
              data={section}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmptyComponent />

          )}
          initialNumToRender={100}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: getBottomSpace()
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={32}
        />
      </Transactions>

      <PanGestureHandler onGestureEvent={OnMoveRegisterTransactionButton}>
        <Animated.View
          style={[
            registerTransactionButtonStyle,
            {
              position: 'absolute',
              bottom: 22,
              right: 22
            }
          ]}
        >
          <ButtonAnimated onPress={handleOpenRegisterTransactionModal} style={styles.animatedButton}>
            <Ionicons name='add-outline' size={32} color={theme.colors.background} />
          </ButtonAnimated>
        </Animated.View>
      </PanGestureHandler>

      <ModalViewSelection
        title="Selecione o período"
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
        <RegisterAccount
          id={accountId}
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
          account={{
            id: accountId,
            name: accountName,
            currency: accountCurrency,
            initial_amount: accountInitialAmount,
            tenant_id: tenantId
          }}
          closeRegisterTransaction={handleCloseTransaction}
        />
      </ModalViewWithoutHeader>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden'
  },
  animatedButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 30
  }
});