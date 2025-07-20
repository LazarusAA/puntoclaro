import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { DiagnosticAPIRequest, DiagnosticAPIResponse, DiagnosticAnswer, DiagnosticZonaRoja } from '~/types'

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Input validation schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateAnswer = (answer: any): answer is DiagnosticAnswer => {
  return (
    typeof answer === 'object' &&
    answer !== null &&
    typeof answer.questionId === 'string' &&
    typeof answer.selectedOptionId === 'string' &&
    typeof answer.isCorrect === 'boolean' &&
    typeof answer.responseTimeMs === 'number' &&
    typeof answer.topicId === 'string' &&
    typeof answer.topicName === 'string' &&
    answer.responseTimeMs >= 0 &&
    answer.responseTimeMs < 300000 // 5 minutes max per question
  );
};

const validateRequest = (body: unknown): body is DiagnosticAPIRequest => {
  if (!body || typeof body !== 'object') return false;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bodyObj = body as any;
  const { examType, answers } = bodyObj;
  
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
    // 1. AUTHENTICATION
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. PARSE REQUEST BODY
    const body = await request.json();
    const { examType, answers } = body;

    if (!examType || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
    }

    // Type the answers array properly
    const typedAnswers = answers as Array<{
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
      responseTimeMs: number;
      topicId: string;
      topicName: string;
    }>;

    // 3. --- ENSURE USER EXISTS IN USERS TABLE ---
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

    // 4. --- RATE LIMITING ---
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.', code: 'RATE_LIMITED' }, 
        { status: 429 }
      );
    }

    // 5. --- INPUT VALIDATION ---
    if (!validateRequest(body)) {
      return NextResponse.json(
        { 
          error: 'Invalid request format. Check exam type and answers structure.', 
          code: 'INVALID_REQUEST' 
        }, 
        { status: 400 }
      );
    }

    // 6. --- DATABASE OPERATIONS ---
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
    const answersToInsert = typedAnswers.map(answer => ({
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

    // 7. --- AI ANALYSIS ---
    const analysisData = typedAnswers.map(answer => ({ 
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
      console.log('Starting AI analysis with data:', JSON.stringify(analysisData, null, 2))
      const result = await model.generateContent(analysisPrompt);
      const response = result.response;
      const text = response.text();
      
      console.log('AI response text:', text)
      
      // Clean and parse the JSON response from the AI
      const cleanedText = text.replace(/```json|```/g, '').trim();
      zonasRojas = JSON.parse(cleanedText);
      
      console.log('Parsed zonasRojas from AI:', JSON.stringify(zonasRojas, null, 2))
      
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
      
      console.log('AI analysis completed successfully')
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      
      // Fallback analysis based on simple logic
      console.log('Using fallback analysis with answers:', JSON.stringify(typedAnswers, null, 2))
      
      // Validate that we have answers to work with
      if (!typedAnswers || typedAnswers.length === 0) {
        console.error('No answers available for fallback analysis')
        throw new Error('No answers available for analysis')
      }
      
      const topicPerformance = new Map<string, { correct: number; total: number }>();
      
      typedAnswers.forEach(answer => {
        if (!answer.topicName) {
          console.warn('Answer missing topicName:', answer)
          return // Skip answers without topic names
        }
        
        const current = topicPerformance.get(answer.topicName) || { correct: 0, total: 0 };
        topicPerformance.set(answer.topicName, {
          correct: current.correct + (answer.isCorrect ? 1 : 0),
          total: current.total + 1
        });
      });
      
      console.log('Topic performance map:', Object.fromEntries(topicPerformance))
      
      // Check if we have any topics
      if (topicPerformance.size === 0) {
        console.error('No valid topics found in answers')
        throw new Error('No valid topics found in answers')
      }
      
      // Sort by worst performance
      const sortedTopics = Array.from(topicPerformance.entries())
        .map(([topic, stats]) => ({
          topic,
          percentage: stats.correct / stats.total
        }))
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 3);
      
      console.log('Sorted topics for fallback:', sortedTopics)
      
      // Ensure we have at least 3 topics (or use all available)
      const topicsToUse = sortedTopics.length >= 3 ? sortedTopics : Array.from(topicPerformance.keys()).map(topic => ({ topic, percentage: 0.5 }))
      
      zonasRojas = topicsToUse.map(({ topic }) => ({
        title: topic,
        description: `Enfócate en mejorar tus habilidades en ${topic} para obtener mejores resultados.`
      }));
      
      console.log('Fallback zonasRojas generated:', JSON.stringify(zonasRojas, null, 2))
    }

    // 8. --- UPDATE SESSION ---
    console.log('About to update session with zonasRojas:', JSON.stringify(zonasRojas, null, 2))
    
    // Safety check: ensure zonasRojas is valid
    if (!zonasRojas || !Array.isArray(zonasRojas) || zonasRojas.length === 0) {
      console.error('zonasRojas is invalid, using emergency fallback')
      
      // Emergency fallback: use generic zonas rojas
      zonasRojas = [
        {
          title: "Razonamiento Lógico",
          description: "Mejorar tu capacidad de análisis lógico es fundamental para el éxito en el examen."
        },
        {
          title: "Comprensión de Lectura", 
          description: "Desarrollar habilidades de lectura crítica te ayudará en todas las secciones."
        },
        {
          title: "Resolución de Problemas",
          description: "Practicar la resolución sistemática de problemas aumentará tu confianza."
        }
      ]
      
      console.log('Emergency fallback zonasRojas:', JSON.stringify(zonasRojas, null, 2))
    }
    
    const { error: updateError } = await supabase
      .from('diagnostic_sessions')
      .update({
        status: 'completed',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result_summary: zonasRojas as any, // Cast to satisfy Supabase Json type
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionData.id);

    if (updateError) {
      console.error('Session update failed:', updateError);
      // Don't fail the request, just log the error
    } else {
      console.log('Session updated successfully with result_summary')
    }

    // 9. --- SUCCESS RESPONSE ---
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