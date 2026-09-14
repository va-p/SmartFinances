import * as Yup from 'yup';

// Account types that, in practice, always have a real financial institution
// behind them (per account-institutions context.md decision #2 / AC11.3) —
// the institution field is required for these, optional for the rest (AC11.4).
export const ACCOUNT_TYPES_REQUIRING_INSTITUTION = [
  'BANK',
  'INVESTMENTS',
  'CREDIT',
];

const CREDIT_TYPE = 'CREDIT';

export type FormData = {
  name: string;
  currency: string;
  balance: number;
  type?: string;
  institution_id?: string | null;
  credit_card_brand?: string;
  credit_card_close_day?: number | string;
  credit_card_credit_limit?: number | string;
  credit_card_available_credit_limit?: number | string | null;
};

// An empty optional numeric input must validate as null (absent), not as a
// type error — yup otherwise fails '' with NaN before `nullable()` applies.
const emptyToNull = (
  value: unknown,
  originalValue: unknown
): unknown =>
  originalValue === '' || originalValue === null || originalValue === undefined
    ? null
    : value;

/* Validation Form - Start */
export const schema = Yup.object().shape({
  name: Yup.string().required('Digite o nome da conta'),
  balance: Yup.number()
    .required('Digite o saldo da conta')
    .typeError('Digite um valor numérico'),
  type: Yup.string(),
  institution_id: Yup.string()
    .nullable()
    .when('type', {
      is: (type: string) =>
        ACCOUNT_TYPES_REQUIRING_INSTITUTION.includes(type),
      then: (currentSchema) =>
        currentSchema.required('Selecione a instituição financeira'),
    }),

  // Credit card fields — captured only for manual CREDIT accounts
  // (feature register-credit-card-fields, spec CC-03..CC-05): brand, closing
  // day and total limit are required while the type is CREDIT; the available
  // limit is optional.
  credit_card_brand: Yup.string().when('type', {
    is: CREDIT_TYPE,
    then: (currentSchema) =>
      currentSchema.required('Digite a bandeira do cartão'),
  }),
  credit_card_close_day: Yup.number()
    .typeError('Digite o dia de fechamento da fatura')
    .when('type', {
      is: CREDIT_TYPE,
      then: (currentSchema) =>
        currentSchema
          .required('Digite o dia de fechamento da fatura')
          .integer('O dia de fechamento deve ser um número inteiro')
          .min(1, 'O dia de fechamento deve estar entre 1 e 31')
          .max(31, 'O dia de fechamento deve estar entre 1 e 31'),
    }),
  credit_card_credit_limit: Yup.number()
    .typeError('Digite um valor numérico')
    .when('type', {
      is: CREDIT_TYPE,
      then: (currentSchema) =>
        currentSchema
          .required('Digite o limite total do cartão')
          .min(0, 'O limite total não pode ser negativo'),
    }),
  credit_card_available_credit_limit: Yup.number()
    .nullable()
    .transform(emptyToNull)
    .typeError('Digite um valor numérico')
    .when('type', {
      is: CREDIT_TYPE,
      then: (currentSchema) =>
        currentSchema.min(0, 'O limite disponível não pode ser negativo'),
    }),
});
/* Validation Form - End */
