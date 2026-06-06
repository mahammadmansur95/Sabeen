'use client'

// THREE.Clock was deprecated in r183; R3F 9.x still creates one internally.
// Suppress that single warning until R3F ships a THREE.Timer migration.
if (typeof window !== 'undefined') {
  const _warn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.Clock: This module')) return
    _warn(...args)
  }
}

import dynamic from 'next/dynamic'

// This client boundary is required in Next.js 16 —
// `ssr: false` is only permitted inside Client Components.
const GameExperience = dynamic(
  () => import('./GameExperience'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width:          '100vw',
          height:         '100svh',
          background:     '#06001A',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '16px',
        }}
      >
        <div
          style={{
            width:          '44px',
            height:         '44px',
            borderRadius:   '50%',
            border:         '3px solid rgba(255,215,0,0.2)',
            borderTopColor: '#FFD700',
            animation:      'spin 1s linear infinite',
          }}
        />
        <p style={{
          color:         'rgba(255,215,0,0.45)',
          fontSize:      '12px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily:    'sans-serif',
          margin:        0,
        }}>
          Loading magic…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    ),
  }
)

export default function ClientEntry() {
  return <GameExperience />
}
