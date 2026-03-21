interface Props {
  onStart: () => void
  isLoading: boolean
}

export function TitleScreen({ onStart, isLoading }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center flex-1"
      style={{ background: 'radial-gradient(ellipse at center, #2a2218 0%, #1a1610 70%)', padding: '40px 20px' }}
    >
      {/* Decorative border frame */}
      <div className="panel" style={{ maxWidth: '600px', width: '100%', padding: '0' }}>
        <div style={{ borderBottom: '2px solid var(--gold-dim)', background: 'var(--stone-dark)', padding: '6px', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--gold-dim)', letterSpacing: '4px' }}>
            ✦ ✦ ✦ ✦ ✦
          </span>
        </div>

        <div style={{ padding: '32px 40px', textAlign: 'center' }}>
          {/* Title */}
          <div style={{ fontFamily: "'Press Start 2P', monospace", color: 'var(--gold)', textShadow: '0 0 20px var(--gold), 0 0 40px rgba(200,168,75,0.3)', lineHeight: 2, marginBottom: '8px' }}>
            <div style={{ fontSize: '28px', letterSpacing: '2px' }}>WIZARD</div>
            <div style={{ fontSize: '28px', letterSpacing: '2px' }}>DUEL</div>
          </div>

          <div style={{ fontFamily: "'VT323', monospace", fontSize: '18px', color: 'var(--gold-dim)', marginBottom: '32px', letterSpacing: '2px' }}>
            A DUEL OF IMAGINATION & CONSEQUENCE
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--gold-dim)', margin: '24px 0', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--stone-mid)', padding: '0 12px', color: 'var(--gold-dim)', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>
              ⚔
            </span>
          </div>

          {/* Description */}
          <div style={{ fontFamily: "'VT323', monospace", fontSize: '20px', color: 'var(--parchment)', lineHeight: 1.6, marginBottom: '32px', textAlign: 'left' }}>
            <p>You face Malachar the Undying in a duel to the death.</p>
            <br />
            <p>Cast spells by <span style={{ color: 'var(--amber)' }}>describing what you do</span>. Be as creative, wild, or absurd as you dare. There are no spell lists here — only imagination and consequence.</p>
            <br />
            <p style={{ color: 'var(--gold-dim)' }}>
              Each turn: <span style={{ color: 'var(--gold)' }}>30 free words.</span><br />
              Need more? Spend your blood — <span style={{ color: 'var(--blood-bright)' }}>5 HP per 10 extra words.</span><br />
              Paradox rises with every reality-bending act.<br />
              At 80% paradox, your own spells may devour you.
            </p>
          </div>

          {isLoading ? (
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: 'var(--paradox-bright)', textShadow: '0 0 8px var(--paradox-bright)' }}>
              <span className="thinking-dots">Summoning Malachar</span>
            </div>
          ) : (
            <button className="btn btn-start" onClick={onStart}>
              Enter the Arena
            </button>
          )}
        </div>

        <div style={{ borderTop: '2px solid var(--gold-dim)', background: 'var(--stone-dark)', padding: '6px', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'var(--gold-dim)', letterSpacing: '4px' }}>
            ✦ ✦ ✦ ✦ ✦
          </span>
        </div>
      </div>
    </div>
  )
}
