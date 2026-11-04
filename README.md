# Keep It Flowing

A pipe-connecting puzzle for Bourn. Through five business stages, it shows why a fixed overdraft can't keep up with a growing business, and how the Flexible Trade Account (with a limit that grows with unpaid invoices) keeps money flowing.

*Business finance that flows. So you can too.*

## Run it

- Double-click `index.html`. It runs straight from the file system, with no build step and no server.
- Or upload the folder to any static host (Netlify, S3, GitHub Pages and so on).

Files:

```
index.html    markup for every screen
styles.css    brand styles and the responsive layout
game.js       CONFIG, the game engine, rendering and input
assets/       favicon and the How to play illustrations (put logo.png here)
```

The only external request is the Google Fonts stylesheet for Lexend Deca. If it can't load, the game falls back to the system font.

## How to play

- Pick a pipe in the tray (Straight, Corner, T-junction) and tap or click an empty square to place it.
- Tap a placed pipe to rotate it. Tap the selected tray piece again (or press **Rotate**) to turn the next piece.
- Long-press, right-click or use **Remove** to take a pipe away.
- Keyboard: arrow keys move the cursor, **R** rotates, **Enter** places or patches, **Delete** removes, **1 to 5** pick tools, **F** starts the flow early, **P** or **Esc** pauses.
- From level 2 you get one violet **Bourn pipe**. Drop it on the grey overdraft pipe. Its capacity grows with the invoices in the tank.

## Edit levels, copy and difficulty

Everything you can tune lives in the `CONFIG` object at the top of `game.js`:

- `CONFIG.urls.flowCheck`: the end-screen button link (placeholder `https://bourn.ai/flow-check`).
- `CONFIG.copy`: every on-screen string, including intro lines, tips, labels and the disclaimer.
- `CONFIG.scoring`: points per second left, per unit delivered, the spill penalty, and the star thresholds.
- `CONFIG.flow`: global flow rules. `bourn.base` and `bourn.scale` set how fast the Bourn pipe's limit grows with invoices waiting.
- `CONFIG.levels`: one object per level.

Level fields (grid coordinates are `[column, row]` from the top left, starting at 0):

| Field | What it does |
| --- | --- |
| `name`, `intro`, `newThing`, `hint` | Intro card text. `newThing` can contain `<strong>`. |
| `size` | Board is `size x size`. |
| `buildTime` | Countdown in seconds before the water starts. |
| `levelTime` | Seconds of flow allowed to reach the target. |
| `fillSpeed` | Tiles per second the water front moves. |
| `sources` | Tanks on the left. `row`, `rate: [start, end]` (invoice flow, ramped over `ramp` seconds), `tank` (size), `delay` (seconds after flow starts, or `[min, max]` for a random late payer). |
| `shuffleDelays` | Randomly swap the delays between tanks each attempt. |
| `dest.row` | Row of "Your business" on the right. |
| `gauge` | `start`, `target` (Growth), `drain` (running costs per second), `spillPenalty`, `leakPenalty`. |
| `fixedPipe` | `{ c, r, rot, capacity }` for the overdraft pipe, or `null`. |
| `bourn` | `count` per level, and `unlock`: `'start'` or `'bottleneck'` (unlocks after the overdraft has bottlenecked for a few seconds). |
| `walls` | List of `[c, r]` blocked squares. |
| `gates` | Annual review gates: `{ c, r, rot, opensAt, openFor }`. |
| `waits` | 60-day waits: `{ c, r, rot, opensAt, days }`. |
| `leaks` | Manual upload leaks: `{ c, r, rot, creep, patch }`. |

`rot` is `0` for vertical and `1` for horizontal. `opensAt` uses the level clock, which starts at the beginning of the countdown.

Tip for testing: add `?speed=3` to the URL to run the game clock three times faster.

## Swap in the real logo

At the very top of `game.js`:

```js
const LOGO_SRC = '';
```

Put the file at `assets/logo.png` and set `LOGO_SRC = 'assets/logo.png'`. Every logo slot (start screen, game bar, final screen) uses it. If the image fails to load, the text wordmark comes back.

## Wire up lead capture

The final screen saves the display name and score to a local leaderboard (`localStorage`, wrapped in `try/catch`). If the player adds an email and ticks the unticked consent box, the submission is stored locally under `kif.leads.v1` and passed to:

```js
function submitLead(data) { ... }
```

near the top of `game.js`, just below `CONFIG`. It's a clearly marked stub that sends nothing. Replace the body with your real `fetch` call. `data` contains `name`, `email`, `consent`, `score`, `stars`, `createdAt` and `source`.

## Notes

- Sound is off by default. The speaker button toggles generated Web Audio blips. There are no audio files.
- `prefers-reduced-motion` turns off particles, wobble and pulsing.
- The 60-day wait is introduced in level 3 alongside the review gate, because level 1 has no obstacles and level 2 focuses on the overdraft bottleneck. You can move it with the `waits` field.
- This is a game. It doesn't show real amounts, approval or terms.
