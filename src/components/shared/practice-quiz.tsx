'use client'

import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
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
  rationale: string // The explanation for the correct answer
}

// Placeholder data for a single topic. This will be passed as props.
const placeholderPracticeQuestions: PracticeQuestion[] = [
  {
    id: 'pq1',
    text: 'Premisa: Todos los mamíferos son de sangre caliente. Premisa: El delfín es un mamífero. Conclusión: ...',
    options: [
      { id: 'pq1-o1', text: 'El delfín es de sangre caliente.' },
      { id: 'pq1-o2', text: 'Algunos delfines son de sangre caliente.' },
      { id: 'pq1-o3', text: 'El delfín vive en el agua.' },
    ],
    correctOptionId: 'pq1-o1',
    rationale: 'Correcto. Al ser un mamífero (caso específico), el delfín debe seguir la regla general de ser de sangre caliente.',
  },
  {
    id: 'pq2',
    text: 'Si todos los "gorks" son "fleeps" y algunos "fleeps" son "smeeps", ¿se puede concluir que algunos "gorks" son "smeeps"?',
    options: [
        { id: 'pq2-o1', text: 'Sí, es una conclusión lógica.'},
        { id: 'pq2-o2', text: 'No, no se puede concluir lógicamente.'},
    ],
    correctOptionId: 'pq2-o2',
    rationale: 'Correcto. Que algunos "fleeps" sean "smeeps" no garantiza que los "gorks" (que son un subconjunto de "fleeps") estén incluidos en ese grupo.'
  },
  {
    id: 'pq3',
    text: 'Premisa: Todos los estudiantes de la UCR estudian mucho. Premisa: María estudia mucho. Conclusión: María es estudiante de la UCR.',
    options: [
      { id: 'pq3-o1', text: 'La conclusión es válida.' },
      { id: 'pq3-o2', text: 'La conclusión no es válida.' },
      { id: 'pq3-o3', text: 'Necesitamos más información.' },
    ],
    correctOptionId: 'pq3-o2',
    rationale: 'Correcto. Este es un error común. Que todos los estudiantes de la UCR estudien mucho no significa que SOLO ellos estudien mucho. María podría estudiar en otro lugar.'
  },
  {
    id: 'pq4',
    text: 'Premisa: Ningún gato es perro. Premisa: Todos los gatos son felinos. Conclusión: Ningún perro es felino.',
    options: [
      { id: 'pq4-o1', text: 'La conclusión es válida.' },
      { id: 'pq4-o2', text: 'La conclusión no es válida.' },
    ],
    correctOptionId: 'pq4-o2',
    rationale: 'Correcto. La conclusión no es válida. Aunque ningún gato es perro, esto no nos dice nada sobre si los perros pueden ser felinos por otra vía.'
  },
  {
    id: 'pq5',
    text: 'Premisa: Si llueve, entonces uso paraguas. Premisa: Estoy usando paraguas. Conclusión: Está lloviendo.',
    options: [
      { id: 'pq5-o1', text: 'La conclusión es válida.' },
      { id: 'pq5-o2', text: 'La conclusión no es válida.' },
    ],
    correctOptionId: 'pq5-o2',
    rationale: 'Correcto. Este es el error de "afirmar el consecuente". Puedo usar paraguas por otras razones (sol, viento, etc.). La regla solo dice que SI llueve ENTONCES uso paraguas, no que SOLO llueva cuando use paraguas.'
  }
];

type PracticeQuizProps = {
  questions?: PracticeQuestion[]
}

export function PracticeQuiz({ questions = placeholderPracticeQuestions }: PracticeQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showScorePulse, setShowScorePulse] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  // Trigger confetti when quiz is completed with perfect score
  useEffect(() => {
    if (isCompleted && score === questions.length) {
      const triggerConfetti = () => {
        const end = Date.now() + 3 * 1000; // 3 seconds
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

        const frame = () => {
          if (Date.now() > end) return;

          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            startVelocity: 60,
            origin: { x: 0, y: 0.5 },
            colors: colors,
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            startVelocity: 60,
            origin: { x: 1, y: 0.5 },
            colors: colors,
          });

          requestAnimationFrame(frame);
        };

        frame();
      };

      // Small delay to let the completion card render first
      setTimeout(triggerConfetti, 100);
    }
  }, [isCompleted, score, questions.length])

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getButtonVariant = (optionId: string): "outline" => {
    // Use outline variant consistently for all states to maintain border structure
    return 'outline'
  }

  const getButtonClassName = (optionId: string) => {
    if (!selectedOption) return 'hover:shadow-md hover:scale-[1.01] active:scale-[0.98]'
    if (optionId === currentQuestion.correctOptionId) {
      return 'bg-green-500 hover:bg-green-500 border-green-500 text-gray-900 shadow-md shadow-green-200 transform scale-[1.02]'
    }
    if (optionId === selectedOption && optionId !== currentQuestion.correctOptionId) {
      return 'bg-red-500 hover:bg-red-500 border-red-500 text-gray-900 shadow-md shadow-red-200'
    }
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
             variant={getButtonVariant(option.id)}
             className={`w-full justify-start h-auto py-3 text-left transition-all duration-500 ease-out ${getButtonClassName(option.id)}`}
             onClick={() => handleOptionSelect(option.id)}
             disabled={!!selectedOption}
           >
             {selectedOption && option.id === currentQuestion.correctOptionId && (
               <CheckCircle2 className="mr-3 h-6 w-6 text-gray-900" />
             )}
             {selectedOption === option.id && option.id !== currentQuestion.correctOptionId && (
               <XCircle className="mr-3 h-6 w-6 text-gray-900 animate-pulse" />
             )}
             <span className="flex-1">{option.text}</span>
           </Button>
        ))}
      </div>

      {selectedOption && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-md">
          <h4 className="font-bold text-lg">Explicación:</h4>
          <p className="text-green-800 text-base leading-relaxed">{currentQuestion.rationale}</p>
          <Button className="w-full mt-4" onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Práctica'}
          </Button>
        </div>
      )}
    </div>
  )
} 