'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLS = 3
const TOTAL = 9
const CONFETTI_COLORS = ['#FFD700', '#FF85A1', '#BB66FF', '#FF6B35', '#00D4FF', '#FF006E', '#fff']

function shuffled(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (a.every((v, i) => v === i)) return shuffled(arr)
  return a
}

interface ConfettiPiece {
  id: number; x: number; y: number
  tx: number; ty: number; rot: number
  color: string; dur: number; delay: number; circle: boolean
}

interface Props {
  onSolved: () => void
}

export default function PuzzleGame({ onSolved }: Props) {
  const [slots, setSlots]       = useState<number[]>(() => shuffled([...Array(TOTAL).keys()]))
  const [selected, setSelected] = useState<number | null>(null)
  const [swaps, setSwaps]       = useState(0)
  const [solved, setSolved]     = useState(false)
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [tileW, setTileW]       = useState(90)
  const [tileH, setTileH]       = useState(110)
  const [imgReady, setImgReady] = useState(false)

  // Stable per-load cache-buster — ensures replacing couple.jpeg always shows fresh
  const imgSrc = useRef(`/couple.jpeg?v=${Date.now()}`).current

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight
      const maxW   = Math.min(window.innerWidth * 0.84, 336) - 8
      const maxH   = window.innerHeight * 0.55
      let pw = maxW
      let ph = pw / aspect
      if (ph > maxH) { ph = maxH; pw = ph * aspect }
      pw = Math.floor(pw / 3) * 3
      ph = Math.floor(ph / 3) * 3
      setTileW(pw / 3)
      setTileH(ph / 3)
      setImgReady(true)
    }
    img.onerror = () => onSolved()
    img.src = imgSrc
  }, [onSolved, imgSrc])

  const handleClick = useCallback((idx: number) => {
    if (solved) return

    // First tap: select
    if (selected === null) {
      setSelected(idx)
      return
    }

    // Re-tap same tile: deselect
    if (selected === idx) {
      setSelected(null)
      return
    }

    // Second tap on different tile: swap
    const from = selected
    setSelected(null)

    const newSlots = [...slots]
    ;[newSlots[from], newSlots[idx]] = [newSlots[idx], newSlots[from]]
    setSlots(newSlots)
    setSwaps(s => s + 1)

    // Check win synchronously against the new arrangement
    if (newSlots.every((v, i) => v === i)) {
      setSolved(true)
      setConfetti(
        Array.from({ length: 64 }, (_, i) => ({
          id: i,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 50,
          tx: (Math.random() - 0.5) * 220,
          ty: -90 - Math.random() * 180,
          rot: Math.random() * 540,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          dur: 1.2 + Math.random() * 0.5,
          delay: Math.random() * 0.25,
          circle: Math.random() > 0.5,
        }))
      )
      setTimeout(onSolved, 2200)
    }
  }, [selected, solved, slots, onSolved])

  const puzzleW = tileW * COLS
  const puzzleH = tileH * 3

  return (
    <>
      {/* Confetti burst on solve */}
      <AnimatePresence>
        {confetti.map(p => (
          <motion.div
            key={p.id}
            style={{
              position: 'fixed',
              width: 8, height: 8,
              borderRadius: p.circle ? '50%' : 2,
              background: p.color,
              left: `${p.x}%`, top: `${p.y}%`,
              zIndex: 60, pointerEvents: 'none',
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: p.tx, y: p.ty, rotate: p.rot, opacity: 0 }}
            transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Puzzle card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          textAlign: 'center',
          padding: 'clamp(16px,3.5vw,32px) clamp(14px,3.5vw,28px)',
          borderRadius: 24,
          background: 'rgba(4,0,18,0.80)',
          backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,215,0,0.2)',
          boxShadow: '0 0 80px rgba(130,40,200,0.22), 0 32px 80px rgba(0,0,0,0.7)',
          maxWidth: 'min(96vw, 420px)', width: '100%',
        }}>
          <p style={{
            color: 'rgba(200,160,255,0.65)', fontFamily: 'Lato, sans-serif',
            fontSize: '0.68rem', letterSpacing: '0.34em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            ✦ A Little Surprise ✦
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            fontSize: 'clamp(0.95rem, 3.2vw, 1.2rem)', color: '#FFE8A8',
            lineHeight: 1.5, marginBottom: 6,
          }}>
            Reassemble our photo<br />to reveal a secret message 💝
          </h2>
          <p style={{
            color: 'rgba(180,140,255,0.55)', fontFamily: 'Lato, sans-serif',
            fontSize: '0.7rem', letterSpacing: '0.14em', marginBottom: 10,
          }}>
            Tap a piece · tap another to swap
          </p>
          <p style={{
            color: 'rgba(255,215,0,0.6)', fontFamily: 'Lato, sans-serif',
            fontSize: '0.72rem', letterSpacing: '0.18em', marginBottom: 12, minHeight: 16,
          }}>
            {swaps > 0 ? `${swaps} swap${swaps !== 1 ? 's' : ''}` : ''}
          </p>

          {/* Photo grid — plain divs so backgroundPosition updates immediately */}
          {imgReady ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${tileW}px)`,
              gap: 3,
              borderRadius: 12, overflow: 'hidden',
              margin: '0 auto',
              width: puzzleW,
              boxShadow: '0 0 0 2px rgba(255,215,0,0.15), 0 8px 40px rgba(0,0,0,0.6)',
            }}>
              {slots.map((tileNum, displayIdx) => {
                const col        = tileNum % COLS
                const row        = Math.floor(tileNum / COLS)
                const isSelected = selected === displayIdx

                return (
                  <div
                    key={displayIdx}
                    onClick={() => handleClick(displayIdx)}
                    style={{
                      width:              tileW,
                      height:             tileH,
                      backgroundImage:    `url('${imgSrc}')`,
                      backgroundSize:     `${puzzleW}px ${puzzleH}px`,
                      backgroundPosition: `-${col * tileW}px -${row * tileH}px`,
                      backgroundRepeat:   'no-repeat',
                      cursor:             'pointer',
                      userSelect:         'none',
                      position:           'relative',
                      zIndex:             isSelected ? 2 : 1,
                      transform:          isSelected ? 'scale(1.06)' : 'scale(1)',
                      boxShadow:          isSelected
                        ? 'inset 0 0 0 3px #FFD700, 0 0 22px rgba(255,215,0,0.7)'
                        : undefined,
                      filter:             solved ? 'brightness(1.4) saturate(1.5)' : undefined,
                      transition:         'transform 0.15s ease, box-shadow 0.15s ease, filter 0.5s ease',
                    }}
                  />
                )
              })}
            </div>
          ) : (
            <div style={{
              width: puzzleW, height: 200, margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,215,0,0.4)', fontSize: '0.8rem', letterSpacing: '0.2em',
            }}>
              Loading…
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
