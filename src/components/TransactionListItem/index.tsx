import React, { memo } from 'react';
import { FlatList } from 'react-native';
import {
  Container,
  DescriptionAndAmountContainer,
  Description,
  AmountContainer,
  TransferDirectionIcon,
  Amount,
  TagsContainer,
  Footer,
  CategoryAndAccountContainer,
  IconContainer,
  Icon,
  DetailsContainer,
  Category,
  Account,
  AmountNotConvertedContainer,
  AmountNotConverted,
  CategoryAndAccountSeparator,
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

import { FadeInUp } from 'react-native-reanimated';

import { TagTransaction } from '@components/TagTransaction';
import { TransactionProps } from '@interfaces/transactions';

type Props = RectButtonProps & {
  data: TransactionProps;
  index: number;
  hideAmount: boolean;
};

const TransactionListItem = memo(function TransactionListItem({
  data,
  index,
  hideAmount,
  ...rest
}: Props) {
  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <IconContainer>
        <Icon type={data.type} name={data.category.icon.name} />
      </IconContainer>
      <DetailsContainer>
        <DescriptionAndAmountContainer>
          <Description type={data.type}>{data.description}</Description>

          <AmountContainer>
            {data.type === 'transferDebit' && (
              <TransferDirectionIcon name='arrow-up-outline' />
            )}
            {data.type === 'transferCredit' && (
              <TransferDirectionIcon name='arrow-down-outline' />
            )}
            <Amount type={data.type}>
              {!hideAmount && data.type === 'debit' && '-'}
              {!hideAmount ? data.amount_formatted : '•••••'}
            </Amount>
          </AmountContainer>
        </DescriptionAndAmountContainer>

        <Footer>
          <CategoryAndAccountContainer>
            <Category>{data.category.name}</Category>
            <CategoryAndAccountSeparator>{' | '}</CategoryAndAccountSeparator>
            <Account>{data.account.name}</Account>
          </CategoryAndAccountContainer>
          <AmountNotConvertedContainer>
            <AmountNotConverted>
              {data.account.currency.code !== data.currency.code &&
                `${data.amount_not_converted}`}
            </AmountNotConverted>
          </AmountNotConvertedContainer>
        </Footer>
        <TagsContainer>
          <FlatList
            data={data.tags}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: any) => <TagTransaction data={item} />}
            horizontal
          />
        </TagsContainer>
      </DetailsContainer>
    </Container>
  );
});

export default TransactionListItem;
