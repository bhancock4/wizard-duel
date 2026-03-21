export interface WizardState {
  hp: number
  paradox: number
  name: string
}

export interface TurnResult {
  narrative: string
  opponentSpell: string
  playerHpDelta: number
  opponentHpDelta: number
  playerParadoxDelta: number
  opponentParadoxDelta: number
  gameOver: boolean
  winner: 'player' | 'opponent' | 'draw' | null
  gameOverReason: string | null
  surrender: boolean
}

export interface LogEntry {
  type: 'player-spell' | 'narrative' | 'system'
  content: string
  timestamp: number
}

export type GamePhase = 'idle' | 'thinking' | 'playing' | 'over'

export interface GameState {
  phase: GamePhase
  player: WizardState
  opponent: WizardState
  log: LogEntry[]
  turnNumber: number
  winner: 'player' | 'opponent' | 'draw' | null
  gameOverReason: string | null
}

export const INITIAL_HP = 100
export const INITIAL_PARADOX = 0
export const BASE_WORD_LIMIT = 30
export const BLOOD_PRICE_HP = 5        // HP cost per extra word chunk
export const BLOOD_PRICE_WORDS = 10    // extra words per HP chunk
export const MAX_WORDS = 80
export const PARADOX_MAX = 100
