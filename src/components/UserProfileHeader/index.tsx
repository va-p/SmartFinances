import React from 'react';
import {
  Container,
  GreetingContainer,
  Greeting,
  UserName
} from './styles';

import { useSelector } from 'react-redux';

import { Avatar } from '../Avatar';

import { selectUserName } from '@slices/userSlice';

export function UserProfileHeader() {
  const userName = useSelector(selectUserName);
  return (
    <Container>
      <Avatar urlImage='http://cdn.onlinewebfonts.com/svg/img_364496.png' />

      <GreetingContainer>
        <Greeting>
          Olá,
        </Greeting>

        <UserName>
          {userName}
        </UserName>
      </GreetingContainer>
    </Container>
  )
}