import React, { useState } from 'react';
import {
  Card,
  CardFooter,
  Icon,
  HideBalanceButton
} from './styles';

import { Balance } from '../Balance';

interface CashFlowCardProps {
  type?: 'show' | 'hide';
  amountIncome: string;
  amountOutcome: string;
  amount: string;
  lastTransaction?: string;
}

const icon = {
  hide: 'eye-outline',
  show: 'eye-off-outline'
}

export function CashFlowCard({
  type,
  amount,
  amountIncome,
  amountOutcome,
}: CashFlowCardProps) {
  const [hideAmount, setHideAmount] = useState(false);

  function handleHideBalance() {
    if (!hideAmount) {
      setHideAmount(true);
    } else {
      setHideAmount(false);
    }
  }

  if (!hideAmount) {
    type = 'show'
  } else {
    type = 'hide'
  }

  return (
    <Card>
      <Balance
        type='total'
        title='Saldo das contas'
        amount={type === 'show' ? amount : '●●●●'}
      />

      <HideBalanceButton onPress={handleHideBalance}>
        <Icon
          name={icon[type]}
          type={type}
        />
      </HideBalanceButton>

      <CardFooter>
        <Balance
          type='up'
          title='Receitas'
          amount={type === 'show' ? amountIncome : '●●●●'}
        />
        <Balance
          type='down'
          title='Despesas'
          amount={type === 'show' ? amountOutcome : '●●●●'}
        />
      </CardFooter>
    </Card>
  )
}