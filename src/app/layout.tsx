import './globals.css'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sistema de Ayuda Social y Donaciones',
  description: 'Conectando corazones generosos con familias que necesitan apoyo. Sistema de ayuda social y donación de alimentos.',
  keywords: ['sistema de ayuda social y donaciones', 'donación', 'ayuda social', 'solidaridad'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
