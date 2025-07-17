'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '~/lib/supabase/client'
import { type User } from '@supabase/supabase-js'

import { DiagnosticQuiz } from '~/components/shared/diagnostic-quiz'
import { AuthModal } from '~/components/shared/auth-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { cache, cacheKeys } from '~/lib/cache'
import type { DiagnosticQuestion, DiagnosticAnswer, ExamType, APIError } from '~/types'

type FlowStep = 'selecting_exam' | 'taking_quiz' | 'auth_gate' | 'submitting' | 'quiz_completed_need_auth'

export default function DiagnosticPage() {
  const [user, setUser] = useState<User | null>(null)
  const [currentStep, setCurrentStep] = useState<FlowStep>('selecting_exam')
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null)
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
  const [quizAnswers, setQuizAnswers] = useState<DiagnosticAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // This effect primarily listens for a user to appear after the auth modal is shown.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // If we were at the auth gate and now have a user, it means login was successful.
      // We can now proceed to submit the answers.
      if (currentStep === 'auth_gate' && currentUser) {
        setIsAuthModalOpen(false); // Close the modal
        setCurrentStep('submitting');
      }
    })
    return () => subscription.unsubscribe()
  }, [currentStep, supabase.auth])

  // This effect fetches questions when an exam is selected.
  useEffect(() => {
    if (currentStep !== 'taking_quiz' || !selectedExam) return;
    
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
  }, [currentStep, selectedExam, supabase])

  // This effect submits answers when the state changes to 'submitting'.
  useEffect(() => {
    if (currentStep !== 'submitting' || !user) return;

    const submitAnswers = async () => {
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
              answers: quizAnswers 
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
        setCurrentStep('taking_quiz'); // Go back to quiz state on error
      }
    };
    submitAnswers();
  }, [currentStep, user, quizAnswers, selectedExam, router])

  const handleExamSelection = (examType: ExamType) => {
    setSelectedExam(examType);
    setCurrentStep('taking_quiz');
    setError(null); // Clear any previous errors
  };

  const handleQuizComplete = (answers: DiagnosticAnswer[]) => {
    setQuizAnswers(answers);
    setCurrentStep('quiz_completed_need_auth');
    // Don't open the modal immediately - let the user see the completion message first
  };

  const handleAuthModalClose = () => {
    // Keep the user on the completion screen when they close the modal
    setIsAuthModalOpen(false);
  };

  const renderContent = () => {
    if (currentStep === 'selecting_exam') {
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
    }

    if (currentStep === 'quiz_completed_need_auth' || currentStep === 'auth_gate') {
      return (
        <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">
              ¡Diagnóstico Completado!
            </CardTitle>

          </CardHeader>
          <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
          Para acceder a tu <strong>diagnóstico personalizado</strong> y recomendaciones de estudio necesitas crear una cuenta gratuita.
              </p>

            
            <Button 
              onClick={() => {
                setCurrentStep('auth_gate');
                setIsAuthModalOpen(true);
              }}
              className="w-full"
              size="lg"
            >
              Ver mi diagnóstico
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentStep === 'submitting') {
      return (
        <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">
                Generando tu diagnóstico...
              </h3>
              <p className="text-muted-foreground mb-4">
                Estamos procesando tus respuestas y creando tu perfil personalizado.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full animate-pulse"
                  style={{ width: '85%' }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Esto puede tomar unos segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (error) {
      return (
        <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentStep('selecting_exam');
                setSelectedExam(null);
                setError(null);
              }}
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
    
    // Only render DiagnosticQuiz when actually taking the quiz
    if (currentStep === 'taking_quiz') {
      return (
        <DiagnosticQuiz 
          questions={questions} 
          onComplete={handleQuizComplete}
          isLoading={isLoading}
          isSubmitting={false}
        />
      );
    }

    // Fallback - should not reach here
    return null;
  };

  return (
    <main className="flex items-center justify-center p-4 py-12 sm:py-24 min-h-screen bg-slate-50">
      {renderContent()}
      
      {/* The AuthModal is rendered here but controlled by state.
          It will only appear when we set isAuthModalOpen to true. */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose} 
      />
    </main>
  );
} 