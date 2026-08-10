import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Container, OptionRow, OptionLabel, CheckmarkContainer } from './styles';

import { useTheme } from 'styled-components';
import Check from 'phosphor-react-native/src/icons/Check';

import { ThemeProps } from '@interfaces/theme';

type SortingOption = 'name-asc' | 'name-desc' | 'balance-asc' | 'balance-desc';

type OptionConfig = {
  value: SortingOption;
  label: string;
};

const OPTIONS: OptionConfig[] = [
  { value: 'name-asc', label: 'Nome (A → Z)' },
  { value: 'name-desc', label: 'Nome (Z → A)' },
  { value: 'balance-asc', label: 'Saldo (menor → maior)' },
  { value: 'balance-desc', label: 'Saldo (maior → menor)' },
];

type Props = {
  selectedOption: SortingOption;
  onSelect: (option: SortingOption) => void;
  handleClose: () => void;
};

export function SortingOptions({ selectedOption, onSelect, handleClose }: Props) {
  const theme = useTheme() as ThemeProps;

  function handlePress(option: SortingOption) {
    onSelect(option);
    handleClose();
  }

  return (
    <Container>
      {OPTIONS.map((option) => {
        const isSelected = option.value === selectedOption;

        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.6}
            onPress={() => handlePress(option.value)}
          >
            <OptionRow>
              <OptionLabel isSelected={isSelected}>{option.label}</OptionLabel>
              {isSelected && (
                <CheckmarkContainer>
                  <Check size={20} color={theme.colors.primary} weight="bold" />
                </CheckmarkContainer>
              )}
            </OptionRow>
          </TouchableOpacity>
        );
      })}
    </Container>
  );
}
