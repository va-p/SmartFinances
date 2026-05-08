# SmartFinances — Coding Conventions

## File & Folder Naming

- **Components:** PascalCase folder + `index.tsx` (e.g., `TransactionListItem/index.tsx`)
- **Screens:** PascalCase folder + `index.tsx` (e.g., `Home/index.tsx`) — used internally; Expo Router maps to `src/app/` routes
- **Hooks:** camelCase, prefixed with `use` (e.g., `useTransactionsQuery.ts`)
- **Stores:** camelCase, suffixed with `Storage` or `Store` (e.g., `userConfigsStorage.ts`, `currenciesStore.ts`)
- **Interfaces:** camelCase filename (e.g., `transactions.ts`); PascalCase type names (e.g., `TransactionProps`)
- **Utils:** camelCase (e.g., `formatCurrency.ts`)
- **Enums:** camelCase filename, `eEnumName` convention (e.g., `eUrl`)

---

## Component Pattern

```tsx
// src/components/MyComponent/index.tsx
import React from 'react';
import { useTheme } from 'styled-components';
import { ThemeProps } from '@interfaces/theme';
import { Container, Title } from './styles';

interface Props {
  title: string;
}

export function MyComponent({ title }: Props) {
  const theme = useTheme() as ThemeProps;
  return (
    <Container>
      <Title>{title}</Title>
    </Container>
  );
}
```

- Always use **named exports** for components
- Cast `useTheme()` as `ThemeProps` for type safety
- Keep styles in a co-located `styles.ts` using `styled-components/native`

---

## TanStack Query Hook Pattern

```ts
// Query
export function useEntityQuery() {
  return useQuery({
    queryKey: ['entity'],
    queryFn: getEntityFn,
  });
}

// Mutation with optimistic update
export function useCreateEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEntityFn,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['entity'] });
      const previous = queryClient.getQueryData<Entity[]>(['entity']);
      queryClient.setQueryData<Entity[]>(['entity'], (old = []) => [
        { ...newItem, id: `temp-${Date.now()}` },
        ...old,
      ]);
      return { previous };
    },
    onError: (err, item, context) => {
      if (context?.previous) queryClient.setQueryData(['entity'], context.previous);
      Alert.alert('Erro', '...');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['entity'] }),
  });
}
```

---

## Zustand Store Pattern

```ts
import { create } from 'zustand';

type MyStore = {
  value: string;
  setValue: (v: string) => void;
};

export const useMyStore = create<MyStore>((set) => ({
  value: '',
  setValue: (v) => set(() => ({ value: v })),
}));
```

- Prefer `set(() => ({ ... }))` over `set({ ... })` for functional updates
- Stores that need persistence read/write from MMKV manually (no middleware)

---

## MMKV Persistence Pattern

```ts
// Write
storageConfig.set(`${DATABASE_CONFIGS}.someKey`, value);

// Read
const value = storageConfig.getBoolean(`${DATABASE_CONFIGS}.someKey`);

// Sync to Zustand
useMyStore.setState(() => ({ someKey: value }));
```

Three MMKV instances: `storageUser`, `storageToken`, `storageConfig`

---

## API Calls

- All HTTP calls go through `api` from `@api/api` (Axios instance pointing to the custom Node.js backend)
- The Axios `baseURL` is set to `https://api.smartfinances.com.br/api/v1` — configure in `src/api/api.ts`
- No raw `fetch()` calls — always use the Axios instance
- Currency quotes use `apiQuotes` from `@api/apiQuotes` (separate Axios instance)
- Endpoint paths are the resource name without prefix (Axios baseURL already includes `/api/v1`)
  - e.g., `api.get('transaction')`, `api.post('account')`, `api.get('auth/me')`
- The backend `authenticate` middleware accepts both Clerk session tokens and the custom JWT stored in MMKV

---

## Forms

- All forms use **React Hook Form** + **Yup** validation
- Use `useForm<FormData>()` and `@hookform/resolvers/yup`
- Form input components live in `src/components/Form/`

---

## Theming

```ts
// Access theme in styled components
const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
`;

// Access theme in components
const theme = useTheme() as ThemeProps;
```

Theme tokens:
- `colors.primary` — brand orange `rgb(255, 170, 41)`
- `colors.background` — screen background
- `colors.success` — green for income
- `colors.attention` — red for expenses
- `fonts.regular/medium/bold` — Poppins variants
- See `lightTheme.ts` / `darkTheme.ts` for full token reference

---

## Routing (Expo Router)

- **Navigate:** `router.push('/path')` or `router.replace('/path')`
- **Dynamic routes:** `[entityId].tsx` → access via `useLocalSearchParams()`
- **Go back:** `router.back()`
- Route groups `(auth)` and `(app)` do NOT appear in the URL path
- Layouts use `<Stack>` or `<Tabs>` from `expo-router`

---

## Linting & Formatting

- ESLint config: `.eslintrc.json` (TypeScript + React + React Native rules)
- Prettier config: `.prettierrc.json`
- Run: `yarn lint`
- Patches via `patch-package`: applied automatically on `yarn install` via `postinstall`
