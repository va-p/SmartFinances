# signup-password-hint Validation

**Date**: 2026-11-09
**Spec**: inline spec in validation request (source of truth; Small scope, no formal `spec.md`)
**Diff range**: commit `8bf9979` on branch `feat/improve-inputs` (`git --no-pager show 8bf9979`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Scope note**: read-only verification; no source files modified, no commits made.

---

## Task Completion

No formal `tasks.md` exists for this Small-scope feature (inline spec only). Diff-surface completion check:

| Task (derived from inline spec) | Status | Notes |
| ------------------------------- | ------ | ----- |
| Add touched/focused state + derived `showPasswordHint` | ✅ Done | `src/screens/SignUp/index.tsx:72-74` |
| Wire `onFocus`/`onBlur` on password `ControlledInput` | ✅ Done | `src/screens/SignUp/index.tsx:242-246` |
| Conditionally render hint with schema-rules text | ✅ Done | `src/screens/SignUp/index.tsx:249-253` |
| Add `PasswordHint` styled component | ✅ Done | `src/screens/SignUp/styles.ts:9-15` |

---

## Spec-Anchored Acceptance Criteria

Coverage method: **code evidence** (`file:line` + code expression). There is no new jest test for
this UI: a full SignUp render requires Clerk (`useSSO`) and expo-router mocks, and the repo pattern
is to test isolated pieces (e.g. `src/__tests__/screens/registerTransactionScroll.spec.tsx`). Each
AC below is traced to exact implementation lines; automated-test absence is flagged honestly rather
than silently passed.

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion / code evidence | Result |
| ------------------------- | -------------------- | ---------------------------------------- | ------ |
| AC1: WHEN password input on SignUp receives focus THEN system SHALL mark it touched and show the hint | `hasTouchedPassword=true`, `isPasswordFocused=true` on focus | `src/screens/SignUp/index.tsx:242-245` — `onFocus={() => { setHasTouchedPassword(true); setIsPasswordFocused(true); }}`. Passthrough verified: `ControlledInput` spreads `...rest` into `Input` (`src/components/Form/ControlledInput/index.tsx:32-38`), `Input` spreads into RN `InputText` (`src/components/Form/Input/index.tsx:21`), so `onFocus` reaches the native `TextInput`. `showPasswordHint` becomes `true` via `:74`. | ✅ PASS |
| AC2: WHILE password input is touched AND focused the system SHALL show hint text describing schema rules (min 8 chars, uppercase, lowercase, number) | Hint visible with text covering all four rules | `src/screens/SignUp/index.tsx:74` — `const showPasswordHint = hasTouchedPassword && isPasswordFocused;` + `src/screens/SignUp/index.tsx:249-253` — `{showPasswordHint && (<PasswordHint>Mínimo de 8 caracteres, com letra maiúscula, minúscula e número.</PasswordHint>)}`. Text matches the Yup schema rules `src/screens/SignUp/index.tsx:56-61` (`.min(8)`, `/[A-Z]/`, `/[a-z]/`, `/[0-9]/`). | ✅ PASS |
| AC3: IF password input loses focus THEN system SHALL hide the hint | `isPasswordFocused=false` → `showPasswordHint=false` → hint unmounted | `src/screens/SignUp/index.tsx:246` — `onBlur={() => setIsPasswordFocused(false)}`; `&&` at `:74` forces `showPasswordHint` to `false`, so the conditional at `:249` unmounts the hint. | ✅ PASS |
| AC4: IF password input was never touched THEN system SHALL hide the hint | Hint hidden before first focus | `src/screens/SignUp/index.tsx:73` — `useState(false)` initial `hasTouchedPassword`; `&&` at `:74` keeps `showPasswordHint` `false` until the first `onFocus` sets it. | ✅ PASS |
| AC5 (ubiquitous): The system SHALL show this hint only on the SignUp screen | `PasswordHint` rendered nowhere except SignUp | `src/screens/SignUp/styles.ts:9-15` defines `PasswordHint`; repo-wide grep for `PasswordHint` returns hits only in `src/screens/SignUp/index.tsx` (import `:3`, render `:249-253`) and `src/screens/SignUp/styles.ts` (definition). No other screen imports or renders it. | ✅ PASS |

**Status**: ✅ All ACs covered (5/5 via code evidence; 0 spec-precision gaps — the inline spec defines
precise outcomes for each AC and the code targets each exactly).

---

## Discrimination Sensor

Method per task brief: scratch-only fault injection on **copies** in `/tmp/signup-hint-sensor`
(real tree never mutated; `git stash` never used). Mutants applied with Python string replacement on
copies, diffs confirmed, scratch discarded afterwards. No covering jest test exists for this UI, so
kill verdicts are by inspection (each fault provably breaks the cited ACs); stated as
killed-by-inspection, not test-killed.

| Mutation | File:line (real tree) | Description | Killed? |
| -------- | --------------------- | ----------- | ------- |
| M1 | `src/screens/SignUp/index.tsx:74` | Flipped `hasTouchedPassword && isPasswordFocused` → `hasTouchedPassword \|\| isPasswordFocused` | ✅ Killed-by-inspection — hint would show after blur (touched persists, breaks AC3) and on focus-without-touch is impossible anyway; `||` breaks AC3/AC4 semantics |
| M2 | `src/screens/SignUp/index.tsx:246` | Removed `onBlur={() => setIsPasswordFocused(false)}` | ✅ Killed-by-inspection — `isPasswordFocused` never clears, hint never hides on blur, breaks AC3 |
| M3 | `src/screens/SignUp/index.tsx:251` | Changed hint text to wrong rules ("Mínimo de 6 caracteres, só números.") | ✅ Killed-by-inspection — text no longer describes the Yup schema (`:56-61`), breaks AC2 |

**Sensor depth**: lightweight (3 targeted behavior-level mutations on highest-risk new code).
**Result**: 3/3 killed-by-inspection, 0 survived - PASS ✅ (with noted limitation: no automated test
to kill mutants at runtime; see Summary).

Isolation: baseline `git --no-optional-locks status --porcelain` (pre-sensor) was clean; post-sensor
status showed `M .specs/project/ROADMAP.md` — a one-line checkbox reorder unrelated to this feature,
made by an external concurrent process (my sensor wrote only to `/tmp`; `git diff --stat` confirmed
no `SignUp` file touched). Scratch dir removed after the run.

---

## Interactive UAT Results (if performed)

N/A — not performed. Rationale: behavior is a trivial focus-driven caption (show/hide + static text);
code evidence plus gate checks are sufficient, and no human-judgment visual design is involved.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ — only hint state, handlers, conditional render, one styled component |
| No abstractions for single-use code | ✅ — two `useState` + one derived boolean, no new abstraction |
| No unnecessary "flexibility" added | ✅ — no props, no config, hardcoded spec text |
| Only touched files required for task | ✅ — exactly `src/screens/SignUp/index.tsx` + `src/screens/SignUp/styles.ts` |
| Didn't "improve" unrelated code | ✅ — `git show` confirms no other hunks |
| Matches existing patterns/style | ✅ — `styled.Text` follows the file's styled-components pattern; `(theme as ThemeProps)` cast matches `useTheme() as ThemeProps` usage in the same screen; new style block produces zero tsc errors |
| Would senior engineer approve? | ✅ — minimal, readable; two-state (`touched`+`focused`) mirrors the spec language and AC4 explicitly requires the "never touched" concept, so the extra boolean is justified, not redundant |
| Tests map to acceptance criteria and are non-shallow (spot-check one story) | ⚠️ — no direct test; justified (Clerk/router mocks needed; repo tests isolated pieces). ACs verified by code evidence instead — see limitation in Summary |
| Spec-anchored outcome check (asserted values match spec) | ✅ — hint text matches all four Yup rules; `&&` matches "touched AND focused" |
| Per-layer Coverage Expectation met | ✅ (proportional) — UI caption with no domain logic; all 5 ACs traced |
| Every test in scope maps to a spec AC | ✅ — no new tests added, none orphaned |
| Documented guidelines followed | ✅ — none found in repo; strong defaults applied (surgical diff, existing patterns) |

---

## Edge Cases

- [x] Hint + Yup validation error co-display: `ErrorMessage` renders above the input inside `ControlledInput`, hint renders below the password input — no layout conflict; both showing simultaneously is semantically fine.
- [x] Re-focus after blur re-shows hint (`hasTouchedPassword` persists) — correct per AC2.
- [x] `confirmPassword` field untouched by the change — correct per AC5 scope.
- [x] `ControlledInput` does not wire `Controller`'s `field.onBlur` (pre-existing; only `onChange`/`value` destructured), so the added `onBlur` via `...rest` cannot regress react-hook-form touched tracking — no conflict.
- [x] Style regression: `PasswordHint` uses `margin-top: -12px` consistent with tight form spacing; `textPlaceholder` color keeps it visually subordinate — cosmetic, matches intent.

---

## Gate Check

- **Gate commands**: `npx eslint src/screens/SignUp/index.tsx src/screens/SignUp/styles.ts` and `npx jest src/__tests__/screens/registerTransactionScroll.spec.tsx --watchman=false` (from `/Users/vap/00_code/JS/SmartFinances`)
- **ESLint result**: exit 0, no warnings/errors on either file (only a TS-version support banner + expo-router deprecation notice, both environmental).
- **Jest result**: 1 passed, 0 failed, 0 skipped (`registerTransactionScroll.spec.tsx` — renders its content children).
- **Test count before/after feature**: 1 → 1 (delta +0; no tests added or removed — justified above).
- **tsc (informational, repo-wide errors pre-exist and out of scope)**: `npx tsc --noEmit` filtered to `screens/SignUp` shows errors only on lines untouched by this diff (`Control<FormData>` mismatches on all five `control={control}` usages — parent commit `8bf9979^` already had all five; `borders`/`colors` on `DefaultTheme` in the pre-existing `MainContent` block). **This diff adds zero new tsc errors**: no errors on added lines `index.tsx:72-74,242-253` or `styles.ts:9-15` (the new block's `(theme as ThemeProps)` cast is clean).
- **Skipped tests**: none. **Failures**: none.

---

## Fix Plans (if issues found)

None — no blocking gaps found.

---

## Requirement Traceability Update

No formal `spec.md` exists (inline spec is the source of truth), so no `spec.md` status update applies:

| Requirement (inline spec) | Previous Status | New Status |
| ------------------------- | --------------- | ---------- |
| AC1 focus → touched + show | Implementing | ✅ Verified |
| AC2 touched+focused → rules text | Implementing | ✅ Verified |
| AC3 blur → hide | Implementing | ✅ Verified |
| AC4 never touched → hide | Implementing | ✅ Verified |
| AC5 SignUp-only | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (PASS)

**Spec-anchored check**: 5/5 ACs matched spec outcome via `file:line` code evidence, 0 spec-precision gaps.
**Sensor**: 3/3 mutations killed-by-inspection, 0 survived.
**Gate**: ESLint clean (exit 0); jest 1 passed, 0 failed; diff adds zero new tsc errors.

**What works**: focus-driven password hint — appears on first focus with schema-accurate Portuguese
rules text, hides on blur, stays hidden until ever touched, and exists only on the SignUp screen.

**Issues found**: none blocking. Known limitation (non-blocking, by design of repo test strategy): no
automated test covers this UI behavior, so regression protection rests on code simplicity + this
report. If the team later adds Clerk/router mocks for screen tests, a focus/blur hint test would be
the natural addition — suggested, not required.

**Next steps**: none required for this feature; proceed with normal merge flow for `feat/improve-inputs`.
