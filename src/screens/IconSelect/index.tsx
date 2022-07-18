import React from 'react';
import {
  Container,
  IconContainer,
  Icon,
  Footer
} from './styles';

import { FlatList } from 'react-native-gesture-handler';

import { IconProps } from '@components/CategoryListItem';
import { Button } from '@components/Form/Button';

import { icons } from '@utils/icons';

type Props = {
  icon: IconProps;
  setIcon: (icon: IconProps) => void;
  closeSelectIcon: () => void;
}

export function IconSelect({
  icon,
  setIcon,
  closeSelectIcon
}: Props) {
  function handleIconSelect(icon: IconProps) {
    setIcon(icon);
  }

  return (
    <Container>
      <FlatList
        data={icons}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <IconContainer icon={item.name} isActive={icon.id === item.id}>
            <Icon
              name={item.name}
              isActive={icon.id === item.id}
              onPress={() => handleIconSelect(item)}
            />
          </IconContainer>
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
          onPress={closeSelectIcon}
        />
      </Footer>
    </Container>
  )
}