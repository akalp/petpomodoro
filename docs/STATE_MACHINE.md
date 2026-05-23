# Pomodoro Session State Machine

## States

### `idle`

No active Pomodoro session is in progress. The user can start a new focus session.

### `running`

A focus session has started. The app has saved `startedAt`, `expectedEndAt`, and `plannedDurationMinutes`.

The app may be closed or backgrounded while this state is active. On the next launch or foreground check, the app should compare the current local time with `expectedEndAt`.

### `awaiting_confirmation`

The local expected end time has passed, but the app still needs the user's honest answer. The pet has not received a reward yet.

The confirmation prompt is:

> Your pet waited for you. Did you really finish this focus session?

Choices:

- Yes, we did it
- Not this time

### `completed`

The user confirmed that they completed the focus session. The session is eligible for a pet reward exactly once.

### `abandoned`

The user ended the session early or honestly said they did not complete it. Early cancellation gives no reward. A declined confirmation after the planned focus window may grant one small honesty reward.

## Allowed Transitions

| From | To | Trigger | Data changes | Reward behavior |
| --- | --- | --- | --- | --- |
| `idle` | `running` | User starts a focus session | Create session with `startedAt`, `expectedEndAt`, `plannedDurationMinutes`, `rewardClaimedAt = null` | No reward |
| `running` | `awaiting_confirmation` | Current local time is greater than or equal to `expectedEndAt` | Apply elapsed focus care impact through `expectedEndAt`; update status to `awaiting_confirmation` | Base focus coins only; no completion reward |
| `running` | `abandoned` | User ends a running session early | Apply elapsed focus care impact through `abandonedAt`; set `abandonedAt`, `abandonmentReason = cancelled`, status `abandoned` | Base focus coins only; no completion reward |
| `awaiting_confirmation` | `completed` | User selects "Yes, we did it" | Set `confirmedAt`, status `completed` | Apply reward if unclaimed |
| `awaiting_confirmation` | `abandoned` | User selects "Not this time" | Set `abandonedAt`, `abandonmentReason = honest_confirmation`, status `abandoned` | Apply one honesty reward if unclaimed |
| `completed` | `idle` | User dismisses result or starts another session | Clear active session reference | Reward already handled |
| `abandoned` | `idle` | User dismisses result or starts another session | Clear active session reference | No reward |

No other transitions should be allowed.

## Transition Details

### Start Session

Input:

- `plannedDurationMinutes`
- current local time as `now`

Rules:

- Only allowed from `idle`.
- Create a new session id.
- Set `startedAt = now`.
- Set `expectedEndAt = now + plannedDurationMinutes`.
- Set `confirmedAt = null`.
- Set `abandonedAt = null`.
- Set `abandonmentReason = null`.
- Set `rewardClaimedAt = null`.
- Set status to `running`.

### Check Time

Input:

- active session
- current local time as `now`

Rules:

- Only changes state when current status is `running`.
- If `now < expectedEndAt`, keep status `running`.
- If `now >= expectedEndAt`, change status to `awaiting_confirmation`.
- Do not apply rewards during this transition.

This check should run during app launch, foreground return, and any in-app timer tick used while the app is open.

### Confirm Completion

Input:

- active session in `awaiting_confirmation`
- current local time as `now`
- current pet

Rules:

- Only allowed from `awaiting_confirmation`.
- Set session status to `completed`.
- Set `confirmedAt = now`.
- Apply reward only if:
  - `rewardClaimedAt` is null.
  - no reward ledger record exists for this `sessionId`.
  - session status is moving to `completed`.
- Set `rewardClaimedAt = now` when reward succeeds.
- Create a reward ledger record for the session.

### Abandon Session

Input:

- active session in `running` or `awaiting_confirmation`
- current local time as `now`

Rules:

- Set session status to `abandoned`.
- Set `abandonedAt = now`.
- Set `abandonmentReason = cancelled` for early ending from `running`.
- Set `abandonmentReason = honest_confirmation` for "Not this time" from `awaiting_confirmation`.
- Leave `confirmedAt = null`.
- Early cancellation leaves `rewardClaimedAt = null` and creates no ledger record. Elapsed focus care impact and base focus coins still apply through the cancellation time.
- Honest declined confirmation may set `rewardClaimedAt`, create one ledger record, and apply only the documented honesty reward; it does not grant completion XP or levels.

### Return To Idle

Input:

- terminal session in `completed` or `abandoned`

Rules:

- Clear the active session reference in UI state.
- Keep the completed or abandoned session in persistent history.
- Starting a new session from a terminal state should first treat the previous terminal session as historical data.

## Reward Application

The MVP rewards are deterministic multi-stat updates: honestly completed focus sessions grant completion rewards, and a declined confirmation grants a smaller honesty-heart reward without completion XP. Elapsed focus time separately decreases hunger and energy and awards base focus coins, whether the session is completed or abandoned.

Reward logic should:

- Accept the pet, session, reward amount, and current time.
- Return updated pet data, updated session data, and a reward ledger row.
- Avoid side effects inside the pure domain function.
- Let the database layer persist all changes in one transaction.

## Feeding Shop

Feeding does not change the Pomodoro session state. Food purchases are local pet-care actions that spend coins and immediately adjust hunger, happiness, and energy.

The shop should be unavailable while a session is `running` or `awaiting_confirmation` so the active focus and confirmation flow remains clear. Once the session is terminal or there is no active session, feeding can resume without changing historical session data.

## Duplicate Reward Prevention

The same session must never reward the pet twice.

Protection should exist in two layers:

- Domain layer: do not generate a reward when `rewardClaimedAt` is already set, a session was cancelled early, or a session is otherwise not eligible.
- Persistence layer: enforce a unique `rewardLedger.sessionId` index in IndexedDB.

The confirmation action should be safe to retry after a refresh, double tap, or transient error. If a reward ledger row already exists, the app should treat the reward as already claimed and avoid adding more XP.

## Rehydration Rules

When the app launches or resumes:

- Load the latest non-terminal session if one exists.
- If it is `running` and `now >= expectedEndAt`, transition it to `awaiting_confirmation`.
- If it is `running` and `now < expectedEndAt`, keep it running.
- If it is already `awaiting_confirmation`, show the confirmation prompt.
- Do not auto-complete a session without user confirmation.
- Do not apply rewards during rehydration.
