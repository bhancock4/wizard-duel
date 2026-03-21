import { useState } from 'react'
import type { LogEntry } from '../types'

interface Props {
  winner: 'player' | 'opponent' | 'draw' | null
  reason: string | null
  turnNumber: number
  log: LogEntry[]
  onRestart: () => void
}

function buildTranscript(log: LogEntry[], winner: Props['winner'], turns: number): string {
  const header = [
    '═══════════════════════════════════════',
    '           WIZARD DUEL TRANSCRIPT      ',
    '═══════════════════════════════════════',
    `Turns: ${turns - 1}  |  Outcome: ${winner === 'player' ? 'Player Victory' : winner === 'opponent' ? 'Malachar Wins' : winner === 'draw' ? 'Draw' : 'Unknown'}`,
    '───────────────────────────────────────',
    '',
  ].join('\n')

  const body = log.map((e) => {
    if (e.type === 'player-spell') return `[PLAYER CAST]\n${e.content}`
    if (e.type === 'system') return `--- ${e.content} ---`
    return e.content
  }).join('\n\n')

  return header + body + '\n\n═══════════════════════════════════════'
}

export function GameOver({ winner, reason, turnNumber, log, onRestart }: Props) {
  const [copied, setCopied] = useState(false)

  const isVictory = winner === 'player'
  const isDraw = winner === 'draw'

  const title = isVictory ? 'VICTORY' : isDraw ? 'A MUTUAL ENDING' : 'DEFEATED'
  const subtitle = isVictory
    ? 'Malachar falls. For now.'
    : isDraw
    ? 'Both wizards unmade by their own power.'
    : 'Your essence dissipates into the void.'
  const titleColor = isVictory ? 'var(--gold)' : isDraw ? 'var(--paradox-bright)' : 'var(--blood-bright)'

  const handleCopy = async () => {
    const text = buildTranscript(log, winner, turnNumber)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = buildTranscript(log, winner, turnNumber)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wizard-duel-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8" style={{ background: 'radial-gradient(ellipse at center, #1a1008 0%, #0e0b06 70%)' }}>
      <div className="panel" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: 0 }}>
        <div style={{ borderBottom: '2px solid var(--gold-dim)', padding: '6px', background: 'var(--stone-dark)' }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--gold-dim)' }}>
            ✦ DUEL CONCLUDED ✦
          </span>
        </div>

        <div style={{ padding: '32px 32px 24px' }}>
          <div className="game-over-banner" style={{ fontSize: '22px', color: titleColor, marginBottom: '12px' }}>
            {title}
          </div>

          <div style={{ fontFamily: "'VT323', monospace", fontSize: '22px', color: 'var(--parchment)', marginBottom: '20px' }}>
            {subtitle}
          </div>

          {reason && (
            <div style={{ fontFamily: "'VT323', monospace", fontSize: '18px', color: 'var(--gold-dim)', marginBottom: '20px', fontStyle: 'italic', borderTop: '1px solid var(--gold-dim)', borderBottom: '1px solid var(--gold-dim)', padding: '10px' }}>
              "{reason}"
            </div>
          )}

          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: 'var(--gold-dim)', marginBottom: '28px' }}>
            The duel lasted {turnNumber - 1} {turnNumber - 1 === 1 ? 'turn' : 'turns'}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button className="btn btn-start" onClick={onRestart}>
              Duel Again
            </button>
          </div>

          {/* Transcript buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-cast" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy Transcript'}
            </button>
            <button className="btn btn-cast" onClick={handleDownload}>
              Download .txt
            </button>
          </div>
        </div>

        <div style={{ borderTop: '2px solid var(--gold-dim)', padding: '6px', background: 'var(--stone-dark)' }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--gold-dim)' }}>
            ✦ ✦ ✦ ✦ ✦
          </span>
        </div>
      </div>
    </div>
  )
}
