type Props = {
  currencyCode: string;
  value: number | string;
  isConverted?: boolean;
  withFraction?: boolean;
};

function formatCurrency(
  currencyCode: string,
  value: number,
  isConverted = true,
  withFraction = true
) {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: withFraction ? 2 : 0,
    maximumFractionDigits: withFraction ? 2 : 0,
  };

  // Specific format to BTC
  if (currencyCode === 'BTC') {
    options.minimumFractionDigits = isConverted ? 6 : 8;
    options.maximumSignificantDigits = isConverted ? 6 : 8;
  }

  return value.toLocaleString('pt-BR', options);
}

export default formatCurrency;
