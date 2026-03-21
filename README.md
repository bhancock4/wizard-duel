# Wizard Duel

A text-based wizard duel game where you cast spells by typing anything you can imagine. Powered by Claude AI as both your opponent (Malachar the ancient wizard) and the narrator who adjudicates what actually happens.

## Gameplay

You face Malachar in a duel to the death. Each turn, describe what your wizard does — anything goes. Transmute him into a cloud. Invoke the heat death of the universe. Bribe gravity. The AI will narrate the outcome, counter with Malachar's response, and track the damage.

**Resources**

- **HP** — Both wizards start at 100. First to 0 loses. You can also surrender (say so in your spell).
- **Words** — You get 30 free words per turn. Each additional 10 words costs 5 HP (the "blood price"). Maximum 80 words total. Running low on HP limits your verbosity.
- **Paradox** — Rises when you bend reality. Above 60%: spells become unpredictable. Above 80%: catastrophic backfire risk — your own power may turn against you.

At game over you can copy or download a full transcript of the duel.

## Setup

You need an [Anthropic API key](https://console.anthropic.com/) with access to Claude Opus.

```bash
npm install
```

Create `.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Note:** The API key is used directly from the browser (`dangerouslyAllowBrowser: true`). This is intentional for a local personal game — do not deploy this publicly without moving the API calls server-side.

## Technical Details

**Stack**

- React 19 + Vite + TypeScript
- Anthropic SDK (`@anthropic-ai/sdk`) — `claude-opus-4-6`
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)

**AI Design**

A single Claude call per turn handles everything: Malachar plays his counter-spell, the narrator describes what happens, and the arbiter decides the mechanical outcome (HP deltas, paradox changes, win conditions). The system prompt defines all three roles simultaneously.

The model returns a raw JSON object with fields for narrative text, Malachar's spell, HP/paradox deltas, and game-over state. An `extractJSON()` helper strips any markdown fencing if the model wraps its response. Damage values are clamped client-side after the call to prevent any single spell from being too swingy.

**Game State**

All state lives in `useGame` (a custom React hook). A `useRef` mirror of state is used to capture the current game state synchronously inside an async `castSpell` function, avoiding stale closure issues with the AI response racing against React re-renders.

**Visuals**

The aesthetic targets 1990s D&D PC games (Eye of the Beholder, Dungeon Master). Key choices:

- `Press Start 2P` — pixel font for UI chrome, headers, stat labels
- `VT323` — retro terminal font for narrative text and dialogue
- Dark stone/dungeon palette with gold accents, blood red for damage, purple for paradox
- Stone walls rendered procedurally: deterministic hash functions generate grain, moss patches, and brick variation without `Math.random()` so the appearance is stable across renders
- Wizard portraits are 16×20 pixel art rendered as SVG `<rect>` grids (48×60px display at 3px/cell)
- Panel flash effect: HP drop → red border pulse; paradox rise → purple border pulse (700ms, tracked via `useRef`)

**Project Structure**

```
src/
  ai/duelist.ts        — All Claude API calls (processTurn, getOpeningTaunt)
  hooks/useGame.ts     — Game state and castSpell logic
  types.ts             — Shared types and game constants
  components/
    App.tsx            — Top-level layout and screen routing
    TitleScreen.tsx    — Opening screen
    StatusBars.tsx     — HP/paradox bars with flash effect and wizard portrait
    BattleLog.tsx      — Scrolling narrative log
    SpellInput.tsx     — Word-counted spell entry with blood price indicator
    GameOver.tsx       — End screen with transcript export
    StoneWall.tsx      — Procedural stone wall columns
    WizardPortrait.tsx — Pixel art SVG wizard faces
```

**Commands**

```bash
npm run dev       # Dev server
npm run build     # Production build
npx tsc --noEmit  # Type check
```
