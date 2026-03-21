// Pixel art wizard portraits — 16×20 grid, 3px per pixel = 48×60px
// Rendered as SVG rects for crisp pixel rendering

const PX = 3  // pixels per logical cell

// Color palettes
const PC: Record<string, string> = {
  '.': 'transparent',
  // Hat
  H: '#1a3d8f',  h: '#2255cc',  b: '#0d1f4a',
  // Skin
  S: '#d4956a',  s: '#a06040',
  // Eyes
  E: '#4488ff',  e: '#cce0ff',
  // Beard / hair
  W: '#d8d5c8',  w: '#a8a49a',
  // Robe
  R: '#1844cc',  r: '#0a2288',
  // Mouth
  M: '#c06848',
  // Cloak clasp
  C: '#c8a84b',
}

// Malachar palette
const MC: Record<string, string> = {
  '.': 'transparent',
  // Hood / robes
  D: '#080314',  d: '#120628',  k: '#1a0840',
  // Pale gaunt skin
  P: '#8a9e8a',  p: '#6a7e6a',  q: '#4a5e4a',
  // Eyes — glowing red
  R: '#ee1100',  r: '#ff5500',  G: '#ff8800',
  // Dark detail
  X: '#020108',
  // Teeth / grin
  T: '#ccccaa',  t: '#888870',
}

// Player wizard pixel map (16 wide × 20 tall)
const PLAYER_MAP = [
  '....HHHHHHHH....',
  '...HHhhhhhHHH...',
  '..HHhhhhhhhHHH..',
  '.HHHhhhhhhhHHHH.',
  '.HHHhhhhhhhHHHH.',
  'bbbbbbbbbbbbbbbb',
  '..SSSSSSSSSSSS..',
  '.SSSSSSSSSSSSSS.',
  '.SS.eEe.SS.eEe..',
  '.SS.eEe.SS.eEe..',
  '.SSSSSSSSSSSSSS.',
  '.SSSsSSSSSsSSSS.',
  '.SSSSMMMsSSSSS..',
  '.SWWWWWWWWWWWS..',
  '.WWWWWWWWWWWWW..',
  'RRRrRRCRRrRRRRRR',
  'RRRrRRRRRrRRRRRR',
  'RRRrRRRRRrRRRRRR',
  'RRRrRRRRRrRRRRRR',
  'RRRrRRRRRrRRRRRR',
]

// Malachar pixel map (16 wide × 20 tall)
const MALACHAR_MAP = [
  'DDDDDDDDDDDDDDDD',
  'DDDDDDDDDDDDDDdd',
  'DDDDddddddddDDdd',
  'DDDPPPPPPPPPPddd',
  'DDPPPPPPPPPPPDdd',
  'DDPPrRGrPPrRGPdd',
  'DDPPrRRrPPrRRPdd',
  'DDPPPppPPPppPPdd',
  'DDPPPqPqPqPqPPdd',
  'DDPPPPPPPPPPPDdd',
  'DDPPTtttttTPPDdd',
  'DDPPqqqqqqqPPddd',
  'DDdkkkkkkkkkdddd',
  'DddkkkkkkkkkddXX',
  'dddkkkkkkkkkdXXX',
  'dkkkkkkkkkkkXXXX',
  'dkkkkkkkkkkkXXXX',
  'dkkkkkkkkkkkXXXX',
  'Xkkkkkkkkkkkk...',
  'Xkkkkkkkkkkkk...',
]

interface PixelFaceProps {
  map: string[]
  palette: Record<string, string>
}

function PixelFace({ map, palette }: PixelFaceProps) {
  const W = map[0].length
  const H = map.length
  const rects: React.ReactElement[] = []

  for (let row = 0; row < H; row++) {
    for (let col = 0; col < W; col++) {
      const ch = map[row][col]
      const color = palette[ch]
      if (!color || color === 'transparent') continue
      rects.push(
        <rect
          key={`${row}-${col}`}
          x={col * PX}
          y={row * PX}
          width={PX}
          height={PX}
          fill={color}
        />
      )
    }
  }

  return (
    <svg
      width={W * PX}
      height={H * PX}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {rects}
    </svg>
  )
}

interface Props {
  character: 'player' | 'malachar'
}

export function WizardPortrait({ character }: Props) {
  const isPlayer = character === 'player'
  const map = isPlayer ? PLAYER_MAP : MALACHAR_MAP
  const palette = isPlayer ? PC : MC
  const label = isPlayer ? 'PLAYER' : 'MALACHAR'
  const borderColor = isPlayer ? 'var(--gold-dim)' : '#3a1050'
  const bgColor = isPlayer ? '#0a0e1a' : '#060308'

  return (
    <div
      style={{
        border: `2px solid ${borderColor}`,
        background: bgColor,
        boxShadow: isPlayer
          ? 'inset 0 0 8px rgba(68,136,255,0.1), 2px 2px 0 rgba(0,0,0,0.6)'
          : 'inset 0 0 8px rgba(180,20,20,0.15), 2px 2px 0 rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Name label */}
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '5px',
        color: isPlayer ? 'var(--gold-dim)' : '#7a3a9a',
        padding: '2px 4px',
        background: 'rgba(0,0,0,0.5)',
        width: '100%',
        textAlign: 'center',
        letterSpacing: '0.5px',
      }}>
        {label}
      </div>
      <PixelFace map={map} palette={palette} />
    </div>
  )
}
