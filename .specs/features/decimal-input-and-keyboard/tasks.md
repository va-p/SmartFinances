# Tasks — Decimal Input Normalization & Keyboard UX

## Task Dependency Graph

```
T1 (utility) ──┬── T2 (ControlledInputValue)
               └── T3 (ControlledInputWithIcon)
                          │
T5 (Screen tap-dismiss) ──┤
                          │
          T4 (screens: keyboardType + Yup)
          T6 (RegisterTransaction KeyboardAvoidingView)
```

T1 must be done first (dependency for T2, T3). T2 and T3 depend on T1. T4, T5, T6 are independent of each other and of T2/T3 (they don't need the utility) — but T4 is logically grouped with T2/T3.

## Tasks

### T1 — Create `parseDecimalInput` utility + tests
**Requirements**: R1
**Files**: `src/utils/parseDecimalInput.ts` (new)
**Dependencies**: None

**Implementation**:
1. Create `src/utils/parseDecimalInput.ts`
2. Export a function `parseDecimalInput(text: string): string`
3. Algorithm:
   - Find `lastIndexOf(',')` and `lastIndexOf('.')`
   - If last comma > last dot → pt-BR style: strip dots, replace last comma with dot
   - If last dot > last comma → US style: strip commas
   - If only commas present → replace all commas with dots
   - If only dots present → return as-is (already normalized)
   - If neither → return as-is (integer)
4. Write unit tests covering cases:
   - `"12,34"` → `"12.34"`
   - `"12.34"` → `"12.34"`
   - `"1234"` → `"1234"`
   - `"1.234,56"` → `"1234.56"` (pt-BR pasted)
   - `"1,234.56"` → `"1234.56"` (US pasted)
   - `""` → `""`
   - `"0,5"` → `"0.5"`
   - `",5"` → `".5"` (partial input: user started with comma)
   - `"1,"` → `"1."` (partial input: user typed comma but no decimal yet)

**Verification**:
- Utility function is a pure function (no side effects, no RN imports)
- All test cases pass

**Commit message**: `feat: add parseDecimalInput utility for locale-agnostic decimal parsing`

---

### T2 — Update `ControlledInputValue` to use the utility
**Requirements**: R2
**Files**: `src/components/Form/ControlledInputValue/index.tsx`
**Dependencies**: T1

**Implementation**:
1. Import `parseDecimalInput` from `@utils/parseDecimalInput`
2. Replace the inline `onChangeText={(text) => onChange(text.replace(',', '.'))}` with `onChangeText={(text) => onChange(parseDecimalInput(text))}`

**Verification**:
- Component still renders and accepts input
- Both comma and dot decimal inputs are normalized to dot
- Existing transaction amount inputs on `RegisterTransaction` continue working

**Commit message**: `refactor: use parseDecimalInput utility in ControlledInputValue`

---

### T3 — Add decimal normalization to `ControlledInputWithIcon`
**Requirements**: R3
**Files**: `src/components/Form/ControlledInputWithIcon/index.tsx`
**Dependencies**: T1

**Implementation**:
1. Import `parseDecimalInput` from `@utils/parseDecimalInput`
2. In the `onChangeText` handler, check if `rest.keyboardType` is `'decimal-pad'` or `'numeric'`
3. If yes, wrap in `parseDecimalInput`: `onChangeText={(text) => onChange(numericKeyboard ? parseDecimalInput(text) : text)}`
4. Extract `numericKeyboard` as a boolean: `const isNumericKeyboard = rest.keyboardType === 'decimal-pad' || rest.keyboardType === 'numeric'`

**Verification**:
- Balance input on `RegisterAccount` accepts comma and normalizes to dot
- Name input (no keyboardType) is unaffected
- Amount input on `RegisterBudget` accepts comma and normalizes to dot

**Commit message**: `feat: normalize comma decimal separator in ControlledInputWithIcon`

---

### T4 — Fix keyboardType + Yup messages on decimal screens
**Requirements**: R4, R5
**Files**: `src/screens/RegisterAccount/index.tsx`, `src/screens/RegisterBudget/index.tsx`
**Dependencies**: None (can be done in parallel with T2/T3, but benefits from T3 for full end-to-end fix)

**Implementation**:
1. `RegisterAccount/index.tsx`: Change balance input `keyboardType='numeric'` → `keyboardType='decimal-pad'`
2. `RegisterAccount/index.tsx`: Change Yup balance typeError from `'Digite somente números e pontos.'` to `'Digite um valor numérico'`
3. `RegisterBudget/index.tsx`: Change amount input `keyboardType='numeric'` → `keyboardType='decimal-pad'`

**Verification**:
- RegisterAccount balance input shows decimal-pad keyboard with decimal separator on iOS
- Yup validation error message is locale-agnostic
- RegisterBudget amount input shows decimal-pad keyboard

**Commit message**: `fix: use decimal-pad keyboard and update validation messages for decimal inputs`

---

### T5 — Add global tap-outside-to-dismiss-keyboard
**Requirements**: R7
**Files**: `src/components/Screen/index.tsx`, `src/components/Screen/styles.ts`
**Dependencies**: None

**Implementation**:
1. In `Screen/index.tsx`: Import `TouchableWithoutFeedback`, `Keyboard` from `react-native`
2. Wrap `Container` children in `<TouchableWithoutFeedback onPress={Keyboard.dismiss}>`
3. Ensure the touchable is accessible (no `pointerEvents` issues)
4. The `SafeAreaView` inside `Container` should still work correctly

**Verification**:
- Opening any screen with inputs, tapping outside dismisses keyboard
- Bottom sheet modals still work (they have their own touch handling)
- ScrollView/flatlist scrolling is not affected (TouchableWithoutFeedback passes through to scroll)

**Commit message**: `feat: dismiss keyboard on tap outside for all screens`

---

### T6 — Add `KeyboardAvoidingView` to `RegisterTransaction`
**Requirements**: R8, R9
**Files**: `src/screens/RegisterTransaction/styles.ts`
**Dependencies**: None

**Implementation**:
1. Import `Platform` from `react-native` in `styles.ts` if not already imported
2. Change `Container` from `styled.View` to `styled.KeyboardAvoidingView`
3. Add `behavior` prop: In the component JSX, add `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` to the `<Container>` element
4. Since `Container` is a styled component, the `behavior` prop is passed as a standard prop (RN's `KeyboardAvoidingView` accepts it)

**Verification**:
- On iOS: when editing transaction amount, the header shifts up so the input is visible
- On Android: height behavior adjusts layout
- `ContentScroll` below header scrolls correctly when keyboard is open
- No visual regression on the transaction form layout

**Commit message**: `fix: add KeyboardAvoidingView to RegisterTransaction screen`

---

## Execution Order

```
Batch 1 (sequential, dependencies):
  T1 → T2, T3 (can run T2 and T3 in parallel after T1)
  T4, T5, T6 (all independent, can run in any order or parallel)

Total: 6 tasks, fits in a single batch
```

## Summary

| Task | Files Changed | Est. Complexity |
|------|--------------|-----------------|
| T1 | 1 new | Low |
| T2 | 1 edit | Low |
| T3 | 1 edit | Low |
| T4 | 2 edits | Low |
| T5 | 1-2 edits | Low |
| T6 | 1 edit | Low |

All tasks are low complexity — surgical changes to well-understood files.
