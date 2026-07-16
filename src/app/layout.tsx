import Providers from '@/app/providers'
import { AuthSync } from '@/components/auth/AuthSync'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import TrackoShell from '@/components/layout/TrackoShell'
import { Suspense } from 'react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Tracko Enterprise Workspace',
  description: 'Enterprise project and task tracking platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthSync />
          <Suspense fallback={null}>
            <TrackoShell>
              {children}
            </TrackoShell>
          </Suspense>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
