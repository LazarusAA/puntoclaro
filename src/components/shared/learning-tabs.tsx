'use client'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { AnimatedBackground } from '~/components/ui/animated-background'
import { Download } from 'lucide-react'
import { useState } from 'react'
import type { LearningModule } from '~/types/learning'
import { PracticeQuiz } from './practice-quiz'

interface LearningTabsProps {
  learningData: LearningModule;
}

export function LearningTabs({ learningData }: LearningTabsProps) {
  const { title, explanation, machote } = learningData
  const [activeTab, setActiveTab] = useState('explicacion')

  return (
    <div className="w-full">
      <div className="rounded-lg bg-gray-200 p-1 mb-6 dark:bg-zinc-800 flex">
        <AnimatedBackground
          defaultValue="explicacion"
          className="rounded-md bg-white shadow-sm dark:bg-zinc-700"
          transition={{
            ease: 'easeInOut',
            duration: 0.2,
          }}
          onValueChange={(value) => setActiveTab(value || 'explicacion')}
        >
          {[
            { id: 'explicacion', label: '1. La Explicación' },
            { id: 'machote', label: '2. El Machote' },
            { id: 'practica', label: '3. La Práctica' }
          ].map((tab) => (
            <button
              key={tab.id}
              data-id={tab.id}
              type="button"
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-transform active:scale-[0.98] dark:text-gray-200 min-w-0"
            >
              {tab.label}
            </button>
          ))}
        </AnimatedBackground>
      </div>

      {activeTab === 'explicacion' && (
        <Card>
          <CardHeader>
            <CardTitle>Entendamos el Concepto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base md:text-lg leading-relaxed">
            <p>{explanation.validation}</p>
            <blockquote className="border-l-4 pl-4 italic text-slate-700">
              &ldquo;{explanation.analogy}&rdquo;
            </blockquote>
            <p>{explanation.core_concept}</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'machote' && (
        <Card>
          <CardHeader>
            <CardTitle>{machote.title}</CardTitle>
            <CardDescription>La guía definitiva para resolver estos problemas. ¡Descárgala y guárdala!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-base">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Pasos a Seguir:</h3>
              <ul className="list-decimal list-inside space-y-2 pl-2">
                {machote.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg">Errores Comunes:</h3>
              <p className="text-slate-700">{machote.common_mistakes[0]}</p>
            </div>
            <div className="pt-4">
              <Button className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Descargar Machote en PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'practica' && (
        <Card>
          <CardHeader>
            <CardTitle>¡A Practicar!</CardTitle>
            <CardDescription>Es hora de poner a prueba lo que aprendiste con 5 preguntas sobre {title}.</CardDescription>
          </CardHeader>
          <CardContent>
            <PracticeQuiz />
          </CardContent>
        </Card>
      )}
    </div>
  )
} 