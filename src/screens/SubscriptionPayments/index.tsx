import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Icons
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ListItem } from '@components/ListItem';
import { ModalView } from '@components/Modals/ModalView';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SubscriptionHelpSheet } from '@components/SubscriptionHelpSheet';
import { SubscriptionPaymentListItem } from '@components/SubscriptionPaymentListItem';

// Hooks
import { useSubscriptionPaymentsQuery } from '@hooks/useSubscriptionPaymentsQuery';

// Utils
import formatCurrency from '@utils/formatCurrency';
import {
  buildSubscriptionPeriodOptions,
  monthKey,
  monthLabel,
} from '@utils/buildSubscriptionPeriodOptions';
import { computePaymentsTotal } from '@utils/subscriptionPaymentsSummary';

// Storages
import { useQuotes } from '@stores/quotesStorage';

import {
  Container,
  PeriodRow,
  PeriodRowLeft,
  PeriodLabel,
  PeriodValue,
  PeriodValueContainer,
  TotalContainer,
  TotalRow,
  TotalLabel,
  TotalValue,
  SectionHeader,
  SectionHeaderTitle,
  HeaderIconButton,
  LoadingContainer,
  PeriodSheetContent,
} from './styles';

import { ThemeProps } from '@interfaces/theme';
import { SubscriptionPaymentProps } from '@interfaces/subscriptions';

export function SubscriptionPayments() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const quotes = useQuotes();

  const { month }: { month?: string } = useLocalSearchParams();
  const [selectedMonth, setSelectedMonth] = useState(
    month ?? monthKey(new Date())
  );

  const periodSheetRef = useRef<BottomSheetModal>(null);
  const helpSheetRef = useRef<BottomSheetModal>(null);

  const { data: payments, isLoading } = useSubscriptionPaymentsQuery(
    selectedMonth
  );

  const total = useMemo(
    () => (payments ? computePaymentsTotal(payments, quotes) : 0),
    [payments, quotes]
  );

  // "Tá pago!" for past months, "Previstos" otherwise (spec.md R16/AC16.4)
  const isPastMonth = useMemo(() => {
    const [year, monthIndex] = selectedMonth.split('-').map(Number);
    const now = new Date();
    return (
      year < now.getFullYear() ||
      (year === now.getFullYear() && monthIndex - 1 < now.getMonth())
    );
  }, [selectedMonth]);

  const periodOptions = useMemo(
    () => buildSubscriptionPeriodOptions(selectedMonth),
    [selectedMonth]
  );

  function handleClose() {
    router.back();
  }

  function handleOpenPeriodSheet() {
    periodSheetRef.current?.present();
  }

  function handleClosePeriodSheet() {
    periodSheetRef.current?.dismiss();
  }

  function handleSelectMonth(key: string) {
    setSelectedMonth(key);
    handleClosePeriodSheet();
  }

  function handleOpenHelp() {
    helpSheetRef.current?.present();
  }

  function handleCloseHelp() {
    helpSheetRef.current?.dismiss();
  }

  function handleOpenSubscription(subscriptionId: number) {
    router.navigate({
      pathname: '/options/subscriptionDetails',
      params: { id: String(subscriptionId) },
    });
  }

  function _renderItem({
    item,
    index,
  }: {
    item: SubscriptionPaymentProps;
    index: number;
  }) {
    return (
      <SubscriptionPaymentListItem
        data={item}
        index={index}
        onPress={() => handleOpenSubscription(item.subscription_id)}
      />
    );
  }

  const sectionTitle = isPastMonth ? 'Tá pago!' : 'Previstos';

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.CloseButton handleClickCloseButton={handleClose} />
          <Header.Title title='Próximos pagamentos' />
          <HeaderIconButton onPress={handleOpenHelp}>
            <QuestionIcon size={20} color={theme.colors.primary} />
          </HeaderIconButton>
        </Header.Root>

        <PeriodRow onPress={handleOpenPeriodSheet}>
          <PeriodRowLeft>
            <PeriodLabel>Período</PeriodLabel>
          </PeriodRowLeft>
          <PeriodValueContainer>
            <PeriodValue>{monthLabel(selectedMonth)}</PeriodValue>
            <CaretDownIcon size={16} color={theme.colors.text} />
          </PeriodValueContainer>
        </PeriodRow>

        <TotalContainer>
          <TotalRow>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>{formatCurrency('BRL', total)}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>{sectionTitle}</TotalLabel>
            <TotalValue>{formatCurrency('BRL', total)}</TotalValue>
          </TotalRow>
        </TotalContainer>

        <SectionHeader>
          <SectionHeaderTitle>
            {payments && payments.length > 0
              ? `${payments.length} cobrança${
                  payments.length === 1 ? '' : 's'
                } em ${monthLabel(selectedMonth)}`
              : `Cobranças em ${monthLabel(selectedMonth)}`}
          </SectionHeaderTitle>
        </SectionHeader>

        {isLoading ? (
          <LoadingContainer>
            <ActivityIndicator size='large' color={theme.colors.primary} />
          </LoadingContainer>
        ) : (
          <FlatList
            data={payments ?? []}
            keyExtractor={(item) =>
              `${item.subscription_id}-${item.date}`
            }
            renderItem={_renderItem}
            ListEmptyComponent={() => (
              <ListEmptyComponent text='Nenhum pagamento previsto neste período.' />
            )}
            initialNumToRender={10}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 4,
              paddingBottom: 24,
            }}
          />
        )}

        <ModalView
          title='Selecione o período'
          bottomSheetRef={periodSheetRef}
          closeModal={handleClosePeriodSheet}
          snapPoints={['70%']}
        >
          <PeriodSheetContent>
            {periodOptions.map((option, index) => (
              <ListItem
                key={option.key}
                data={{ id: index, name: option.label }}
                isActive={option.isActive}
                onPress={() => handleSelectMonth(option.key)}
              />
            ))}
          </PeriodSheetContent>
        </ModalView>

        <SubscriptionHelpSheet
          bottomSheetRef={helpSheetRef}
          close={handleCloseHelp}
        />
      </Container>
    </Screen>
  );
}
