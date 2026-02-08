import { create } from 'zustand';

interface TransactionsStore {
  selectedTransactions: number[];
  toggleTransaction: (id: number) => void;
  clearSelection: () => void;
  setSelectedTransactions: (ids: number[]) => void;
  isSelected: (id: number) => boolean;
}

const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  selectedTransactions: [],
  toggleTransaction: (id) =>
    set((state) => ({
      selectedTransactions: state.selectedTransactions.includes(id)
        ? state.selectedTransactions.filter((txId) => txId !== id)
        : [...state.selectedTransactions, id],
    })),
  clearSelection: () => set({ selectedTransactions: [] }),
  setSelectedTransactions: (ids) => set({ selectedTransactions: ids }),
  isSelected: (id) => get().selectedTransactions.includes(id),
}));

// Selectors for optimized subscriptions
export const useSelectedTransactionsCount = () =>
  useTransactionsStore((state) => state.selectedTransactions.length);

export const useIsTransactionSelected = (id: number) =>
  useTransactionsStore((state) => state.selectedTransactions.includes(id));

export const useSelectedTransactions = () =>
  useTransactionsStore((state) => state.selectedTransactions);

export const useToggleTransaction = () =>
  useTransactionsStore((state) => state.toggleTransaction);

export const useClearSelection = () =>
  useTransactionsStore((state) => state.clearSelection);

export default useTransactionsStore;
