'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DiagnosticQuiz } from '~/components/shared/diagnostic-quiz'
import { Navbar1 } from '~/components/layouts/main-nav'
import { Footer7 } from '~/components/layouts/site-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { createClient } from '~/lib/supabase/client'

type ExamType = 'ucr' | 'tec';

// Define the shape of the question data we expect from Supabase
type Question = {
  id: string;
  content: { text: string };
  topic_id: string;
  question_options: {
    id: string;
    text: string;
    is_correct: boolean;
  }[];
};

type AnswerPayload = {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  topicId: string;
};

export default function DiagnosticPage() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!selectedExam) return;

    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('id')
        .ilike('name', `%${selectedExam}%`)
        .single();

      if (examError || !examData) {
        setError('No se pudo encontrar el examen seleccionado.');
        setIsLoading(false);
        return;
      }

      // First get topic IDs for the selected exam
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .eq('exam_id', examData.id);

      if (topicsError || !topicsData || topicsData.length === 0) {
        setError('No se encontraron temas para este examen.');
        setIsLoading(false);
        return;
      }

      const topicIds = topicsData.map(t => t.id);

      const { data, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          content,
          topic_id,
          question_options ( id, text, is_correct )
        `)
        .in('topic_id', topicIds)
        .limit(12); // Fetch our 12 diagnostic questions

      if (questionsError) {
        setError('Error al cargar las preguntas. Por favor, intenta de nuevo.');
        console.error(questionsError);
      } else {
        // Type-cast the data to match our Question interface and randomize the order
        const typedQuestions = data.map(q => ({
          ...q,
          content: q.content as { text: string }
        })) as Question[];
        setQuestions(typedQuestions.sort(() => 0.5 - Math.random()));
      }
      setIsLoading(false);
    };

    fetchQuestions();
  }, [selectedExam, supabase]);

  const handleQuizComplete = async (answers: AnswerPayload[]) => {
    setIsLoading(true);
    setError(null);
    console.log('Submitting answers to backend:', { examType: selectedExam, answers });

    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: selectedExam, answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocurrió un error en el servidor.');
      }
      
      // On success, redirect to the dashboard
      router.push('/dashboard');

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error de conexión.';
      setError(`No se pudo completar el diagnóstico: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (selectedExam) {
      if (isLoading) return <p>Cargando tu diagnóstico...</p>;
      if (error) return <p className="text-red-500">{error}</p>;
      return <DiagnosticQuiz questions={questions} onComplete={handleQuizComplete} />;
    }

    return (
      <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">¿Para cuál examen te estás preparando?</CardTitle>
          <CardDescription className="pt-2">Tu elección nos ayudará a darte el diagnóstico más preciso.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Button variant="outline" className="h-auto py-6 text-base" onClick={() => setSelectedExam('ucr')}>
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-lg">UCR / UNA</span>
              <span className="text-xs text-muted-foreground">Prueba de Aptitud Académica</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-6 text-base" onClick={() => setSelectedExam('tec')}>
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-lg">TEC</span>
              <span className="text-xs text-muted-foreground">Examen de Admisión</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar1 
        menu={[]} 
        logo={{ url: "/", src: "/logo.svg", alt: "Umbral Logo", title: "Umbral" }}
        auth={{ login: { title: "Iniciar sesión", url: "#" }, signup: { title: "Registrarse", url: "#" } }}
      />
      <main className="flex-grow flex items-center justify-center p-4 py-12 sm:py-24">
        {renderContent()}
      </main>
      <Footer7 />
    </div>
  );
} 