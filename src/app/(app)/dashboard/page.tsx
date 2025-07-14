'use client' // This page will have client-side interactions (e.g., modals)

import { useState } from 'react'
import { ZonaRojaCard } from '~/components/shared/zona-roja-card'
import { PaywallModal } from '~/components/shared/paywall-modal'

// This placeholder data will be replaced by a call to our backend.
// It reflects the kind of specific, actionable insights our AI will provide.
const zonasRojasData = [
  {
    title: 'Razonamiento Deductivo',
    description: 'Detectamos una oportunidad para fortalecer cómo aplicas reglas generales a problemas específicos.',
    isLocked: false,
  },
  {
    title: 'Análisis de Figuras',
    description: 'Mejorar tu habilidad para identificar patrones en secuencias geométricas tendrá un gran impacto.',
    isLocked: true,
  },
  {
    title: 'Comprensión de Textos Complejos',
    description: 'Dominar la inferencia en textos densos es clave para la sección verbal del examen.',
    isLocked: true,
  },
]

export default function DashboardPage() {
  const userName = 'Estudiante' // This will be fetched from Supabase auth.
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const handleCardClick = (isLocked: boolean, title: string) => {
    if (isLocked) {
      setIsPaywallOpen(true);
    } else {
      alert(`Navegando a la lección de "${title}"...`);
    }
  }

  return (
    <div className="bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            ¡Pura vida, {userName}!
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Tu diagnóstico está listo. Este es tu plan de ataque. Enfócate en estas 3
            áreas para ver el mayor progreso.
          </p>
        </header>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {zonasRojasData.map((zona) => (
            <ZonaRojaCard
              key={zona.title}
              title={zona.title}
              description={zona.description}
              isLocked={zona.isLocked}
              onClick={() => handleCardClick(zona.isLocked, zona.title)}
            />
          ))}
        </div>
        <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
      </div>
    </div>
  )
}
