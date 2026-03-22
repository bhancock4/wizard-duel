# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npx tsc --noEmit  # Type check without building
```

## API Key Setup

Copy `.env.local` and set your key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

The Anthropic client uses `dangerouslyAllowBrowser: true` — this is intentional for a local-only personal game.

## Architecture

**Stack:** React + Vite + TypeScript + Anthropic SDK (`@anthropic-ai/sdk`) + Tailwind CSS (v4 via `@tailwindcss/vite` plugin)

**Visual theme:** 1990s D&D PC game aesthetic (Eye of the Beholder). Uses `Press Start 2P` (pixel font for headers/UI chrome) and `VT323` (retro terminal font for narrative text) from Google Fonts. Color palette is dark stone/dungeon with gold/amber accents, blood red for damage, and purple for paradox. Defined as CSS custom properties in `src/index.css`.

### Game Mechanics

- **HP:** Both wizards start at 100 HP. Game ends at 0 HP or surrender.
- **Word limit:** 30 free words per turn. Each extra 10 words costs 5 HP ("blood price"), max 80 words total.
- **Paradox:** 0–100%. Rises with reality-bending spells. Above 60% = unstable; above 80% = spells may backfire catastrophically. Tracked separately for player and opponent.
- **Surrender:** Detected by Claude via spell content (say "I surrender" or "I yield").

### Data Flow

```
User types spell → SpellInput → castSpell() (useGame hook)
  → deduct blood price HP immediately, set phase='thinking'
  → processTurn(spell, currentState) [Claude API call]
  → structured JSON response parsed → state updated → phase='playing' or 'over'
```

### Key Files

- `src/types.ts` — All shared types and game constants (`INITIAL_HP`, `BASE_WORD_LIMIT`, `BLOOD_PRICE_HP`, etc.)
- `src/ai/duelist.ts` — All Claude API calls. `processTurn()` uses structured JSON output (`output_config.format`) with an explicit JSON schema to guarantee parseable game state deltas. `getOpeningTaunt()` generates Malachar's opening line.
- `src/hooks/useGame.ts` — All game state (`useState` + `useRef` for async-safe state reads). `castSpell` captures state synchronously in the setState updater before the async AI call.
- `src/App.tsx` — Top-level layout; routes between title, duel arena, and game over screens based on `GameState.phase`.

### AI Design

Claude (`claude-haiku-4-5-20251001`) plays dual roles as **Malachar** (the opponent wizard) and **Narrator/Arbiter**. The system prompt defines both personalities and the adjudication rules (spell damage tiers, paradox effects, how counters reduce damage). Structured outputs guarantee a typed `TurnResult` response every call. The model is never streamed — responses come back in full and display immediately.

Malachar's damage/paradox numbers are clamped client-side after the AI call to prevent exploits (e.g., a single spell claiming 999 damage).
