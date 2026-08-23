import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Icons
import Plus from 'phosphor-react-native/src/icons/Plus';
import Question from 'phosphor-react-native/src/icons/Question';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { SubscriptionListItem } from '@components/SubscriptionListItem';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SubscriptionHelpSheet } from '@components/SubscriptionHelpSheet';
import { ModalViewWithoutHeader } from '@components/Modals/ModalViewWithoutHeader';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Screens
import { RegisterTransaction } from '@screens/RegisterTransaction';

// Hooks
import { useSubscriptionsQuery } from '@hooks/useSubscriptionsQuery';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { getUpcomingPaymentsSummary } from '@utils/subscriptionPaymentsSummary';

// Storages
import { useQuotes } from '@stores/quotesStorage';

import {
  Container,
  SectionHeader,
  SectionHeaderTitle,
  HelpButton,
  HeaderIconButton,
  LoadingContainer,
  Footer,
  FooterTextContainer,
  FooterTitle,
  FooterSubtitle,
} from './styles';

import { ThemeProps } from '@interfaces/theme';
import { SubscriptionProps } from '@interfaces/subscriptions';

export function Subscriptions() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const quotes = useQuotes();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const helpSheetRef = useRef<BottomSheetModal>(null);
  const registerTransactionSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');

  const { data: subscriptions, isLoading, refetch } = useSubscriptionsQuery();

  const upcomingSummary = useMemo(
    () =>
      subscriptions
        ? getUpcomingPaymentsSummary(subscriptions, quotes)
        : null,
    [subscriptions, quotes]
  );

  function handleOpenDetails(id: number) {
    router.navigate({
      pathname: '/options/subscriptionDetails',
      params: { id: String(id) },
    });
  }

  function handleOpenPayments() {
    if (!upcomingSummary) return;
    router.navigate({
      pathname: '/options/subscriptionPayments',
      params: { month: upcomingSummary.month },
    });
  }

  function handleOpenHelp() {
    helpSheetRef.current?.present();
  }

  function handleCloseHelp() {
    helpSheetRef.current?.dismiss();
  }

  function handleOpenRegisterTransaction() {
    setTransactionId('');
    registerTransactionSheetRef.current?.present();
  }

  function handleCloseRegisterTransaction() {
    registerTransactionSheetRef.current?.dismiss();
    refetch();
  }

  function handleResetTransactionId() {
    setTransactionId('');
  }

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  function _renderItem({
    item,
    index,
  }: {
    item: SubscriptionProps;
    index: number;
  }) {
    return (
      <SubscriptionListItem
        data={item}
        index={index}
        onPress={() => handleOpenDetails(item.id)}
      />
    );
  }

  const upcomingCountText = upcomingSummary
    ? `${upcomingSummary.count} cobrança${
        upcomingSummary.count === 1 ? '' : 's'
      } prevista${upcomingSummary.count === 1 ? '' : 's'}`
    : '';

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.BackButton />
          <Header.Title title='Minhas assinaturas' />
          <HeaderIconButton onPress={handleOpenRegisterTransaction}>
            <Plus size={22} color={theme.colors.primary} />
          </HeaderIconButton>
        </Header.Root>

        <SectionHeader>
          <SectionHeaderTitle>Classificadas como assinaturas</SectionHeaderTitle>
          <HelpButton onPress={handleOpenHelp}>
            <Question size={20} color={theme.colors.primary} />
          </HelpButton>
        </SectionHeader>

        {isLoading ? (
          <LoadingContainer>
            <ActivityIndicator size='large' color={theme.colors.primary} />
          </LoadingContainer>
        ) : (
          <FlatList
            data={subscriptions ?? []}
            keyExtractor={(item) => String(item.id)}
            renderItem={_renderItem}
            ListEmptyComponent={() => (
              <ListEmptyComponent text='Nenhuma assinatura identificada. Crie transações recorrentes (mensais ou anuais) para identificá-las automaticamente aqui.' />
            )}
            initialNumToRender={10}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 24,
            }}
          />
        )}

        {upcomingSummary && (
          <Footer
            onPress={handleOpenPayments}
            style={{ marginBottom: bottomTabBarHeight - 32}}
          >
            <FooterTextContainer>
              <FooterTitle>Próximos pagamentos</FooterTitle>
              <FooterSubtitle>
                {formatCurrency('BRL', upcomingSummary.total)} em{' '}
                {upcomingCountText}
              </FooterSubtitle>
            </FooterTextContainer>
            <CaretRight size={20} color={theme.colors.primary} />
          </Footer>
        )}

        <SubscriptionHelpSheet
          bottomSheetRef={helpSheetRef}
          close={handleCloseHelp}
        />

        <ModalViewWithoutHeader
          bottomSheetRef={registerTransactionSheetRef}
          snapPoints={['100%']}
        >
          <RegisterTransaction
            id={transactionId}
            resetId={handleResetTransactionId}
            closeRegisterTransaction={handleCloseRegisterTransaction}
          />
        </ModalViewWithoutHeader>
      </Container>
    </Screen>
  );
}
