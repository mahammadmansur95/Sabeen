'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../lib/store'

// ─────────────────────────────────────────────────────────────────────────────
//  MORPHING PARTICLE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const N       = 4500
const SCALE   = 2.8
const HOLD_MS = 4200

function makeHeartTargets(n: number): Float32Array {
  const out  = new Float32Array(n * 3)
  const yOff = 0.156 * SCALE
  for (let i = 0; i < n; i++) {
    const t  = (i / n) * Math.PI * 2
    const hx = (16 * Math.pow(Math.sin(t), 3) / 16) * SCALE
    const hy = ((13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16) * SCALE
    out[i * 3]     = hx + (Math.random() - 0.5) * 0.30
    out[i * 3 + 1] = hy + yOff + (Math.random() - 0.5) * 0.30
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.25
  }
  return out
}

function makeNameTargets(n: number): Float32Array {
  const out = new Float32Array(n * 3)
  if (typeof document === 'undefined') return out

  const W = 1200, H = 240
  const cv  = document.createElement('canvas')
  cv.width  = W; cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 156px Georgia, serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('SABEEN', W / 2, H / 2)

  const px: [number, number][] = []
  const d = ctx.getImageData(0, 0, W, H).data
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (d[(y * W + x) * 4] > 128) px.push([x, y])

  for (let i = 0; i < n; i++) {
    const p = px[Math.floor(Math.random() * px.length)] ?? [W / 2, H / 2]
    out[i * 3]     = ((p[0] / W) - 0.5) * 8.2 + (Math.random() - 0.5) * 0.04
    out[i * 3 + 1] = -((p[1] / H) - 0.5) * 2.2 + (Math.random() - 0.5) * 0.04
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.25
  }
  return out
}

const HEART_PAL: [number,number,number][] = [
  [0.68, 0.18, 0.35], [0.75, 0.38, 0.50], [0.78, 0.55, 0.62],
  [0.62, 0.15, 0.34], [0.80, 0.62, 0.68], [0.66, 0.32, 0.50],
]
const NAME_PAL: [number,number,number][] = [
  [0.82, 0.65, 0.10], [0.80, 0.72, 0.44], [0.78, 0.54, 0.20],
  [0.76, 0.46, 0.42], [0.80, 0.72, 0.58], [0.68, 0.52, 0.78],
]

function makeColorBuf(n: number, pal: [number,number,number][]): Float32Array {
  const a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const c = pal[Math.floor(Math.random() * pal.length)]
    a[i*3]=c[0]; a[i*3+1]=c[1]; a[i*3+2]=c[2]
  }
  return a
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED POINT SHADER  (for morphing particles + galaxy bg)
// ─────────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute vec3 aColor;
  varying   vec3 vColor;
  uniform float  uSize;
  void main(){
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    gl_PointSize = uSize*(160.0/-mv.z);
    gl_Position  = projectionMatrix*mv;
  }
`
const FRAG = /* glsl */`
  varying vec3 vColor;
  void main(){
    vec2  c = gl_PointCoord-0.5;
    float d = length(c);
    if(d>0.5)discard;
    float a = exp(-d*d*14.0)*0.48;
    gl_FragColor = vec4(vColor,a);
  }
`

// ─────────────────────────────────────────────────────────────────────────────
//  CAMERA CONTROLLER
//  Exact same technique as three.js snow example — camera position chases mouse
// ─────────────────────────────────────────────────────────────────────────────
function CameraController() {
  const { camera } = useThree()
  // mouseX/Y in world-space units (camera at z=9, FOV=50 → visible half-width ≈ 4.2 at z=0)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const halfW = window.innerWidth  / 2
    const halfH = window.innerHeight / 2
    const onMove = (e: MouseEvent) => {
      // Normalise to ±(world half-width at z=0) so full mouse sweep spans ~the scene
      mouse.current.x = (e.clientX - halfW) / halfW * 3.2
      mouse.current.y = (e.clientY - halfH) / halfH * 1.8
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    // Mirror of three.js snow render():
    //   camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    //   camera.position.y += ( -mouseY - camera.position.y ) * 0.05;
    //   camera.lookAt( scene.position );
    camera.position.x += ( mouse.current.x - camera.position.x) * 0.05
    camera.position.y += (-mouse.current.y + 2 - camera.position.y) * 0.05
    camera.lookAt(0, 0.5, 0)
  })

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROMANTIC HEART PARTICLE LAYERS
//  Exact same structure as three.js snow example:
//   • One shared geometry, 5 PointsMaterial layers, each with random initial rotation
//   • Layers rotate at different speeds in the render loop
//   • Hue shifts slowly over time for a living, romantic glow
// ─────────────────────────────────────────────────────────────────────────────
function RomanticHeartLayers() {
  // Draw a soft heart sprite onto a canvas — used as the PointsMaterial map
  const heartTex = useMemo(() => {
    const S = 128
    const cv = document.createElement('canvas')
    cv.width = S; cv.height = S
    const ctx = cv.getContext('2d')!
    ctx.clearRect(0, 0, S, S)

    // Soft radial glow behind the heart
    const grd = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5)
    grd.addColorStop(0,   'rgba(255,255,255,1)')
    grd.addColorStop(0.4, 'rgba(255,160,190,0.75)')
    grd.addColorStop(1,   'rgba(255, 80,130,0)')
    ctx.fillStyle = grd

    // Parametric heart path (same equation as MorphingParticles)
    const cx = S / 2, cy = S / 2 + S * 0.06
    const sc = S * 0.33
    ctx.beginPath()
    for (let i = 0; i <= 256; i++) {
      const t = (i / 256) * Math.PI * 2
      const x = sc * 16 * Math.pow(Math.sin(t), 3) / 16
      const y = -sc * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16
      if (i === 0) ctx.moveTo(cx + x, cy + y)
      else         ctx.lineTo(cx + x, cy + y)
    }
    ctx.closePath()
    ctx.fill()

    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // One shared geometry — all 5 layers render the same 8000 points
  // (exactly like three.js snow which uses the same geometry for all 5 sprite types)
  const sharedGeo = useMemo(() => {
    const COUNT = 8000
    const verts = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      verts[i * 3]     = Math.random() * 20 - 10   // ±10 world units
      verts[i * 3 + 1] = Math.random() * 20 - 10
      verts[i * 3 + 2] = Math.random() * 20 - 10
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])

  const layers = useMemo(() => {
    const params: { hsl: [number, number, number]; size: number }[] = [
      { hsl: [0.97, 0.85, 0.55], size: 0.55 },
      { hsl: [0.93, 0.80, 0.50], size: 0.38 },
      { hsl: [0.88, 0.70, 0.58], size: 0.25 },
    ]

    return params.map(({ hsl, size }) => {
      const mat = new THREE.PointsMaterial({
        size,
        map:       heartTex,
        blending:  THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        alphaTest: 0.001,   // Chrome needs this for point sprites with transparent maps
      })
      mat.color.setHSL(hsl[0], hsl[1], hsl[2], THREE.SRGBColorSpace)

      const pts = new THREE.Points(sharedGeo, mat)
      // Random initial rotation so layers appear scattered, not stacked
      pts.rotation.x = Math.random() * Math.PI * 2
      pts.rotation.y = Math.random() * Math.PI * 2
      pts.rotation.z = Math.random() * Math.PI * 2

      return { pts, mat, origHue: hsl[0], sat: hsl[1], lit: hsl[2] }
    })
  }, [heartTex, sharedGeo])

  useFrame(({ clock }) => {
    // time scale mirrors three.js: Date.now() * 0.00005 ≈ elapsed * 0.05
    const time = clock.getElapsedTime() * 0.05

    layers.forEach(({ pts, mat, origHue, sat, lit }, i) => {
      // Rotate each layer at a different speed (same formula as three.js snow)
      pts.rotation.y = time * (i < 3 ? (i + 1) : -(i + 1))

      // Slow hue drift for a living, warm-to-rosy glow
      const h = (origHue + time * 0.015) % 1
      mat.color.setHSL(h, sat, lit, THREE.SRGBColorSpace)
    })
  })

  return (
    <>
      {layers.map(({ pts }, i) => (
        <primitive key={i} object={pts} />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MORPHING PARTICLES  (heart ↔ "SABEEN" name)
// ─────────────────────────────────────────────────────────────────────────────
function MorphingParticles() {
  const pts = useRef<THREE.Points>(null!)

  const heartT = useMemo(() => makeHeartTargets(N), [])
  const nameT  = useMemo(() => makeNameTargets(N),  [])
  const heartC = useMemo(() => makeColorBuf(N, HEART_PAL), [])
  const nameC  = useMemo(() => makeColorBuf(N, NAME_PAL),  [])

  const posArr = useMemo(() => heartT.slice(), [heartT])
  const colArr = useMemo(() => heartC.slice(), [heartC])
  const velArr = useMemo(() => new Float32Array(N * 3), [])

  const morphT      = useRef(0)
  const morphDir    = useRef<1|-1>(1)
  const phaseTimer  = useRef(0)
  const holding     = useRef(false)

  const cx    = useRef(0)
  const cy    = useRef(0)
  const cDown = useRef(false)

  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pb = new THREE.BufferAttribute(posArr, 3); pb.setUsage(THREE.DynamicDrawUsage)
    const cb = new THREE.BufferAttribute(colArr, 3); cb.setUsage(THREE.DynamicDrawUsage)
    g.setAttribute('position', pb)
    g.setAttribute('aColor',   cb)
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: { uSize: { value: 1.35 } },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [posArr, colArr])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cx.current    = ((e.clientX / window.innerWidth)  - 0.5) * 14.8
      cy.current    = -((e.clientY / window.innerHeight) - 0.5) * 8.3
      cDown.current = true
    }
    const onOut = () => { cDown.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onOut)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onOut)
    }
  }, [])

  useFrame((_, delta) => {
    if (!pts.current) return

    const pos = posArr
    const vel = velArr
    const col = colArr
    const hc  = heartC, nc = nameC
    const hT  = heartT, nT = nameT
    const t   = morphT.current

    phaseTimer.current += delta * 1000
    if (!holding.current) {
      morphT.current = THREE.MathUtils.clamp(t + morphDir.current * 0.018, 0, 1)
      if (morphT.current === 0 || morphT.current === 1) {
        holding.current    = true
        phaseTimer.current = 0
      }
    } else if (phaseTimer.current > HOLD_MS) {
      morphDir.current   = (morphDir.current === 1 ? -1 : 1) as 1|-1
      holding.current    = false
      phaseTimer.current = 0
    }

    const tr   = morphT.current
    const tPos = tr < 0.5 ? hT : nT
    const RAD = 1.9, FORCE = 0.20, DAMP = 0.87, LERP = 0.024
    const mouseX = cx.current, mouseY = cy.current, active = cDown.current

    for (let i = 0; i < N; i++) {
      const i3 = i * 3

      col[i3]     = hc[i3]     + (nc[i3]     - hc[i3])     * tr
      col[i3 + 1] = hc[i3 + 1] + (nc[i3 + 1] - hc[i3 + 1]) * tr
      col[i3 + 2] = hc[i3 + 2] + (nc[i3 + 2] - hc[i3 + 2]) * tr

      if (active) {
        const dx = pos[i3]     - mouseX
        const dy = pos[i3 + 1] - mouseY
        const d2 = dx * dx + dy * dy
        if (d2 < RAD * RAD && d2 > 1e-5) {
          const d  = Math.sqrt(d2)
          const f  = ((RAD - d) / RAD) * FORCE
          vel[i3]     += (dx / d) * f
          vel[i3 + 1] += (dy / d) * f
          vel[i3 + 2] += (Math.random() - 0.5) * f * 0.18
        }
      }

      vel[i3]     *= DAMP; vel[i3 + 1] *= DAMP; vel[i3 + 2] *= DAMP
      pos[i3]     += vel[i3]     + (tPos[i3]     - pos[i3])     * LERP
      pos[i3 + 1] += vel[i3 + 1] + (tPos[i3 + 1] - pos[i3 + 1]) * LERP
      pos[i3 + 2] += vel[i3 + 2] + (tPos[i3 + 2] - pos[i3 + 2]) * LERP
    }

    pts.current.geometry.attributes.position.needsUpdate = true
    pts.current.geometry.attributes.aColor.needsUpdate   = true
  })

  return <points ref={pts} args={[geo, mat]} />
}

// ─────────────────────────────────────────────────────────────────────────────
//  GALAXY BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
function GalaxyBackground() {
  const ref = useRef<THREE.Points>(null!)
  const { geo, mat } = useMemo(() => {
    const BG = 4000
    const pos = new Float32Array(BG * 3)
    const col = new Float32Array(BG * 3)
    const pal: [number,number,number][] = [
      [0.45,0.10,0.75],[0.75,0.25,0.45],[0.25,0.25,0.65],
      [0.90,0.65,0.00],[0.90,0.90,0.90],[0.55,0.15,0.75],
      [1.00,0.40,0.55],[0.30,0.20,0.70],
    ]
    const MAX = 11
    for (let i = 0; i < BG; i++) {
      const r     = Math.pow(Math.random(), 0.5) * MAX
      const arm   = i % 3
      const theta = arm * (Math.PI * 2 / 3) + r * 0.5 + (Math.random() - 0.5) * 0.6
      const noise = (Math.random() - 0.5) * r * 0.2
      pos[i*3]     = r * Math.cos(theta) + noise
      pos[i*3 + 1] = (Math.random() - 0.5) * r * 0.05
      pos[i*3 + 2] = r * Math.sin(theta) + noise - 5
      const c = pal[Math.floor(Math.random() * pal.length)]
      const dim = 0.15 + Math.random() * 0.25
      col[i*3]=c[0]*dim; col[i*3+1]=c[1]*dim; col[i*3+2]=c[2]*dim
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos,3))
    g.setAttribute('aColor',   new THREE.BufferAttribute(col,3))
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: { uSize: { value: 0.6 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.025
  })

  return <points ref={ref} args={[geo, mat]} rotation={[-0.5, 0, 0]} />
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingScene() {
  const { scene } = useGameStore()
  const isTransitioning = scene === 'transitioning'

  useEffect(() => {
    if (!isTransitioning) return
    const id = setTimeout(() => { window.location.href = '/proposal?autostart=true' }, 2600)
    return () => clearTimeout(id)
  }, [isTransitioning])

  return (
    <>
      <color attach="background" args={['#02000A']} />
      <fog   attach="fog"        args={['#02000A', 45, 110]} />

      {/* Mouse-driven camera parallax — identical to three.js snow example */}
      <CameraController />

      <Stars
        radius={130} depth={80} count={2500}
        factor={3.5} saturation={0} fade speed={0.08}
      />

      <GalaxyBackground />

      {/* 5 rotating heart sprite layers — same technique as three.js snow sprites */}
      <RomanticHeartLayers />

      {/* Heart ↔ SABEEN name morphing particles */}
      <MorphingParticles />

    </>
  )
}
