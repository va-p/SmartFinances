import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Content,
  Label,
  QuantityRow,
  QuantityButton,
  QuantityButtonText,
  QuantityInput,
  PeriodSelector,
  PeriodText,
  Footer,
} from './styles';

import { Screen } from '@components/Screen';
import { Button } from '@components/Button';
import { Gradient } from '@components/Gradient';

import { useTheme } from 'styled-components';
import { ThemeProps } from '@interfaces/theme';

import CaretUp from 'phosphor-react-native/src/icons/CaretUp';
import Calendar from 'phosphor-react-native/src/icons/Calendar';
import CaretDown from 'phosphor-react-native/src/icons/CaretDown';

export type RecurrencePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceData {
  interval: number;
  period: RecurrencePeriod;
}

type Props = {
  initialInterval?: number;
  initialPeriod?: RecurrencePeriod;
  onSave: (data: RecurrenceData) => void;
  onCancel: () => void;
};

const PERIOD_OPTIONS: { key: RecurrencePeriod; label: string }[] = [
  { key: 'DAILY', label: 'Diário' },
  { key: 'WEEKLY', label: 'Semanal' },
  { key: 'MONTHLY', label: 'Mensal' },
  { key: 'YEARLY', label: 'Anual' },
];

const PERIOD_LABELS: Record<RecurrencePeriod, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export function RecurrenceSelect({
  initialInterval = 1,
  initialPeriod = 'DAILY',
  onSave,
  onCancel,
}: Props) {
  const theme = useTheme() as ThemeProps;
  const [interval, setInterval] = useState(initialInterval);
  const [period, setPeriod] = useState<RecurrencePeriod>(initialPeriod);
  const [inputValue, setInputValue] = useState(String(initialInterval));

  function handleIncrement() {
    const next = interval + 1;
    setInterval(next);
    setInputValue(String(next));
  }

  function handleDecrement() {
    const next = Math.max(1, interval - 1);
    setInterval(next);
    setInputValue(String(next));
  }

  function handleInputChange(text: string) {
    setInputValue(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setInterval(parsed);
    }
  }

  function handleInputBlur() {
    if (inputValue === '' || isNaN(parseInt(inputValue, 10)) || parseInt(inputValue, 10) < 1) {
      setInputValue('1');
      setInterval(1);
    }
  }

  function handleSelectPeriod() {
    Alert.alert(
      'Período de recorrência',
      'Selecione a frequência',
      PERIOD_OPTIONS.map((opt) => ({
        text: opt.label,
        onPress: () => setPeriod(opt.key),
      }))
    );
  }

  function handleSave() {
    onSave({ interval, period });
  }

  function getRecurrenceDescription(): string {
    if (period === 'DAILY' && interval === 1) return 'Todo dia';
    if (period === 'DAILY') return `A cada ${interval} dias`;
    if (period === 'WEEKLY' && interval === 1) return 'Toda semana';
    if (period === 'WEEKLY') return `A cada ${interval} semanas`;
    if (period === 'MONTHLY' && interval === 1) return 'Todo mês';
    if (period === 'MONTHLY') return `A cada ${interval} meses`;
    if (period === 'YEARLY' && interval === 1) return 'Todo ano';
    return `A cada ${interval} anos`;
  }

  return (
    <Screen>
      <Container>
        <Gradient />
        <Content>
          {/*<Label>Configurar recorrência</Label>*/}

          {/* ── Quantity Input ──────────────────────────────── */}
          <Label secondary>Intervalo</Label>
          <QuantityRow>
            <QuantityButton onPress={handleDecrement}>
              <QuantityButtonText>
                <CaretDown size={20} color={theme.colors.text} weight="bold" />
              </QuantityButtonText>
            </QuantityButton>

            <QuantityInput
              value={inputValue}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              keyboardType="numeric"
              selectTextOnFocus
              textAlign="center"
            />

            <QuantityButton onPress={handleIncrement}>
              <QuantityButtonText>
                <CaretUp size={20} color={theme.colors.text} weight="bold" />
              </QuantityButtonText>
            </QuantityButton>
          </QuantityRow>

          {/* ── Period Selector ─────────────────────────────── */}
          <Label secondary>Período</Label>
          <PeriodSelector onPress={handleSelectPeriod}>
            <Calendar size={20} color={theme.colors.primary} />
            <PeriodText>{PERIOD_LABELS[period]}</PeriodText>
          </PeriodSelector>

          {/* ── Actions ─────────────────────────────────────── */}
          <Footer>
            <Button.Root onPress={handleSave}>
              <Button.Text text="Salvar" />
            </Button.Root>
          </Footer>
        </Content>
      </Container>
    </Screen>
  );
}
