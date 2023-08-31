import React from 'react';

import { render } from '@testing-library/react-native';
import { SignUp } from '@screens/SignUp';

describe('SignUp Screen', () => {
  it('should render signup screen correctly', () => {
    const { getByPlaceholderText } = render(<SignUp />);

    const inputEmail = getByPlaceholderText('E-mail');

    expect(inputEmail).toBeTruthy();
  });
});
