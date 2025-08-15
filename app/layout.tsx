import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import Script from "next/script"

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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TMRVXHHP');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TMRVXHHP" height="0" width="0" style={{display: "none", visibility: "hidden"}} />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  )
}
