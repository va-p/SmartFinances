import React, { ReactNode, useEffect, useState } from 'react';
import { ViewProps } from 'react-native';
import { Container } from './styles';

type HeaderRootProps = ViewProps & {
  children: ReactNode | ReactNode[];
  justifyContent?: 'center' | 'flex-start' | 'space-between';
};

export function HeaderRoot({
  children,
  justifyContent = undefined,
  ...rest
}: HeaderRootProps) {
  const [childsCount, setChildsCount] = useState(0);

  useEffect(() => {
    // React.Children.toArray filters out null, undefined, and false
    // (conditionally rendered children that aren't shown), so we get
    // the count of only the actually-rendered elements.
    const realCount = React.Children.toArray(children).length;
    setChildsCount(realCount || 1);
  }, [children]);

  return (
    <Container
      childsCount={childsCount}
      justifyContent={justifyContent}
      {...rest}
    >
      {children}
    </Container>
  );
}
