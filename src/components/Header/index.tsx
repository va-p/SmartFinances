import React from 'react';
import {
  Container,
  BackButton,
  Icon,
  Title
} from './styles';

import { useNavigation } from '@react-navigation/native';

type TypeProps = 'primary' | 'secondary';

type Props = {
  type: TypeProps;
  title: string;
}

export function Header({ type, title }: Props) {
  const navigation = useNavigation();

  function handleClickBackButton() {
    navigation.goBack();
  };

  return (
    <Container type={type}>
      {
        type === 'primary' ?
          <BackButton onPress={handleClickBackButton}>
            <Icon name='chevron-back-outline' />
          </BackButton> :
          <></>
      }
      <Title>{title}</Title>      
    </Container>
  );
}