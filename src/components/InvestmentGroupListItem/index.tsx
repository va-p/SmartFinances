import React from 'react';

import {
  Container,
  DetailsContainer,
  IconContainer,
  TextColumn,
  Name,
  SubLine,
  RightColumn,
  Amount,
  ChevronContainer,
  Profit,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { useTheme } from 'styled-components';
import { FadeInUp } from 'react-native-reanimated';
import { BankIcon } from 'phosphor-react-native/src/icons/Bank';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { CaretUpIcon } from 'phosphor-react-native/src/icons/CaretUp';

import { ThemeProps } from '@interfaces/theme';
import { CurrencyCodes } from '@interfaces/currencies';
import formatCurrency from '@utils/formatCurrency';
import {
  InvestmentGroup,
  grossProfitOf,
  netProfitOf,
} from '@utils/groupInvestments';

type Props = RectButtonProps & {
  data: InvestmentGroup;
  index: number;
  currencyCode: CurrencyCodes;
  hideAmount?: boolean;
  expanded?: boolean;
};

/**
 * Signed profit teaser (Layout 2, Q2): `+R$ X` for gains, plain
 * `R$ X` (already signed by pt-BR) for losses, null with no basis.
 */
function formatProfitText(
  profit: number | null,
  currencyCode: CurrencyCodes
): string | null {
  if (profit === null) {
    return null;
  }
  const formatted = formatCurrency(currencyCode, profit);
  return profit >= 0 ? `+${formatted}` : formatted;
}

/**
 * Aggregate profit teaser for a collapsed group header (Layout 2).
 * Sums each member's preferred profit (net, else gross); null when no
 * member has a computable basis.
 */
function groupProfit(members: InvestmentGroup['members']): number | null {
  let total = 0;
  let contributors = 0;
  members.forEach((member) => {
    const profit =
      netProfitOf(member.investmentData, member.balance) ??
      grossProfitOf(member.investmentData);
    if (profit !== null) {
      total += profit;
      contributors += 1;
    }
  });
  return contributors > 0 ? total : null;
}

/**
 * Uniform maturity label for the header: every member shares the same
 * valid expiresAt. Mixed or missing maturities omit the chip so the
 * header never misleads.
 */
function groupMaturityLabel(
  members: InvestmentGroup['members']
): string | null {
  const dates = members.map((member) => member.investmentData?.expiresAt);
  const first = dates[0];
  if (!first) {
    return null;
  }
  if (!dates.every((date) => date === first)) {
    return null;
  }
  const parsed = new Date(first);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  // UTC getters: maturity is a calendar date, never a local instant.
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `Venc ${month}/${parsed.getUTCFullYear()}`;
}

export function InvestmentGroupListItem({
  data,
  index,
  currencyCode,
  hideAmount = false,
  expanded = false,
  ...rest
}: Props) {
  const theme = useTheme() as ThemeProps;

  const title = data.count > 1 ? `${data.label} (${data.count})` : data.label;
  const totalText = formatCurrency(currencyCode, data.totalBalanceBase);
  const profit = groupProfit(data.members);
  const profitText = formatProfitText(profit, currencyCode);
  const profitIsPositive = profit !== null && profit >= 0;
  const profitColor = profitIsPositive
    ? theme.colors.success
    : theme.colors.attention;
  const maturity = groupMaturityLabel(data.members);
  const issuer =
    data.members.map((member) => member.investmentData?.issuer?.trim())
      .find((value) => value) ?? null;
  const subLine =
    [issuer, maturity].filter(Boolean).join(' · ') || null;

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <DetailsContainer>
        <IconContainer>
          <BankIcon color={theme.colors.primary} />
        </IconContainer>
        <TextColumn>
          <Name>{title}</Name>
          {subLine && <SubLine>{subLine}</SubLine>}
        </TextColumn>
      </DetailsContainer>

      <RightColumn>
        <Amount>{!hideAmount ? totalText : '•••••'}</Amount>
        {profitText && (
          <Profit style={{ color: profitColor }}>
            {!hideAmount ? profitText : '•••••'}
          </Profit>
        )}
      </RightColumn>

      <ChevronContainer>
        {data.count > 1 && expanded && (
          <CaretUpIcon size={16} color={theme.colors.text} />
        )}
        {data.count > 1 && !expanded && (
          <CaretDownIcon size={16} color={theme.colors.text} />
        )}
        {data.count <= 1 && (
          <CaretRightIcon size={16} color={theme.colors.text} />
        )}
      </ChevronContainer>
    </Container>
  );
}
