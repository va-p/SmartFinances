import React, { ReactNode, useEffect, useState } from 'react';
import { ViewProps } from 'react-native';
import { Container } from './styles';

type HeaderRootProps = ViewProps & {
  children: ReactNode | ReactNode[];
};

export function HeaderRoot({ children, ...rest }: HeaderRootProps) {
  const [childsCount, setChildsCount] = useState(0);

  useEffect(() => {
    // React.Children.toArray filters out null, undefined, and false
    // (conditionally rendered children that aren't shown), so we get
    // the count of only the actually-rendered elements.
    const realCount = React.Children.toArray(children).length;
    setChildsCount(realCount || 1);
  }, [children]);

  return (
    <Container childsCount={childsCount} {...rest}>
      {children}
    </Container>
  );
}
