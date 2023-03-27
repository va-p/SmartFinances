import { CategoryProps } from '@components/CategoryListItem';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define a type for the slice state
interface budgetCategoriesSelectedState {
  budgetCategoriesSelected: CategoryProps[];
}

// Define the initial state using that type
const initialState: budgetCategoriesSelectedState = {
  budgetCategoriesSelected: [],
};

export const budgetCategoriesSelectedSlice = createSlice({
  name: 'budgetCategoriesSelected',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setBudgetCategoriesSelected: (
      state,
      action: PayloadAction<
        budgetCategoriesSelectedState['budgetCategoriesSelected']
      >
    ) => {
      state.budgetCategoriesSelected = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setBudgetCategoriesSelected } =
  budgetCategoriesSelectedSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectBudgetCategoriesSelected = (state: RootState) =>
  state.budgetCategoriesSelected.budgetCategoriesSelected;

export default budgetCategoriesSelectedSlice.reducer;
