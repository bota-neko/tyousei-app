import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tyousei-kun x Peatix',
  description: 'Event adjustment and management made simple and premium.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{ textAlign: 'center', padding: '2rem 0 1rem' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />
        </div>
        {children}
      </body>
    </html>
  )
}
