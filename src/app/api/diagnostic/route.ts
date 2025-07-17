import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { DiagnosticAPIRequest, DiagnosticAPIResponse, DiagnosticAnswer, DiagnosticZonaRoja } from '~/types'

// Initialize the Gemini client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// Input validation schemas
const validateAnswer = (answer: any): answer is DiagnosticAnswer => {
  return (
    typeof answer === 'object' &&
    typeof answer.questionId === 'string' &&
    typeof answer.selectedOptionId === 'string' &&
    typeof answer.isCorrect === 'boolean' &&
    typeof answer.responseTimeMs === 'number' &&
    typeof answer.topicId === 'string' &&
    typeof answer.topicName === 'string' &&
    answer.questionId.length > 0 &&
    answer.selectedOptionId.length > 0 &&
    answer.topicId.length > 0 &&
    answer.topicName.length > 0 &&
    answer.responseTimeMs > 0 &&
    answer.responseTimeMs < 300000 // 5 minutes max per question
  );
};

const validateRequest = (body: any): body is DiagnosticAPIRequest => {
  if (!body || typeof body !== 'object') return false;
  
  const { examType, answers } = body;
  
  if (!examType || !['ucr', 'tec'].includes(examType)) return false;
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 50) return false;
  
  return answers.every(validateAnswer);
};

// Simple rate limiting (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 10;

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  const userRecord = requestCounts.get(userId);
  
  if (!userRecord || now > userRecord.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + hourMs });
    return true;
  }
  
  if (userRecord.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  userRecord.count++;
  return true;
};

