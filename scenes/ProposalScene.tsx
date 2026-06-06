'use client'

import { useEffect, useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const ATLAS_URL = 'https://threejs.org/examples/textures/cube/sun_temple_stripe.jpg'

function CastlePanorama({ onReady }: { onReady: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    // Inside-out box so the camera sees the interior faces
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.scale(1, 1, -1)
    mesh.geometry = geo

    const loader = new THREE.ImageLoader()
    loader.load(ATLAS_URL, (img) => {
      const w = img.height
      const mats = Array.from({ length: 6 }, (_, i) => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = w
        canvas.getContext('2d')!.drawImage(img, w * i, 0, w, w, 0, 0, w, w)
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        return new THREE.MeshBasicMaterial({ map: tex })
      })
      ;(mesh as THREE.Mesh).material = mats
      onReady()
    })

    return () => { geo.dispose() }
  }, [onReady])

  return <mesh ref={meshRef} />
}

export default function ProposalScene({ onReady }: { onReady: () => void }) {
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <>
      <CastlePanorama onReady={onReady} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        rotateSpeed={-0.25}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
        onStart={() => setAutoRotate(false)}
      />
    </>
  )
}
