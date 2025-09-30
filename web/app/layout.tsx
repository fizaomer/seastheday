import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seas the Day - Find your perfect beach window',
  description: 'Find the best 2-4 hour windows to go to the beach based on hourly weather forecasts.',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-text">
        {children}
      </body>
    </html>
  )
}
