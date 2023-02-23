import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface AccountState {
  accountId: string;
  accountName: string | null;
  accountCurrency: {
    code: string | null;
    symbol: string | null;
  };
  accountInitialAmount: number;
  accountTotalRevenues: string | null;
  accountTotalExpenses: string | null;
  accountTotalAmount: string | null;
  accountTenantId: number | null;
};

// Define the initial state using that type
const initialState: AccountState = {
  accountId: '',
  accountName: null,
  accountCurrency: {code: null, symbol: null},
  accountInitialAmount: 0,
  accountTotalRevenues: null,
  accountTotalExpenses: null,
  accountTotalAmount: "R$0",
  accountTenantId: null
};

export const accountSlice = createSlice({
  name: 'account',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setAccountId: (state, action: PayloadAction<AccountState['accountId']>) => {
      state.accountId = action.payload;
    },
    setAccountName: (state, action: PayloadAction<AccountState['accountName']>) => {
      state.accountName = action.payload;
    },
    setAccountCurrency: (state, action: PayloadAction<AccountState['accountCurrency']>) => {
      state.accountCurrency = action.payload;
    },
    setAccountInitialAmount: (state, action: PayloadAction<AccountState['accountInitialAmount']>) => {
      state.accountInitialAmount = action.payload;
    },
    setAccountTotalRevenues: (state, action: PayloadAction<AccountState['accountTotalRevenues']>) => {
      state.accountTotalRevenues = action.payload;
    },
    setAccountTotalExpenses: (state, action: PayloadAction<AccountState['accountTotalExpenses']>) => {
      state.accountTotalExpenses = action.payload;
    },
    setAccountTotalAmount: (state, action: PayloadAction<AccountState['accountTotalAmount']>) => {
      state.accountTotalAmount = action.payload;
    },
    setAccountTenantId: (state, action: PayloadAction<AccountState['accountTenantId']>) => {
      state.accountTenantId = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setAccountId,
  setAccountName,
  setAccountCurrency,
  setAccountInitialAmount,
  setAccountTotalRevenues,
  setAccountTotalExpenses,
  setAccountTotalAmount,
  setAccountTenantId
} = accountSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAccountId = (state: RootState) => state.account.accountId;
export const selectAccountName = (state: RootState) => state.account.accountName;
export const selectAccountCurrency = (state: RootState) => state.account.accountCurrency;
export const selectAccountInitialAmount = (state: RootState) => state.account.accountInitialAmount;
export const selectAccountTotalRevenues = (state: RootState) => state.account.accountTotalRevenues;
export const selectAccountTotalExpenses = (state: RootState) => state.account.accountTotalExpenses;
export const selectAccountTotalAmount = (state: RootState) => state.account.accountTotalAmount;
export const selectAccountTenantId = (state: RootState) => state.account.accountTenantId;

export default accountSlice.reducer;