import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "SongDash - Social Music Sharing",
  description: "Share song moments with highlighted lyrics and personal notes. Discover new music through social connections.",
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://songdash.io' : 'http://localhost:3000'),
  openGraph: {
    title: "SongDash - Social Music Sharing",
    description: "Share song moments with highlighted lyrics and personal notes. Discover new music through social connections.",
    url: process.env.NODE_ENV === 'production' ? 'https://songdash.io' : 'http://localhost:3000',
    siteName: 'SongDash',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SongDash - Social Music Sharing",
    description: "Share song moments with highlighted lyrics and personal notes. Discover new music through social connections.",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
