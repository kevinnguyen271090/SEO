import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { AuthSessionProvider } from '@/lib/auth/session-provider'

export const metadata: Metadata = {
  title: 'FinTrader - AI-Powered Trading Platform',
  description: 'Advanced trading platform with AI signals, backtesting, and portfolio management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
