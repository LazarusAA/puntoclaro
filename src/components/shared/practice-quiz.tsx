'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

// Define the shape of a question for this component
type PracticeQuestion = {
  id: string
  text: string
  options: {
    id: string
    text: string
  }[]
  correctOptionId: string
  rationale: string
}

type PracticeQuizProps = {
  topicId: string
}

export function PracticeQuiz({ topicId }: PracticeQuizProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showScorePulse, setShowScorePulse] = useState(false)

  const fetchPracticeQuiz = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/practice/${topicId}`)
      if (!response.ok) {
        throw new Error('No se pudieron cargar las preguntas de práctica.')
      }
      const data = await response.json()
      if (!data.practiceQuestions || data.practiceQuestions.length === 0) {
        throw new Error('No hay preguntas de práctica disponibles para este tema en este momento.')
      }
      setQuestions(data.practiceQuestions)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido.')
    } finally {
      setIsLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    fetchPracticeQuiz()
  }, [fetchPracticeQuiz])

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption) return // Prevent changing answer
    setSelectedOption(optionId)
    if (optionId === currentQuestion.correctOptionId) {
      setScore(score + 1)
      setShowScorePulse(true)
      setTimeout(() => setShowScorePulse(false), 600)
    }
  }
  
  const handleNextQuestion = () => {
    setSelectedOption(null)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedOption(null)
    setShowScorePulse(false)
    setIsCompleted(false)
    // Refetch new set of questions for a fresh practice session
    fetchPracticeQuiz()
  }

  useEffect(() => {
    if (isCompleted && score === questions.length && questions.length > 0) {
      // Confetti logic...
    }
  }, [isCompleted, score, questions.length])

  if (isLoading) {
    return <div className="text-center p-8">Buscando las mejores preguntas para ti...</div>
  }
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>
  }
  if (isCompleted) {
    const isPerfectScore = score === questions.length
    const scorePercentage = Math.round((score / questions.length) * 100)
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <CardTitle className={`text-2xl ${isPerfectScore ? 'text-green-600' : ''}`}>
            {isPerfectScore ? '¡Perfecto!' : '¡Práctica Completada!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-4xl font-bold mb-2 ${isPerfectScore ? 'text-green-600' : ''}`}>
            {score} / {questions.length}
          </p>
          <p className={`text-lg mb-2 ${isPerfectScore ? 'text-green-600 font-semibold' : ''}`}>
            {scorePercentage}% correcto
          </p>
          <p className="text-slate-600">
            {isPerfectScore 
              ? '¡Increíble! Dominaste completamente el razonamiento deductivo.' 
              : '¡Excelente trabajo! La práctica constante es la clave.'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleRestart}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar Práctica
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return <div className="text-center p-8">Cargando pregunta...</div>;
  }

  const getButtonClassName = (optionId: string) => {
    if (!selectedOption) return 'hover:shadow-md hover:scale-[1.01] active:scale-[0.98]'
    if (optionId === currentQuestion.correctOptionId) return 'bg-green-500 hover:bg-green-500 border-green-500 text-white shadow-md shadow-green-200 transform scale-[1.02]'
    if (optionId === selectedOption) return 'bg-red-500 hover:bg-red-500 border-red-500 text-white shadow-md shadow-red-200'
    return 'opacity-40 bg-gray-100 border-gray-200'
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pregunta {currentQuestionIndex + 1} de {questions.length}</h3>
        <div className={`text-sm text-slate-600 transition-all duration-300 ${showScorePulse ? 'animate-pulse text-green-600 font-bold scale-110' : ''}`}>
          Puntuación: {score}/{questions.length}
        </div>
      </div>
      
      <h4 className="text-base mb-4 leading-relaxed">{currentQuestion.text}</h4>
      
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
           <Button
             key={option.id}
             variant="outline"
             className={`w-full justify-start h-auto py-3 text-left transition-all duration-500 ease-out ${getButtonClassName(option.id)}`}
             onClick={() => handleOptionSelect(option.id)}
             disabled={!!selectedOption}
           >
             {selectedOption && option.id === currentQuestion.correctOptionId && <CheckCircle2 className="mr-3 h-6 w-6" />}
             {selectedOption === option.id && option.id !== currentQuestion.correctOptionId && <XCircle className="mr-3 h-6 w-6 animate-pulse" />}
             <span className="flex-1">{option.text}</span>
           </Button>
        ))}
      </div>

      {selectedOption && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md animate-in fade-in-50 duration-500">
          <h4 className="font-bold text-lg text-blue-800">Explicación:</h4>
          <p className="text-blue-900 text-base leading-relaxed">{currentQuestion.rationale}</p>
          <Button className="w-full mt-4" onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Práctica'}
          </Button>
        </div>
      )}
    </div>
  )
} 