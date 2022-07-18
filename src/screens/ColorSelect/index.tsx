import React from 'react';
import {
  Container,
  ColorContainer,
  Color,
  Footer
} from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { ColorProps } from '@components/CategoryListItem';
import { Button } from '@components/Form/Button';

import { colors } from '@utils/colors';

type Props = {
  color: ColorProps;
  setColor: (color: ColorProps) => void;
  closeSelectColor: () => void;
}

export function ColorSelect({
  color,
  setColor,
  closeSelectColor
}: Props) {
  function handleColorSelect(color: ColorProps) {
    setColor(color);
  }

  return (
    <Container>
      <FlatList
        data={colors}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ColorContainer color={item.hex} isActive={color.id === item.id}>
            <Color
              color={item.hex}
              isActive={color.id === item.id}
              onPress={() => handleColorSelect(item)}
            />
          </ColorContainer>
        )}
        numColumns={7}
        contentContainerStyle={{
          alignItems: 'center',
        }}
        style={{
          flex: 1,
          width: '100%',
          padding: 10
        }}
      />

      <Footer>
        <Button
          type='secondary'
          title="Selecionar"
          onPress={closeSelectColor}
        />
      </Footer>
    </Container>
  )
}