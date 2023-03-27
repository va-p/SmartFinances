import React from 'react';
import { Container, BackButton, Title } from './styles';

import { useNavigation } from '@react-navigation/native';
import * as Icon from 'phosphor-react-native';

import theme from '@themes/theme';

type TypeProps = 'primary' | 'secondary';

type Props = {
  type: TypeProps;
  title: string;
};

export function Header({ type, title }: Props) {
  const navigation = useNavigation();

  function handleClickBackButton() {
    navigation.goBack();
  }

  return (
    <Container type={type}>
      {type === 'primary' ? (
        <BackButton onPress={handleClickBackButton}>
          <Icon.CaretLeft size={20} color={theme.colors.primary} />
        </BackButton>
      ) : (
        <></>
      )}
      <Title>{title}</Title>
    </Container>
  );
}
