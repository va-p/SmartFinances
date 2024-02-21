function formatCurrency(currencyCode: string, value: number) {
  let valueFormatted = '';

  return {
    formatAmountConverted() {
      switch (currencyCode) {
        case 'BRL':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          return valueFormatted;
        case 'BTC':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BTC',
            minimumFractionDigits: 6,
            maximumSignificantDigits: 6,
          });
          return valueFormatted;
        case 'EUR':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'EUR',
          });
          return valueFormatted;
        case 'USD':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'USD',
          });
          return valueFormatted;
      }
    },
    formatAmountNotConverted() {
      switch (currencyCode) {
        case 'BRL':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          return valueFormatted;
        case 'BTC':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BTC',
            minimumFractionDigits: 8,
            maximumSignificantDigits: 8,
          });
          return valueFormatted;
        case 'EUR':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'EUR',
          });
          return valueFormatted;
        case 'USD':
          valueFormatted = Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'USD',
          });
          return valueFormatted;
      }
    },
  };
}

export default formatCurrency;
