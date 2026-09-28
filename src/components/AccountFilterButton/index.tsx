import React, { useRef } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { FilterButton } from '@components/FilterButton';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';
import { AccountFilterSelect } from '@screens/AccountFilterSelect';

import { getAccountsFilterLabel } from '@utils/accountsFilter';
import { useSelectedAccountsFilter } from '@stores/selectedAccountsFilterStorage';

/**
 * Accounts filter pill for the Home header. Encapsulates the pill (the same
 * FilterButton as the period selector), the accounts bottom sheet and the
 * label derivation; filtering the transactions is the parent's job.
 */
export function AccountFilterButton() {
  const accountFilterBottomSheetRef = useRef<BottomSheetModal>(null);

  const selectedAccountsFilter = useSelectedAccountsFilter(
    (state) => state.selectedAccountsFilter
  );

  function handleOpenAccountFilterModal() {
    accountFilterBottomSheetRef.current?.present();
  }

  return (
    <>
      <FilterButton
        title={getAccountsFilterLabel(selectedAccountsFilter)}
        onPress={handleOpenAccountFilterModal}
      />

      <ModalViewSelection
        title='Selecione as contas'
        bottomSheetRef={accountFilterBottomSheetRef}
        snapPoints={['75%']}
      >
        <AccountFilterSelect />
      </ModalViewSelection>
    </>
  );
}
