import { useEffect, useRef, useState } from 'react'
import type { WizardState } from '../types'
import { INITIAL_HP, PARADOX_MAX } from '../types'
import { WizardPortrait } from './WizardPortrait'

interface Props {
  wizard: WizardState
  isPlayer: boolean
}

export function StatusBars({ wizard, isPlayer }: Props) {
  const hpPct = Math.max(0, (wizard.hp / INITIAL_HP) * 100)
  const paradoxPct = Math.min(100, (wizard.paradox / PARADOX_MAX) * 100)
  const isLowHp = wizard.hp <= 30
  const isHighParadox = wizard.paradox >= 60

  const prevHpRef = useRef(wizard.hp)
  const prevParadoxRef = useRef(wizard.paradox)
  const [flashClass, setFlashClass] = useState<string | null>(null)
  const [flashKey, setFlashKey] = useState(0)

  useEffect(() => {
    const hpDrop = wizard.hp < prevHpRef.current
    const paradoxRise = wizard.paradox > prevParadoxRef.current

    if (hpDrop || paradoxRise) {
      // Damage takes priority over paradox for the flash colour
      setFlashClass(hpDrop ? 'flash-damage' : 'flash-paradox')
      // Increment key to restart the CSS animation even if same type fires twice
      setFlashKey(k => k + 1)
    }

    prevHpRef.current = wizard.hp
    prevParadoxRef.current = wizard.paradox
  }, [wizard.hp, wizard.paradox])

  return (
    <div key={flashKey} className={`panel p-0 ${flashClass ?? ''}`}>
      {/* Header row: portrait + name + hp */}
      <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
        {isPlayer && (
          <WizardPortrait character="player" />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{isPlayer ? '⚔ PLAYER' : 'MALACHAR ⚔'}</span>
            <span style={{ color: isLowHp ? 'var(--blood-bright)' : 'var(--gold-light)', fontSize: '8px' }}>
              {wizard.hp} HP
            </span>
          </div>
        </div>
        {!isPlayer && (
          <WizardPortrait character="malachar" />
        )}
      </div>

      <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* HP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '9px', fontFamily: "'Press Start 2P', monospace", color: 'var(--gold-dim)' }}>
            <span>VITALITY</span>
            <span style={{ color: isLowHp ? 'var(--blood-bright)' : 'var(--gold)' }}>
              {wizard.hp}/{INITIAL_HP}
            </span>
          </div>
          <div className="bar-track">
            <div className={`bar-fill-hp ${isLowHp ? 'low' : ''}`} style={{ width: `${hpPct}%` }} />
          </div>
        </div>

        {/* Paradox Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '9px', fontFamily: "'Press Start 2P', monospace", color: 'var(--gold-dim)' }}>
            <span>PARADOX</span>
            <span style={{ color: isHighParadox ? 'var(--paradox-bright)' : 'var(--gold-dim)' }}>
              {wizard.paradox}%
            </span>
          </div>
          <div className="bar-track">
            <div className="bar-fill-paradox" style={{ width: `${paradoxPct}%` }} />
          </div>
          {isHighParadox && (
            <div style={{ fontSize: '7px', fontFamily: "'Press Start 2P', monospace", color: 'var(--paradox-bright)', marginTop: '2px', textShadow: '0 0 6px var(--paradox-bright)' }}>
              ⚠ REALITY UNSTABLE
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
