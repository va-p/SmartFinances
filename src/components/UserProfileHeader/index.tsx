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
      <Avatar urlImage='https://avatars.githubusercontent.com/u/86264374?s=400&u=1f5068f1cd425601df99567d3419c77a6fab80f9&v=4' />

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