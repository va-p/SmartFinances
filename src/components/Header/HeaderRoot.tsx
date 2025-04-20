import React, { ReactNode, useEffect, useState } from 'react';
import { ViewProps } from 'react-native';
import { Container } from './styles';

type HeaderRootProps = ViewProps & {
  children: ReactNode | ReactNode[];
};

export function HeaderRoot({ children, ...rest }: HeaderRootProps) {
  const [childsCount, setChildsCount] = useState(0);

  useEffect(() => {
    function countChildren() {
      if (children?.length && children.length > 1) {
        setChildsCount(children.length);
      }

      if (!children?.length) {
        setChildsCount(1);
      }
    }

    countChildren();
  }, [children]);

  return (
    <Container childsCount={childsCount} {...rest}>
      {children}
    </Container>
  );
}
