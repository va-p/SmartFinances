import React from 'react';
import {
  Amount,
  AmountContainer,
  AmountGroup,
  AmountLabel,
  Container,
  InstitutionName,
  Name,
  NameContainer,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { AccountProps } from '@interfaces/accounts';
import { FadeInLeft } from 'react-native-reanimated';
import formatCurrency from '@utils/formatCurrency';

type Props = RectButtonProps & {
  data: AccountProps;
  index: number;
  hideAmount?: boolean;
};

export function CreditCardListItem({
  data,
  index,
  hideAmount = false,
  ...rest
}: Props) {
  const { creditLimit, availableCreditLimit } = data.creditData ?? {};
  const hasInvoice =
    creditLimit != null && availableCreditLimit != null;
  const invoiceText = hasInvoice
    ? formatCurrency(
      data.currency.code,
      Number(creditLimit) - Number(availableCreditLimit)
    )
    : '—';
  const limitText =
    availableCreditLimit != null
      ? formatCurrency(data.currency.code, Number(availableCreditLimit))
      : '—';
  return (
    <Container entering={FadeInLeft.delay(index * 100)} {...rest}>
      <AmountContainer>
        <AmountGroup>
          <AmountLabel>Fatura atual</AmountLabel>
          <Amount>{!hideAmount ? invoiceText : '•••••'}</Amount>
          {data.totalAccountAmountConverted && (
            <Amount style={{ fontSize: 12 }}>
              ({!hideAmount ? data.totalAccountAmountConverted : '•••••'})
            </Amount>
          )}
        </AmountGroup>

        <AmountGroup>
          <AmountLabel>Limite disponível</AmountLabel>
          <Amount>{!hideAmount ? limitText : '•••••'}</Amount>
        </AmountGroup>
      </AmountContainer>

      <NameContainer>
        {data.institution && (
          <InstitutionName numberOfLines={1}>
            {data.institution.name}
          </InstitutionName>
        )}
        <Name>{data.name}</Name>
      </NameContainer>
    </Container>
  );
}
