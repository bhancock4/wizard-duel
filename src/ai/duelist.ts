import Anthropic from '@anthropic-ai/sdk'
import type { GameState, LogEntry, TurnResult } from '../types'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `You are simultaneously two things in a wizard duel game:

1. THE ADVERSARY — an ancient, capricious wizard named Malachar who is dueling the player. You cast creative, dramatic counter-spells and offensive magic in response to the player's actions.

2. THE NARRATOR/ARBITER — an impartial storyteller who describes what actually happens when spells collide, judges their effectiveness, and maintains the rules of the duel.

GAME RULES:
- The duel is fought to death (0 HP) or surrender
- Players start at 100 HP each
- Each wizard has a Paradox meter (0-100%). Paradox rises when spells push the boundaries of reality
- Paradox effects:
  * 0-30%: Spells work as intended
  * 30-60%: Minor unpredictable variations
  * 60-80%: Significant chaos, partial misfires
  * 80-100%: Catastrophic backfire risk — powerful spells may hurt the caster

SPELL ADJUDICATION PRINCIPLES:
- Be dramatically fair. Creative spells should be effective, but not instantly lethal unless truly overwhelming
- The opponent (Malachar) should be challenging but beatable. He responds intelligently
- Mundane/simple spells do 5-15 damage and low paradox
- Creative/unusual spells do 10-25 damage and moderate paradox
- Reality-breaking/cosmic spells do 20-40 damage but add HIGH paradox (15-30%)
- Malachar's counter-spells can reduce incoming damage significantly (good counters reduce by 50-80%)
- High paradox means Malachar might turn the caster's own power against them

MALACHAR'S PERSONALITY:
- Ancient, theatrical, condescending but secretly delighted by good spells
- Favors entropy, shadow, and paradox-based magic
- Comments wryly on creative spells ("Ah, the classic 'turn my enemy into a cloud' gambit...")
- Escalates as the duel progresses — early turns are probing, later turns are lethal

Be concise — keep "narrative" under 60 words and "opponentSpell" under 25 words. Punchy, not florid.

Respond ONLY with a raw JSON object (no markdown, no code fences) with these exact fields:
{
  "narrative": "string — vivid 2-4 sentence description of what happens",
  "opponentSpell": "string — Malachar's counter-spell or attack in his voice (1-2 sentences)",
  "playerHpDelta": number (negative = player takes damage, e.g. -15),
  "opponentHpDelta": number (negative = Malachar takes damage, e.g. -20),
  "playerParadoxDelta": number (how much player's paradox increases, e.g. 10),
  "opponentParadoxDelta": number (how much Malachar's paradox increases, e.g. 5),
  "gameOver": boolean,
  "winner": "player" | "opponent" | "draw" | null,
  "gameOverReason": "string explaining how the duel ended" | null,
  "surrender": boolean (true only if the player explicitly surrendered in their spell)
}`

function buildTurnPrompt(spell: string, state: GameState, history: LogEntry[]): string {
  const { player, opponent, turnNumber } = state

  const recentHistory = history
    .slice(-10)
    .map((e) => {
      if (e.type === 'player-spell') return `[Player cast]: ${e.content}`
      if (e.type === 'narrative') return `[Narrator]: ${e.content}`
      return ''
    })
    .filter(Boolean)
    .join('\n')

  return `CURRENT DUEL STATE (Turn ${turnNumber}):
Player HP: ${player.hp}/100 | Paradox: ${player.paradox}%
Malachar HP: ${opponent.hp}/100 | Paradox: ${opponent.paradox}%

RECENT HISTORY:
${recentHistory || 'The duel has just begun.'}

PLAYER'S SPELL THIS TURN:
"${spell}"

Adjudicate this spell, craft Malachar's response, and narrate the outcome. Remember:
- If the player's spell mentions surrender, yield, or conceding, set surrender: true and gameOver: true with winner: "opponent"
- If either wizard hits 0 HP, set gameOver: true with appropriate winner
- Apply paradox backfire effects if either wizard's paradox is above 60%
- Keep the drama high and the stakes real
- Respond with raw JSON only`
}

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  // Find first { to last } in case there's any preamble
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text
}

export async function processTurn(
  spell: string,
  state: GameState,
): Promise<TurnResult> {
  const prompt = buildTurnPrompt(spell, state, state.log)

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI')
  }

  const result = JSON.parse(extractJSON(textBlock.text)) as TurnResult

  // Clamp to prevent abuse — damage is negative, so floor at -100
  return {
    ...result,
    playerHpDelta: Math.max(result.playerHpDelta, -100),
    opponentHpDelta: Math.max(result.opponentHpDelta, -100),
    playerParadoxDelta: Math.min(Math.max(result.playerParadoxDelta, 0), 30),
    opponentParadoxDelta: Math.min(Math.max(result.opponentParadoxDelta, 0), 20),
  }
}

export async function getOpeningTaunt(): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content:
          'You are Malachar, an ancient wizard. Give a short (2-3 sentence) dramatic opening taunt to challenge your opponent to a duel. Be theatrical and intimidating but also darkly amusing. Start speaking immediately, no preamble.',
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock && textBlock.type === 'text'
    ? textBlock.text
    : 'The duel begins. Impress me, mortal.'
}
