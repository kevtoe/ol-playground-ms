import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
font-family: ${GeistSans.style.fontFamily};
--font-sans: ${GeistSans.variable};
--font-mono: ${GeistMono.variable};
}
      `}</style>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v9.2.4/ol.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol-ext@4.0.33/dist/ol-ext.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
