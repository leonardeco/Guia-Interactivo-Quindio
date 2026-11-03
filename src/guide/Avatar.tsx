import { useId, useRef } from 'react'
import type { Character } from './characters'
import { useAvatarLife } from './useAvatarLife'
import './avatar.css'

export type AvatarMode = 'idle' | 'walk' | 'cheer'

type Props = {
  character: Character
  mode: AvatarMode
  talking?: boolean
  facing?: 'left' | 'right'
  size?: number
  title?: string
  /** Eye movements and fine details; off for the tiny avatar on the map. */
  detail?: boolean
}

type Look = Character['look']

const INK = '#3a2418'
const ol = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function Hand({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g className="av-hand" style={{ transformOrigin: `${x}px ${y - 4}px` }}>
      <path d={`M${x - 6.5} ${y - 4} q-1 9 6.5 11 q7.5 -2 6.5 -11 q-6.5 -3 -13 0 z`} fill={fill} {...ol} />
      <path d={`M${x + 5} ${y - 2} q6 -1 5 5 q-2 3 -5 1`} fill={fill} {...ol} strokeWidth={1.8} />
      <path d={`M${x - 3} ${y + 3} v3 M${x} ${y + 4} v3 M${x + 3} ${y + 3} v3`} stroke={INK} strokeOpacity={0.35} strokeWidth={1.2} />
    </g>
  )
}

function Arm({ x, side, skin, sleeve }: { x: number; side: 'front' | 'back'; skin: string; sleeve: string }) {
  return (
    <g className={`av-arm av-arm-${side}`} style={{ transformOrigin: `${x}px 120px` }}>
      <path d={`M${x - 7} 116 q7 -5 14 0 l-1 35 q-6 3 -12 0 z`} fill={sleeve} {...ol} />
      <g className="av-fore" style={{ transformOrigin: `${x}px 150px` }}>
        <path d={`M${x - 6} 148 q6 -3 12 0 l-1 31 q-5 3 -10 0 z`} fill={sleeve} {...ol} />
        <Hand x={x} y={186} fill={skin} />
      </g>
    </g>
  )
}

function Leg({ x, side, look, skinLegs }: { x: number; side: 'front' | 'back' | 'one'; look: Look; skinLegs: boolean }) {
  const thigh = skinLegs ? look.skinShade : look.bottom
  const shin = skinLegs ? look.skinShade : look.bottom
  return (
    <g className={`av-leg av-leg-${side}`} style={{ transformOrigin: `${x}px 186px` }}>
      <path d={`M${x - 8} 184 h16 l-1 45 h-14 z`} fill={thigh} {...ol} />
      <g className="av-shin" style={{ transformOrigin: `${x}px 228px` }}>
        <path d={`M${x - 7} 226 h14 l-1 42 h-12 z`} fill={shin} {...ol} />
        <path d={`M${x - 7} 228 h6 v40 h-5 z`} fill="#000" opacity={0.08} />
        <g className="av-foot" style={{ transformOrigin: `${x}px 270px` }}>
          <path d={`M${x - 8} 266 h14 q13 1 13 10 q0 3 -3 3 h-24 q-2 0 -2 -3 z`} fill={look.shoes} {...ol} />
          <path d={`M${x - 4} 270 h12`} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
    </g>
  )
}

function Mouth() {
  return (
    <g className="av-mouth">
      <g className="av-v av-v-rest">
        <path d="M91 91 q10 8 20 0" stroke="#5a2a1a" strokeWidth={2.8} strokeLinecap="round" fill="none" />
      </g>
      <g className="av-v av-v-M">
        <path d="M92 93 q9 2.5 18 0" stroke="#5a2a1a" strokeWidth={3} strokeLinecap="round" fill="none" />
      </g>
      <g className="av-v av-v-A">
        <path d="M91 89 q10 -2 20 0 q-1 13 -10 13 q-9 0 -10 -13 z" fill="#4a1a14" stroke="#5a2a1a" strokeWidth={1.6} />
        <path d="M93 89.5 q8 -1.5 16 0 v2.6 q-8 1.2 -16 0 z" fill="#fff" />
        <ellipse cx={101} cy={98.5} rx={5} ry={2.6} fill="#d9625a" />
      </g>
      <g className="av-v av-v-E">
        <path d="M90 90 q11 -2 22 0 q-3 7 -11 7 q-8 0 -11 -7 z" fill="#4a1a14" stroke="#5a2a1a" strokeWidth={1.6} />
        <path d="M92 90.2 q9 -1.2 18 0 v2 q-9 1 -18 0 z" fill="#fff" />
      </g>
      <g className="av-v av-v-O">
        <ellipse cx={101} cy={93} rx={5.6} ry={7} fill="#4a1a14" stroke="#5a2a1a" strokeWidth={1.8} />
        <ellipse cx={101} cy={97} rx={3} ry={1.8} fill="#d9625a" />
      </g>
      <g className="av-v av-v-U">
        <ellipse cx={101} cy={93} rx={3.6} ry={4.4} fill="#4a1a14" stroke="#5a2a1a" strokeWidth={2} />
      </g>
    </g>
  )
}

