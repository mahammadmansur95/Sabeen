'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

import LandingScene from '../scenes/LandingScene'
import Countdown    from './ui/Countdown'
import { useGameStore } from '../lib/store'

function CanvasFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: '#06001A' }}>
      <motion.div
        className="w-12 h-12 rounded-full mb-6"
        style={{ border: '3px solid rgba(255,215,0,0.3)', borderTopColor: '#FFD700' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm tracking-widest uppercase"
        style={{ color: 'rgba(255,215,0,0.5)' }}>
        Loading magic…
      </p>
    </div>
  )
}

// Purple portal flash when "Step Through the Portal" is clicked
function TransitionOverlay() {
  const { scene } = useGameStore()
  const isTransitioning = scene === 'transitioning'

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.8, 1, 0] }}
          transition={{ duration: 3.5, times: [0, 0.3, 0.55, 0.7, 1], ease: 'easeInOut' }}
        >
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse, #BB66FF 0%, #7B2D8B 30%, #FF85A1 60%, #06001A 100%)' }} />
          <motion.p
            className="relative z-10 text-2xl md:text-3xl font-bold"
            style={{ color: '#FFFFFF', textShadow: '0 0 40px rgba(200,120,255,1)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
            transition={{ duration: 3.5, times: [0, 0.25, 0.75, 1] }}
          >
            ✨ Stepping through the portal… ✨
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function GameExperience() {
  return (
    <div className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: '#06001A' }}>

      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          camera={{ position: [0, 2, 9], fov: 50, near: 0.1, far: 500 }}
          gl={{
            antialias:           false,
            alpha:               false,
            powerPreference:     'default',
            toneMapping:         THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
            outputColorSpace:    THREE.SRGBColorSpace,
          }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', e => e.preventDefault(), false)
          }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            <LandingScene />
          </Suspense>
        </Canvas>
      </Suspense>

      <TransitionOverlay />
      <Countdown />
    </div>
  )
}
