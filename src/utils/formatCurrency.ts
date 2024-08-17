function formatCurrency(currencyCode: string, value: number, isConverted = true) {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
  };

  // Specific format to BTC
  if (currencyCode === 'BTC') {
    options.minimumFractionDigits = isConverted ? 6 : 8;
    options.maximumSignificantDigits = isConverted ? 6 : 8;
  }

  return value.toLocaleString('pt-BR', options);
}

export default formatCurrency;
