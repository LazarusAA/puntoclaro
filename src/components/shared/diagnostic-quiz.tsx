'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'

// This is a placeholder type. In the real app, this will come from our database types.
type Question = {
  id: string
  text: string
  options: {
    id: string
    text: string
  }[]
}

// Define the exam type
type ExamType = 'ucr' | 'tec';

// Component props interface
interface DiagnosticQuizProps {
  examType: ExamType;
}

// Placeholder questions for building the UI.
const placeholderQuestions: Question[] = [
  {
    id: 'q1',
    text: '¿Qué número continúa la siguiente secuencia: 3, 7, 11, 15, ___?',
    options: [
      { id: 'q1-o1', text: '18' },
      { id: 'q1-o2', text: '19' },
      { id: 'q1-o3', text: '20' },
      { id: 'q1-o4', text: '21' },
    ],
  },
  {
    id: 'q2',
    text: 'Yigüirro es a Pájaro como...',
    options: [
      { id: 'q2-o1', text: 'Guápil es a Árbol' },
      { id: 'q2-o2', text: 'Río es a Agua' },
      { id: 'q2-o3', text: 'Lapa es a Rojo' },
      { id: 'q2-o4', text: 'Mariposa es a Vuelo' },
    ],
  },
  // Add 8-10 more placeholder questions to simulate the full flow.
  {
    id: 'q3',
    text: 'This is the final question. Clicking an option will finish the quiz.',
    options: [
      { id: 'q3-o1', text: 'Finish' },
      { id: 'q3-o2', text: 'Finish' },
      { id: 'q3-o3', text: 'Finish' },
      { id: 'q3-o4', text: 'Finish' },
    ],
  },
]

export function DiagnosticQuiz({ examType }: DiagnosticQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // TODO: Use examType to fetch exam-specific questions from the database
  console.log('Quiz initialized for exam type:', examType)

  const handleAnswerClick = (optionId: string) => {
    // In the real app, we would send the answer to our backend here.
    console.log(`User answered question ${placeholderQuestions[currentQuestionIndex].id} with option ${optionId}`)

    // Increment completed questions count
    setCompletedQuestions(completedQuestions + 1)

    // Move to the next question or complete the quiz.
    if (currentQuestionIndex < placeholderQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setIsCompleted(true)
      // Here we would trigger the navigation to the dashboard.
      console.log('Quiz completed!')
    }
  }

  if (isCompleted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">¡Diagnóstico Completado!</h2>
        <p className="mt-2">Analizando tus resultados...</p>
        {/* In the real app, a spinner would show before redirecting. */}
      </div>
    )
  }

  const currentQuestion = placeholderQuestions[currentQuestionIndex]
  const progressValue = (completedQuestions / placeholderQuestions.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="mb-4">
          <p className="text-sm font-medium text-center mb-2">
            Pregunta {currentQuestionIndex + 1} de {placeholderQuestions.length}
          </p>
          <Progress value={progressValue} />
        </div>
        <CardTitle className="text-2xl leading-relaxed text-center">
          {currentQuestion.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {currentQuestion.options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              size="lg"
              className="h-auto py-4 text-base whitespace-normal"
              onClick={() => handleAnswerClick(option.id)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 