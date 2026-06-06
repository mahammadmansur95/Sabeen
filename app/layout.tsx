import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'A Special Birthday Surprise ❤️',
  description: 'A cinematic romantic journey made just for you.',
  icons:       { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  themeColor:          '#06001A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%', background: '#06001A' }}>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, height: '100%', overflow: 'hidden', background: '#06001A' }}>
        {children}
      </body>
    </html>
  )
}
