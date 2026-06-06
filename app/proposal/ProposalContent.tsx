'use client'

import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'

import ProposalScene   from '../../scenes/ProposalScene'
import PuzzleGame      from '../../components/PuzzleGame'
import BirthdayOverlay from '../../components/BirthdayOverlay'

type Phase = 'loading' | 'puzzle' | 'birthday'

export default function ProposalContent() {
  const [phase, setPhase] = useState<Phase>('loading')

  // Safe to read window here — this component is never SSR'd (ssr:false in page.tsx)
  const autoStart = new URLSearchParams(window.location.search).get('autostart') === 'true'

  const handleSceneReady = useCallback(() => {
    setTimeout(() => setPhase('puzzle'), 1400)
  }, [])

  const handlePuzzleSolved = useCallback(() => {
    setPhase('birthday')
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>

      {/* ── 360° castle panorama ─────────────────────── */}
      <Canvas
        camera={{ position: [0, 0, 0.01], fov: 90, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <ProposalScene onReady={handleSceneReady} />
        </Suspense>
      </Canvas>

      {/* ── Vignette ────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2,0,12,0.5) 72%, rgba(2,0,12,0.82) 100%)',
      }} />

      {/* ── Portal veil — fades dark purple out on arrival from landing ── */}
      {autoStart && (
        <motion.div
          style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#06001a', pointerEvents: 'none' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.6, delay: 0.2, ease: 'easeInOut' }}
        />
      )}

      {/* ── Puzzle ──────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'puzzle' && (
          <PuzzleGame key="puzzle" onSolved={handlePuzzleSolved} />
        )}
      </AnimatePresence>

      {/* ── Birthday message ─────────────────────────── */}
      <AnimatePresence>
        {phase === 'birthday' && (
          <BirthdayOverlay key="birthday" />
        )}
      </AnimatePresence>
    </div>
  )
}
