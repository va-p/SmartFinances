# Financial Goals Validation

**Date**: 2026-09-14
**Spec**: `.specs/features/financial-goals/spec.md`
**Diff range**: backend `smart-finances-backend` `d0c8310^..f298f7b` (contiguous, branch `goals-target-savings`); frontend `SmartFinances` = the goal commit list on `goals-target-savings`: `58941a9, 39c170f, 597ba72, 5329ddd, 59b7e92, b74c169, 42a24f0, 2a28dc7, 1528379, 76d50a9, 5ebfd19, d581114, edcd8b9, 5a9bfae, 658b865, a162fd6, 5aaaed6, 09a0442, 2aafcb6, 938e3e2, 0f0ad4e, 3a59f16, 7bd5cae, ba437d7, 4fea33a, bd3b74d, 0075d5b, 383531e, 1d05835, 65cfbfd, b9a3cec, d1a2edc, 620cbec` (fix for Gap 1; user's non-goal commits interleaved on the branch are out of scope and not judged)
**Verifier**: independent sub-agent (author ≠ verifier)

**Overall**: ✅ Ready — initial pass found 1 AC gap (chart `hideAmount` masking inverted, GOAL-53/AC-7); fixed in `620cbec` and re-verified 2026-09-14: 63/63 criteria evidenced, 8/9 sensor mutants killed (the 1 survivor is the documented no-test chart layer), all gates green.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 schema/migration | ✅ Done | `prisma/schema.prisma:356-398` + migrations on disk (gitignored by convention); `prisma migrate deploy` on cPanel still pending (STATE.md #16) |
| T2 zod schemas | ✅ Done | `src/schemas/goal.schema.ts` + 30 schema tests |
| T3 service create | ✅ Done | `createGoalWithReserve`, `resolveGoalTransferCategory` |
| T4 deposit/withdraw | ✅ Done | `depositToGoal`/`withdrawFromGoal` via `createTransferPair` |
| T5 status/delete | ✅ Done | `transitionGoalStatus`, `deleteGoalWithTransferBack` |
| T6–T9 routes | ✅ Done | 8 endpoints registered under `/api/v1/goal` (`src/routes/goal.routes.ts`, `src/server.ts`) |
| T10 account guard | ✅ Done | virtual accounts excluded from `GET /account` default + delete guard |
| T11–T14 data layer | ✅ Done | interfaces, `goalCalculations`, query/mutation hooks |
| T15–T20 screens | ✅ Done | entry, list, form, details, movement, completed/archived |
| T21 visibility audit | ✅ Done | Accounts/pickers/Overview/AccountsList all filter `isVirtual` |
| Amendment (GOAL-43..50) | ✅ Done | conditional reserve + linked-account routing + server-side virtual filter |
| A1–A8 chart amendment | ✅ Done | A1–A8 incl. Gap-1 fix: masking wiring corrected in `620cbec` (AC-7 re-verified PASS) |
| A5 gates/docs | ✅ Done | batch log + STATE.md records (`b9a3cec`, `d1a2edc`) |

---

## Spec-Anchored Acceptance Criteria

All paths below are repo-relative: `smart-finances-backend/...` and `SmartFinances/...`. Per the Test Coverage Matrix, backend service/schema/controller and frontend utils are test-covered layers (assertion cited); frontend hooks/screens/components have NO automated tests by design — evidence is implementation `file:line` + "verified by inspection".

### P1: Goals Entry Point & Active Goals List

| Criterion | Spec outcome | Evidence (`file:line` + assertion) | Result |
| --------- | ------------ | ----------------------------------- | ------ |
| GOAL-01 menu entry navigates to Goals | tap "Metas & Objetivos" → Goals screen | `src/screens/OptionsMenu/index.tsx:106-109` `router.navigate('/options/goals')` + `:323-327` `onPress={() => handleOpenGoals()}`; route `src/app/(app)/options/goals/index.tsx` — verified by inspection | ✅ PASS |
| GOAL-02 active goal cards (name, current, target, %, deadline) | each ACTIVE goal rendered as card | List: `src/screens/Goals/index.tsx:68-71` filters `status === 'ACTIVE'`, `:195-209` renders `GoalListItem` per goal; card fields: `src/components/GoalListItem/index.tsx:66-81` (name `:66`, current `:68-70`, target `:72`, percent bar `:75-78`, deadline `:56-62`); calc: `src/__tests__/utils/goalCalculations.spec.ts:61-72` `expect(progress.currentAmount).toBe(800)` / `percentage 80` | ✅ PASS |
| GOAL-03 empty state with CTA | no ACTIVE goals → empty state + create CTA | `src/screens/Goals/index.tsx:210-214` `ListEmptyComponent text='Nenhuma meta ativa. Crie sua primeira meta...'` — verified by inspection | ✅ PASS |
| GOAL-04 create button at all times | create-goal button (FAB) always visible | `src/screens/Goals/index.tsx:227-238` Footer `Button.Root onPress={handleOpenRegisterGoalModal}` rendered unconditionally — verified by inspection. Note: implemented as a fixed footer button ("Criar nova meta"), not a floating-action button; the always-visible outcome is met | ✅ PASS (note) |
| GOAL-05 hideAmount masks goal values | all monetary values masked on Goals screens | `src/screens/Goals/index.tsx:181` summary `'•••••'`; `src/components/GoalListItem/index.tsx:69,72`; `src/screens/GoalDetails/index.tsx:292,296-297,358-359,382-383`; chart exception under Gap 1 | ✅ PASS (except chart, Gap 1) |
| GOAL-06 navigation to Completed/Archived | reachable from Goals screen | `src/screens/Goals/index.tsx:145-151` handlers + `:169-176` header buttons; routes `src/app/(app)/options/goals/completed.tsx` / `archived.tsx` — verified by inspection | ✅ PASS |

### P1: Create Goal

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-07 create ACTIVE goal | valid form → goal created ACTIVE | `src/__tests__/goal.service.test.ts:166-191` `assert.equal(data.status ?? "ACTIVE", "ACTIVE")` + reserve link `:179`; controller `src/__tests__/goal.controller.test.ts:379-416` `assert.deepEqual(statuses, [201])`, single `$transaction` | ✅ PASS |
| GOAL-08 field validation, no API call | empty name / target ≤ 0 → field-level errors | Backend: `src/__tests__/goal.schema.test.ts:56-99` (`issuePaths` include `name`/`target_amount`, zero + negative rejected). Frontend: `src/screens/RegisterGoal/index.tsx:78-84` Yup schema, `:247,:259` `error={errors.name}/{errors.amount}` rendered per field — verified by inspection | ✅ PASS |
| GOAL-09 link accounts, balances in current amount | linked accounts joined; balances count | `goal.service.test.ts:207-235` junction rows asserted; foreign account: `goal.controller.test.ts:453-476` 404; balance inclusion: `goalCalculations.spec.ts:61-72` (500 reserve + 300 linked = 800) | ✅ PASS |
| GOAL-10 deadline today-or-later | past deadline rejected, today ok, optional | `goal.schema.test.ts:101-125` (PAST fails on `deadline` path, today passes, omitted/null pass); frontend `RegisterGoal/index.tsx:160-169` `startOfDay(deadline) < startOfDay(new Date())` → Alert, return | ✅ PASS |
| GOAL-11 API failure → rollback + alert | optimistic state rolled back, error alert | `src/hooks/useGoalMutations.ts:131-136` `onError` restores `previousGoals` + `Alert.alert('Erro', ...)` — verified by inspection | ✅ PASS |
| GOAL-43 no links → atomic virtual reserve | reserve created (virtual, OTHER, 0, goal currency) atomically | `goal.service.test.ts:150-164` `assert.equal(data.isVirtual, true)` / `type 'OTHER'` / `balance '0'`; atomic: `goal.controller.ts:195-208` inside one `prisma.$transaction`, `goal.controller.test.ts:379` `transactionCount === 1` | ✅ PASS |
| GOAL-44 links → NO reserve | linked creation creates no reserve | `goal.service.test.ts:836-851` `assert.equal(writesOf(writes,"account.create").length, 0)` + `reserveAccountId null`; controller `:1153-1176` `reserve_account: null` in DTO | ✅ PASS |
| GOAL-45 edit removes last link → empty reserve | reserve-less goal re-creates empty reserve on empty links | `goal.service.test.ts:853-876` (`ensureGoalReserve` creates + attaches); controller `:1178-1201` empty `linked_account_ids` → reserve re-created in-transaction | ✅ PASS |

### P1: Goal Details, Deposits & Withdrawals

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-12 deposit = TRANSFER source→reserve, current +amount | exact transfer-pair legs and balance deltas | `goal.service.test.ts:344-376`: `debit.type 'TRANSFER_DEBIT'`, `debit.accountId 10`, `"-500"`; `credit.accountId 100`, `"500"`; increments `-500`/`+500`; controller `:770-815` returns updated reserve balance 800, status 201 | ✅ PASS |
| GOAL-13 withdrawal = TRANSFER reserve→destination | exact legs, current decreases | `goal.service.test.ts:378-405` (debit 100 `-200`, credit 10 `+200`); controller `:837-866` reserve balance 100 after 200-withdraw from 300 | ✅ PASS |
| GOAL-14 withdraw > source balance rejected, no transaction | 400 + zero writes (reserve OR linked source) | Reserve: `goal.service.test.ts:439-455` `statusCode === 400 && /saldo insuficiente/i` + `transaction.create === 0` (300.01 vs 300); linked: `:985-1002` (400.01 vs 400, zero writes); exactly-balance allowed `:457-466` | ✅ PASS |
| GOAL-15 duplicate-submission guard | confirm disabled while in flight | `src/screens/RegisterGoalMovement/index.tsx:411-414` `Button.Root isLoading={isDepositing || isWithdrawing}`; `src/components/Button/ButtonRoot.tsx:22` `<Container enabled={!isLoading}>` — verified by inspection | ✅ PASS |
| GOAL-16 multi-currency per-leg conversion | per-leg `amount_in_account_currency` like regular transfers | `goal.service.test.ts:559-584` (source leg `-500` own-currency, reserve leg `+100` goal-currency, per-leg increments); schema `goal.schema.test.ts:203-242` (non-positive conversion rejected); frontend per-leg wiring `RegisterGoalMovement/index.tsx:169-207` | ✅ PASS |
| GOAL-17 history: reserve + linked accounts, newest first | transactions ordered newest first, spans reserve + linked | `goal.controller.test.ts:308-362`: `txQuery.where.accountId in [100, 10]` (reserve + linked), `assert.deepEqual(txQuery.orderBy, { createdAt: "desc" })`; render `GoalDetails/index.tsx:370-418` | ✅ PASS |
| GOAL-18 refresh accounts + transactions after mutation | queries invalidated post-mutation | `src/hooks/useGoalMovementMutations.ts:50-58` invalidates `goals`, `goal/:id`, `accounts`, `transactions` on settle — verified by inspection | ✅ PASS |
| GOAL-46 deposit (no reserve) → chosen linked account | TRANSFER source→linked | `goal.service.test.ts:918-946` credit `accountId 11` `+500`; missing `linked_account_id` → 400 `:948-963`; controller `:1204-1229` | ✅ PASS |
| GOAL-47 withdraw (no reserve) → from chosen linked account | TRANSFER linked→destination | `goal.service.test.ts:965-983` debit `accountId 11` `-200`; controller `:1230-1254` | ✅ PASS |
| GOAL-48 non-linked target rejected | 400, no transaction | `goal.service.test.ts:1004-1038` (`/not linked to this goal/i`, zero writes, deposit + withdraw); controller `:1255-1279` | ✅ PASS |

### P1: Goal Completion

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-19 "Meta atingida" at ≥ target, stays active | flag at ≥ 100% while ACTIVE | `goalCalculations.spec.ts:111-131` (`percentage 100 → isAmountReached true`; `150%` keeps flag); render `GoalListItem/index.tsx:82-87`, `GoalDetails/index.tsx:321-330` | ✅ PASS |
| GOAL-20 conclude → COMPLETED, leaves active list | manual conclude sets COMPLETED + completedAt | `goal.service.test.ts:625-639` (`status 'COMPLETED'`, `completedAt` stamped; invalid sources 400); controller `:626-650` `completed_at` in DTO; active-list exit via `Goals/index.tsx:68-71` ACTIVE filter | ✅ PASS |
| GOAL-21 completed list content | name, target, completion date | `src/screens/CompletedGoals/index.tsx:83-99` `GoalListItem` + `footerText: 'Concluída em ...'` — verified by inspection | ✅ PASS |
| GOAL-22 COMPLETED read-only | no deposits/withdrawals/edits | `goal.service.test.ts:407-437` deposit+withdraw on COMPLETED/ARCHIVED → 400, `writes.length === 0`; edit: `goal.controller.test.ts:519-541` 400 + no transaction; UI: `GoalDetails/index.tsx:287,479-502` actions only when `isActive` | ✅ PASS |
| GOAL-23 completed empty state | empty state when none | `src/screens/CompletedGoals/index.tsx:101-103` `ListEmptyComponent` — verified by inspection | ✅ PASS |

### P1: Virtual Reserve Visibility & Net Worth Integrity

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-24 excluded from Accounts tab/groupings/lists | virtual never renders in any account list | `src/screens/Accounts/index.tsx:194-202` institution/standalone filter `!account.isVirtual`; `:330-337` credit-card filter; `src/screens/AccountsList/index.tsx:77-80` `accounts.filter((account) => !account.isVirtual)` — verified by inspection | ✅ PASS |
| GOAL-25 included in Net Worth + evolution chart | total includes virtual balances | `Accounts/index.tsx:123` `useAccountsQuery(true)`; `:136-164` total accumulates all non-`hide` accounts (incl. virtual); `:254-258` `buildNetWorthEvolution({ totalAssets: totalAccountsBalance, ... })`; `Overview/index.tsx:110` `useAccountsQuery(true)` + `:154` `totalAssets += convertedBalance` | ✅ PASS |
| GOAL-26 excluded from regular pickers | virtual not selectable in transaction/transfer pickers | `src/screens/AccountSelect/index.tsx:54-57` and `AccountDestinationSelect/index.tsx:47-50` `filter((account) => !account.isVirtual)`; server-side backstop: `goal.service.test.ts:508-523, 539-557` virtual source/destination → 400 | ✅ PASS |
| GOAL-27 deposit leaves net worth unchanged | pair sums to zero across user accounts | `goal.service.test.ts:367-375` source increment `-500` + reserve increment `+500` (sum zero); total includes both sides via GOAL-25 evidence | ✅ PASS |
| GOAL-49 GET /account excludes virtual by default | default response excludes virtual | `src/__tests__/account.controller.test.ts:342-365` `assert.equal(findManyArgs[0].where.isVirtual, false)`; impl `src/controllers/account.controller.ts:21-27` | ✅ PASS |
| GOAL-50 include_virtual=true + isVirtual in DTO | opt-in includes virtual; DTO always has isVirtual | `account.controller.test.ts:367-392` no `isVirtual` key in where + `assert.deepEqual(payload.map(a => a.isVirtual), [false, true])`; DTO `account.controller.ts:67` | ✅ PASS |

### P2: Edit Goal

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-28 persist edits + recompute progress | edits persist; progress recomputed | `goal.controller.test.ts:477-500` name/target persisted, currency untouched (`updateData` has no currency key); recompute: progress is derived per render (`Goals/index.tsx:73-79`, `GoalDetails/index.tsx:121-124`) + `useGoalMutations.ts:158-161` invalidates on success | ✅ PASS |
| GOAL-29 target ≤ current keeps ACTIVE + flag | flag shows, status unchanged | `goalCalculations.spec.ts:122-131` (150% → flag true, real percentage); status: `goal.controller.ts:250-257` update writes only name/target/deadline — status never touched | ✅ PASS |
| GOAL-30 unlink subtracts balance, no money moved | junction replaced, no transfers | `goal.controller.test.ts:544-569` (set replaced), `:571-598` (empty array unlinks all); no `createTransferPair` anywhere in `updateGoal` (`goal.controller.ts:259-280`) — verified by inspection | ✅ PASS |

### P2: Archive & Unarchive

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-31 archive records previous status → ARCHIVED | previousStatus stored | `goal.service.test.ts:641-659` (`fromActive.previousStatus === 'ACTIVE'`, `fromCompleted === 'COMPLETED'`; double-archive 400); controller `:652-672` | ✅ PASS |
| GOAL-32 archived list | all ARCHIVED goals displayed | `src/screens/ArchivedGoals/index.tsx:51-54` filter `status === 'ARCHIVED'` — verified by inspection | ✅ PASS |
| GOAL-33 unarchive restores previous status | ACTIVE→ACTIVE, COMPLETED→COMPLETED | `goal.service.test.ts:661-694` (both restorations + fallback to ACTIVE + previousStatus cleared; non-archived 400); controller `:674-697` | ✅ PASS |
| GOAL-34 ARCHIVED read-only | no deposits/withdrawals/edits | Same service/controller tests as GOAL-22 (`goal.service.test.ts:407-437` loops COMPLETED and ARCHIVED; `goal.controller.test.ts:519-541`); UI `GoalDetails/index.tsx:333-339` read-only note + `:479` actions gated on `isActive` | ✅ PASS |
| GOAL-35 archived empty state | empty state when none | `src/screens/ArchivedGoals/index.tsx:125-127` — verified by inspection | ✅ PASS |

### P2: Delete Goal with Transfer-Back

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-36 zero-balance/no-reserve delete, no destination required | delete without transfer; reserve deleted; net worth unchanged | `goal.service.test.ts:704-730` (zero writes, goal + reserve deleted, order asserted); reserve-less: `:1040-1049` only goal row deleted, no account.delete; controller `:990-1023` | ✅ PASS |
| GOAL-37 balance > 0 → destination required + full transfer-back first | 400 without destination; atomic transfer-back before deletes | `goal.service.test.ts:732-741` (400, zero writes); `:743-782` full-balance pair then `goal.delete`/`account.delete`, exact write order asserted; controller `:1025-1056` (transfer-back in `$transaction`, count 1) and `:1058-1074` (400, no transaction.create) | ✅ PASS |
| GOAL-38 unlink real accounts, unmodified | junctions cascade; real accounts untouched | `goal.service.test.ts:784-794` touched accounts = {reserve, destination} only; FK `ON DELETE CASCADE` on `goal_linked_accounts.account_id` (`prisma/schema.prisma:394-395`, `prisma/migrations/20260825085131_add_financial_goals/migration.sql:49`) | ✅ PASS |
| GOAL-39 no dangling transfer relations | counterpart legs survive with SetNull link | Schema-level: `prisma/schema.prisma:276-277` `Transaction.account onDelete: Cascade` + `relatedTransaction onDelete: SetNull`; delete flow only removes the reserve account (`goal.controller.ts` → `deleteGoalWithTransferBack`), so real-account legs persist with `relatedTransactionId` nulled — verified by inspection (schema + migration DDL; coverage matrix assigns migration layer to build gate) | ✅ PASS |
| GOAL-40 transfer-back failure aborts deletion | goal kept intact, error alert | `goal.service.test.ts:819-832` (injected failure → `goal.delete`/`account.delete` counts 0); single `$transaction` wrapper `goal.controller.ts:468-470`; frontend alert `useGoalMutations.ts:180-188` | ✅ PASS |

### P2: Linked Account Deletion Interplay

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-41 real-account deletion unlinks + recompute | deletion unblocks, junction cascades, current amount drops | `src/controllers/account.controller.ts:615-617` plain `prisma.account.delete` (no goal block) + FK cascade `ON DELETE CASCADE` (`migration.sql:49`); current amount recomputed client-side from surviving links (`goalCalculations.ts:29-46`) — verified by inspection (schema-level, build-gate layer per coverage matrix) | ✅ PASS |
| GOAL-42 real-account deletion never touches reserves | reserves unmodified | `account.controller.ts:608-613,615-617`: only the target account row is deleted; no goal/reserve writes; tests `account.controller.test.ts:235-267` (virtual delete blocked, `deleteCalls === 0`) and `:269-301` (regular delete works). Documented deviation: the guard's AppError(400) surfaces as 401 due to that controller's pre-existing catch-all (`:625-628`) — pre-existing tech debt, not a feature regression | ✅ PASS (note) |

### P2: Goal Evolution & Projection Chart

| Criterion | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| GOAL-51 / AC-1 cumulative evolution from all goal-account transactions, seeded to current amount | month buckets from first movement → current; final point = current amount; seed holds pre-window balances | `src/__tests__/utils/buildGoalProjection.spec.ts:59-84` (points `500,1000,1500` + monthKeys), `:86-108` (calendar-month fill), `:247-272` (amendment-2 seed: starts 5500, ends 6000, average stays 500), `:274-292` (direct CREDIT/DEBIT flows), `:230-245` (created_at fallback); integration `GoalDetails/index.tsx:345-349` (chart directly below header card, fed `progress.currentAmount`) + `GoalProjectionChart/index.tsx:49-66` | ✅ PASS |
| GOAL-52 / AC-2 dashed projection at average until target + arrowhead | projection only while average > 0; dashed line; arrowhead at final point | `buildGoalProjection.spec.ts:59-84` (projection bucket `2027-12 → 2000`, `isProjection` flags), `:143-157` (negative average → history only); rendering `GoalProjectionChart/index.tsx:117` `strokeDashArray2={[6,4]}`, `:119-127` `showArrow2` + `arrowConfig2` — verified by inspection | ✅ PASS |
| AC-3 average formula | (last − first) / (elapsed buckets − 1) | `buildGoalProjection.spec.ts:106-107` `(1500 − 500) / (5 − 1) = 250`; impl `buildGoalProjection.ts:154-158` (sensor mutation 6 killed by 8 tests) | ✅ PASS |
| GOAL-53 / AC-4 guards | < 2 movement months → no chart (and no projection) | `buildGoalProjection.spec.ts:110-141` (`toBeNull()` for 1 month, 0 months, future-only); component `GoalProjectionChart/index.tsx:64-66` `return null` (sensor mutation 8 killed) | ✅ PASS |
| AC-5 60-month cap, capped projection rendered anyway | exactly 60 projected buckets, target unreached still renders | `buildGoalProjection.spec.ts:159-180` (`toHaveLength(62)`, 60 projected, last `2032-10`, value 620) (sensor mutation 7 killed) | ✅ PASS |
| AC-6 pt-BR labels, year on first/last bucket of each year, compact-k Y axis, target as top reference | labels per spec | `buildGoalProjection.spec.ts:182-203` (year labels on first/last of 2027 and 2028); Y axis `GoalProjectionChart/index.tsx:144-160` compact `k` form; top reference `:109` `maxValue={Math.max(projection.targetAmount, ...values)}` — verified by inspection. Note: year rendered two-digit (`"MMM '\n' yy"`, user layout fix `1d05835`, test aligned `65cfbfd`); spec does not pin the year format | ✅ PASS (note) |
| AC-7 hideAmount masks data-point texts + focused values | when `hideAmount` on, no chart values render | ✅ **PASS (re-verified after `620cbec`)** — `GoalProjectionChart/index.tsx:132-133` now passes BOTH `showTextOnFocus={!hideAmount}` AND `showValuesAsDataPointsText={!hideAmount}`. Library trace (`react-native-gifted-charts@1.4.7`, unchanged): with `hideAmount` ON both props are false, so `text` is never assigned in either branch (`dist/LineChart/index.js:308-322`) and the render gate `text || item.dataPointText ?` (`:409`) is falsy → no `CanvasText` renders anywhere (data-point texts and focused values fully masked). With `hideAmount` OFF both are true: `text = value` (`:320-322`) and the gate `!showTextOnFocus || index === selectedIndex` (`:410`) renders only the focused point's value — unchanged desired behavior. Fix surface: `git show 620cbec` = 1 file, +3/−2, the prop + comment only; no working-tree drift. Layer has no automated test (documented blocker; see sensor mutation 9) — verified by inspection against the library render code, the coverage-matrix mechanism for this layer | ✅ PASS |

**Status**: ✅ All 63 criteria covered (57 story ACs + 6 edge cases). AC-7 re-verified PASS after fix `620cbec`. Spec-precision notes (non-blocking): GOAL-04 footer button vs FAB; AC-6 two-digit year; GOAL-42 catch-all 401. No ⚠️ spec-precision gaps where the spec left an outcome undefined.

---

## Edge Cases

- [x] Deposit/withdraw amount ≤ 0 → rejected before any API call: Yup `.positive` (`RegisterGoalMovement/index.tsx:136-139`), zod `.positive` (`goal.schema.ts:60,92`; tests `goal.schema.test.ts:220-230,256-265`), service `assertPositiveAmount` (`goal.service.test.ts:468-495` zero writes)
- [x] Two deposits in quick succession applied atomically: every write inside `prisma.$transaction` (`goal.controller.ts:370-386`) with SQL balance increments via `createTransferPair`; mid-flow failure aborts (pattern proven by `goal.service.test.ts:819-832` and the transaction suite's `AC-1.2` no-writes-after-failure test)
- [x] API unreachable → rollback optimistic state + error alert: `useGoalMutations.ts:131-136` (create restore), `:180-188` (delete restore), `useGoalMovementMutations.ts:67-72,87-92` (movement alerts) — verified by inspection
- [x] Completed/Archived empty lists render empty state, no crash: `CompletedGoals/index.tsx:101-103`, `ArchivedGoals/index.tsx:125-127` — verified by inspection
- [x] Linked accounts ≥ 100% of target at creation → immediate "Meta atingida": `isAmountReached` at `>= 100` (`goalCalculations.ts:54`, tests `:111-131`) computed on the optimistic create that mirrors linked balances (`useGoalMutations.ts:79-118`)
- [x] Multi-currency deposit converts via current quotes as regular transfers: `convertCurrency` at live quotes (`RegisterGoalMovement/index.tsx:169-184`), per-leg persistence tested (`goal.service.test.ts:559-584`)

---

## Discrimination Sensor

P0/full depth (money movement + data integrity). Scratch protocol: `git worktree` blocked by sandbox (.git protected) → documented fallback used: `cp <file> $TMPDIR/<file>.bak` → mutate working file → run the covering test → restore from backup → `diff` + `git status --porcelain` vs pre-sensor baseline (backend: clean; frontend: ` M android/app/build.gradle` — pre-existing). Both trees byte-identical to baseline after all 8 mutations.

| # | Mutation | File:line | Description | Killed? |
| - | -------- | --------- | ----------- | ------- |
| 1 | Deposit leg routing | `smart-finances-backend/src/services/goal.service.ts:279` | Credit leg `accountId: target.id` → `data.sourceAccountId` (money credited to wrong account) | ✅ Killed — 3 failures: `GOAL-12 deposit debits the source and credits the reserve`, `GOAL-16 multi-currency`, `GOAL-46 deposit without a reserve` |
| 2 | GOAL-48 linked check bypass | `goal.service.ts:221-224` | `if (!isLinked) throw` → `if (false && !isLinked)` (non-linked account accepted) | ✅ Killed — `GOAL-48` deposit + withdraw rejection tests (exact 400 + message + zero writes) |
| 3 | Delete transfer-back removed | `goal.service.ts:407` | `if (balance.greaterThan(0))` → `if (false && ...)` (reserve money orphaned on delete) | ✅ Killed — 5 service failures (`GOAL-37` ×3, `GOAL-38/39`, `GOAL-40`) + 3 controller failures |
| 4 | GOAL-49 default exclusion dropped | `account.controller.ts:26` | `...(includeVirtual ? {} : { isVirtual: false })` removed from where | ✅ Killed — `GOAL-49` test asserting `findManyArgs[0].where.isVirtual === false` |
| 4b | GOAL-50 DTO flag dropped | `account.controller.ts:67` | `isVirtual: account.isVirtual` removed from DTO | ✅ Killed — `GOAL-50` test asserting `payload.map(a => a.isVirtual) === [false, true]` |
| 5 | Null-safe reserve fallback broken | `SmartFinances/src/utils/goalCalculations.ts:29` | `goal?.reserve_account?.balance ?? 0` → `goal.reserve_account.balance` (throws on linked-only goals) | ✅ Killed — `GOAL-43/44 linked-only goal (reserve_account null)` test |
| 6 | Average formula broken | `SmartFinances/src/utils/buildGoalProjection.ts:158` | `.div(history.length - 1)` → `.div(history.length)` | ✅ Killed — 8 failures incl. the AC-3 elapsed-buckets test |
| 7 | 60-month cap broken | `buildGoalProjection.ts:167` | `months < MAX_PROJECTION_MONTHS` → `months < 59` | ✅ Killed — AC-5 cap test (expects 62 points, last `2032-10`) |
| 8 | <2-months guard broken | `buildGoalProjection.ts:111` | `flowsByMonth.size < 2` → `< 1` | ✅ Killed — AC-4 `returns null with fewer than 2 distinct movement months` |
| 9 | Fix regression probe (re-verify round, 2026-09-14) | `GoalProjectionChart/index.tsx:133` | `showValuesAsDataPointsText={!hideAmount}` reverted to unconditional (the pre-fix bug) | ❌ Survived — full suite still 181 passed; expected: the chart component layer has no automated test by design (coverage matrix: build gate + Verifier spec-check + UAT) and jest cannot render it (pre-existing ESM transform blocker, STATE.md #13/#14 class). The AC is guarded by the spec-check trace above; add a chart masking render test when the screen-test infra is fixed (tracked with the existing blocker) |

**Sensor depth**: P0-full (9 mutations across initial pass + fix re-verify; ≥5 required)
**Result**: 8/9 killed, 1 survivor confined to the documented no-test UI layer (fix-regression probe, mutation 9). Zero survivors in any tested layer — no test-strengthening fix tasks needed beyond the tracked screen-test blocker.

---

## Interactive UAT Results

Not performed — this is the independent Verifier pass (read-only). Interactive UAT remains for the user to exercise on device; the one gap found (chart masking) is a code-level defect, not a judgment call.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ (virtual-delete guard slightly exceeds GOAL-42's letter but enforces the spec's reserve-only-via-goal invariant; documented in commit) |
| No abstractions for single-use code | ✅ (service functions are flat orchestration; no speculative generics) |
| No unnecessary "flexibility" | ✅ (injected `tx` matches the established fake-tx test pattern, not extra config) |
| Only touched files required for task | ✅ (commit surface is goal-scoped; visibility edits are the minimum the audit required) |
| Didn't "improve" unrelated code | ✅ (user's interleaved commits excluded from judgment; no drive-by refactors in goal commits) |
| Matches existing patterns/style | ✅ (snake_case DTOs, AppError codes, mocked req/res tests, yup forms, styled-components screens) |
| Would senior engineer approve? | ✅ for everything except the AC-7 prop wiring (`showValuesAsDataPointsText` unconditional) |
| Tests map to ACs and are non-shallow (spot-check: P1 Details story) | ✅ — `GOAL-12` service test asserts exact leg types, accounts, signed amounts, and balance increments, not just "no throw" |
| Spec-anchored outcome check | ✅ for 62/63; ❌ AC-7 (masking) — assertion outcomes match spec-defined values elsewhere (400s, newest-first, full-balance transfer-back, ACTIVE default, cascade order) |
| Per-layer Coverage Expectation met | ✅ — service 1:1 to ACs; controller covers happy+edge+error per route (404 foreign, 400 inactive, 400 over-balance, 400 non-linked, 201/200 happy); utils 1:1; migration layer by build gate per matrix |
| Every test in scope maps to a spec AC / edge / Done-when | ✅ — all goal tests carry GOAL-xx/AC-x/D-x labels; category-resolution tests map to the design error table required by GOAL-12/13 happy paths; no unclaimed goal tests |
| Documented guidelines followed | ✅ none found (no AGENTS.md/CI gates) — strong defaults applied per tasks.md coverage matrix |

---

## Gate Check

Re-run 2026-09-14 after fix `620cbec` (all counts re-derived by the Verifier, not taken from the fix report):

- **Backend full gate**: `yarn test:unit && yarn build` → **202 tests, 202 pass, 0 fail, 0 skipped** (12 test files, explicit `test:unit` list includes all 3 goal files + account controller); `tsc` build green.
- **Frontend full gate**: `npx jest --watchman=false` → **181 tests passed, 0 failed** across 22 suites; `src/__tests__/screens/profile.spec.tsx` suite fails at the **transform stage** (`SyntaxError: Cannot use import statement outside a module` from `phosphor-react-native/src/icons/DotsThreeCircle.tsx` via `HeaderIcon → Header → SignUp → profile.spec`) — verified a transform error, not an assertion failure; unrelated to any goal file (documented pre-existing baseline).
- **Frontend tsc**: `npx tsc --noEmit` → **548 errors, 0 in goal files** (re-confirmed post-fix; repo-wide styled-components `DefaultTheme` baseline; 615 → 548 after the user's theme-typings work). Confirmed by grep over the full error list: no match for any goal/Goal path.
- **Test count before feature**: backend 0 goal tests (suite 174 pre-amendment per batch log; 62 goal tests at batch 1); frontend 0 goal tests (137 total at batch 4 before chart).
- **Test count after feature**: backend 202 (of which 114 goal tests across `goal.schema` 30 + `goal.service` 48 + `goal.controller` 36; plus 4 goal tests in `account.controller` = 118 goal-scoped); frontend 19 goal tests (9 `goalCalculations` + 10 `buildGoalProjection`).
- **Delta**: +202−174 backend suite growth all additive; no test deleted, no assertion weakened (all goal commits additive; `f298f7b` +383 additive lines).
- **Skipped tests**: none.
- **Failures**: `profile.spec.tsx` pre-existing transform failure only (documented baseline, not a feature regression).

---

## Fix Plans

### Fix 1: Chart `hideAmount` masking is inverted (GOAL-53 / chart AC-7) — ✅ FIXED & VERIFIED

- **Root cause** (initial pass): `showValuesAsDataPointsText` was unconditional, inverting the `showTextOnFocus={!hideAmount}` mask.
- **Fix**: `620cbec` "fix(goals): mask chart data point texts while amounts are hidden" — 1 file (`GoalProjectionChart/index.tsx`), +3/−2: `showValuesAsDataPointsText={!hideAmount}`. Mutation surface confirmed to be this commit only; no working-tree drift.
- **Verification**: library render-gate trace (AC-7 row above) — with `hideAmount` ON no value text renders at all; with OFF only the focused point's value renders. Gates re-run green (below). Fix→re-verify iteration 1 of max 3.
- **Residual (non-blocking)**: mutation 9 shows a regression of this line would pass the suite — no chart-layer test can render under the current jest ESM transform blocker. Add the masking render test when screen-test infra is fixed (same tracker as STATE.md #13).
- **Priority**: closed (was Major)

---

## Requirement Traceability Update

Proposed spec.md status updates (Verifier proposal — applied by the orchestrator):

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| GOAL-01..GOAL-52 | Implementing | ✅ Verified |
| GOAL-53 | Implementing → ❌ Needs Fix (initial pass) | ✅ Verified (AC-4/5/6 at initial pass; AC-7 fixed in `620cbec` and re-verified 2026-09-14) |

---

## Summary

**Overall**: ✅ PASS — Ready (after fix→re-verify iteration 1 of max 3)

**Result**: PASS ✅ — 63/63 criteria evidenced; GOAL-53/AC-7 fixed in `620cbec` and re-verified; all gates green.

**Spec-anchored check**: 63/63 criteria matched the spec-defined outcome with `file:line` evidence (AC-7 re-verified PASS after `620cbec`); 0 hard spec-precision gaps (3 non-blocking notes: footer button vs FAB, two-digit year label, pre-existing 401 catch-all in `deleteAccount`).
**Sensor**: 8/9 mutations killed; the single survivor is the fix-regression probe on the chart component layer, which has no automated test by documented design (jest cannot render it) — the AC is guarded by the cited library render-code trace.
**Gate** (re-run 2026-09-14 post-fix): backend 202 passed, 0 failed + build green; frontend 181 passed (19/19 goal utils; `profile.spec.tsx` pre-existing transform failure confirmed unchanged); tsc 548 baseline errors, 0 in goal files.

**What works**: the full goal lifecycle (create with conditional reserve, deposit/withdraw as transfer pairs across reserve and linked-account routing with per-leg multi-currency, conclude/archive/unarchive with previous-status restore, delete with atomic full-balance transfer-back), the visibility contract (virtual reserves: excluded from every list/picker by default, included in net worth, server-side default-exclude), the evolution/projection math with seeded amendment-2 behavior, and — after `620cbec` — complete `hideAmount` masking on the chart (no data-point texts, no focused values).

**Issues found**: none open. Residual watch item (non-blocking): chart-layer regressions cannot be caught by the suite until the jest ESM transform blocker is fixed (STATE.md #13 class) — add the masking render test then.

**Next steps**: ship. Separately: `prisma migrate deploy` for `20260825085131_add_financial_goals` + `20260827120000_goal_reserve_optional` remains pending on cPanel (STATE.md #16) — deployment blocker, not a code defect.

---

# Amendment 3 Validation (2026-09-15) — Chart X-Axis Labels Across Projected Months (GOAL-54)

**Date**: 2026-09-15
**Spec**: `.specs/features/financial-goals/spec.md` — story "P2: Goal Evolution & Projection Chart", AC-8 (amendment 3, 2026-09-15) + GOAL-54 traceability row (`spec.md:314`)
**Design context**: `.specs/features/financial-goals/design.md:190` (D3 amendment 3)
**Diff range**: `9b83ff0..e4ad92e` (2 commits: `9b83ff0` docs amendment; `e4ad92e` fix)
**Verifier**: independent sub-agent (author ≠ verifier)
**Overall verdict**: PASS ✅

---

## Task Completion (amendment 3)

| Task | Status | Notes |
| ---- | ------ | ----- |
| `9b83ff0` docs: AC-8 + GOAL-54 row + D3 amendment note | ✅ Done | `spec.md:236`, `spec.md:314`, `design.md:190` |
| `e4ad92e` fix: `buildGoalChartSeries` util + spec-anchored tests + chart rewiring | ✅ Done | `src/utils/buildGoalChartSeries.ts`, `src/__tests__/utils/buildGoalChartSeries.spec.ts`, `src/screens/GoalDetails/components/GoalProjectionChart/index.tsx:72,126` — no blocked/partial items |

---

## Spec-Anchored Acceptance Criteria (amendment 3, evidence-or-zero)

Paths are repo-relative to `SmartFinances`. Regression surface (AC-2/AC-4) is re-verified per validation mandate; all other P2 ACs (1,3,5,6,7) are untouched by the diff (verified: the diff changes only the chart datasets/labels construction).

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| GOAL-54 / AC-8: WHILE the projection line is rendered, the X axis SHALL carry the date label of every plotted month, real and projected alike | In the spec's Independent Test scenario (3 real months 500/1000/1500 + 1 projected month reaching 2000): the primary dataset spans all 4 plotted months so the library (labels mapped per primary item, design D3) renders all 4 labels; real months carry numeric values; the projected month carries a non-numeric placeholder that stays undrawn (`interpolateMissingValues: false`, D3) | `src/__tests__/utils/buildGoalChartSeries.spec.ts:37` — `expect(series.data).toHaveLength(4)`; `:38` — `expect(series.labels).toEqual(['set','out','nov',"dez\n26"])`; `:44-46` — `expect(series.data.map((item) => item.value)).toEqual([500, 1000, 1500, undefined])` (scenario values match the spec's Independent Test exactly); impl `src/utils/buildGoalChartSeries.ts:38-40`; integration `GoalProjectionChart/index.tsx:72` — `buildGoalChartSeries(projection.points)` — and `:126` `xAxisLabelTexts={labels}`; D3 mechanism preserved at `:98` `interpolateMissingValues={false}` | ✅ PASS |
| AC-2 (regression surface): WHILE average monthly progress is positive, the chart SHALL extend a dashed projection from the last real month onward until the target, WITH an arrowhead at the final point | `data2`: undefined over the earlier real indices, the last real cumulative (1500) at the connect index, then one value per projected month (2000); arrowhead only when a projection exists | `buildGoalChartSeries.spec.ts:52-57` — `expect(series.data2?.map((item) => item.value)).toEqual([undefined, undefined, 1500, 2000])`; impl `buildGoalChartSeries.ts:42-47` (connect index = `realCount - 1`); wiring unchanged behavior: `GoalProjectionChart/index.tsx:89` `data2={data2}`, `:109` `strokeDashArray2={[6, 4]}`, `:111` `showArrow2={!!data2}` + `:112-119` `arrowConfig2` | ✅ PASS |
| AC-4 (regression surface): IF no projection (average ≤ 0) THEN the system SHALL NOT render the projection | No overlay: `data2` is `undefined`; no padding artifacts: `data` keeps only real values, `labels` covers only real months | `buildGoalChartSeries.spec.ts:63-65` — `expect(series.data2).toBeUndefined()`, `expect(series.data.map((item) => item.value)).toEqual([500, 1000, 1500])`, `expect(series.labels).toEqual(['set', 'out', 'nov'])`; impl `buildGoalChartSeries.ts:34-36,42-44` (`firstProjectionIndex === -1 → data2 undefined`); component guard untouched `GoalProjectionChart/index.tsx:64-66` | ✅ PASS |

**Status**: ✅ 3/3 in-scope criteria matched the spec-defined outcome with `file:line` evidence; 0 spec-precision gaps (AC-8's label values are pinned by the spec's Independent Test scenario).

---

## Discrimination Sensor (amendment 3)

Lightweight depth (P2 visual layer; the 2 mandated behavior-level mutants). Scratch protocol (documented fallback, same class as the feature report — `git worktree` blocked by the sandbox, `.git` protected): `cp src/utils/buildGoalChartSeries.ts $TMPDIR/...orig` → apply behavior-level fault via edit → run the covering gate → restore from backup → verify isolation → delete temp copies. Isolation verified after both mutants: `git diff HEAD` on the mutated file = 0 lines (byte-identical to HEAD); `git status --porcelain` identical to the pre-sensor baseline (` M android/app/build.gradle`, pre-existing and untouched throughout); diff-range stat unchanged (5 files, 128+/17−); temp copies removed.

| # | Mutation | File:line | Description | Killed? |
| - | -------- | --------- | ----------- | ------- |
| A | Revert the padding (the original bug) | `src/utils/buildGoalChartSeries.ts:38-40` | `data` maps only `points.slice(0, realCount)` — projected months get no primary-dataset slot | ✅ Killed — AC-8 test fails (`buildGoalChartSeries.spec.ts:37`: expected length 4, received 3), jest exit 1 |
| B | Connect index also `undefined` | `src/utils/buildGoalChartSeries.ts:46` | `index < realCount - 1` → `index < realCount` — the dashed overlay drops the last real cumulative (1500) at the connect index | ✅ Killed — AC-2 test fails (`buildGoalChartSeries.spec.ts:52`: expected `[undefined, undefined, 1500, 2000]`, received `[undefined, undefined, undefined, 2000]`), jest exit 1 |

**Sensor depth**: lightweight (2 mutants, the mandated pair)  
**Result**: 2/2 killed — PASS ✅

Residual (non-blocking, carried from the feature report): the JSX wiring itself (`GoalProjectionChart/index.tsx:72,88-89,126`) sits in the documented no-test component layer (jest cannot render it — pre-existing ESM transform blocker, STATE.md #13 class). Mutation A applied at the JSX call site would survive the suite; the layer is guarded by the util-level tests above + inspection (same mechanism as AC-7 in the feature report). This is the tracked blocker, not a new gap.

---

## Code Quality (amendment 3)

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ (dataset shaping only; no chart props, styling, or guard behavior changed) |
| No abstractions for single-use code | ✅ (one pure util shaping chart props; extraction mirrors the existing `buildGoalProjection` pattern and is what makes AC-8 testable) |
| No unnecessary "flexibility" added | ✅ (single concrete signature; no options/config) |
| Only touched files required for task | ✅ (util, its spec, the one chart component, spec/design docs) |
| Didn't "improve" unrelated code | ✅ (component edit is minimal: inline `data`/`data2` construction + label mapping replaced by the util call; all other JSX props untouched) |
| Matches existing patterns/style | ✅ (same util + colocated spec file layout as `buildGoalProjection`/`buildGoalProjection.spec.ts`) |
| Would senior engineer approve? | ✅ |
| Tests map to ACs and are non-shallow | ✅ — exact value equality on datasets and labels (`toEqual` with the spec's Independent Test values), not mere existence checks |
| Spec-anchored outcome check | ✅ — asserted values are the spec-defined scenario values (table above) |
| Per-layer Coverage Expectation met | ✅ — domain util 1:1 to ACs; component layer per the documented coverage matrix (inspection) |
| Every test in scope maps to a spec AC / edge / Done-when | ✅ — 4/4 (AC-8 ×2, AC-2, AC-4); no unclaimed tests |
| Documented guidelines followed | ✅ none found (no AGENTS.md/CI gates) — strong defaults applied per the coverage matrix |

---

## Edge Cases (amendment 3 scope)

- [x] No projection → no overlay and no orphaned placeholder slots/labels: covered by the AC-4 test (`buildGoalChartSeries.spec.ts:60-66`)
- [x] Component guard regression surface (< 2 movement months → no chart): untouched (`GoalProjectionChart/index.tsx:64-66`); projection-impossible goals keep AC-4 behavior via the same `firstProjectionIndex === -1` branch (`buildGoalChartSeries.ts:34-36`)

---

## Gate Check (amendment 3)

- **Gate command**: `npx jest src/__tests__/utils/buildGoalChartSeries.spec.ts` (executed with `--watchman=false` — watchman is blocked by the Verifier sandbox; same documented workaround as the feature report's gate)
- **Result**: 4 passed, 0 failed, 0 skipped
- **Full suite regression count**: `npx jest --watchman=false` → **185 passed, 185 total across 23 suites** (1 suite fails at the transform stage — `src/__tests__/screens/profile.spec.tsx`, `phosphor-react-native` ESM issue: pre-existing documented baseline, unrelated to this change; the eslint `airbnb` config breakage is likewise pre-existing and repo-wide, not counted against this work)
- **Test count before amendment**: 0 in `buildGoalChartSeries.spec.ts` (new file); 181 suite-wide (feature report figure, 2026-09-14)
- **Test count after amendment**: 4 in scope file; 185 suite-wide
- **Delta**: +4, all additive; no test deleted and no assertion weakened (the diff is additive on test files; `buildGoalProjection.spec.ts` untouched)
- **Skipped tests**: none
- **Failures**: only the pre-existing `profile.spec.tsx` transform failure

---

## Requirement Traceability Update (amendment 3)

Verifier proposal (applied by the orchestrator):

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| GOAL-54 | 🚧 Implementing | ✅ Verified |

---

## Summary (amendment 3)

**Overall**: ✅ Ready

**Spec-anchored check**: 3/3 in-scope criteria matched the spec-defined outcome with `file:line` evidence (AC-8 primary; AC-2/AC-4 regression surface); 0 spec-precision gaps  
**Sensor**: 2/2 mutations killed (the mandated pair: reverted padding, connect index undefined)  
**Gate**: 4 passed in scope; 185 passed suite-wide; pre-existing failures unchanged

**What works**: the GoalDetails chart's primary dataset and label series now span every plotted month, so projected months carry their x-axis date labels (AC-8), while the dashed overlay connect behavior, arrowhead, masking wiring, and the no-projection/guard behavior are preserved untouched (AC-2/AC-4 regression surface re-verified).

**Issues found**: none open. Non-blocking residual carried from the feature report: the component-layer JSX wiring has no automated render test (documented blocker, STATE.md #13 class), guarded by util-level tests + inspection.

**Next steps**: interactive UAT on device for the visual label rendering (user-facing layer, judgment reserved for the user); route GOAL-54 to ✅ Verified.
