import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  const supabase = await createClient()

  try {
    const { topicId } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 1. Fetch all questions for the given topic
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        content,
        question_options ( id, text, is_correct, rationale )
      `)
      .eq('topic_id', topicId);

    if (questionsError) throw questionsError;

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json({ 
        error: 'No hay preguntas disponibles para este tema en este momento.',
        practiceQuestions: []
      });
    }

    // 2. Fetch the user's answer history for these questions
    const questionIds = allQuestions.map(q => q.id);
    const { data: answeredQuestions, error: answeredError } = await supabase
      .from('user_answers')
      .select('question_id, is_correct')
      .eq('user_id', user.id)
      .in('question_id', questionIds);
    
    if (answeredError) throw answeredError;

    // 3. Implement the Intelligent Selection Algorithm
    const answeredCorrectlyIds = new Set(
      answeredQuestions?.filter(a => a.is_correct).map(a => a.question_id) || []
    );
    const answeredIncorrectlyIds = new Set(
      answeredQuestions?.filter(a => !a.is_correct).map(a => a.question_id) || []
    );

    // Priority 1: Questions the user has answered incorrectly
    let selectedQuestions = allQuestions.filter(q => answeredIncorrectlyIds.has(q.id));
    
    // Priority 2: Questions the user has never seen
    const unseenQuestions = allQuestions.filter(q => 
      !answeredCorrectlyIds.has(q.id) && !answeredIncorrectlyIds.has(q.id)
    );
    selectedQuestions.push(...unseenQuestions);

    // Priority 3: If we still need more, add questions they got right (for review)
    if (selectedQuestions.length < 5) {
      const correctQuestions = allQuestions.filter(q => answeredCorrectlyIds.has(q.id));
      selectedQuestions.push(...correctQuestions);
    }

    // Shuffle and take the first 5 questions for the practice session
    const practiceQuiz = selectedQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(q => ({
        id: q.id,
        text: (q.content as { text?: string })?.text || '',
        options: q.question_options.map(opt => ({ id: opt.id, text: opt.text })),
        correctOptionId: q.question_options.find(opt => opt.is_correct)?.id || '',
        rationale: q.question_options.find(opt => opt.is_correct)?.rationale || '¡Esta es la respuesta correcta!'
      }));

    if (practiceQuiz.length === 0) {
      return NextResponse.json({ 
        error: 'No hay preguntas de práctica disponibles para este tema en este momento.',
        practiceQuestions: []
      });
    }

    return NextResponse.json({ practiceQuestions: practiceQuiz });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate practice quiz', details: errorMessage }), { status: 500 });
  }
} 