import React from 'react';
import { Container} from './styles';

import { ListItem } from '@components/ListItem';

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
  function handlePress(option: SortingOption) {
    onSelect(option);
    handleClose();
  }

  return (
    <Container>
      {OPTIONS.map((option, index) => {
        const isSelected = option.value === selectedOption;

        return (
          <ListItem
            key={option.value}
            data={{ id: index, name: option.label }}
            isActive={isSelected}
            onPress={() => handlePress(option.value)}
          />
        );
      })}
    </Container>
  );
}
