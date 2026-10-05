import React, { RefObject } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { CurrencySelect } from '@screens/CurrencySelect';
import { ModalViewSelection } from '@components/Modals/ModalViewSelection';

import { useUserConfigs } from '@stores/userConfigsStorage';
import { useCurrenciesStore } from '@stores/currenciesStore';
import { filterBaseCurrencyCandidates } from '@utils/baseCurrency';

type Props = {
  bottomSheetRef: RefObject<BottomSheetModal>;
};

// The one base-currency selection flow (BC-06): both entry points (welcome
// step and OptionsMenu) present this sheet, so a selection applies through
// the same store action everywhere.
export function BaseCurrencySelectSheet({ bottomSheetRef }: Props) {
  const baseCurrency = useUserConfigs((state) => state.baseCurrency);
  const setBaseCurrency = useUserConfigs((state) => state.setBaseCurrency);

  const currencies = useCurrenciesStore((state) => state.currencies);
  const items = filterBaseCurrencyCandidates(currencies);

  return (
    <ModalViewSelection
      title='Selecione a moeda base'
      bottomSheetRef={bottomSheetRef}
      snapPoints={['75%']}
    >
      <CurrencySelect
        currency={baseCurrency}
        setCurrency={setBaseCurrency}
        closeSelectCurrency={() => bottomSheetRef.current?.dismiss()}
        items={items}
      />
    </ModalViewSelection>
  );
}
