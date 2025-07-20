import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const supabase = await createClient()

  try {
    const { topicId } = await params;

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
    const incorrectQuestions = allQuestions.filter(q => answeredIncorrectlyIds.has(q.id));
    
    // Priority 2: Questions the user has never seen
    const unseenQuestions = allQuestions.filter(q => 
      !answeredCorrectlyIds.has(q.id) && !answeredIncorrectlyIds.has(q.id)
    );

    // Priority 3: Questions they got right (for review) - but limit to avoid repetition
    const correctQuestions = allQuestions.filter(q => answeredCorrectlyIds.has(q.id));
    
    // Combine questions with intelligent distribution
    let selectedQuestions: typeof allQuestions = [];
    
    // If we have incorrect questions, prioritize them but mix in some others
    if (incorrectQuestions.length > 0) {
      // Take up to 3 incorrect questions
      const incorrectToInclude = incorrectQuestions.slice(0, 3);
      selectedQuestions.push(...incorrectToInclude);
      
      // Fill remaining slots with unseen or correct questions
      const remainingSlots = 5 - incorrectToInclude.length;
      const otherQuestions = [...unseenQuestions, ...correctQuestions];
      if (otherQuestions.length > 0) {
        const shuffledOthers = otherQuestions.sort(() => 0.5 - Math.random()).slice(0, remainingSlots);
        selectedQuestions.push(...shuffledOthers);
      }
    } else if (unseenQuestions.length > 0) {
      // If no incorrect questions, prioritize unseen
      selectedQuestions = unseenQuestions.slice(0, 5);
      // If we need more, add some correct questions
      if (selectedQuestions.length < 5 && correctQuestions.length > 0) {
        const needed = 5 - selectedQuestions.length;
        const additionalCorrect = correctQuestions.slice(0, needed);
        selectedQuestions.push(...additionalCorrect);
      }
    } else {
      // If all questions have been answered, use all correct questions
      selectedQuestions = correctQuestions;
    }

    // Improved shuffling algorithm (Fisher-Yates)
    const shuffleArray = (array: typeof selectedQuestions) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Shuffle and take the first 5 questions for the practice session
    const practiceQuiz = shuffleArray(selectedQuestions)
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

// Type for practice quiz answers
type PracticeAnswer = {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
}

type PracticeSubmission = {
  answers: PracticeAnswer[];
  topicId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const supabase = await createClient()

  try {
    const { topicId } = await params;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Parse and validate request body
    let body: PracticeSubmission;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { status: 400 });
    }

    // Validate required fields
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return new Response(JSON.stringify({ error: 'Answers array is required and must not be empty' }), { status: 400 });
    }

    if (body.topicId !== topicId) {
      return new Response(JSON.stringify({ error: 'Topic ID mismatch' }), { status: 400 });
    }

    // Validate each answer
    for (const answer of body.answers) {
      if (!answer.questionId || !answer.selectedOptionId || typeof answer.isCorrect !== 'boolean') {
        return new Response(JSON.stringify({ error: 'Invalid answer format' }), { status: 400 });
      }
    }

    // Get the exam ID for this topic
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('exam_id')
      .eq('id', topicId)
      .single();

    if (topicError || !topicData) {
      console.error('Topic lookup failed:', topicError);
      return new Response(JSON.stringify({ error: 'Topic not found' }), { status: 404 });
    }

    // Create a diagnostic session for this practice (reusing the diagnostic_sessions table)
    const { data: sessionData, error: sessionError } = await supabase
      .from('diagnostic_sessions')
      .insert({ 
        user_id: user.id, 
        exam_id: topicData.exam_id, 
        status: 'completed' // Mark as completed immediately since it's practice
      })
      .select('id')
      .single();

    if (sessionError || !sessionData) {
      console.error('Practice session creation failed:', sessionError);
      return new Response(JSON.stringify({ error: 'Failed to create practice session' }), { status: 500 });
    }

    // Prepare data for batch insert
    const answersToInsert = body.answers.map(answer => ({
      user_id: user.id,
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
      is_correct: answer.isCorrect,
      response_time_ms: answer.responseTimeMs,
      diagnostic_session_id: sessionData.id
    }));

    // Insert all answers in a single transaction
    const { error: insertError } = await supabase
      .from('user_answers')
      .insert(answersToInsert);

    if (insertError) {
      console.error('Error inserting practice answers:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save practice results' }), { status: 500 });
    }

    // Return success response with summary
    const correctAnswers = body.answers.filter(a => a.isCorrect).length;
    const totalAnswers = body.answers.length;
    const scorePercentage = Math.round((correctAnswers / totalAnswers) * 100);

    return NextResponse.json({
      success: true,
      message: 'Practice results saved successfully',
      summary: {
        totalQuestions: totalAnswers,
        correctAnswers,
        scorePercentage,
        topicId,
        sessionId: sessionData.id
      }
    });

  } catch (error) {
    console.error('Practice submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to save practice results', details: errorMessage }), { status: 500 });
  }
} 