import { useGame } from './hooks/useGame'
import { TitleScreen } from './components/TitleScreen'
import { StatusBars } from './components/StatusBars'
import { BattleLog } from './components/BattleLog'
import { SpellInput } from './components/SpellInput'
import { GameOver } from './components/GameOver'
import { StoneWall } from './components/StoneWall'
import './index.css'

export default function App() {
  const { state, startDuel, castSpell, resetGame, maxAffordableWords } = useGame()
  const { phase, player, opponent, log, turnNumber, winner, gameOverReason } = state

  const isThinking = phase === 'thinking'
  const isPlaying = phase === 'playing'
  const isOver = phase === 'over'
  const isIdle = phase === 'idle'

  if (isIdle) return <TitleScreen onStart={startDuel} isLoading={false} />
  if (isThinking && log.length === 0) return <TitleScreen onStart={startDuel} isLoading={true} />
  if (isOver) {
    return (
      <GameOver
        winner={winner}
        reason={gameOverReason}
        turnNumber={turnNumber}
        log={log}
        onRestart={resetGame}
      />
    )
  }

  const playerMaxWords = maxAffordableWords(player.hp)

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#0e0b08',
      }}
    >
      <StoneWall side="left" />

      {/* Arena — center column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'radial-gradient(ellipse at top, #2a2218 0%, #1a1610 70%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: '3px solid var(--gold-dim)',
            background: 'var(--stone-dark)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '11px',
              color: 'var(--gold)',
              textShadow: '0 0 10px var(--gold)',
              letterSpacing: '3px',
            }}
          >
            ⚔ WIZARD DUEL ⚔
          </span>
          <span
            style={{
              position: 'absolute',
              right: '16px',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: 'var(--gold-dim)',
            }}
          >
            TURN {turnNumber}
          </span>
        </div>

        {/* Status bars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '8px',
            flexShrink: 0,
          }}
        >
          <StatusBars wizard={player} isPlayer={true} />
          <StatusBars wizard={opponent} isPlayer={false} />
        </div>

        {/* Battle log — takes all remaining vertical space */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 8px', minHeight: 0 }}>
          <BattleLog entries={log} isThinking={isThinking} />
        </div>

        {/* Spell input */}
        <div style={{ padding: '8px', flexShrink: 0 }}>
          <SpellInput
            onCast={castSpell}
            disabled={!isPlaying}
            playerHp={player.hp}
            maxWords={playerMaxWords}
          />
        </div>
      </div>

      <StoneWall side="right" />
    </div>
  )
}
