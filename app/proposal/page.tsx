'use client'

import dynamic from 'next/dynamic'

// Skip SSR entirely — this is a Three.js canvas experience with no server-rendering value.
// ssr:false prevents any hydration mismatch from Framer Motion, canvas, or browser APIs.
const ProposalContent = dynamic(() => import('./ProposalContent'), { ssr: false })

export default function ProposalPage() {
  return <ProposalContent />
}
