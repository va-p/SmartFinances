import React from 'react';
import { Switch } from 'react-native';
import {
  Container,
  Icon,
  TitleContainer,
  Title,
  SubtitleContainer,
  SubTitle
} from './styles';

import theme from '@themes/theme';

type Props = {
  onValueChnage: () => void;
  value: boolean;
  isEnabled: boolean;
  title: string;
  subTitle?: string;
  icon: string;
  color: string;
}

export function ButtonToggle({
  onValueChnage,
  value,
  isEnabled,
  title,
  subTitle,
  icon,
  color
}: Props) {
  return (
    <Container>
      <TitleContainer>
        <Icon color={color} name={icon} />
        <Title>{title}</Title>
      </TitleContainer>
      <SubtitleContainer>
        <SubTitle>{subTitle}</SubTitle>
        <Switch
          trackColor={{false: '#767577', true: theme.colors.title}}
          thumbColor={isEnabled ? theme.colors.primary : '#f4f3f4'}
          ios_backgroundColor='#3e3e3e'
          onValueChange={onValueChnage}
          value={value}
        />
      </SubtitleContainer>
    </Container>
  )
}