export function Avatar({ character, mode, talking = false, facing = 'right', size = 180, title, detail = true }: Props) {
  const raw = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  useAvatarLife(svgRef, { talking, walking: mode === 'walk', detail })
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const look = character.look
  const s = look.scale
  const skinGrad = `skin-${uid}`
  const topGrad = `top-${uid}`
  const hatGrad = `hat-${uid}`
  const bottomGrad = `bottom-${uid}`
  const skinLegs = look.dress
  const pose = mode === 'idle' && talking ? 'talk' : mode
  const classes = [
    'avatar',
    `avatar--${pose}`,
    `avatar--${character.id}`,
    talking ? 'avatar--talking' : '',
    facing === 'left' ? 'avatar--left' : '',
    look.oneLeg ? 'avatar--hop' : '',
  ]

  return (
    <svg
      ref={svgRef}
      className={classes.filter(Boolean).join(' ')}
      viewBox="0 0 200 300"
      width={size * (2 / 3)}
      height={size}
      role="img"
      aria-label={title ?? character.name}
      data-viseme="rest"
    >
      <defs>
        <radialGradient id={skinGrad} cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="30%" stopColor={look.skin} />
          <stop offset="100%" stopColor={look.skinShade} />
        </radialGradient>
        <linearGradient id={topGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={look.top} />
          <stop offset="100%" stopColor={look.topShade} />
        </linearGradient>
        <linearGradient id={bottomGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={look.bottom} />
          <stop offset="100%" stopColor={look.bottom} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={hatGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#d6c8aa" />
        </linearGradient>
      </defs>

      <ellipse className="av-shadow" cx="100" cy="288" rx="46" ry="8" fill="#2a1a12" opacity="0.24" />

      <g transform={`translate(100 292) scale(${s}) translate(-100 -292)`}>
        <g className="av-figure" style={{ transformOrigin: '100px 280px' }}>
          <g className="av-body" style={{ transformOrigin: '100px 280px' }}>
            <Arm x={82} side="back" skin={look.skinShade} sleeve={look.topShade} />

            {look.oneLeg ? (
              <Leg x={100} side="one" look={look} skinLegs={skinLegs} />
            ) : (
              <>
                <Leg x={92} side="back" look={look} skinLegs={skinLegs} />
                <Leg x={108} side="front" look={look} skinLegs={skinLegs} />
              </>
            )}

            {!look.dress && <path d="M71 176 h58 l3 18 q-32 7 -64 0 z" fill={`url(#${bottomGrad})`} {...ol} />}

            {look.dress && (
              <g className="av-skirt" style={{ transformOrigin: '100px 172px' }}>
                <path d="M75 168 L60 246 Q100 260 140 246 L125 168 Z" fill={`url(#${bottomGrad})`} {...ol} />
                <path d="M88 172 L80 252 M112 172 L120 252" stroke="#000" strokeOpacity="0.12" strokeWidth="3" />
                <path d="M62 238 Q100 252 138 238" stroke={look.accent} strokeWidth="4.5" fill="none" opacity="0.9" />
              </g>
            )}

            <g className="av-torso" style={{ transformOrigin: '100px 186px' }}>
              <path d="M72 122 Q74 106 100 104 Q126 106 128 122 L132 184 Q100 193 68 184 Z" fill={`url(#${topGrad})`} {...ol} />
              <path d="M92 106 L100 120 L108 106" stroke={INK} strokeOpacity="0.4" strokeWidth="2" fill="none" />
              {!look.dress && <rect x="70" y="175" width="60" height="7" rx="3" fill="#2a1a12" opacity="0.8" />}
              {!look.dress && <rect x="96" y="174" width="9" height="9" rx="2" fill="#d4a017" stroke={INK} strokeWidth="1.2" />}

              {look.vest && (
                <path d="M78 122 L92 176 L108 176 L122 122 L110 116 L90 116 Z" fill={look.accent} opacity="0.92" stroke={INK} strokeWidth="1.6" />
              )}
              {look.badge && (
                <g>
                  <circle cx="116" cy="148" r="8" fill="#e0b03a" stroke={INK} strokeWidth="1.4" />
                  <path d="M112 148 l2.6 2.8 5.4-6" stroke="#084838" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </g>
              )}

              {look.ruana && (
                <g>
                  <path d="M64 118 Q100 100 136 118 L142 170 Q100 182 58 170 Z" fill={look.accent} {...ol} />
                  <path d="M62 132 Q100 119 138 132" stroke="#f4efe4" strokeWidth="3" fill="none" opacity="0.85" />
                  <path d="M60 150 Q100 139 140 150" stroke="#2a1a12" strokeWidth="2.5" fill="none" opacity="0.5" />
                  <path d="M59 162 Q100 153 141 162" stroke="#f4efe4" strokeWidth="2" fill="none" opacity="0.75" />
                  <path d="M66 172 l-2 8 M78 175 l-1 8 M90 177 l0 8 M110 177 l0 8 M122 175 l1 8 M134 172 l2 8" stroke={look.accent} strokeWidth="2.4" />
                </g>
              )}

              {look.leafy && (
                <g fill={look.accent} stroke={look.topShade} strokeWidth="1.2" opacity="0.95">
                  {[
                    [80, 140, -30],
                    [118, 132, 25],
                    [92, 166, 10],
                    [112, 196, -20],
                    [80, 214, 35],
                    [122, 226, -10],
                    [100, 236, 15],
                    [72, 236, -40],
                  ].map(([x, y, r]) => (
                    <path key={`${x}-${y}`} d={`M${x} ${y} q8 -10 16 0 q-8 10 -16 0 z`} transform={`rotate(${r} ${x + 8} ${y})`} />
                  ))}
                </g>
              )}

              {look.prop === 'carriel' && (
                <g>
                  <path d="M84 110 L122 170" stroke="#5a3418" strokeWidth="4.5" strokeLinecap="round" />
                  <rect x="108" y="164" width="28" height="26" rx="6" fill="#7a4b26" stroke={INK} strokeWidth="2" />
                  <path d="M108 171 h28 v6 q-14 7 -28 0 z" fill="#5a3418" />
                  <circle cx="122" cy="181" r="2.4" fill="#d4a017" />
                </g>
              )}

              {look.prop === 'canasto' && (
                <g>
                  <path d="M84 110 L118 168" stroke="#8a5a2b" strokeWidth="3.4" strokeLinecap="round" />
                  <path d="M102 166 h36 l-4 26 h-28 z" fill="#b8864b" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
                  <path d="M105 174 h30 M106 182 h28" stroke="#8a5a2b" strokeWidth="2" />
                  <circle cx="111" cy="164" r="4.2" fill="#b3261e" stroke={INK} strokeWidth="1" />
                  <circle cx="120" cy="162" r="4.2" fill="#c0392b" stroke={INK} strokeWidth="1" />
                  <circle cx="129" cy="164" r="4.2" fill="#8e1b14" stroke={INK} strokeWidth="1" />
                </g>
              )}
            </g>

            <g className="av-head" style={{ transformOrigin: '100px 104px' }}>
              {look.hairStyle === 'long' && (
                <path className="av-hair-back" d="M68 64 Q62 120 70 158 L130 158 Q138 120 132 64 Q129 34 100 34 Q71 34 68 64 Z" fill={look.hair} {...ol} />
              )}
              {look.hairStyle === 'bun' && <circle cx="74" cy="42" r="12" fill={look.hair} {...ol} />}

              {look.ears ? (
                <g fill={`url(#${skinGrad})`} {...ol}>
                  <path d="M73 68 L50 48 L72 86 Z" />
                  <path d="M127 68 L150 48 L128 86 Z" />
                </g>
              ) : (
                <g fill={look.skinShade} {...ol} strokeWidth={1.8}>
                  <ellipse cx="69" cy="76" rx="5" ry="7" />
                  <ellipse cx="131" cy="76" rx="5" ry="7" />
                </g>
              )}

              <rect x="92" y="94" width="16" height="16" rx="4" fill={look.skinShade} stroke={INK} strokeWidth={1.8} />
              <ellipse cx="100" cy="71" rx="31" ry="33" fill={`url(#${skinGrad})`} {...ol} />

              <g className="av-face">
                <ellipse className="av-cheek" cx="83" cy="85" rx="6" ry="3.6" fill="#e0726a" opacity="0.35" />
                <ellipse className="av-cheek" cx="119" cy="85" rx="6" ry="3.6" fill="#e0726a" opacity="0.35" />

                <g className="av-brows" style={{ transformOrigin: '100px 60px' }}>
                  <path d="M82 60 q7 -5 14 -1.5" stroke={look.hair} strokeWidth="3.6" strokeLinecap="round" fill="none" />
                  <path d="M105 58.5 q7 -3.5 14 1.5" stroke={look.hair} strokeWidth="3.6" strokeLinecap="round" fill="none" />
                </g>

                <g className="av-eyes">
                  <ellipse cx="89" cy="72" rx="6.6" ry="7.6" fill="#fff" stroke={INK} strokeWidth="1.8" />
                  <ellipse cx="111" cy="72" rx="6.6" ry="7.6" fill="#fff" stroke={INK} strokeWidth="1.8" />
                  <g className="av-pupils">
                    <circle cx="90" cy="73" r="4" fill="#2a1a12" />
                    <circle cx="112" cy="73" r="4" fill="#2a1a12" />
                    <circle cx="91.4" cy="71.2" r="1.4" fill="#fff" />
                    <circle cx="113.4" cy="71.2" r="1.4" fill="#fff" />
                  </g>
                  <g className="av-lids" style={{ transformOrigin: '100px 64px' }}>
                    <ellipse cx="89" cy="72" rx="7.6" ry="8.6" fill={look.skin} stroke={INK} strokeWidth="1.8" />
                    <ellipse cx="111" cy="72" rx="7.6" ry="8.6" fill={look.skin} stroke={INK} strokeWidth="1.8" />
                  </g>
                </g>

                <path d="M101 75 q6 7 -1 10" stroke={look.skinShade} strokeWidth="2.6" strokeLinecap="round" fill="none" />

                <Mouth />

                {look.beard === 'mustache' && (
                  <path className="av-stache" d="M88 87 q13 -8 26 0 q-6 6 -13 2 q-7 4 -13 -2 Z" fill={look.hair} stroke={INK} strokeWidth="1.4" />
                )}
                {look.beard === 'long' && (
                  <g fill={look.hair} stroke={INK} strokeWidth="1.6">
                    <path className="av-beard" d="M71 78 Q72 106 87 124 Q100 150 113 124 Q128 106 129 78 Q122 102 101 102 Q80 102 71 78 Z" />
                    <path className="av-stache" d="M87 87 q14 -8 28 0 q-7 6 -14 2 q-7 4 -14 -2 Z" />
                  </g>
                )}
              </g>

              {(look.hairStyle === 'short' || look.hairStyle === 'bun') && (
                <path d="M70 66 Q70 34 100 34 Q130 34 130 66 Q121 49 100 49 Q81 49 70 66 Z" fill={look.hair} {...ol} />
              )}
              {look.hairStyle === 'long' && <path d="M70 64 Q72 36 100 36 Q128 36 130 64 Q113 47 100 49 Q86 47 70 64 Z" fill={look.hair} {...ol} />}

              {look.hat === 'aguadeno' && (
                <g className="av-hat">
                  <ellipse cx="100" cy="46" rx="50" ry="10" fill={`url(#${hatGrad})`} {...ol} />
                  <path d="M76 46 Q76 14 100 12 Q124 14 124 46 Z" fill={`url(#${hatGrad})`} {...ol} />
                  <path d="M86 20 q14 -6 28 0" stroke="#b9ab8c" strokeWidth="2" fill="none" />
                  <rect x="76" y="34" width="48" height="8" fill="#1d1d1d" />
                </g>
              )}
              {look.hat === 'brim' && (
                <g className="av-hat">
                  <ellipse cx="100" cy="48" rx="48" ry="9" fill={look.accent} {...ol} />
                  <path d="M78 48 Q78 16 100 14 Q122 16 122 48 Z" fill={look.top} {...ol} />
                </g>
              )}
              {look.hat === 'cap' && (
                <g className="av-hat">
                  <path d="M72 52 Q74 26 100 24 Q128 26 126 52 Z" fill={look.accent} {...ol} />
                  <path d="M122 48 h24 l-6 8 h-18 z" fill={look.topShade} {...ol} />
                </g>
              )}
            </g>

            <Arm x={118} side="front" skin={`url(#${skinGrad})`} sleeve={look.top} />
          </g>
        </g>
      </g>
    </svg>
  )
}
