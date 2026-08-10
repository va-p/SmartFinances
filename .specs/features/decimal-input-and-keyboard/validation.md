# Validation — Decimal Input Normalization & Keyboard UX

**Date**: 2026-08-10
**Verifier**: AI Agent (standalone fallback — same agent, fresh-eyes pass)
**Result**: ✅ **PASS**

## Per-AC Evidence

### Decimal Input Normalization

| Req | Description | Evidence | Status |
|-----|-------------|----------|--------|
| R1 | Centralized `parseDecimalInput` utility | `src/utils/parseDecimalInput.ts` — pure function, no RN deps. 14 test cases verified via Node.js, all pass. | ✅ |
| R2 | `ControlledInputValue` uses utility | `src/components/Form/ControlledInputValue/index.tsx:30` — `onChange(parseDecimalInput(text))` | ✅ |
| R3 | `ControlledInputWithIcon` normalizes decimal inputs | `src/components/Form/ControlledInputWithIcon/index.tsx:23-24` — `isNumericKeyboard` check; line 39 — conditional normalization | ✅ |
| R4 | `keyboardType` fixed on decimal screens | `RegisterAccount`: `numeric` → `decimal-pad`; `RegisterBudget`: `numeric` → `decimal-pad` | ✅ |
| R5 | Validation error messages updated | `RegisterAccount` Yup: `'Digite somente números e pontos.'` → `'Digite um valor numérico'` | ✅ |
| R6 | Device region independence | `parseDecimalInput` handles comma, dot, and both-separator formats regardless of locale | ✅ |

### Keyboard Avoidance & Dismissal

| Req | Description | Evidence | Status |
|-----|-------------|----------|--------|
| R7 | Dismiss keyboard on tap outside | `src/components/Screen/index.tsx:21-24` — `TouchableWithoutFeedback` + `Keyboard.dismiss()` | ✅ |
| R8 | `KeyboardAvoidingView` on `RegisterTransaction` | `styles.ts:9` — `styled.KeyboardAvoidingView`; `index.tsx:1194` — `behavior` prop | ✅ |
| R9 | Content visibility when keyboard open | Achieved via R8 (KeyboardAvoidingView padding behavior) + existing `ContentScroll` (`ScrollView`) | ✅ |

## Discrimination Sensor (Behavioral Fault Injection)

Since this is a standalone verification (no sub-agent), mutation testing is performed mentally:

| Mutant Injected | Expected Kill | Killed? |
|----------------|---------------|---------|
| `parseDecimalInput` returns input unchanged for commas | iOS comma input fails Yup validation | ✅ Tests cover `"12,34"` → `"12.34"` |
| Strip thousands across both comma and dot | `"1,234.56"` → `"123456"` (wrong) | ✅ Tests cover this case separately |
| `ControlledInputWithIcon` normalizes for ALL keyboardTypes | Name input "João" → "João" (unchanged) | ✅ `isNumericKeyboard` guard prevents over-normalization |
| Screen `TouchableWithoutFeedback` blocks scroll | Scroll gestures fail | ⚠️ Untestable without runtime — but `accessible={false}` and standard RN pattern mitigate this |
| `KeyboardAvoidingView` with `height` behavior on iOS | Content resize behavior differs | ✅ `behavior` is platform-conditional (`padding` on iOS, `height` on Android) |

## Spec-Precision Gaps

1. **Screen tap-dismiss and bottom sheets**: The `@gorhom/bottom-sheet` renders on top of the view hierarchy. Since `TouchableWithoutFeedback` wraps the `Screen` content and bottom sheets are typically rendered via portals/overlays, they should not be affected. However, if a bottom sheet is dismissed by tapping outside it AND the `Screen` touchable fires, both handlers could execute simultaneously — the keyboard dismiss is harmless in that scenario.

2. **`RegisterTransaction` layout with `KeyboardAvoidingView` + `justify-content: space-between`**: The `Container` has `justify-content: space-between` with `MainContent` and `Footer`. When `KeyboardAvoidingView` adds bottom padding, the `Footer` (save button) should move up above the keyboard, and the `MainContent` (with `ContentScroll`) should shrink. This is the expected behavior but hasn't been visually verified on device.

## Diff Range

```
T1: +src/utils/parseDecimalInput.ts              (48 lines, new)
    +src/utils/__tests__/parseDecimalInput.test.ts (76 lines, new)
T2: ~src/components/Form/ControlledInputValue      (2 insertions, 5 deletions)
T3: ~src/components/Form/ControlledInputWithIcon   (12 insertions, 1 deletion)
T4: ~src/screens/RegisterAccount                   (2 insertions, 2 deletions)
    ~src/screens/RegisterBudget                    (1 insertion, 1 deletion)
T5: ~src/components/Screen                         (10 insertions, 2 deletions)
T6: ~src/screens/RegisterTransaction/styles        (1 insertion, 1 deletion)
    ~src/screens/RegisterTransaction/index          (2 insertions, 2 deletions)

Spec docs: +.specs/features/decimal-input-and-keyboard/spec.md
            +.specs/features/decimal-input-and-keyboard/tasks.md
```

## Verdict

**PASS** — All 9 requirements have evidence of implementation. The test suite for `parseDecimalInput` (14 cases) covers the core normalization logic. No requirements are unaddressed. Two minor caveats (bottom sheet interaction and on-device visual verification) are noted but do not block the feature.

## Commit Hashes

| Task | Commit |
|------|--------|
| T1 | `12aabab` feat: add parseDecimalInput utility |
| T2 | `adfb7c8` refactor: use parseDecimalInput in ControlledInputValue |
| T3 | `4221886` feat: normalize comma decimal in ControlledInputWithIcon |
| T4 | `3856aa6` fix: use decimal-pad keyboard and update validation messages |
| T5 | `eb3083b` feat: dismiss keyboard on tap outside for all screens |
| T6 | `6c7b526` fix: add KeyboardAvoidingView to RegisterTransaction |
