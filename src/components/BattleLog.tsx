import { useEffect, useRef } from 'react'
import type { LogEntry } from '../types'

interface Props {
  entries: LogEntry[]
  isThinking: boolean
}

export function BattleLog({ entries, isThinking }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries, isThinking])

  return (
    <div
      className="battle-log"
      style={{ height: '100%', overflowY: 'auto', padding: '12px 16px' }}
    >
      {entries.length === 0 && (
        <div style={{ color: 'var(--gold-dim)', fontFamily: "'Press Start 2P', monospace", fontSize: '10px', textAlign: 'center', paddingTop: '40px', lineHeight: 2 }}>
          The arena awaits...<br />Speak your incantation, wizard.
        </div>
      )}

      {entries.map((entry, i) => {
        if (entry.type === 'player-spell') {
          return (
            <div key={i} className="log-entry-player" style={{ paddingLeft: '12px', borderLeft: '3px solid var(--amber-dim)' }}>
              <span style={{ color: 'var(--amber-dim)', fontSize: '14px', fontFamily: "'Press Start 2P', monospace" }}>YOU CAST: </span>
              {entry.content}
            </div>
          )
        }
        if (entry.type === 'system') {
          return (
            <div key={i} className="log-entry-system">
              {entry.content}
            </div>
          )
        }
        return (
          <div key={i} className="log-entry-narrative">
            {entry.content}
          </div>
        )
      })}

      {isThinking && (
        <div style={{ color: 'var(--paradox-bright)', fontFamily: "'Press Start 2P', monospace", fontSize: '10px', padding: '12px 0', textShadow: '0 0 8px var(--paradox-bright)' }}>
          <span className="thinking-dots">The ether churns</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
