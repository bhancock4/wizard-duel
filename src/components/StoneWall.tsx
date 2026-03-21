interface Props {
  side: 'left' | 'right'
}

function hash(n: number): number {
  return ((n * 2654435761) >>> 0) % 256
}
function hash2(n: number, salt: number): number {
  return ((((n + salt) * 2246822519) >>> 0) ^ (((n * 3266489917) >>> 0) + salt)) % 256
}

export function StoneWall({ side }: Props) {
  const BRICK_H = 40   // tall chunky stones
  const MORTAR = 5
  const COURSE = BRICK_H + MORTAR
  const NUM_COURSES = 60

  // 1.5-column effect: 3 sub-columns of width=66%, staggered so ~1.5 are visible
  // col 0: left 0,   width 66%
  // col 1: left 34%, width 66%  (partial overlap, staggered vertically by 0.5 course)
  // col 2: left 68%, width 66%  (right strip, mostly clipped)
  const cols = [
    { left: '0%',   topOffset: 0 },
    { left: '34%',  topOffset: -COURSE / 2 },
    { left: '68%',  topOffset: -COURSE * 0.25 },
  ]

  return (
    <div
      style={{
        width: '104px',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#0d0d0d',
        imageRendering: 'pixelated',
        borderLeft:  side === 'right' ? '3px solid var(--gold-dim)' : undefined,
        borderRight: side === 'left'  ? '3px solid var(--gold-dim)' : undefined,
        boxShadow: side === 'left'
          ? 'inset -14px 0 28px rgba(0,0,0,0.97)'
          : 'inset 14px 0 28px rgba(0,0,0,0.97)',
      }}
    >
      {cols.map((col, ci) => (
        <div
          key={ci}
          style={{
            position: 'absolute',
            top: col.topOffset,
            left: col.left,
            width: '70%',
            display: 'flex',
            flexDirection: 'column',
            gap: `${MORTAR}px`,
          }}
        >
          {Array.from({ length: NUM_COURSES }).map((_, i) => (
            <Brick key={i} seed={i * 13 + ci * 37} />
          ))}
        </div>
      ))}

      {/* Inner-edge depth shadow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: side === 'left'
            ? 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)'
            : 'linear-gradient(to left,  rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)',
        }}
      />
    </div>
  )
}

function Brick({ seed }: { seed: number }) {
  const h1 = hash(seed)
  const h2 = hash2(seed, 7)
  const h3 = hash2(seed, 13)
  const h4 = hash2(seed, 41)
  const h5 = hash2(seed, 67)
  const h6 = hash2(seed, 97)

  // Wide grey range — some stones almost dark, some mid-grey
  const base = 34 + (h1 % 46)
  const bg = `rgb(${base}, ${base}, ${base + 1})`

  // Grain: coarser diagonal stripes
  const grainAngle = 40 + (h2 % 30)
  const grainSpacing = 3 + (h3 % 4)   // 3–6px stripes — noticeable
  const grainOpacity = 0.10 + (h4 % 14) * 0.01

  // Moss: ~72% of bricks
  const mossCount = h5 % 100 < 72
    ? (h6 % 100 < 35 ? 3 : h6 % 100 < 65 ? 2 : 1)
    : 0

  const mosses = Array.from({ length: mossCount }).map((_, mi) => {
    const mh1 = hash2(seed, 100 + mi * 17)
    const mh2 = hash2(seed, 200 + mi * 23)
    const mh3 = hash2(seed, 300 + mi * 37)
    const mh4 = hash2(seed, 400 + mi * 53)
    const mh5 = hash2(seed, 500 + mi * 71)

    const fromBottom = mh5 % 4 !== 0  // 75% grow from bottom
    const left   = `${2 + (mh1 % 68)}%`
    const width  = `${22 + (mh2 % 60)}%`
    const height = `${40 + (mh3 % 55)}%`

    // Richer greens — dark forest to bright emerald
    const gr = 65 + (mh1 % 70)
    const gb = 10 + (mh2 % 24)
    const mossBg = `rgb(${gb + 4}, ${gr}, ${gb})`

    // Internal moss grain
    const mgAngle = 80 + (mh4 % 20)
    const mgOpacity = 0.10 + (mh5 % 12) * 0.01

    return { left, width, height, mossBg, fromBottom, mgAngle, mgOpacity }
  })

  return (
    <div
      style={{
        height: '40px',
        width: '100%',
        flexShrink: 0,
        position: 'relative',
        background: bg,
        borderRadius: '4px',
        imageRendering: 'pixelated',
        overflow: 'hidden',
        backgroundImage: `repeating-linear-gradient(
          ${grainAngle}deg,
          transparent,
          transparent ${grainSpacing}px,
          rgba(255,255,255,${grainOpacity}) ${grainSpacing}px,
          rgba(255,255,255,${grainOpacity}) ${grainSpacing + 1}px
        )`,
        boxShadow: [
          'inset 3px 3px 0 rgba(255,255,255,0.13)',
          'inset -3px -3px 0 rgba(0,0,0,0.55)',
          'inset 1px 1px 0 rgba(255,255,255,0.06)',
        ].join(', '),
      }}
    >
      {mosses.map((m, mi) => (
        <div
          key={mi}
          style={{
            position: 'absolute',
            bottom: m.fromBottom ? 0 : undefined,
            top: m.fromBottom ? undefined : 0,
            left: m.left,
            width: m.width,
            height: m.height,
            background: m.mossBg,
            borderRadius: m.fromBottom ? '3px 3px 0 0' : '0 0 3px 3px',
            imageRendering: 'pixelated',
            opacity: 0.90,
            backgroundImage: `repeating-linear-gradient(
              ${m.mgAngle}deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,${m.mgOpacity}) 2px,
              rgba(0,0,0,${m.mgOpacity}) 3px
            )`,
          }}
        />
      ))}
    </div>
  )
}
