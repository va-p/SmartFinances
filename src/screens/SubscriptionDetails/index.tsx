import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Animations
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Icons
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { LockIcon } from 'phosphor-react-native/src/icons/Lock';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { PencilSimpleIcon } from 'phosphor-react-native/src/icons/PencilSimple';

// Components
import { Screen } from '@components/Screen';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

// Hooks
import { useSubscriptionDetailQuery } from '@hooks/useSubscriptionDetailQuery';
import { useUpdateSubscriptionMutation } from '@hooks/useSubscriptionMutations';

// Utils
import formatCurrency from '@utils/formatCurrency';
import { parseDecimalInput } from '@utils/parseDecimalInput';
import { formatSubscriptionDate } from '@utils/formatSubscriptionDate';
import { subscriptionRecurrenceLabel } from '@utils/subscriptionDisplay';

import {
  Container,
  ContentScroll,
  Row,
  RowLeft,
  RowIcon,
  RowLabel,
  RowLabelDanger,
  RowValue,
  SectionHeaderRow,
  SectionHeaderTitle,
  EditButton,
  EditButtonText,
  SectionBody,
  DetailLine,
  DetailLabel,
  DetailValue,
  EditSheetContent,
  InputLabel,
  EditInput,
  PeriodPills,
  PeriodPill,
  PeriodPillText,
  SaveButtonContainer,
} from './styles';

import { ThemeProps } from '@interfaces/theme';
import { SubscriptionRecurrencePeriod } from '@interfaces/subscriptions';

const AnimatedSectionBody = Animated.createAnimatedComponent(SectionBody);

const COLLAPSE_DURATION = 300;

/**
 * A single CaretDown that rotates between its collapsed (pointing up, -180°)
 * and expanded (pointing down, 0°) positions. Expanding increases the angle
 * (clockwise); closing decreases it, reversing the previous rotation back to
 * the original position.
 */
type RotatingCaretProps = {
  expanded: boolean;
  color: string;
};

