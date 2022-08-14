import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import {
  Container,
  Header,
  CashFlowGroup,
  CashFlowTotal,
  CashFlowDescription,
  Chart,
  FiltersContainer,
  FilterButtonGroup,
  Transactions,
  TransactionList,
} from './styles'

import {
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryTheme
} from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addMonths, addYears, subMonths, subYears } from 'date-fns';

import { TransactionListItem, TransactionProps } from '@components/TransactionListItem';
import { ModalViewSelection } from '@components/ModalViewSelection';
import { SelectButton } from '@components/SelectButton';
import { Load } from '@components/Load';

import { PeriodProps, PeriodSelect } from '@screens/PeriodSelect';

import {
  setBtcQuoteBrl,
  selectBtcQuoteBrl,
  setEurQuoteBrl,
  selectEurQuoteBrl,
  setUsdQuoteBrl,
  selectUsdQuoteBrl
} from '@slices/quotesBrlSlice';

import {
  selectUserTenantId
} from '@slices/userSlice';

import apiQuotes from '@api/apiQuotes';
import api from '@api/api';

type PeriodData = {
  date: Date | number;
  totalRevenuesByPeriod: number;
  totalExpensesByPeriod: number;
}

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [refreshing, setRefreshing] = useState(true);
  const dispatch = useDispatch();
  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);
  const eurQuoteBrl = useSelector(selectEurQuoteBrl);
  const usdQuoteBrl = useSelector(selectUsdQuoteBrl);
  const [transactionsFormatted, setTransactionsFormatted] = useState<TransactionProps>();
  const [transactionsFormattedBySelectedPeriod, setTransactionsFormattedBySelectedPeriod] = useState<TransactionProps[]>([]);
  const [periodSelectedModalOpen, setPeriodSelectedModalOpen] = useState(false);
  const [periodSelected, setPeriodSelected] = useState<PeriodProps>({
    id: '1',
    name: 'Mês',
    period: 'months'
  });
  const [totalAmountsGroupedBySelectedPeriod, setTotalAmountsGroupedBySelectedPeriod] = useState<PeriodData[]>([
    {
      date: 0,
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0
    },
    {
      date: 1,
      totalRevenuesByPeriod: 0,
      totalExpensesByPeriod: 0
    }
  ]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [cashFlowTotal, setCashFlowTotal] = useState('');
  const [cashFlowTotalBySelectedPeriod, setCashFlowTotalBySelectedPeriod] = useState('');

  //console.log(selectedDate);

  async function fetchBtcQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          id: '1',
          convert: 'BRL'
        }
      })
      if (!data) {
      }
      else {
        dispatch(
          setBtcQuoteBrl(data.data.quote.BRL)
        )
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Cotação de moedas", "Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.")
    }
  };

  async function fetchEurQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'EUR',
          convert: 'BRL'
        }
      })
      if (!data) {
      }
      else {
        dispatch(
          setEurQuoteBrl(data.data['0'].quote.BRL)
        )
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Cotação de moedas", "Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.")
    }
  };

  async function fetchUsdQuote() {
    try {
      const { data } = await apiQuotes.get('v2/tools/price-conversion', {
        params: {
          amount: 1,
          symbol: 'USD',
          convert: 'BRL'
        }
      })
      if (!data) {
      }
      else {
        dispatch(
          setUsdQuoteBrl(data.data['0'].quote.BRL)
        )
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Cotação de moedas", "Não foi possível buscar a cotação de moedas. Por favor, verifique sua internet e tente novamente.")
    }
  };

  async function fetchTransactions() {
    setLoading(true);

    try {
      const { data } = await api.get('transaction', {
        params: {
          tenant_id: tenantId
        }
      })
      if (!data) {
      }
      else {
        setRefreshing(false);
      }

      /**
       * All Transactions and Totals Formatted in PT-br - Start
       */
      let amount = 'R$0';
      let amountConvertedBRL = 0;
      let amountConvertedBRLFormatted = 'R$0';
      let totalRevenuesBRL = 0;
      let totalExpensesBRL = 0;

      const transactionsFormattedPtbr: TransactionProps = data
        .map((transactionPtbr: TransactionProps) => {
          //Insert switch for verify currency and formatted amount for this currency. If currency is BTC, convert value to BTC using converting API.
          switch (transactionPtbr.account.currency) {
            case 'BRL - Real Brasileiro':
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC - Bitcoin':
              amountConvertedBRL = Number(transactionPtbr.amount) * btcQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
              break;
            case 'EUR - Euro':
              amountConvertedBRL = Number(transactionPtbr.amount) * eurQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'EUR'
                });
              break;
            case 'USD - Dólar Americano':
              amountConvertedBRL = Number(transactionPtbr.amount) * usdQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbr.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                });
              break;
            default: 'BRL - Real Brasileiro'
              break;
          }

          switch (transactionPtbr.type) {
            case 'income':
              if (transactionPtbr.account.currency != 'BRL - Real Brasileiro') {
                totalRevenuesBRL += amountConvertedBRL
              } else {
                totalRevenuesBRL += Number(transactionPtbr.amount)
              }
              break;
            case 'outcome':
              if (transactionPtbr.account.currency != 'BRL - Real Brasileiro') {
                totalExpensesBRL += amountConvertedBRL
              } else {
                totalExpensesBRL += Number(transactionPtbr.amount)
              }
              break;
            default: 'income';
              break;
          }

          const dateTransactionPtbr = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionPtbr.created_at));

          return {
            id: transactionPtbr.id,
            created_at: dateTransactionPtbr,
            description: transactionPtbr.description,
            amount,
            amountConvertedBRLFormatted,
            type: transactionPtbr.type,
            account: {
              id: transactionPtbr.account?.id,
              name: transactionPtbr.account?.name,
              currency: transactionPtbr.account?.currency,
              simbol: transactionPtbr.account?.simbol,
              initial_amount: transactionPtbr.account?.initial_amount,
              tenant_id: transactionPtbr.account?.tenant_id
            },
            category: {
              id: transactionPtbr.category?.id,
              name: transactionPtbr.category?.name,
              icon: {
                id: transactionPtbr.category?.icon.id,
                title: transactionPtbr.category?.icon.title,
                name: transactionPtbr.category?.icon.name,
              },
              color: {
                id: transactionPtbr.category.color.id,
                name: transactionPtbr.category.color.name,
                hex: transactionPtbr.category.color.hex,
              },
              tenant_id: transactionPtbr.category?.tenant_id
            },
            tenant_id: transactionPtbr.tenant_id
          }
        });

      // Set totals in BRL for all period formatted in pt-BR
      let initialTotalAmount = 0;

      const totalBRL = initialTotalAmount + totalRevenuesBRL - totalExpensesBRL;
      const totalFormattedPtbr = Number(totalBRL)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

      setTransactionsFormatted(transactionsFormattedPtbr);
      setCashFlowTotal(totalFormattedPtbr);
      /**
       * All Transactions and Totals Formatted in pt-BR - End
       */


      /**
        * All Totals Grouped By Months - Start
       */
      let totalRevenuesBRLByPeriod = 0;
      let totalExpensesBRLByPeriod = 0;

      const transactionsGroupedByMonths = data
        .map((transactionByMonth: TransactionProps) => {
          switch (transactionByMonth.account.currency) {
            case 'BRL - Real Brasileiro':
              amount = Number(transactionByMonth.amount);
              break;
            case 'BTC - Bitcoin':
              amount = Number(transactionByMonth.amount) * btcQuoteBrl.price;
              break;
            case 'EUR - Euro':
              amount = Number(transactionByMonth.amount) * eurQuoteBrl.price;
              break;
            case 'USD - Dólar Americano':
              amount = Number(transactionByMonth.amount) * usdQuoteBrl.price;
              break;
            default: 'BRL - Real Brasileiro'
              break;
          }

          const dateTransactionByMonth = Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
          }).format(new Date(transactionByMonth.created_at));

          return {
            date: dateTransactionByMonth,
            type: transactionByMonth.type,
            amount,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0
          }
        });

      const totalsByMonths = transactionsGroupedByMonths
        .reduce((acc: any, current: any) => {
          if (!acc[current.date]) {
            acc[current.date] = {
              ...current
            }
          }

          switch (current.type) {
            case 'income':
              acc[current.date].totalRevenuesByPeriod += Number(current.amount)
              break;
            case 'outcome':
              acc[current.date].totalExpensesByPeriod += Number(current.amount)
              break;
          }

          return acc
        }, []);

      const totalsGroupedByMonths: any = Object.values(totalsByMonths);

      // Set totals in BRL for selected period formatted in pt-BR
      /**
       * All Totals Grouped By Months - End
       */

      /**
       * All Totals Grouped By Years - Start
       */
      const transactionsGroupedByYears = data
        .map((transactionByYear: TransactionProps) => {
          switch (transactionByYear.account.currency) {
            case 'BRL - Real Brasileiro':
              amount = Number(transactionByYear.amount);
              break;
            case 'BTC - Bitcoin':
              amount = Number(transactionByYear.amount) * btcQuoteBrl.price;
              break;
            case 'EUR - Euro':
              amount = Number(transactionByYear.amount) * eurQuoteBrl.price;
              break;
            case 'USD - Dólar Americano':
              amount = Number(transactionByYear.amount) * usdQuoteBrl.price;
              break;
            default: 'BRL - Real Brasileiro'
              break;
          }

          const dateTransactionByYear = Intl.DateTimeFormat('pt-BR', {
            year: 'numeric'
          }).format(new Date(transactionByYear.created_at));

          return {
            date: dateTransactionByYear,
            type: transactionByYear.type,
            amount: transactionByYear.amount,
            totalRevenuesByPeriod: 0,
            totalExpensesByPeriod: 0
          }
        });

      const totalsByYears = transactionsGroupedByYears
        .reduce((acc: any, current: any) => {
          if (!acc[current.date]) {
            acc[current.date] = {
              ...current
            }
          }

          switch (current.type) {
            case 'income':
              acc[current.date].totalRevenuesByPeriod += Number(current.amount)
              break;
            case 'outcome':
              acc[current.date].totalExpensesByPeriod += Number(current.amount)
              break;
          }

          return acc
        }, []);

      const totalsGroupedByYears: any = Object.values(totalsByYears);
      /**
       * All Totals Grouped By Years - End
       */

      /**
       * Transactions By Selected Period Formatted in pt-BR - Start
       */
      const transactionsBySelectedPeriod = data
        .filter((transaction: TransactionProps) => {
          //periodSelected.period === 'modnths' ?
            new Date(transaction.created_at).getMonth() === selectedDate.getMonth() &&
            new Date(transaction.created_at).getFullYear() === selectedDate.getFullYear() //:
            //new Date(transaction.created_at).getFullYear() === selectedDate.getFullYear()
        }
        );

      let totalRevenuesBRLBySelectedPeriod = 0;
      let totalExpensesBRLBySelectedPeriod = 0;

      const transactionsBySelectedPeriodFormattedPtbr = transactionsBySelectedPeriod
        .map((transactionPtbrBySelectedPeriod: TransactionProps) => {
          switch (transactionPtbrBySelectedPeriod.account.currency) {
            case 'BRL - Real Brasileiro':
              amount = Number(transactionPtbrBySelectedPeriod.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              break;
            case 'BTC - Bitcoin':
              amountConvertedBRL = Number(transactionPtbrBySelectedPeriod.amount) * btcQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbrBySelectedPeriod.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BTC',
                  minimumFractionDigits: 8,
                  maximumSignificantDigits: 8
                });
              break;
            case 'EUR - Euro':
              amountConvertedBRL = Number(transactionPtbrBySelectedPeriod.amount) * eurQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbrBySelectedPeriod.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'EUR'
                });
              break;
            case 'USD - Dólar Americano':
              amountConvertedBRL = Number(transactionPtbrBySelectedPeriod.amount) * usdQuoteBrl.price;
              amountConvertedBRLFormatted = Number(amountConvertedBRL)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });
              amount = Number(transactionPtbrBySelectedPeriod.amount)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                });
              break;
            default: 'BRL - Real Brasileiro'
              break;
          }

          switch (transactionPtbrBySelectedPeriod.type) {
            case 'income':
              if (transactionPtbrBySelectedPeriod.account.currency != 'BRL - Real Brasileiro') {
                totalRevenuesBRLBySelectedPeriod += amountConvertedBRL
              } else {
                totalRevenuesBRLBySelectedPeriod += Number(transactionPtbrBySelectedPeriod.amount)
              }
              break;
            case 'outcome':
              if (transactionPtbrBySelectedPeriod.account.currency != 'BRL - Real Brasileiro') {
                totalExpensesBRLBySelectedPeriod += amountConvertedBRL
              } else {
                totalExpensesBRLBySelectedPeriod += Number(transactionPtbrBySelectedPeriod.amount)
              }
              break;
            default: 'income';
              break;
          }

          const dateTransactionBySelectedPeriod = Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(new Date(transactionPtbrBySelectedPeriod.created_at));

          return {
            id: transactionPtbrBySelectedPeriod.id,
            created_at: dateTransactionBySelectedPeriod,
            description: transactionPtbrBySelectedPeriod.description,
            amount,
            amountConvertedBRLFormatted,
            type: transactionPtbrBySelectedPeriod.type,
            account: {
              id: transactionPtbrBySelectedPeriod.account?.id,
              name: transactionPtbrBySelectedPeriod.account?.name,
              currency: transactionPtbrBySelectedPeriod.account?.currency,
              simbol: transactionPtbrBySelectedPeriod.account?.simbol,
              initial_amount: transactionPtbrBySelectedPeriod.account?.initial_amount,
              tenant_id: transactionPtbrBySelectedPeriod.account?.tenant_id
            },
            category: {
              id: transactionPtbrBySelectedPeriod.category?.id,
              name: transactionPtbrBySelectedPeriod.category?.name,
              icon: {
                id: transactionPtbrBySelectedPeriod.category?.icon.id,
                title: transactionPtbrBySelectedPeriod.category?.icon.title,
                name: transactionPtbrBySelectedPeriod.category?.icon.name,
              },
              color: {
                id: transactionPtbrBySelectedPeriod.category.color.id,
                name: transactionPtbrBySelectedPeriod.category.color.name,
                hex: transactionPtbrBySelectedPeriod.category.color.hex,
              },
              tenant_id: transactionPtbrBySelectedPeriod.category?.tenant_id
            },
            tenant_id: transactionPtbrBySelectedPeriod.tenant_id
          }
        });

      const totalBRLBySelectedPeriod = totalRevenuesBRLBySelectedPeriod - totalExpensesBRLBySelectedPeriod;
      const totalBySelectedPeriodFormattedBRL = Number(totalBRLBySelectedPeriod)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })

      console.log(transactionsBySelectedPeriod);
      setTransactionsFormattedBySelectedPeriod(transactionsBySelectedPeriodFormattedPtbr);
      setCashFlowTotalBySelectedPeriod(totalBySelectedPeriodFormattedBRL);
      /**
       * Transactions By Selected Period Formatted in pt-BR - End
       */

      /**
       * Set Totals Grouped by Selected Period - Start
       */
      switch (periodSelected.period) {
        case 'months':
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByMonths);
          break;
        case 'years':
          setTotalAmountsGroupedBySelectedPeriod(totalsGroupedByYears);
        default:
          break;
      }
      /**
       * Set Totals Grouped by Selected Period - End
       */
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Transações", "Não foi possível buscar as transações. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleOpenPeriodSelectedModal() {
    setPeriodSelectedModalOpen(true);
  };

  function handleClosePeriodSelectedModal() {
    setPeriodSelectedModalOpen(false);
  };

  function handleDateChange(action: 'next' | 'prev'): void {
    switch (periodSelected.period) {
      case 'months':
        if (action === 'next') {
          setSelectedDate(addMonths(selectedDate, 1));
        } else {
          setSelectedDate(subMonths(selectedDate, 1));
        }
        break;
      case 'years':
        if (action === 'next') {
          setSelectedDate(addYears(selectedDate, 1));
        } else {
          setSelectedDate(subYears(selectedDate, 1));
        }
        break;
      default:
        break;
    }

  };

  async function handleTransactionSwipeLeft(id: string) {
    Alert.alert("Exclusão de transação", "Tem certeza que deseja excluir a transação?", [{ text: "Não, cancelar a exclusão." }, { text: "Sim, excluir a transação.", onPress: () => handleDeleteTransaction(id) }])
  };

  async function handleDeleteTransaction(id: string) {
    try {
      await api.delete('delete_transaction', {
        params: {
          transaction_id: id
        }
      });
      fetchTransactions();
      Alert.alert("Exclusão de transação", "Transação excluída com sucesso!")
    } catch (error) {
      Alert.alert("Exclusão de transação", `${error}`)
    }
  };

  useFocusEffect(useCallback(() => {
    fetchBtcQuote();
    fetchEurQuote();
    fetchUsdQuote();
    fetchTransactions();
  }, [periodSelected]));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header>
        <CashFlowGroup>
          <CashFlowTotal>{cashFlowTotal}</CashFlowTotal>
          <CashFlowDescription> Fluxo de Caixa</CashFlowDescription>
        </CashFlowGroup>
      </Header>

      <Chart>
        <FiltersContainer>
          <FilterButtonGroup>
            <SelectButton
              title={`Por ${periodSelected.name}`}
              onPress={handleOpenPeriodSelectedModal}
            />
          </FilterButtonGroup>
        </FiltersContainer>

        <VictoryChart
          theme={VictoryTheme.material}
          width={400} height={220}
          maxDomain={{ x: 6 }}
          domainPadding={{ x: 7 }}
        >
          <VictoryGroup
            offset={12}
          >
            <VictoryBar
              data={totalAmountsGroupedBySelectedPeriod}
              x='date'
              y='totalRevenuesByPeriod'
              sortKey="x"
              sortOrder="descending"
              alignment='start'
              style={{
                data: {
                  width: 10,
                  fill: 'seagreen'
                }
              }}
              cornerRadius={{ top: 2, bottom: 2 }}
              animate={{
                duration: 2500,
                onLoad: { duration: 2500 },
                easing: 'backOut'
              }}
            />
            <VictoryBar
              data={totalAmountsGroupedBySelectedPeriod}
              x='date'
              y='totalExpensesByPeriod'
              sortOrder="descending"
              alignment='start'
              style={{
                data: {
                  width: 10,
                  fill: 'tomato'
                }
              }}
              cornerRadius={{ top: 2, bottom: 2 }}
              animate={{
                duration: 2500,
                onLoad: { duration: 2500 },
                easing: 'backOut'
              }}
            />
          </VictoryGroup>
        </VictoryChart>
      </Chart>

      <Transactions>
        <TransactionList
          data={transactionsFormatted}
          keyExtractor={(item: TransactionProps) => item.id}
          renderItem={({ item }: any) => (
            <TransactionListItem
              data={item}
              onSwipeableLeftOpen={() => handleTransactionSwipeLeft(item.id)}
            />
          )}
          initialNumToRender={50}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />
          }
        />
      </Transactions>
      <ModalViewSelection
        visible={periodSelectedModalOpen}
        closeModal={handleClosePeriodSelectedModal}
        title='Selecione o período'
      >
        <PeriodSelect
          period={periodSelected}
          setPeriod={setPeriodSelected}
          closeSelectPeriod={handleClosePeriodSelectedModal}
        />
      </ModalViewSelection>
    </Container >
  )
}