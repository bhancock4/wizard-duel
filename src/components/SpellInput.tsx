import { useState, useCallback } from 'react'
import { BASE_WORD_LIMIT, BLOOD_PRICE_HP, BLOOD_PRICE_WORDS } from '../types'

interface Props {
  onCast: (spell: string, bloodPriceChunks: number) => void
  disabled: boolean
  playerHp: number
  maxWords: number
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export function SpellInput({ onCast, disabled, playerHp, maxWords }: Props) {
  const [spell, setSpell] = useState('')

  const wordCount = countWords(spell)
  const overBase = Math.max(0, wordCount - BASE_WORD_LIMIT)
  const bloodChunks = Math.ceil(overBase / BLOOD_PRICE_WORDS)
  const bloodCost = bloodChunks * BLOOD_PRICE_HP
  const isOverMax = wordCount > maxWords
  const isOverBase = wordCount > BASE_WORD_LIMIT
  const cantAfford = bloodCost >= playerHp // would kill or kill + overshoot
  const canCast = !disabled && spell.trim().length > 0 && !isOverMax && !cantAfford

  const handleCast = useCallback(() => {
    if (!canCast) return
    onCast(spell.trim(), bloodChunks)
    setSpell('')
  }, [canCast, spell, bloodChunks, onCast])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleCast()
      }
    },
    [handleCast],
  )

  const wordCountColor = isOverMax
    ? 'var(--blood-bright)'
    : isOverBase
    ? 'var(--blood-bright)'
    : wordCount > BASE_WORD_LIMIT * 0.8
    ? 'var(--amber)'
    : 'var(--gold-dim)'

  return (
    <div className="panel p-0">
      <div className="panel-title">Incantation</div>
      <div className="p-3 space-y-2">
        <textarea
          className="spell-input"
          rows={3}
          placeholder="Describe your spell... be creative. Reality is merely a suggestion."
          value={spell}
          onChange={(e) => setSpell(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Word count & blood price info */}
          <div className="space-y-1">
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: wordCountColor }}>
              {wordCount}/{BASE_WORD_LIMIT} words
              {isOverBase && !isOverMax && (
                <span style={{ color: 'var(--blood-bright)', marginLeft: '8px' }}>
                  +{bloodCost} HP blood price
                </span>
              )}
              {isOverMax && (
                <span style={{ color: 'var(--blood-bright)', marginLeft: '8px' }}>
                  MAX {maxWords} WORDS
                </span>
              )}
            </div>

            {isOverBase && !isOverMax && (
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: 'var(--blood)', lineHeight: 1.6 }}>
                {wordCount - BASE_WORD_LIMIT} extra words = {bloodCost} HP cost
                {cantAfford && (
                  <span style={{ color: 'var(--blood-bright)', display: 'block' }}>
                    ✗ NOT ENOUGH VITALITY
                  </span>
                )}
              </div>
            )}

            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: 'var(--gold-dim)', lineHeight: 1.6 }}>
              {BASE_WORD_LIMIT} free words · {BLOOD_PRICE_HP}HP per {BLOOD_PRICE_WORDS} extra · max {maxWords}
            </div>
          </div>

          {/* Cast button */}
          <div className="flex gap-2 items-center">
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: 'var(--gold-dim)' }}>
              ctrl+enter
            </div>
            <button
              className="btn btn-cast"
              onClick={handleCast}
              disabled={!canCast}
            >
              {isOverBase && !isOverMax && !cantAfford
                ? `Cast (-${bloodCost}HP)`
                : 'Cast Spell'}
            </button>
          </div>
        </div>

        {/* Surrender hint */}
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: 'var(--gold-dim)', borderTop: '1px solid rgba(200,168,75,0.15)', paddingTop: '6px' }}>
          Tip: To surrender, include "I surrender" or "I yield" in your spell
        </div>
      </div>
    </div>
  )
}