function RotatingCaret({ expanded, color }: RotatingCaretProps) {
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: COLLAPSE_DURATION,
      easing: Easing.inOut(Easing.quad),
    });
  }, [expanded, progress]);

  const caretStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [-180, 0])}deg` },
    ],
  }));

  return (
    <Animated.View style={caretStyle}>
      <CaretDownIcon size={18} color={color} />
    </Animated.View>
  );
}

export function SubscriptionDetails() {
  const theme = useTheme() as ThemeProps;
  const router = useRouter();
  const { id }: { id: string } = useLocalSearchParams();

  const { data: subscription, isLoading, refetch } =
    useSubscriptionDetailQuery(id);
  const updateMutation = useUpdateSubscriptionMutation();

  const editSheetRef = useRef<BottomSheetModal>(null);
  const [paymentsExpanded, setPaymentsExpanded] = useState(true);
  const [listExpanded, setListExpanded] = useState(true);

  // Edit form state (GA-5: amount + day + recurrence period)
  const [amountInput, setAmountInput] = useState('');
  const [dayInput, setDayInput] = useState('');
  const [period, setPeriod] = useState<SubscriptionRecurrencePeriod>('MONTHLY');

  const hideFromList = Boolean(subscription?.hide_from_subscription_list);

  const editAmountPreview = useMemo(() => {
    if (!amountInput || !subscription) return null;
    const parsed = Number(parseDecimalInput(amountInput));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return formatCurrency(subscription.currency.code, parsed);
  }, [amountInput, subscription]);

  function handleClose() {
    router.back();
  }

  function handleOpenEdit() {
    if (!subscription) return;
    setAmountInput(String(subscription.amount).replace('.', ','));
    setDayInput(String(subscription.day));
    setPeriod(
      subscription.recurrence_period === 'YEARLY' ? 'YEARLY' : 'MONTHLY'
    );
    editSheetRef.current?.present();
  }

  function handleCloseEdit() {
    editSheetRef.current?.dismiss();
  }

  function handleSaveEdit() {
    if (!subscription) return;

    const parsedAmount = Number(parseDecimalInput(amountInput));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Editar assinatura', 'Informe um valor válido.');
      return;
    }

    // Anchor the new billing day on the current next (or last) payment month,
    // clamped to that month's length (spec.md R15/AC15.3).
    const base =
      (subscription.next_payment_at &&
        new Date(subscription.next_payment_at)) ||
      (subscription.last_payment_at &&
        new Date(subscription.last_payment_at)) ||
      new Date();
    const lastDay = new Date(
      base.getFullYear(),
      base.getMonth() + 1,
      0
    ).getDate();
    const parsedDay = Math.min(
      Math.max(1, Number(dayInput) || subscription.day),
      lastDay
    );
    const newDate = new Date(base);
    newDate.setDate(parsedDay);

    updateMutation.mutate(
      {
        transaction_id: subscription.id,
        amount: parsedAmount,
        transaction_date: newDate.toISOString(),
        recurrence_period: period,
      },
      {
        onSuccess: () => {
          handleCloseEdit();
          refetch();
        },
      }
    );
  }

  function handleMarkNotSubscription() {
    if (!subscription) return;

    Alert.alert(
      'Não é uma assinatura',
      'Este pagamento deixará de aparecer em "Minhas assinaturas". Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () =>
            updateMutation.mutate(
              { transaction_id: subscription.id, is_subscription: false },
              { onSuccess: () => router.back() }
            ),
        },
      ]
    );
  }

  function handleToggleHide() {
    if (!subscription) return;
    updateMutation.mutate(
      {
        transaction_id: subscription.id,
        hide_from_subscription_list: !hideFromList,
      },
      { onSuccess: () => refetch() }
    );
  }

  return (
    <Screen>
      <Container>
        <Gradient />

        <Header.Root>
          <Header.CloseButton handleClickCloseButton={handleClose} />
          <Header.Title
            title={subscription ? subscription.description : 'Assinatura'}
          />
        </Header.Root>

        {isLoading || !subscription ? (
          <ActivityIndicator
            size='large'
            color={theme.colors.primary}
            style={{ marginTop: 48 }}
          />
        ) : (
          <ContentScroll>
            <Row>
              <RowLeft>
                <RowLabel>Último pagamento</RowLabel>
                <RowValue>
                  {subscription.last_payment_at
                    ? formatSubscriptionDate(subscription.last_payment_at)
                    : '—'}
                </RowValue>
              </RowLeft>
              <CaretRightIcon size={16} color={theme.colors.text} />
            </Row>

            <Row>
              <RowLeft>
                <RowLabel>Próximo pagamento</RowLabel>
                <RowValue>
                  {subscription.next_payment_at
                    ? formatSubscriptionDate(subscription.next_payment_at)
                    : '—'}
                </RowValue>
              </RowLeft>
              <CaretRightIcon size={16} color={theme.colors.text} />
            </Row>

            {/* Detalhes sobre pagamento (collapsible, AC15.3) */}
            <SectionHeaderRow>
              <SectionHeaderTitle>Detalhes sobre pagamento</SectionHeaderTitle>
              <EditButton onPress={handleOpenEdit}>
                <PencilSimpleIcon size={16} color={theme.colors.primary} />
                <EditButtonText>Editar</EditButtonText>
              </EditButton>
              <EditButton onPress={() => setPaymentsExpanded((v) => !v)}>
                <RotatingCaret
                  expanded={paymentsExpanded}
                  color={theme.colors.text}
                />
              </EditButton>
            </SectionHeaderRow>

            {paymentsExpanded && (
              <AnimatedSectionBody
                entering={FadeInUp.duration(COLLAPSE_DURATION)}
                exiting={FadeOutUp.duration(COLLAPSE_DURATION)}
              >
                <DetailLine>
                  <DetailLabel>Valor</DetailLabel>
                  <DetailValue>
                    {formatCurrency(
                      subscription.currency.code,
                      subscription.amount
                    )}
                  </DetailValue>
                </DetailLine>
                <DetailLine>
                  <DetailLabel>Recorrência</DetailLabel>
                  <DetailValue>
                    {subscriptionRecurrenceLabel(
                      subscription.recurrence_period
                    )}
                  </DetailValue>
                </DetailLine>
                <DetailLine>
                  <DetailLabel>Dia de cobrança</DetailLabel>
                  <DetailValue>Dia {subscription.day}</DetailValue>
                </DetailLine>
              </AnimatedSectionBody>
            )}

            <SectionHeaderRow>
              <SectionHeaderTitle>Exibição na lista</SectionHeaderTitle>
              <EditButton onPress={() => setListExpanded((v) => !v)}>
                <RotatingCaret
                  expanded={listExpanded}
                  color={theme.colors.text}
                />
              </EditButton>
            </SectionHeaderRow>

            {listExpanded && (
              <AnimatedSectionBody
                entering={FadeInUp.duration(COLLAPSE_DURATION)}
                exiting={FadeOutUp.duration(COLLAPSE_DURATION)}
              >
                <Row onPress={handleMarkNotSubscription}>
                  <RowLeft>
                    <RowIcon>
                      <LockIcon size={20} color={theme.colors.attention} />
                    </RowIcon>
                    <RowLabelDanger>Não é uma assinatura</RowLabelDanger>
                  </RowLeft>
                  <CaretRightIcon size={16} color={theme.colors.attention} />
                </Row>

                <Row onPress={handleToggleHide}>
                  <RowLeft>
                    <RowIcon>
                      {hideFromList ? (
                        <EyeIcon size={20} color={theme.colors.primary} />
                      ) : (
                        <EyeSlashIcon size={20} color={theme.colors.primary} />
                      )}
                    </RowIcon>
                    <RowLabel>
                      {hideFromList ? 'Exibir na lista' : 'Ocultar da lista'}
                    </RowLabel>
                  </RowLeft>
                  <CaretRightIcon size={16} color={theme.colors.text} />
                </Row>
              </AnimatedSectionBody>
            )}
          </ContentScroll>
        )}

        <ModalViewSelection
          title='Editar assinatura'
          bottomSheetRef={editSheetRef}
          snapPoints={['70%']}
          keyboardBehavior='extend'
        >
          <EditSheetContent>
            <InputLabel>Valor</InputLabel>
            <EditInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType='decimal-pad'
              placeholder='0,00'
              placeholderTextColor={theme.colors.textPlaceholder}
            />
            {editAmountPreview && (
              <DetailLabel style={{ marginTop: 6 }}>
                {editAmountPreview}
              </DetailLabel>
            )}

            <InputLabel>Dia de cobrança (1–31)</InputLabel>
            <EditInput
              value={dayInput}
              onChangeText={setDayInput}
              keyboardType='number-pad'
              placeholder='6'
              placeholderTextColor={theme.colors.textPlaceholder}
            />

            <InputLabel>Recorrência</InputLabel>
            <PeriodPills>
              <PeriodPill
                isActive={period === 'MONTHLY'}
                onPress={() => setPeriod('MONTHLY')}
              >
                <PeriodPillText isActive={period === 'MONTHLY'}>
                  Mensal
                </PeriodPillText>
              </PeriodPill>
              <PeriodPill
                isActive={period === 'YEARLY'}
                onPress={() => setPeriod('YEARLY')}
              >
                <PeriodPillText isActive={period === 'YEARLY'}>
                  Anual
                </PeriodPillText>
              </PeriodPill>
            </PeriodPills>

            <SaveButtonContainer>
              <Button.Root
                onPress={handleSaveEdit}
                isLoading={updateMutation.isPending}
              >
                <Button.Text text='Salvar' />
              </Button.Root>
            </SaveButtonContainer>
          </EditSheetContent>
        </ModalViewSelection>
      </Container>
    </Screen>
  );
}
