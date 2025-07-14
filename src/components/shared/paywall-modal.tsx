'use client'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { CheckCircle, Lock, Star } from 'lucide-react'
import { ShineBorder } from '~/components/magicui/shine-border'

// The feature list is rewritten to be scannable and benefit-oriented.
const features = [
  { bold: 'Análisis Personalizado', rest: 'de tus Zonas Rojas' },
  { bold: 'Lecciones + Machotes', rest: 'ilimitados' },
  { bold: 'Práctica Personalizada', rest: 'según tus errores' },
  { bold: 'Simulacros Oficiales', rest: 'con resultados' },
]

type PaywallModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const handleUpgrade = () => {
    // This will trigger the Stripe Checkout flow.
    alert('Redirecting to payment...')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* The key change is `p-0` to allow for full control over the layout sections. */}
      <DialogContent className="sm:max-w-md p-0 border-0 overflow-hidden bg-transparent">
        <div className="relative rounded-xl bg-white">
          <ShineBorder 
            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} 
            borderWidth={4}
          />
          
          {/* Section 1: The Offer Header. Visually distinct to draw the eye. */}
          <div className="bg-slate-50/75 px-4 pt-8 pb-4 rounded-t-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 text-center">
              Aprueba el examen. <br /> Entra a la U.
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2 text-slate-600">
              Todo lo que necesitas, por menos de lo que cuesta <strong>una sola hora</strong> con un tutor.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Section 2: The Core Offer (Value & Features). */}
        <div className="px-6 py-6 bg-white">
          {/* The Price: This is the hero element. Large, bold, and clear. */}
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              OFERTA POPULAR
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </p>
            <p className="text-6xl font-bold text-gray-900">₡9,900</p>
            <p className="text-sm text-slate-500 font-medium mt-2">pago único • sin suscripciones</p>
          </div>

          {/* The Feature List: Clear, scannable, and value-packed. */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-500 uppercase text-center">EL PLAN DE ATAQUE COMPLETO INCLUYE:</p>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-slate-800 font-medium">
                    <strong>{feature.bold}</strong> {feature.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 3: The Call to Action Footer. A clear, final step. */}
        <div className="p-6 pt-4 bg-slate-50/75 border-t rounded-b-xl">
          <Button
            size="lg"
            className="w-full text-lg h-14 font-bold mb-2"
            onClick={handleUpgrade}
          >
            Obtener acceso ilimitado
          </Button>
          <p className="text-xs text-center text-slate-500 mt-3 flex items-center justify-center gap-1.5">
            <Lock className="h-4 w-4" />
            Pago seguro y acceso garantizado hasta el día del examen.
          </p>
        </div>

        </div>
      </DialogContent>
    </Dialog>
  )
} 