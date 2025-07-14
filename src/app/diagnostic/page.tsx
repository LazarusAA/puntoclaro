'use client'

import { useState } from 'react'
import { DiagnosticQuiz } from '~/components/shared/diagnostic-quiz'
import { Navbar1 } from '~/components/layouts/main-nav'
import { Footer7 } from '~/components/layouts/site-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'

// Define a type for clarity and type safety
type ExamType = 'ucr' | 'tec';

export default function DiagnosticPage() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);

  // If an exam has been selected, render the quiz.
  if (selectedExam) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar1 
          menu={[]} 
          logo={{ url: "/", src: "/logo.svg", alt: "Umbral Logo", title: "Umbral" }}
          auth={{ login: { title: "Iniciar sesión", url: "#" }, signup: { title: "Registrarse", url: "#" } }}
        />
        <main className="flex-grow flex items-center justify-center p-4 py-2 sm:py-4">
          <div className="w-full h-[750px] flex items-center justify-center">
            {/* We will pass the selectedExam to the quiz to fetch the correct questions */}
            <DiagnosticQuiz examType={selectedExam} />
          </div>
        </main>
        <Footer7 />
      </div>
    );
  }

  // If no exam is selected, render the selection screen.
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar1 
        menu={[]} 
        logo={{ url: "/", src: "/logo.svg", alt: "Umbral Logo", title: "Umbral" }}
        auth={{ login: { title: "Iniciar sesión", url: "#" }, signup: { title: "Registrarse", url: "#" } }}
      />
      <main className="flex-grow flex items-center justify-center p-4 py-2 sm:py-4">
        <div className="w-full h-[750px] flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">
              ¿Para cuál examen te estás preparando?
            </CardTitle>
            <CardDescription className="pt-2">
              Tu elección nos ayudará a darte el diagnóstico más preciso.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Button
              variant="outline"
              className="h-auto py-6 text-base"
              onClick={() => setSelectedExam('ucr')}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg">UCR / UNA</span>
                <span className="text-xs text-muted-foreground">Prueba de Aptitud Académica</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 text-base"
              onClick={() => setSelectedExam('tec')}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg">TEC</span>
                <span className="text-xs text-muted-foreground">Examen de Admisión</span>
              </div>
            </Button>
          </CardContent>
        </Card>
        </div>
      </main>
      <Footer7 />
    </div>
  );
} 