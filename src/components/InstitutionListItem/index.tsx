import React from 'react';
import { Container, Name } from './styles';

import { useTheme } from 'styled-components';
import { RectButtonProps } from 'react-native-gesture-handler';
import { FadeInUp } from 'react-native-reanimated';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';

import { ThemeProps } from '@interfaces/theme';
import { InstitutionProps } from '@interfaces/institutions';

type Props = RectButtonProps & {
  data: InstitutionProps;
  index: number;
};

export function InstitutionListItem({ data, index, ...rest }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <Container entering={FadeInUp.delay(index * 100)} {...rest}>
      <Name>{data.name}</Name>
      <CaretRight size={16} color={theme.colors.text} />
    </Container>
  );
}
