import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'T.A.O Marketing System',
  description: 'Think / Act / Optimize - 考え、動き、改善する',
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
