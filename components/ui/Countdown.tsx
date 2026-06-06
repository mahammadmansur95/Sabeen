'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountdown } from '../../hooks/useCountdown'
import { useGameStore } from '../../lib/store'

// ── Small sparkle scattered around the card ──────────────────────────────────

const Sparkle = ({ idx }: { idx: number }) => {
  const x = (idx * 37) % 100
  const y = (idx * 53) % 100
  return (
    <motion.span
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, color: '#FFD700', fontSize: 7 }}
      animate={{ opacity: [0, 1, 0], scale: [0.3, 1.3, 0.3], rotate: [0, 180] }}
      transition={{ duration: 2.8, repeat: Infinity, delay: idx * 0.3, ease: 'easeInOut' }}
    >
      ✦
    </motion.span>
  )
}

// ── Animated countdown digit ──────────────────────────────────────────────────

const Unit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center" style={{ minWidth: 'min(10vw, 46px)' }}>
    <div style={{
      position: 'relative', overflow: 'hidden',
      height: 'min(11vw, 48px)', width: 'min(10vw, 46px)',
    }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: -18, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0,   opacity: 1, filter: 'blur(0px)' }}
          exit={{    y: 18,  opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'min(6vw, 2rem)', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            color: '#FFE8A8',
            textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 6px rgba(180,80,255,0.4)',
            fontFamily: 'Georgia, serif',
          }}
        >
          {String(value).padStart(2, '0')}
        </motion.div>
      </AnimatePresence>
    </div>
    <span style={{
      color: 'rgba(200,170,255,0.75)',
      fontSize: 'min(2.2vw, 9px)',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      marginTop: 2,
      fontFamily: 'sans-serif',
    }}>
      {label}
    </span>
  </div>
)

const Divider = () => (
  <motion.span
    className="font-bold pb-3 select-none"
    animate={{ opacity: [0.3, 0.9, 0.3] }}
    transition={{ duration: 1.4, repeat: Infinity }}
    style={{ color: 'rgba(200,150,255,0.7)', textShadow: '0 0 12px rgba(180,80,255,0.5)', fontSize: 'min(5.5vw, 1.4rem)' }}
  >
    :
  </motion.span>
)

// ── Portal ripple ring ────────────────────────────────────────────────────────

const PortalRing = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ border: '1px solid rgba(180,80,255,0.4)', inset: '-20px' }}
    initial={{ opacity: 0.7, scale: 0.85 }}
    animate={{ opacity: 0, scale: 1.35 }}
    transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeOut' }}
  />
)

// ── Main countdown component ──────────────────────────────────────────────────

export default function Countdown() {
  const [devMode, setDevMode] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDevMode(new URLSearchParams(window.location.search).get('dev') === 'true')
    }
  }, [])

  const { days, hours, minutes, seconds, isComplete } = useCountdown(devMode)
  const [confetti, setConfetti] = useState<{ x: number; y: number; c: string }[]>([])

  useEffect(() => {
    if (!isComplete) return
    setConfetti(Array.from({ length: 90 }, (_, i) => ({
      x: 50 + (Math.random() * 80 - 40),
      y: Math.random() * -140 - 20,
      c: ['#FF6B35','#FFD700','#FF85A1','#00D4FF','#FF006E','#BB66FF'][i % 6],
    })))
    setTimeout(() => setConfetti([]), 4500)
  }, [isComplete])

  const handleStart = () => {
    useGameStore.getState().setScene('transitioning')
  }

  return (
    /*
     * Layout strategy:
     *  Mobile  (< sm / 640px): left-4 right-4 bottom-4  →  full-width with 16px side margins, centered
     *  Desktop (≥ sm / 640px): right-8 bottom-8 left-auto  →  bottom-right corner, auto width
     */
    <motion.div
      className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:right-8 sm:left-auto z-50 pointer-events-none flex justify-center sm:block"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Confetti burst */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <AnimatePresence>
          {confetti.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{ background: p.c, left: `${p.x}%`, top: '50%' }}
              initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ y: p.y, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5 + Math.random(), ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Card ── */}
      <div
        className="relative rounded-3xl overflow-hidden pointer-events-auto"
        style={{
          background:           'rgba(5, 0, 20, 0.80)',
          backdropFilter:       'blur(32px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
          border:               '1px solid rgba(180, 80, 255, 0.45)',
          boxShadow:            '0 0 0 1px rgba(180,80,255,0.08), 0 0 70px rgba(130,40,255,0.35), 0 28px 70px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)',
          // Mobile: fill the full container (left-4 right-4 = ~92vw max 400px)
          // Desktop: fixed comfortable width
          width: '100%',
          maxWidth: '300px',
        }}
      >
        {/* Portal ripple rings */}
        <PortalRing delay={0} />
        <PortalRing delay={0.85} />
        <PortalRing delay={1.7} />

        {/* Sparkles */}
        {Array.from({ length: 12 }).map((_, i) => <Sparkle key={i} idx={i} />)}

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(130,40,255,0.14) 0%, transparent 65%)' }} />

        <div className="relative" style={{ padding: 'clamp(10px, 3vw, 18px) clamp(10px, 3.5vw, 20px) clamp(8px, 2.5vw, 16px)' }}>
          <motion.p
            className="text-center tracking-[0.28em] uppercase mb-2"
            style={{ color: 'rgba(200,160,255,0.75)', fontSize: 'min(2.6vw, 10px)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨ something magical for Sabeen ✨
          </motion.p>

          <p className="text-center font-semibold mb-4"
            style={{
              color:      '#FFE8A8',
              fontSize:   'min(4.2vw, 1rem)',
              textShadow: '0 0 18px rgba(255,215,0,0.55)',
              fontFamily: 'Georgia, serif',
              fontStyle:  'italic',
            }}>
            June 8, 2026
          </p>

          {!isComplete && (
            <div className="flex items-end justify-center gap-1.5 sm:gap-2 mb-4">
              <Unit value={days}    label="Days" />
              <Divider />
              <Unit value={hours}   label="Hrs"  />
              <Divider />
              <Unit value={minutes} label="Min"  />
              <Divider />
              <Unit value={seconds} label="Sec"  />
            </div>
          )}

          {isComplete && (
            <motion.p
              className="text-center mb-4 leading-relaxed"
              style={{ color: '#FFE8A8', fontSize: 'min(3.8vw, 0.9rem)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              The portal is open for you, Sabeen ❤️
            </motion.p>
          )}

          {isComplete && (
            <motion.button
              onClick={handleStart}
              className="w-full rounded-2xl font-bold tracking-widest uppercase relative overflow-hidden"
              style={{
                padding:    'clamp(10px, 3vw, 16px) 12px',
                fontSize:   'min(3.2vw, 0.8rem)',
                background: 'linear-gradient(135deg, #7B2D8B 0%, #BB44FF 40%, #FF85A1 75%, #FFD700 100%)',
                boxShadow:  '0 0 35px rgba(180,80,255,0.55), 0 4px 24px rgba(0,0,0,0.5)',
                color:      '#FFFFFF',
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 55px rgba(180,80,255,0.75)' }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'rgba(255,255,255,0.12)' }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <span className="relative z-10">Step Through the Portal ✨</span>
            </motion.button>
          )}

          {!isComplete && (
            <motion.div className="mt-4 h-px w-full relative overflow-hidden rounded-full"
              style={{ background: 'rgba(180,80,255,0.12)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #BB66FF, #FF85A1, transparent)' }}
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
