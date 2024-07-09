import { create } from 'zustand';

import { CategoryProps } from '@interfaces/categories';

type BudgetCategoriesSelected = {
  budgetCategoriesSelected: CategoryProps[];
  setBudgetCategoriesSelected: (categories: CategoryProps[]) => void;
};

export const useBudgetCategoriesSelected = create<BudgetCategoriesSelected>(
  (set) => ({
    budgetCategoriesSelected: [],
    setBudgetCategoriesSelected: (categories: CategoryProps[]) =>
      set(() => ({ budgetCategoriesSelected: categories })),
  })
);
