import { useState, useCallback, useRef } from 'react'
import {
  type GameState,
  type LogEntry,
  INITIAL_HP,
  INITIAL_PARADOX,
  BLOOD_PRICE_HP,
  BLOOD_PRICE_WORDS,
  BASE_WORD_LIMIT,
  MAX_WORDS,
} from '../types'
import { processTurn, getOpeningTaunt } from '../ai/duelist'

const initialState = (): GameState => ({
  phase: 'idle',
  player: { hp: INITIAL_HP, paradox: INITIAL_PARADOX, name: 'You' },
  opponent: { hp: INITIAL_HP, paradox: INITIAL_PARADOX, name: 'Malachar' },
  log: [],
  turnNumber: 1,
  winner: null,
  gameOverReason: null,
})

export function useGame() {
  const [state, setState] = useState<GameState>(initialState())
  // Keep a ref so async callbacks can read current state without stale closure
  const stateRef = useRef(state)
  const updateState = useCallback((updater: (s: GameState) => GameState) => {
    setState((s) => {
      const next = updater(s)
      stateRef.current = next
      return next
    })
  }, [])

  const startDuel = useCallback(async () => {
    updateState((s) => ({ ...s, phase: 'thinking' }))

    try {
      const taunt = await getOpeningTaunt()
      updateState((s) => ({
        ...s,
        phase: 'playing',
        log: [
          {
            type: 'system',
            content: '⚔ The duel begins. Cast your spell, wizard.',
            timestamp: Date.now() - 1,
          },
          {
            type: 'narrative',
            content: `Malachar speaks: "${taunt}"`,
            timestamp: Date.now(),
          },
        ],
      }))
    } catch {
      updateState((s) => ({
        ...s,
        phase: 'playing',
        log: [
          {
            type: 'system',
            content: '⚔ The duel begins. Cast your spell, wizard.',
            timestamp: Date.now(),
          },
        ],
      }))
    }
  }, [updateState])

  const castSpell = useCallback(
    async (spell: string, bloodPriceChunks: number) => {
      const bloodCost = bloodPriceChunks * BLOOD_PRICE_HP

      // Immediately deduct blood price and add player's spell to log
      let stateForAI: GameState
      updateState((s) => {
        if (s.phase !== 'playing') return s
        const next: GameState = {
          ...s,
          phase: 'thinking',
          player: { ...s.player, hp: s.player.hp - bloodCost },
          log: [
            ...s.log,
            { type: 'player-spell', content: spell, timestamp: Date.now() },
          ],
        }
        stateForAI = next
        return next
      })

      try {
        // stateForAI is set synchronously inside the updater above
        const result = await processTurn(spell, stateForAI!)

        updateState((prev) => {
          const newPlayerHp = Math.max(0, prev.player.hp + result.playerHpDelta)
          const newOpponentHp = Math.max(0, prev.opponent.hp + result.opponentHpDelta)
          const newPlayerParadox = Math.min(100, prev.player.paradox + result.playerParadoxDelta)
          const newOpponentParadox = Math.min(100, prev.opponent.paradox + result.opponentParadoxDelta)

          let gameOver = result.gameOver
          let winner = result.winner
          let gameOverReason = result.gameOverReason

          if (!gameOver) {
            if (newPlayerHp <= 0 && newOpponentHp <= 0) {
              gameOver = true; winner = 'draw'
              gameOverReason = 'Both wizards fall simultaneously.'
            } else if (newPlayerHp <= 0) {
              gameOver = true; winner = 'opponent'
              gameOverReason = gameOverReason ?? 'You have fallen.'
            } else if (newOpponentHp <= 0) {
              gameOver = true; winner = 'player'
              gameOverReason = gameOverReason ?? 'Malachar is defeated!'
            }
          }

          const newLog: LogEntry[] = [
            ...prev.log,
            { type: 'narrative', content: result.narrative, timestamp: Date.now() },
            { type: 'narrative', content: `Malachar: "${result.opponentSpell}"`, timestamp: Date.now() + 1 },
          ]

          return {
            ...prev,
            phase: gameOver ? 'over' : 'playing',
            player: { ...prev.player, hp: newPlayerHp, paradox: newPlayerParadox },
            opponent: { ...prev.opponent, hp: newOpponentHp, paradox: newOpponentParadox },
            log: newLog,
            turnNumber: prev.turnNumber + 1,
            winner,
            gameOverReason,
          }
        })
      } catch (err) {
        console.error('AI error:', err)
        updateState((prev) => ({
          ...prev,
          phase: 'playing',
          log: [
            ...prev.log,
            { type: 'system', content: '[The magical ether stutters... try again]', timestamp: Date.now() },
          ],
        }))
      }
    },
    [updateState],
  )

  const resetGame = useCallback(() => {
    const fresh = initialState()
    stateRef.current = fresh
    setState(fresh)
  }, [])

  const maxAffordableWords = (currentHp: number): number => {
    const affordableChunks = Math.floor((currentHp - 1) / BLOOD_PRICE_HP)
    return Math.min(MAX_WORDS, BASE_WORD_LIMIT + affordableChunks * BLOOD_PRICE_WORDS)
  }

  return { state, startDuel, castSpell, resetGame, maxAffordableWords }
}
