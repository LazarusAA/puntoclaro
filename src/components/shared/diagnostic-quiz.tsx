'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import type { DiagnosticQuestion, DiagnosticAnswer } from '~/types'

interface DiagnosticQuizProps {
  questions: DiagnosticQuestion[];
  onComplete: (answers: DiagnosticAnswer[]) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export function DiagnosticQuiz({ questions, onComplete, isLoading = false, isSubmitting = false }: DiagnosticQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<DiagnosticAnswer[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isLastQuestionAnswered, setIsLastQuestionAnswered] = useState(false);

  // Reset quiz state when questions change
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setStartTime(Date.now());
  }, [questions]);

  const handleAnswerClick = useCallback((optionId: string) => {
    if (isLoading || isSubmitting || !questions.length) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = currentQuestion.question_options.find(opt => opt.id === optionId);
    
    if (!selectedOption) {
      console.error('Selected option not found');
      return;
    }

    const responseTime = Date.now() - startTime;
    
    const answer: DiagnosticAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect: selectedOption.is_correct,
      responseTimeMs: responseTime,
      topicId: currentQuestion.topic.id,
      topicName: currentQuestion.topic.name,
    };

    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStartTime(Date.now());
    } else {
      // Mark that we've answered the last question and trigger loading immediately
      setIsLastQuestionAnswered(true);
      // Use setTimeout to ensure state update happens before onComplete
      setTimeout(() => {
        onComplete(newAnswers);
      }, 10); // Small delay to ensure state update and re-render
    }
  }, [isLoading, isSubmitting, questions, currentQuestionIndex, startTime, userAnswers, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isLoading || isSubmitting || !questions.length) return;
      
      const currentQuestion = questions[currentQuestionIndex];
      const options = currentQuestion.question_options;
      
      // Allow number keys 1-4 for quick selection
      const keyNum = parseInt(event.key);
      if (keyNum >= 1 && keyNum <= options.length) {
        handleAnswerClick(options[keyNum - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, questions, isLoading, isSubmitting, handleAnswerClick]);

  // Loading state
  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-500">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
              role="status"
              aria-label="Cargando preguntas"
            ></div>
            <p className="text-muted-foreground">Cargando preguntas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Show submission loading state after last question is answered
  if (isLastQuestionAnswered) {
    return (
      <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-500">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"
              role="status"
              aria-label="Procesando diagnóstico"
            ></div>
            <h3 className="text-xl font-semibold mb-2">
              ¡Excelente trabajo!
            </h3>
            <p className="text-muted-foreground mb-4">
              Estamos analizando tus respuestas y preparando tu diagnóstico personalizado...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full animate-pulse"
                style={{ width: '75%' }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Esto puede tomar unos segundos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-500"
      role="main"
      aria-labelledby="quiz-title"
    >
      <CardHeader>
        <div className="mb-4">
          <p 
            className="text-sm font-medium text-center mb-2"
            aria-live="polite"
            aria-atomic="true"
          >
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </p>
          <Progress 
            value={progressValue} 
            className="h-2" 
            aria-label={`Progreso del cuestionario: ${Math.round(progressValue)}% completado`}
          />
        </div>
        <CardTitle 
          id="quiz-title"
          className="text-2xl leading-relaxed text-center"
          tabIndex={0}
        >
          {currentQuestion.content.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          role="radiogroup"
          aria-labelledby="quiz-title"
          aria-describedby="quiz-instructions"
        >
          <div 
            id="quiz-instructions" 
            className="sr-only"
            aria-live="polite"
          >
            Selecciona una opción para responder. Puedes usar las teclas numéricas 1 a {currentQuestion.question_options.length} para seleccionar rápidamente.
          </div>
          {currentQuestion.question_options.map((option, index) => (
            <Button
              key={option.id}
              variant="outline"
              size="lg"
              className="h-auto py-4 text-base whitespace-normal text-left justify-start focus-visible:ring-2 focus-visible:ring-offset-2"
                             onClick={() => handleAnswerClick(option.id)}
               disabled={isLoading || isSubmitting}
              role="radio"
              aria-checked="false"
              aria-describedby={`option-${index + 1}-hint`}
            >
              <span className="sr-only">Opción {index + 1}: </span>
              {option.text}
              <span 
                id={`option-${index + 1}-hint`} 
                className="sr-only"
              >
                Presiona {index + 1} en el teclado para seleccionar esta opción
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 