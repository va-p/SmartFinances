import * as Yup from 'yup';

export type FormData = {
  description: string;
  amount: number;
  amountInAccountCurrency?: number | null;
  exchangeRate?: number | null;
};

// An empty optional numeric input must validate as null (absent), not as a
// type error — yup otherwise fails '' with NaN before `nullable()` applies
// (same trick as RegisterAccount/schema).
const emptyToNull = (
  value: unknown,
  originalValue: unknown
): unknown =>
  originalValue === '' || originalValue === null || originalValue === undefined
    ? null
    : value;

/* Validation Form - Start */
export const schema = Yup.object().shape({
  description: Yup.string().required('Digite a descrição'),
  amount: Yup.number()
    .typeError('Digite um valor numérico')
    .required('Digite o valor'),
  // FX-09 / AC P2-2: derived display of the rate-driven conversion — the
  // screen recomputes it via setValue, so it only needs to be numeric.
  amountInAccountCurrency: Yup.number().nullable(),
  // FX-09 / AC P2-9: the applied rate. Must be positive whenever present;
  // presence-while-converting is enforced at submit time (the schema cannot
  // see the selected-currency/account-currency pair).
  exchangeRate: Yup.number()
    .nullable()
    .transform(emptyToNull)
    .typeError('Digite um valor numérico')
    .positive('A cotação deve ser maior que zero'),
});
/* Validation Form - End */
