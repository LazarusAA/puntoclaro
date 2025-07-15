import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Define types for clarity
type Answer = {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  // We need to add topicId to the data sent from the client
  topicId: string; 
};

type RequestBody = {
  examType: 'ucr' | 'tec';
  answers: Answer[];
};

// Initialize the Gemini client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    // 1. --- AUTHENTICATION & DATA VALIDATION ---
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { examType, answers }: RequestBody = await request.json()
    if (!examType || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
    }

    // 2. --- DATABASE OPERATIONS (Initial Save) ---
    const { data: examData, error: examError } = await supabase
      .from('exams').select('id').ilike('name', `%${examType}%`).single();
    if (examError || !examData) throw new Error(`Could not find exam for type: ${examType}`);
    const examId = examData.id;

    const { data: sessionData, error: sessionError } = await supabase
      .from('diagnostic_sessions').insert({ user_id: user.id, exam_id: examId, status: 'in_progress' }).select('id').single();
    if (sessionError) throw sessionError;
    const sessionId = sessionData.id;

    const answersToInsert = answers.map(answer => ({
      diagnostic_session_id: sessionId,
      user_id: user.id,
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
      is_correct: answer.isCorrect,
      response_time_ms: answer.responseTimeMs,
    }));
    const { error: answersError } = await supabase.from('user_answers').insert(answersToInsert);
    if (answersError) throw answersError;

    // 3. --- AI ANALYSIS (Real Implementation) ---
    
    // Format the data for the AI prompt
    const analysisPrompt = `
      ROLE: Expert psychometrician and academic advisor specializing in Costa Rican admission tests.
      CONTEXT: A student has just completed a diagnostic test for the ${examType.toUpperCase()} exam. My task is to analyze their performance PATTERN to identify the 3 most critical areas for improvement (\`Zonas Rojas\`).
      INPUT_DATA: ${JSON.stringify(answers, null, 2)}
      TASK:
      1.  Analyze the provided JSON data.
      2.  Identify the top 3 topics where the student showed the most weakness. Prioritize topics using this heuristic: 1st by highest percentage of incorrect answers, 2nd (as a tie-breaker) by the more foundational skill.
      3.  **CRITICAL EDGE CASE:** If the user gets a 100% perfect score, do NOT return an empty list. Instead, identify the 3 topics corresponding to the questions with the 'difícil' difficulty rating that they answered correctly. Frame these as their "Zonas de Fortaleza" (Zones of Strength).
      4.  Return the output as a clean JSON array of exactly three objects. Each object must have a "title" (the topic name) and a "description" (an encouraging, one-sentence explanation of why focusing on this area is important, or why it's a great strength).
    
      EXAMPLE OUTPUT FOR A USER WITH WEAKNESSES:
      [
        { "title": "Análisis de Figuras", "description": "Mejorar tu habilidad para identificar patrones en secuencias geométricas tendrá un gran impacto." },
        { "title": "Comprensión de Textos Complejos", "description": "Dominar la inferencia en textos densos es clave para la sección verbal del examen." },
        { "title": "Lógica Proposicional", "description": "Fortalecer cómo aplicas reglas generales a problemas específicos es una gran oportunidad." }
      ]
    
      EXAMPLE OUTPUT FOR A USER WITH A PERFECT SCORE:
      [
        { "title": "Lógica Proposicional (Zona de Fortaleza)", "description": "¡Excelente! Demostraste un dominio total en una de las áreas más complejas del examen." },
        { "title": "Secuencias Numéricas (Zona de Fortaleza)", "description": "Tu habilidad para ver patrones complejos es una gran ventaja. ¡Sigue así!" },
        { "title": "Analogías Verbales (Zona de Fortaleza)", "description": "Tu razonamiento verbal es de alto nivel. ¡Felicidades por este resultado!" }
      ]
    `;

    const result = await model.generateContent(analysisPrompt);
    const response = result.response;
    const text = response.text();
    
    // Clean and parse the JSON response from the AI
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const zonasRojas = JSON.parse(cleanedText);

    // 4. --- DATABASE OPERATIONS (Final Update) ---
    const { error: updateError } = await supabase
      .from('diagnostic_sessions')
      .update({
        status: 'completed',
        result_summary: zonasRojas,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    // 5. --- RETURN RESPONSE ---
    return NextResponse.json({ zonasRojas });

  } catch (error) {
    console.error('Error processing diagnostic:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to process diagnostic', details: errorMessage }), { status: 500 });
  }
} 