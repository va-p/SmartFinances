import React from 'react';
import { Container } from './styles';

import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

import { UserProfileHeader } from '../UserProfileHeader';

export function CustomDrawerNavigator(props: any) {
  return (
    <Container>
      <UserProfileHeader />

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </Container>
  );
}