export async function POST(request: Request) {
  const startTime = Date.now();
  const supabase = await createClient();

  try {
    // 1. --- AUTHENTICATION ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' }, 
        { status: 401 }
      );
    }

    // 1.1. --- ENSURE USER EXISTS IN USERS TABLE ---
    const { error: userUpsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (userUpsertError) {
      console.error('Failed to ensure user exists:', userUpsertError);
      return NextResponse.json(
        { error: 'Failed to initialize user', code: 'USER_INIT_ERROR' }, 
        { status: 500 }
      );
    }

    // 2. --- RATE LIMITING ---
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.', code: 'RATE_LIMITED' }, 
        { status: 429 }
      );
    }

    // 3. --- INPUT VALIDATION ---
    let requestBody: DiagnosticAPIRequest;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format', code: 'INVALID_JSON' }, 
        { status: 400 }
      );
    }

    if (!validateRequest(requestBody)) {
      return NextResponse.json(
        { 
          error: 'Invalid request format. Check exam type and answers structure.', 
          code: 'INVALID_REQUEST' 
        }, 
        { status: 400 }
      );
    }

    const { examType, answers } = requestBody;

    // 4. --- DATABASE OPERATIONS ---
    // Get exam ID
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('id')
      .ilike('name', `%${examType}%`)
      .single();

    if (examError || !examData) {
      console.error('Exam lookup failed:', examError);
      return NextResponse.json(
        { error: 'Exam not found', code: 'EXAM_NOT_FOUND' }, 
        { status: 404 }
      );
    }

    // Create diagnostic session
    const { data: sessionData, error: sessionError } = await supabase
      .from('diagnostic_sessions')
      .insert({ 
        user_id: user.id, 
        exam_id: examData.id, 
        status: 'in_progress' 
      })
      .select('id')
      .single();

    if (sessionError || !sessionData) {
      console.error('Session creation failed:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create diagnostic session', code: 'SESSION_ERROR' }, 
        { status: 500 }
      );
    }

    // Insert answers
    const answersToInsert = answers.map(answer => ({
      diagnostic_session_id: sessionData.id,
      user_id: user.id,
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
      is_correct: answer.isCorrect,
      response_time_ms: answer.responseTimeMs,
    }));

    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(answersToInsert);

    if (answersError) {
      console.error('Answers insertion failed:', answersError);
      return NextResponse.json(
        { error: 'Failed to save answers', code: 'SAVE_ERROR' }, 
        { status: 500 }
      );
    }

    // 5. --- AI ANALYSIS ---
    const analysisData = answers.map(answer => ({ 
      topicName: answer.topicName, 
      isCorrect: answer.isCorrect 
    }));

    const analysisPrompt = `
      ROLE: Expert psychometrician and academic advisor specializing in Costa Rican admission tests.
      CONTEXT: A student has just completed a diagnostic test for the ${examType.toUpperCase()} exam. My task is to analyze their performance PATTERN to identify the 3 most critical areas for improvement (\`Zonas Rojas\`).
      INPUT_DATA: ${JSON.stringify(analysisData, null, 2)}
      TASK:
      1. Analyze the provided JSON data which contains a list of topics and whether the user's answer was correct.
      2. Identify the top 3 topics where the student showed the most weakness. Prioritize topics using this heuristic: 1st by highest percentage of incorrect answers, 2nd (as a tie-breaker) by the more foundational skill.
      3. CRITICAL EDGE CASE: If the user gets a 100% perfect score, identify the 3 topics corresponding to the questions with the 'difícil' difficulty rating that they answered correctly. Frame these as their "Zonas de Fortaleza" (Zones of Strength).
      4. Return the output as a clean JSON array of exactly three objects. Each object must have a "title" (the topic name) and a "description".
      5. CRITICAL INSTRUCTION: The "description" field MUST be in Spanish, providing an encouraging, one-sentence explanation.

      EXAMPLE OUTPUT FOR A USER WITH WEAKNESSES (IN SPANISH):
      [
        { "title": "Análisis de Figuras", "description": "Mejorar tu habilidad para identificar patrones en secuencias geométricas tendrá un gran impacto." },
        { "title": "Comprensión de Textos Complejos", "description": "Dominar la inferencia en textos densos es clave para la sección verbal del examen." },
        { "title": "Lógica Proposicional", "description": "Fortalecer cómo aplicas reglas generales a problemas específicos es una gran oportunidad." }
      ]

      EXAMPLE OUTPUT FOR A USER WITH A PERFECT SCORE (IN SPANISH):
      [
        { "title": "Lógica Proposicional", "description": "¡Excelente! Demostraste un dominio total en una de las áreas más complejas del examen." },
        { "title": "Secuencias Numéricas", "description": "Tu habilidad para ver patrones complejos es una gran ventaja. ¡Sigue así!" },
        { "title": "Analogías Verbales", "description": "Tu razonamiento verbal es de alto nivel. ¡Felicidades por este resultado!" }
      ]
    `;

    let zonasRojas: DiagnosticZonaRoja[];
    
    try {
      const result = await model.generateContent(analysisPrompt);
      const response = result.response;
      const text = response.text();
      
      // Clean and parse the JSON response from the AI
      const cleanedText = text.replace(/```json|```/g, '').trim();
      zonasRojas = JSON.parse(cleanedText);
      
      // Validate AI response
      if (!Array.isArray(zonasRojas) || zonasRojas.length !== 3) {
        throw new Error('Invalid AI response format');
      }
      
      // Validate each zona roja
      for (const zona of zonasRojas) {
        if (!zona.title || !zona.description || 
            typeof zona.title !== 'string' || 
            typeof zona.description !== 'string') {
          throw new Error('Invalid zona roja format');
        }
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      
      // Fallback analysis based on simple logic
      const topicPerformance = new Map<string, { correct: number; total: number }>();
      
      answers.forEach(answer => {
        const current = topicPerformance.get(answer.topicName) || { correct: 0, total: 0 };
        topicPerformance.set(answer.topicName, {
          correct: current.correct + (answer.isCorrect ? 1 : 0),
          total: current.total + 1
        });
      });
      
      // Sort by worst performance
      const sortedTopics = Array.from(topicPerformance.entries())
        .map(([topic, stats]) => ({
          topic,
          percentage: stats.correct / stats.total
        }))
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 3);
      
      zonasRojas = sortedTopics.map(({ topic }) => ({
        title: topic,
        description: `Enfócate en mejorar tus habilidades en ${topic} para obtener mejores resultados.`
      }));
    }

    // 6. --- UPDATE SESSION ---
    const { error: updateError } = await supabase
      .from('diagnostic_sessions')
      .update({
        status: 'completed',
        result_summary: zonasRojas as any, // Cast to satisfy Supabase Json type
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionData.id);

    if (updateError) {
      console.error('Session update failed:', updateError);
      // Don't fail the request, just log the error
    }

    // 7. --- SUCCESS RESPONSE ---
    const processingTime = Date.now() - startTime;
    
    console.log(`Diagnostic completed successfully for user ${user.id} in ${processingTime}ms`);
    
    const response: DiagnosticAPIResponse = { zonasRojas };
    return NextResponse.json(response);

  } catch (error) {
    console.error('Diagnostic processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const processingTime = Date.now() - startTime;
    
    console.error(`Diagnostic failed after ${processingTime}ms: ${errorMessage}`);
    
    return NextResponse.json(
      { 
        error: 'Failed to process diagnostic', 
        code: 'PROCESSING_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, 
      { status: 500 }
    );
  }
} 