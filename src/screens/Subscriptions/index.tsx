import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform } from 'react-native';
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
  OptionsContainer,
  OptionRow,
  OptionIconContainer,
  OptionTextsContainer,
  OptionTitle,
  OptionSubtitle,
} from './styles';

import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';

// Icons
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ListBulletsIcon } from 'phosphor-react-native/src/icons/ListBullets';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Gradient } from '@components/Gradient';
import { ListEmptyComponent } from '@components/ListEmptyComponent';
import { SubscriptionListItem } from '@components/SubscriptionListItem';
import { SubscriptionHelpSheet } from '@components/SubscriptionHelpSheet';
import { ModalViewWithoutHeader } from '@components/Modals/ModalViewWithoutHeader';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

// Screens
import { RegisterTransaction } from '@screens/RegisterTransaction';
import { TransactionSelect } from '@screens/TransactionSelect';

// Hooks
import { useSubscriptionsQuery } from '@hooks/useSubscriptionsQuery';
import { useBottomTabBarHeight } from '@hooks/useBottomTabBarHeight';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { getUpcomingPaymentsSummary } from '@utils/subscriptionPaymentsSummary';

// Storages
import { useQuotes } from '@stores/quotesStorage';
import { useUserConfigs } from '@stores/userConfigsStorage';

import { ThemeProps } from '@interfaces/theme';
import { SubscriptionProps } from '@interfaces/subscriptions';
import { TransactionProps } from '@interfaces/transactions';


function EmptyList() {
  return <ListEmptyComponent text='Nenhuma assinatura identificada. Crie transações recorrentes (mensais ou anuais) para identificá-las automaticamente aqui.' />;
}
export function Subscriptions() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const quotes = useQuotes();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const helpSheetRef = useRef<BottomSheetModal>(null);
  const registerTransactionSheetRef = useRef<BottomSheetModal>(null);
  const addSubscriptionSheetRef = useRef<BottomSheetModal>(null);
  const transactionSelectSheetRef = useRef<BottomSheetModal>(null);
  const [transactionId, setTransactionId] = useState('');
  const [openAdvancedSelectors, setOpenAdvancedSelectors] = useState(false);

  const { data: subscriptions, isLoading, refetch } = useSubscriptionsQuery();
  const baseCurrencyCode = useUserConfigs((state) => state.baseCurrency.code);

  const upcomingSummary = useMemo(
    () =>
      subscriptions
        ? getUpcomingPaymentsSummary(subscriptions, quotes, new Date(), baseCurrencyCode)
        : null,
    [subscriptions, quotes, baseCurrencyCode]
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
    setOpenAdvancedSelectors(false);
    registerTransactionSheetRef.current?.present();
  }

  function handleOpenAddSubscription() {
    addSubscriptionSheetRef.current?.present();
  }

  function handleChooseNewTransaction() {
    addSubscriptionSheetRef.current?.dismiss();
    handleOpenRegisterTransaction();
  }

  function handleChooseExistingTransaction() {
    transactionSelectSheetRef.current?.present();
  }

  function handleSelectTransaction(transaction: TransactionProps) {
    setTransactionId(String(transaction.id));
    setOpenAdvancedSelectors(true);
    transactionSelectSheetRef.current?.dismiss();
    addSubscriptionSheetRef.current?.dismiss();
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

  type RenderItemProps = {
    item: SubscriptionProps;
    index: number;
  };
  function renderItem({ item, index }: RenderItemProps) {
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
          <HeaderIconButton onPress={() => handleOpenAddSubscription()}>
            <PlusIcon size={22} color={theme.colors.primary} />
          </HeaderIconButton>
        </Header.Root>

        <SectionHeader>
          <SectionHeaderTitle>Classificadas como assinaturas</SectionHeaderTitle>
          <HelpButton onPress={() => handleOpenHelp()}>
            <QuestionIcon size={20} color={theme.colors.primary} />
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
            renderItem={({
              item,
              index,
            }: {
              item: SubscriptionProps;
              index: number;
            }) => renderItem({ item, index })}
            ListEmptyComponent={EmptyList}
            initialNumToRender={10}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: 8,
              paddingBottom: 24,
            }}
          />
        )}

        {upcomingSummary && (
          <Footer
            onPress={() => handleOpenPayments()}
            style={{ marginBottom: Platform.OS === 'ios' ? bottomTabBarHeight - 32 : bottomTabBarHeight - 16}}
          >
            <FooterTextContainer>
              <FooterTitle>Próximos pagamentos</FooterTitle>
              <FooterSubtitle>
                {formatCurrency(baseCurrencyCode, upcomingSummary.total)} em{' '}
                {upcomingCountText}
              </FooterSubtitle>
            </FooterTextContainer>
            <CaretRightIcon size={20} color={theme.colors.primary} />
          </Footer>
        )}

        <SubscriptionHelpSheet
          bottomSheetRef={helpSheetRef}
          close={() => handleCloseHelp()}
        />

        <ModalViewWithoutHeader
          bottomSheetRef={registerTransactionSheetRef}
          snapPoints={['100%']}
        >
          <RegisterTransaction
            id={transactionId}
            initiallyOpenAdvancedSelectors={openAdvancedSelectors}
            resetId={() => handleResetTransactionId()}
            closeRegisterTransaction={() => handleCloseRegisterTransaction()}
          />
        </ModalViewWithoutHeader>

        {/* ── Add subscription: choice modal ──────────────────── */}
        <ModalViewSelection
          $modal
          title='Adicionar assinatura'
          bottomSheetRef={addSubscriptionSheetRef}
          snapPoints={['30%']}
        >
          <OptionsContainer>
            <OptionRow onPress={() => handleChooseExistingTransaction()}>
              <OptionIconContainer>
                <ListBulletsIcon size={22} color={theme.colors.primary} />
              </OptionIconContainer>
              <OptionTextsContainer>
                <OptionTitle>Selecionar transação existente</OptionTitle>
                <OptionSubtitle>
                  Inclui transações importadas de contas sincronizadas
                </OptionSubtitle>
              </OptionTextsContainer>
            </OptionRow>

            <OptionRow onPress={() => handleChooseNewTransaction()}>
              <OptionIconContainer>
                <PlusIcon size={22} color={theme.colors.primary} />
              </OptionIconContainer>
              <OptionTextsContainer>
                <OptionTitle>Criar nova transação</OptionTitle>
                <OptionSubtitle>
                  Cadastre uma nova transação recorrente
                </OptionSubtitle>
              </OptionTextsContainer>
            </OptionRow>
          </OptionsContainer>
        </ModalViewSelection>

        {/* ── Add subscription: transaction picker ───────────── */}
        <ModalViewSelection
          $modal
          title='Selecione a transação'
          bottomSheetRef={transactionSelectSheetRef}
          snapPoints={['85%']}
        >
          <TransactionSelect
            setTransaction={(transaction: TransactionProps) =>
              handleSelectTransaction(transaction)
            }
            closeSelectTransaction={() =>
              transactionSelectSheetRef.current?.dismiss()
            }
          />
        </ModalViewSelection>
      </Container>
    </Screen>
  );
}
