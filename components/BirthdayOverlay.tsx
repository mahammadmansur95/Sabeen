'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHAYARI =
  `Tumhari saalgirah, mere liye sirf ek taareekh nahi,\n` +
  `balki us khwaab ka jashn hai jo humne milkar dekha hai.\n` +
  `Tumhare aane se pehle waqt bas guzar raha tha,\n` +
  `tumhare aane ke baad, har ghadi ek kahani ban gayi hai.\n\n` +
  `Woh station ka platform ho ya raat ki woh aakhri calls,\n` +
  `tumhare har message mein maine apna sukoon dhund liya hai.\n` +
  `Aaj ki raat, main khuda se kuch aur nahi,\n` +
  `bas humare milne ki woh khubsoorat ghadi maang raha hoon —\n` +
  `khwahish hai ki agle saal, tumhari saalgirah par\n` +
  `tumhare haath mere haathon mein hon aur main tumhari aankhon mein dekh kar keh sakoon:\n` +
  `"Khush raho, kyunki tumhari khushi mein hi meri duniya hai."\n\n` +
  `Tohfa toh mere paas keemti nahi, par ek waada hai —\n` +
  `ki jitni dhoop tumhari raahon mein aayi,\n` +
  `main apni zindagi mein tumhare liye sukoon likh dunga.\n` +
  `Tumhare saath waqt ka pata hi nahi chalta,\n` +
  `jaise har lamha ruk kar humara intezaar kar raha ho.\n\n` +
  `Tumhe janam din mubarak, meri jaan,\n` +
  `is baar doori hai, par agle saal tumhare saath ka jashn hoga.\n` +
  `Khuda kare hamari ye baatein kabhi khatam na hon,\n` +
  `aur tumhare har 'Good Night' ke baad, mere khwaabon mein bas tum raho.\n\n` +
  `Tum jiyo hazaaron saal,\n` +
  `aur har saal ki shuruwaat mujhse ho.\n\n` +
  `Saalgirah Mubarak. 🌹`

const EMOJIS = ['❤️', '💕', '💖', '🌹', '✨', '💝', '🌸', '💍']

interface Heart {
  id: number; left: number; size: number; dur: number; delay: number; emoji: string
}

let heartId = 0

const PDF_URL = '/Love%20Letter%20Sabeen.pdf'

