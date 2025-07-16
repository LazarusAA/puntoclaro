'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DiagnosticQuiz } from '~/components/shared/diagnostic-quiz'
import { DiagnosticErrorBoundary } from '~/components/shared/error-boundary'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { createClient } from '~/lib/supabase/client'
import { cache, cacheKeys } from '~/lib/cache'
import type { DiagnosticQuestion, DiagnosticAnswer, ExamType, APIError } from '~/types'

export default function DiagnosticPage() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!selectedExam) return;

    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check cache first
        const cacheKey = cacheKeys.diagnosticQuestions(selectedExam);
        const cachedQuestions = cache.get<DiagnosticQuestion[]>(cacheKey);
        
        if (cachedQuestions && cachedQuestions.length > 0) {
          setQuestions(cachedQuestions.sort(() => 0.5 - Math.random()).slice(0, 12));
          setIsLoading(false);
          return;
        }
        
        // Single optimized query to get exam, topics, and questions
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select(`
            id,
            topics (
              id,
              name,
              questions (
                id,
                content,
                question_options (
                  id,
                  text,
                  is_correct
                )
              )
            )
          `)
          .ilike('name', `%${selectedExam}%`)
          .single();

        if (examError || !examData) {
          throw new Error('No se pudo encontrar el examen seleccionado.');
        }

        // Flatten and structure the data
        const allQuestions: DiagnosticQuestion[] = [];
        
        examData.topics?.forEach(topic => {
          topic.questions?.forEach(question => {
            allQuestions.push({
              id: question.id,
              content: question.content as { text: string },
              topic: {
                id: topic.id,
                name: topic.name
              },
              question_options: question.question_options || []
            });
          });
        });

        if (allQuestions.length === 0) {
          throw new Error('No se encontraron preguntas para este examen.');
        }

        // Cache the questions for future use (cache for 5 minutes)
        cache.set(cacheKey, allQuestions, 5 * 60 * 1000);
        
        // Shuffle and limit to 12 questions
        const shuffledQuestions = allQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, 12);

        setQuestions(shuffledQuestions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar las preguntas.';
        setError(errorMessage);
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedExam, supabase]);

  const handleQuizComplete = async (answers: DiagnosticAnswer[]) => {
    setIsSubmitting(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;

    const attemptSubmission = async (): Promise<void> => {
      try {
        const response = await fetch('/api/diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            examType: selectedExam, 
            answers 
          }),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          const errorData: APIError = await response.json();
          throw new Error(errorData.error || 'Error en el servidor.');
        }
        
        // Success - redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        retryCount++;
        
        if (err instanceof Error && err.name === 'TimeoutError') {
          throw new Error('La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.');
        }
        
        if (retryCount < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
          return attemptSubmission();
        }
        
        throw err;
      }
    };

    try {
      await attemptSubmission();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión.';
      setError(`No se pudo completar el diagnóstico: ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  const handleExamSelection = (examType: ExamType) => {
    setSelectedExam(examType);
    setError(null); // Clear any previous errors
    setIsSubmitting(false); // Reset submission state
  };

  const renderContent = () => {
    if (selectedExam) {
      if (error) {
        return (
          <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
            <CardContent className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedExam(null)}
              >
                Volver a seleccionar examen
              </Button>
            </CardContent>
          </Card>
        );
      }

      if (isLoading && questions.length === 0) {
        return (
          <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Preparando tu diagnóstico...</p>
              </div>
            </CardContent>
          </Card>
        );
      }

             return (
         <DiagnosticQuiz 
           questions={questions} 
           onComplete={handleQuizComplete}
           isLoading={isLoading}
           isSubmitting={isSubmitting}
         />
       );
    }

    return (
      <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
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
            onClick={() => handleExamSelection('ucr')}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-lg">UCR / UNA</span>
              <span className="text-xs text-muted-foreground">
                Prueba de Aptitud Académica
              </span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 text-base" 
            onClick={() => handleExamSelection('tec')}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-lg">TEC</span>
              <span className="text-xs text-muted-foreground">
                Examen de Admisión
              </span>
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="flex items-center justify-center p-4 py-12 sm:py-24 min-h-screen bg-slate-50">
      <DiagnosticErrorBoundary>
        {renderContent()}
      </DiagnosticErrorBoundary>
    </main>
  );
} 