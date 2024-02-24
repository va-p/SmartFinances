import { useSelector } from 'react-redux';

import {
  selectBrlQuoteBtc,
  selectBrlQuoteEur,
  selectBrlQuoteUsd,
  selectBtcQuoteBrl,
  selectBtcQuoteEur,
  selectBtcQuoteUsd,
  selectEurQuoteBrl,
  selectEurQuoteBtc,
  selectEurQuoteUsd,
  selectUsdQuoteBrl,
  selectUsdQuoteBtc,
  selectUsdQuoteEur,
} from '@slices/quotesSlice';

function ConvertCurrencies(
  accountCurrencyCode: string,
  currencyCode: string,
  amount: string
) {
  const brlQuoteBtc = useSelector(selectBrlQuoteBtc);
  const brlQuoteEur = useSelector(selectBrlQuoteEur);
  const brlQuoteUsd = useSelector(selectBrlQuoteUsd);
  const btcQuoteBrl = useSelector(selectBtcQuoteBrl);
  const btcQuoteEur = useSelector(selectBtcQuoteEur);
  const btcQuoteUsd = useSelector(selectBtcQuoteUsd);
  const eurQuoteBrl = useSelector(selectEurQuoteBrl);
  const eurQuoteBtc = useSelector(selectEurQuoteBtc);
  const eurQuoteUsd = useSelector(selectEurQuoteUsd);
  const usdQuoteBrl = useSelector(selectUsdQuoteBrl);
  const usdQuoteBtc = useSelector(selectUsdQuoteBtc);
  const usdQuoteEur = useSelector(selectUsdQuoteEur);

  let amountConverted = 0;

  switch (accountCurrencyCode) {
    // Converted BTC
    case 'BTC':
      switch (currencyCode) {
        case 'BRL':
          amountConverted = Number(amount) * brlQuoteBtc.price;
          break;
        case 'EUR':
          amountConverted = Number(amount) * eurQuoteBtc.price;
          break;
        case 'USD':
          amountConverted = Number(amount) * usdQuoteBtc.price;
          break;
      }
      break;
    // Converted BRL
    case 'BRL':
      switch (currencyCode) {
        case 'BTC':
          amountConverted = Number(amount) * btcQuoteBrl.price;
          break;
        case 'EUR':
          amountConverted = Number(amount) * eurQuoteBrl.price;
          break;
        case 'USD':
          amountConverted = Number(amount) * usdQuoteBrl.price;
          break;
      }
      break;
    // Converted EUR
    case 'EUR':
      switch (currencyCode) {
        case 'BTC':
          amountConverted = Number(amount) * btcQuoteEur.price;
          break;
        case 'BRL':
          amountConverted = Number(amount) * brlQuoteEur.price;
          break;
        case 'USD':
          amountConverted = Number(amount) * usdQuoteEur.price;
          break;
      }
      break;
    // Converted USD
    case 'USD':
      switch (currencyCode) {
        case 'BTC':
          amountConverted = Number(amount) * btcQuoteUsd.price;
          break;
        case 'BRL':
          amountConverted = Number(amount) * brlQuoteUsd.price;
          break;
        case 'EUR':
          amountConverted = Number(amount) * eurQuoteUsd.price;
          break;
      }
      break;
  }

  console.log('amountConverted in uti >>>', amountConverted);
  return amountConverted;
}

export default ConvertCurrencies;
