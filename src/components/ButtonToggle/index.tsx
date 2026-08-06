import React from 'react';
import { Platform, Switch } from 'react-native';
import {
  Container,
  TitleContainer,
  Title,
  SubtitleContainer,
  SubTitle,
} from './styles';

import { useTheme } from 'styled-components';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  onValueChange: () => void;
  value: boolean;
  isEnabled: boolean;
  title: string;
  subTitle?: string;
  icon: any;
};

export function ButtonToggle({
  onValueChange,
  value,
  isEnabled,
  title,
  subTitle,
  icon,
}: Props) {
  const theme = useTheme() as ThemeProps;
  const isAndroid = Platform.OS === 'android';

  return (
    <Container>
      <TitleContainer>
        {icon}
        <Title>{title}</Title>
      </TitleContainer>
      <SubtitleContainer>
        <SubTitle>{subTitle}</SubTitle>
        <Switch
          trackColor={{ false: undefined, true: isAndroid ? '#ABA39A' : theme.colors.primary }}
          thumbColor={isAndroid && isEnabled ? theme.colors.primary : undefined}
          ios_backgroundColor={theme.colors.border}
          onValueChange={onValueChange}
          value={value}
        />
      </SubtitleContainer>
    </Container>
  );
}
