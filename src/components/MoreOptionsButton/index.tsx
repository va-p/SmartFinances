import React from 'react';
import {
  Container,
  Content,
  DetailsContainer,
  Icon,
  Title,
  IconChevronForward
} from './styles';

import { RectButtonProps } from 'react-native-gesture-handler';

type Props = RectButtonProps & {
  icon: string;
  title: string;
}

export function MoreOptionsButton({ icon, title, ...rest }: Props) {
  return (
    <Container >
      <Content {...rest}>
        <DetailsContainer>
          <Icon name={icon} />
          <Title>{title}</Title>
        </DetailsContainer>
      <IconChevronForward name='chevron-forward-outline'/>
      </Content>
    </Container>
  );
}