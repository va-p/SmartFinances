import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SearchInputContainer, ClearSearchButton } from './styles';

// Dependencies
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { Control } from 'react-hook-form';
import { useTheme } from 'styled-components';

// Icons
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';

// Components
import { ControlledInputWithIcon } from '@components/Form/ControlledInputWithIcon';

// Interfaces
import { ThemeProps } from '@interfaces/theme';

type SearchBarProps = {
  control: Control<any>;
  onClear: () => void;
  // Overrides the container's default horizontal margins on screens whose
  // container already applies the 16px horizontal padding (Home parity keeps
  // the bar 16px from the screen edges on every screen).
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({ control, onClear, style = undefined }: SearchBarProps) {
  const theme = useTheme() as ThemeProps;

  return (
    <Animated.View
      entering={FadeInUp.easing(Easing.bounce).duration(500)}
      exiting={FadeOutUp.easing(Easing.linear)}
    >
      <SearchInputContainer style={style}>
        <ControlledInputWithIcon
          icon={<MagnifyingGlassIcon color={theme.colors.primary} />}
          placeholder='Pesquisar...'
          autoCorrect={false}
          name='search'
          control={control}
        />
        <ClearSearchButton onPress={onClear}>
          <XIcon size={20} color={theme.colors.primary} />
        </ClearSearchButton>
      </SearchInputContainer>
    </Animated.View>
  );
}
