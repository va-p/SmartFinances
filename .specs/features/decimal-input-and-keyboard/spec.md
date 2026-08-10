# Decimal Input Normalization & Keyboard UX

## Summary

Two interrelated input UX issues on iOS (and partially Android):

1. **Decimal separator mismatch**: iOS decimal-pad emits a comma (`,`) depending on device region, but the app's Yup validation and database only accept dot (`.`) as decimal separator. The base currency is BRL (pt-BR locale), which uses comma as decimal and dot as thousands. The `ControlledInputValue` component has a stopgap `replace(',', '.')` but `ControlledInputWithIcon` (used for balance on `RegisterAccount` and amount on `RegisterBudget`) lacks it — causing validation failures on iOS.
2. **Keyboard overlaps content and won't dismiss**: On iOS, the keyboard overlaps text inputs with no automatic content shift, and tapping outside doesn't dismiss it. `RegisterTransaction` lacks `KeyboardAvoidingView` entirely.

## Requirements

### Decimal Input Normalization

#### R1 — Centralized Decimal Parsing Utility
Create a `parseDecimalInput` utility at `src/utils/parseDecimalInput.ts` (or similar) that:
- Accepts a raw string from any numeric text input
- Returns a normalized string with dot (`.`) as the decimal separator
- Handles: simple comma (`12,34` → `12.34`), simple dot (`12.34`), integers (`1234`)
- Handles pasted formatted values with both separators using the heuristic "last separator is the decimal": `1.234,56` → `1234.56` (pt-BR), `1,234.56` → `1234.56` (US)
- Is a pure function with no side effects, no imports from React/React Native

#### R2 — `ControlledInputValue` Uses the Utility
Replace the inline `onChangeText={(text) => onChange(text.replace(',', '.'))}` in `ControlledInputValue` with a call to `parseDecimalInput`. Behavior unchanged from the user's perspective, but centralized.

#### R3 — `ControlledInputWithIcon` Normalizes Decimal Inputs
Add comma-to-dot normalization to `ControlledInputWithIcon`. The normalization should activate when the `keyboardType` prop is `'decimal-pad'` or `'numeric'` (i.e., any numeric input mode). Name/description inputs (no `keyboardType` or `keyboardType='default'`) must not be affected.

#### R4 — Fix `keyboardType` on Decimal Screens
Screens that accept decimal values but currently use `keyboardType='numeric'` must change to `'decimal-pad'`:
- `RegisterAccount` — balance field
- `RegisterBudget` — amount field

(`keyboardType='numeric'` shows an integer-only keypad on iOS — no decimal separator at all.)

#### R5 — Update Validation Error Messages
Update Yup `typeError` messages to be locale-agnostic:
- `RegisterAccount` balance: `'Digite somente números e pontos.'` → `'Digite um valor numérico'` (consistent with `RegisterTransaction` and `RegisterBudget`)
- No other screens have decimal-specific error messages that need changing.

#### R6 — Device Region Independence
The solution must work regardless of device locale/region. An iPhone set to US English with an iOS keyboard that emits a period must be handled identically to a pt-BR device emitting a comma. The normalization function handles both.

### Keyboard Avoidance & Dismissal

#### R7 — Dismiss Keyboard on Tap Outside
All screens with text inputs should dismiss the keyboard when the user taps outside any input. Implement as a `TouchableWithoutFeedback` + `Keyboard.dismiss()` wrapper. This can be applied at the `Screen` component level for global behavior, or per-screen. Prefer the `Screen`-level approach for consistent UX.

#### R8 — `KeyboardAvoidingView` on `RegisterTransaction`
Add `KeyboardAvoidingView` to the `RegisterTransaction` screen (currently uses a plain `View` container). Use `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` consistent with `RegisterAccount`. The screen already has a `ContentScroll` (`ScrollView`) below the header, which will scroll up when the keyboard appears — inputs in the header will shift via the padding behavior.

#### R9 — On-Screen Content Visibility
When the keyboard is open, the input being edited must remain visible. This is achieved by the combination of `KeyboardAvoidingView` (R8) and the dismiss-on-tap (R7) behaviors. No standalone `KeyboardAvoidingView` library is needed — React Native's built-in component has been stable since ~0.65 and the deprecation of `react-native-keyboard-aware-scroll-view` in favor of native behavior is the recommended approach for Expo SDK 52+.

## Non-Requirements (out of scope)

- **Multi-currency base currency selection**: Future feature. The normalization utility is currency-agnostic by design (accepts both separators, outputs dot).
- **Changing the display formatting**: `formatCurrency` already uses `pt-BR` locale correctly. No change needed.
- **Android numeric keypad**: Android's `numeric`/`decimal-pad` keypads already include a dot key, so the comma normalization is a no-op there — but must not break Android behavior.
- **Input masking** (e.g., formatting as the user types like "1.234,56"): Out of scope. This feature only handles input acceptance and normalization.

## Affected Files

| File | Change |
|------|--------|
| `src/utils/parseDecimalInput.ts` | **New** — centralized decimal parsing utility |
| `src/components/Form/ControlledInputValue/index.tsx` | Use `parseDecimalInput` instead of inline `replace` |
| `src/components/Form/ControlledInputWithIcon/index.tsx` | Apply normalization when `keyboardType` is `decimal-pad`/`numeric` |
| `src/components/Screen/index.tsx` | Add tap-outside-to-dismiss-keyboard behavior |
| `src/screens/RegisterAccount/index.tsx` | Fix: `keyboardType='numeric'` → `'decimal-pad'`; update Yup typeError message |
| `src/screens/RegisterAccount/styles.ts` | (If needed for keyboard avoidance changes) |
| `src/screens/RegisterBudget/index.tsx` | Fix: `keyboardType='numeric'` → `'decimal-pad'` for amount field |
| `src/screens/RegisterTransaction/styles.ts` | Change `Container` from `View` to `KeyboardAvoidingView` |

## Total Requirements / Estimated Tasks

**Requirements**: 9 (R1–R9)
**Estimated tasks**: 6 (some requirements merge into the same task)

| Task | Requirements | Files |
|------|-------------|-------|
| T1: Create `parseDecimalInput` utility + tests | R1 | 1 new file |
| T2: Update `ControlledInputValue` to use utility | R2 | 1 file |
| T3: Add normalization to `ControlledInputWithIcon` | R3 | 1 file |
| T4: Fix keyboardType + Yup messages on screens | R4, R5 | 2 files |
| T5: Add global tap-to-dismiss keyboard | R7 | 1 file (Screen) |
| T6: Add `KeyboardAvoidingView` to `RegisterTransaction` | R8, R9 | 1 file (styles) |