export default function BirthdayOverlay() {
  const [text, setText]           = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [hearts, setHearts]       = useState<Heart[]>([])
  const idxRef                    = useRef(0)

  // Typewriter — sets typingDone when the shayari is fully printed
  useEffect(() => {
    const iv = setInterval(() => {
      if (idxRef.current >= SHAYARI.length) {
        clearInterval(iv)
        setTypingDone(true)
        return
      }
      const next = idxRef.current + 1
      idxRef.current = next
      setText(SHAYARI.slice(0, next))
    }, 28)
    return () => clearInterval(iv)
  }, [])

  // Floating hearts
  useEffect(() => {
    const make = () => {
      const h: Heart = {
        id:    heartId++,
        left:  3 + Math.random() * 94,
        size:  0.9 + Math.random() * 1.5,
        dur:   3.5 + Math.random() * 4,
        delay: Math.random() * 0.5,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      }
      setHearts(prev => [...prev, h])
      setTimeout(() => setHearts(prev => prev.filter(x => x.id !== h.id)), 9000)
    }
    for (let i = 0; i < 24; i++) setTimeout(make, i * 130)
    const iv = setInterval(make, 650)
    return () => clearInterval(iv)
  }, [])

  return (
    <>
      {/* Floating hearts */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 19, pointerEvents: 'none', overflow: 'hidden' }}>
        {hearts.map(h => (
          <motion.span
            key={h.id}
            style={{ position: 'absolute', bottom: -30, left: `${h.left}%`, fontSize: `${h.size}rem`, pointerEvents: 'none', userSelect: 'none' }}
            initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ y: '-110vh', opacity: 0, rotate: 20, scale: 0.3 }}
            transition={{ duration: h.dur, delay: h.delay, ease: 'linear' }}
          >
            {h.emoji}
          </motion.span>
        ))}
      </div>

      {/* Birthday shayari card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}
      >
        <div style={{
          textAlign: 'center',
          padding: 'clamp(16px,4vw,52px) clamp(16px,5vw,60px)',
          borderRadius: 28,
          background: 'rgba(4,0,18,0.74)',
          backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,215,0,0.18)',
          boxShadow: '0 0 100px rgba(130,40,200,0.2), 0 32px 80px rgba(0,0,0,0.65)',
          maxWidth: 620, width: 'calc(100% - 24px)',
          maxHeight: '92vh', overflowY: 'auto', scrollbarWidth: 'thin',
        }}>
          <p style={{ color: 'rgba(200,160,255,0.6)', fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', letterSpacing: '0.38em', textTransform: 'uppercase', marginBottom: 6 }}>
            Happy Birthday
          </p>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem,10vw,5.5rem)', fontStyle: 'italic', fontWeight: 700, lineHeight: 1, color: '#FFD700', textShadow: '0 0 60px rgba(255,215,0,0.7)', marginBottom: 14 }}>
            Sabeen
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16, fontSize: '1.1rem' }}>
            <div style={{ flex: 1, maxWidth: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.32), transparent)' }} />
            <span>❤️</span>
            <div style={{ flex: 1, maxWidth: 80, height: 1, background: 'linear-gradient(90deg, rgba(255,215,0,0.32), transparent)' }} />
          </div>

          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(255,245,228,0.92)', fontSize: 'clamp(0.85rem,2.2vw,1.08rem)', lineHeight: 1.75, whiteSpace: 'pre-wrap', marginBottom: 20, textAlign: 'left' }}>
            {text}
            {/* Cursor disappears when typing is done */}
            {!typingDone && (
              <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#FFD700', verticalAlign: 'middle', marginLeft: 2, animation: 'cursorBlink 0.75s step-end infinite' }} />
            )}
          </p>

          <p style={{ color: 'rgba(255,215,0,0.6)', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', marginBottom: typingDone ? 20 : 0, textAlign: 'right' }}>
            — Mansur 💍
          </p>

          {/* Love letter button — appears after shayari finishes */}
          <AnimatePresence>
            {typingDone && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)', marginBottom: 24 }} />

                <p style={{ color: 'rgba(200,160,255,0.55)', fontFamily: 'Lato, sans-serif', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
                  ✦ One more thing ✦
                </p>

                <motion.button
                  onClick={() => setShowLetter(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ boxShadow: ['0 0 30px rgba(255,107,160,0.3)', '0 0 55px rgba(255,107,160,0.6)', '0 0 30px rgba(255,107,160,0.3)'] }}
                  transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
                  style={{
                    width: '100%', padding: '14px 20px',
                    border: '1px solid rgba(255,165,120,0.35)', borderRadius: 50,
                    background: 'linear-gradient(135deg, rgba(120,20,60,0.6) 0%, rgba(180,50,100,0.5) 50%, rgba(100,20,80,0.6) 100%)',
                    backdropFilter: 'blur(12px)',
                    color: '#FFE8C8', fontFamily: 'Georgia, serif', fontStyle: 'italic',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
                    cursor: 'pointer', letterSpacing: '0.04em',
                  }}
                >
                  💌 &nbsp;Read My Letter to You
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Love Letter Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 80,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(2,0,10,0.96)',
              backdropFilter: 'blur(8px)',
              padding: 'clamp(12px, 3vw, 28px)',
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 820, marginBottom: 14 }}
            >
              <div>
                <p style={{ color: 'rgba(200,160,255,0.55)', fontFamily: 'Lato, sans-serif', fontSize: '0.65rem', letterSpacing: '0.34em', textTransform: 'uppercase', marginBottom: 2 }}>
                  A letter written just for you
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
                  💌 My Love Letter, Sabeen
                </h2>
              </div>

              <motion.button
                onClick={() => setShowLetter(false)}
                whileHover={{ scale: 1.1, background: 'rgba(255,215,0,0.12)' }}
                whileTap={{ scale: 0.93 }}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '1px solid rgba(255,215,0,0.25)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,215,0,0.7)', fontSize: '1rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* PDF frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                width: '100%', maxWidth: 820,
                flex: 1, minHeight: 0,
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,215,0,0.18)',
                boxShadow: '0 0 80px rgba(255,107,160,0.12), 0 0 0 1px rgba(255,215,0,0.06)',
              }}
            >
              {/* Primary: iframe for desktop browsers */}
              <iframe
                src={PDF_URL}
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '60vh', display: 'block', background: '#fff' }}
                title="Love Letter for Sabeen"
              />
            </motion.div>

            {/* Fallback link for mobile where iframes don't render PDFs */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: 'rgba(255,200,150,0.45)', fontFamily: 'Lato, sans-serif', fontSize: '0.7rem', marginTop: 10, letterSpacing: '0.1em' }}
            >
              Can&apos;t see the letter?&nbsp;
              <a href={PDF_URL} target="_blank" rel="noreferrer"
                style={{ color: 'rgba(255,215,0,0.65)', textDecoration: 'underline' }}>
                Tap here to open it ↗
              </a>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </>
  )
}
