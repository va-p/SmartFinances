import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';

import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import FunnelIcon from 'phosphor-react-native/src/icons/Funnel';

import { SortingOptions } from '@screens/SortingOptions';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

import { ThemeProps } from '@interfaces/theme';
import { SortingOption } from '@stores/userConfigsStorage';

type Props = {
  selectedOption: SortingOption;
  onSelect: (option: SortingOption) => void;
};

/**
 * Funnel button that opens the account sorting bottom sheet. Shared by the
 * Accounts and AccountsList screens; persistence of the selected option is
 * the parent's responsibility.
 */
export function SortFilterButton({ selectedOption, onSelect }: Props) {
  const theme = useTheme() as ThemeProps;
  const sortingBottomSheetRef = useRef<BottomSheetModal>(null);

  function handleSortingPress() {
    sortingBottomSheetRef.current?.present();
  }

  function handleCloseSortingModal() {
    sortingBottomSheetRef.current?.dismiss();
  }

  return (
    <>
      <TouchableOpacity onPress={handleSortingPress} style={{ padding: 8 }}>
        <FunnelIcon size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <ModalViewSelection
        title='Selecione a ordenação'
        bottomSheetRef={sortingBottomSheetRef}
        snapPoints={['50%']}
      >
        <SortingOptions
          selectedOption={selectedOption}
          onSelect={onSelect}
          handleClose={handleCloseSortingModal}
        />
      </ModalViewSelection>
    </>
  );
}
