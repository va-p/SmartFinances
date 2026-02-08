import React, { memo } from 'react';
import {
  FlatList,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from 'react-native';
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

import { FadeInUp } from 'react-native-reanimated';

import { TagTransaction } from '@components/TransactionListItem/components/TagTransaction';
import { TransactionProps } from '@interfaces/transactions';
import {
  useIsTransactionSelected,
  useToggleTransaction,
  useSelectedTransactionsCount,
} from '@stores/useTransactionsStore';
import { useTheme } from 'styled-components/native';
import { ThemeProps } from '@interfaces/theme';

type Props = {
  data: TransactionProps;
  index: number;
  hideAmount: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

const TransactionListItem = memo(function TransactionListItem({
  data,
  index,
  hideAmount,
  onPress,
  onLongPress,
  ...rest
}: Props) {
  const theme = useTheme() as ThemeProps;
  const isSelected = useIsTransactionSelected(data.id);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      {...rest}
    >
      <View>
        <Container
          entering={FadeInUp.delay(index * 100)}
          style={{
            backgroundColor: isSelected
              ? theme.colors.primary_light
              : theme.colors.shape,
          }}
          {...rest}
        >
          <IconContainer>
            <Icon type={data.type} name={data.category.icon.name} />
          </IconContainer>
          <DetailsContainer>
            <DescriptionAndAmountContainer>
              <Description type={data.type}>{data.description}</Description>

              <AmountContainer>
                {data.type === 'TRANSFER_DEBIT' && (
                  <TransferDirectionIcon name='arrow-up-outline' />
                )}
                {data.type === 'TRANSFER_CREDIT' && (
                  <TransferDirectionIcon name='arrow-down-outline' />
                )}
                <Amount type={data.type}>
                  {!hideAmount &&
                    data.account.type === 'CREDIT' &&
                    data.type === 'DEBIT' &&
                    '-'}
                  {!hideAmount
                    ? data.amount_in_account_currency
                      ? data.amount_in_account_currency_formatted
                      : data.amount_formatted
                    : '•••••'}
                </Amount>
              </AmountContainer>
            </DescriptionAndAmountContainer>

            <Footer>
              <CategoryAndAccountContainer>
                <Category>{data.category.name}</Category>
                <CategoryAndAccountSeparator>
                  {' | '}
                </CategoryAndAccountSeparator>
                <Account>{data.account.name}</Account>
              </CategoryAndAccountContainer>
              <AmountNotConvertedContainer>
                <AmountNotConverted>
                  {data.amount_in_account_currency &&
                    `${data.amount_formatted}`}
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
      </View>
    </TouchableWithoutFeedback>
  );
});

export default TransactionListItem;
