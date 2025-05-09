import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ViewToken } from 'react-native';
import { Container, MonthSelectButton, PeriodRulerList } from './styles';

import CaretLeft from 'phosphor-react-native/src/icons/CaretLeft';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';

import { PeriodRulerListItem } from './components/PeriodRulerListItem';

import theme from '@themes/theme';

interface PeriodRulerListItem {
  date: string;
  isActive: boolean;
}

type Props = {
  handleDateChange: (direction: 'prev' | 'next') => void;
  handlePressDate: (stringDate: string) => void;
  dates: PeriodRulerListItem[];
  periodRulerListColumnWidth: number;
  horizontalPadding?: number;
};

export function PeriodRuler({
  dates,
  handleDateChange,
  handlePressDate,
  periodRulerListColumnWidth,
  horizontalPadding = 32,
}: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [initialScrollComplete, setInitialScrollComplete] = useState(false);

  const getItemLayout = (_: any, index: number) => {
    return {
      length: periodRulerListColumnWidth,
      offset: periodRulerListColumnWidth * index,
      index,
    };
  };

  useEffect(() => {
    const findActiveIndex = () => {
      const index = dates.findIndex((item) => item.isActive);
      return index !== -1 ? index : 0;
    };

    if (initialScrollComplete && dates.length > 0) {
      const activeIndex = findActiveIndex();
      flatListRef.current?.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [dates, initialScrollComplete]);

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (!initialScrollComplete && viewableItems.length > 0) {
      setInitialScrollComplete(true);
    }
  };

  return (
    <Container horizontalPadding={horizontalPadding}>
      <MonthSelectButton onPress={() => handleDateChange('prev')}>
        <CaretLeft size={18} color={theme.colors.text} />
      </MonthSelectButton>
      <PeriodRulerList
        ref={flatListRef}
        data={dates}
        keyExtractor={(_: any, idx: number) => String(idx)}
        getItemLayout={getItemLayout}
        renderItem={({ item }: any) => (
          <PeriodRulerListItem
            data={item}
            width={periodRulerListColumnWidth}
            onPress={handlePressDate}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 1,
          waitForInteraction: false,
        }}
      />
      <MonthSelectButton onPress={() => handleDateChange('next')}>
        <CaretRight size={18} color={theme.colors.text} />
      </MonthSelectButton>
    </Container>
  );
}
