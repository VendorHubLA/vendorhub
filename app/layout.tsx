import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'VendorHub — Where Vendors, Communication, and Projects Align',
    template: '%s | VendorHub',
  },
  description:
    'The AI-native operating system for commercial real estate vendor management. Vetted vendors, centralized communication, and proactive project intelligence.',
  openGraph: {
    title: 'VendorHub',
    description: 'Where Vendors, Communication, and Projects Align',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
