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
      <body>{children}</body>
    </html>
  )
}
