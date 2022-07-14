import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface AmountBrlState {
  revenues: {
    amount: string;
  };
  expenses: {
    amount: string;
  };
  total: {
    amount: string;
  };
}

// Define the initial state using that type
const initialState: AmountBrlState = {
  revenues: {
    amount: 'R$0',
  },
  expenses: {
    amount: 'R$0',
  },
  total: {
    amount: 'R$0',
  }
};

export const amountBrlSlice = createSlice({
  name: 'amountBrl',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setRevenuesBrl: (state, action: PayloadAction<AmountBrlState['revenues']>) => {
      state.revenues = action.payload;
    },
    setExpensesBrl: (state, action: PayloadAction<AmountBrlState['expenses']>) => {
      state.expenses = action.payload;
    },
    setTotalBrl: (state, action: PayloadAction<AmountBrlState['total']>) => {
      state.total = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setRevenuesBrl,
  setExpensesBrl,
  setTotalBrl
} = amountBrlSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectRevenuesBrl = (state: RootState) => state.amountBrl.revenues;
export const selectExpensesBrl = (state: RootState) => state.amountBrl.expenses;
export const selectTotalBrl = (state: RootState) => state.amountBrl.total;

export default amountBrlSlice.reducer;