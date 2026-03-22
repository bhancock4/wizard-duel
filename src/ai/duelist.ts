import Anthropic from '@anthropic-ai/sdk'
import type { GameState, TurnResult } from '../types'
import { SYSTEM_PROMPT, OPENING_TAUNT_PROMPT, FALLBACK_TAUNT, buildTurnPrompt } from './prompts'

const MODEL = 'claude-haiku-4-5-20251001'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const CACHED_SYSTEM = [
  {
    type: 'text' as const,
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' as const },
  },
]

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text
}

function validateTurnResult(raw: unknown): TurnResult {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('AI response is not an object')
  }
  const r = raw as Record<string, unknown>

  const requiredStrings = ['narrative', 'opponentSpell'] as const
  for (const key of requiredStrings) {
    if (typeof r[key] !== 'string' || (r[key] as string).trim() === '') {
      throw new Error(`AI response missing required string field: ${key}`)
    }
  }

  const requiredNumbers = ['playerHpDelta', 'opponentHpDelta', 'playerParadoxDelta', 'opponentParadoxDelta'] as const
  for (const key of requiredNumbers) {
    if (typeof r[key] !== 'number' || !isFinite(r[key] as number)) {
      throw new Error(`AI response missing required number field: ${key}`)
    }
  }

  if (typeof r['gameOver'] !== 'boolean') {
    throw new Error('AI response missing required boolean field: gameOver')
  }
  if (typeof r['surrender'] !== 'boolean') {
    throw new Error('AI response missing required boolean field: surrender')
  }

  const validWinners = ['player', 'opponent', 'draw', null]
  if (!validWinners.includes(r['winner'] as string | null)) {
    throw new Error(`AI response has invalid winner value: ${r['winner']}`)
  }

  return raw as TurnResult
}

export async function processTurn(
  spell: string,
  state: GameState,
): Promise<TurnResult> {
  const prompt = buildTurnPrompt(spell, state, state.log)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: CACHED_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI')
  }

  const parsed = JSON.parse(extractJSON(textBlock.text))
  const result = validateTurnResult(parsed)

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
    model: MODEL,
    max_tokens: 256,
    messages: [{ role: 'user', content: OPENING_TAUNT_PROMPT }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : FALLBACK_TAUNT
}
