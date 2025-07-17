import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createHash } from 'crypto'

// Note: Using 'as any' for learning_modules table queries since TypeScript types 
// need to be regenerated after adding the new table to Supabase

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// Helper function to create a hash of user's error evidence
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createEvidenceHash(evidence: any[]): string {
  // Create hash based on error patterns, not exact content
  const patterns = evidence.map(e => ({
    rationale_type: e.error_rationale?.substring(0, 50), // First 50 chars of rationale
    difficulty: e.question_difficulty || 'unknown'
  }));
  
  const sortedPatterns = patterns.sort((a, b) => a.rationale_type.localeCompare(b.rationale_type));
  return createHash('sha256').update(JSON.stringify(sortedPatterns)).digest('hex');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const supabase = await createClient()

  try {
    const { topicId } = await params;

    // 1. --- AUTHENTICATION ---
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
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
      return new Response(JSON.stringify({ error: 'Failed to initialize user' }), { status: 500 });
    }

    // 2. --- ASSEMBLE THE COGNITIVE DOSSIER ---

    // 2a. Fetch Topic and Exam Info
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select(`
        name,
        exams!topics_exam_id_fkey ( name )
      `)
      .eq('id', topicId)
      .single();

    if (topicError || !topicData) {
      throw new Error(`Could not find topic with ID: ${topicId}`);
    }
    const topicName = topicData.name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const examName = (topicData.exams as any)?.name || 'Unknown Exam';

    // 2b. Fetch Evidence of Misunderstanding (the user's specific wrong answers for this topic)
    const { data: errorEvidence, error: evidenceError } = await supabase
      .from('user_answers')
      .select(`
        questions!user_answers_question_id_fkey ( content, topic_id, difficulty ),
        question_options!user_answers_selected_option_id_fkey ( text, rationale )
      `)
      .eq('user_id', user.id)
      .eq('questions.topic_id', topicId)
      .eq('is_correct', false);
    
    if (evidenceError) throw evidenceError;

    // Check if user has any errors for this topic
    if (!errorEvidence || errorEvidence.length === 0) {
      return NextResponse.json({ 
        error: 'No learning needed', 
        message: `¡Excelente! No tienes errores registrados en "${topicName}". Tu dominio de este tema es sólido.`,
        code: 'NO_ERRORS_FOUND'
      }, { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evidenceForPrompt = errorEvidence.map((e: any) => {
      const questionContent = e.questions?.content as { text?: string } | null;
      return {
        question_text: questionContent?.text || 'Unknown question',
        question_difficulty: e.questions?.difficulty || 'unknown',
        chosen_distractor_text: e.question_options?.text || 'Unknown option',
        error_rationale: e.question_options?.rationale || 'No rationale available',
      };
    });

    // 2c. Create evidence hash for caching
    const evidenceHash = createEvidenceHash(evidenceForPrompt);

    // 3. --- CHECK FOR CACHED LEARNING MODULE ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cachedModule, error: cacheError } = await (supabase as any)
      .from('learning_modules')
      .select('*')
      .eq('user_id', user.id)
      .eq('topic_id', topicId)
      .single();

    // Return cached module if evidence hasn't changed significantly
    if (cachedModule && !cacheError && cachedModule.evidence_hash === evidenceHash) {
      console.log(`Returning cached learning module for user ${user.id}, topic ${topicId}`);
      
      // Update access tracking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('learning_modules')
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: (cachedModule.access_count || 0) + 1
        })
        .eq('id', cachedModule.id);

      return NextResponse.json({ learningModule: cachedModule.content });
    }

    // 4. --- GENERATE NEW PERSONALIZED MODULE WITH AI ---
    console.log(`Generating new learning module for user ${user.id}, topic ${topicId}`);
    const aiStartTime = Date.now();
    const moduleGenerationPrompt = `
      ROLE & PERSONA: You are TutorCognitivo, an expert academic coach. Your persona is a helpful, smart, slightly older friend. Your tone is natural, direct, and encouraging. Address the user (a 17-year-old) respectfully but casually. Avoid clichés. Your goal is to build trust by being incredibly useful.

      CONTEXT: You have received a "Cognitive Dossier" for a student struggling with a specific topic. Use this evidence to craft a hyper-personalized "Micro-Dosis de Estudio."

      COGNITIVE DOSSIER:
      - Student Name: ${user.user_metadata.full_name || 'Estudiante'}
      - Exam Context: "${examName}"
      - Zona Roja (Topic): "${topicName}"
      - Evidence of Misunderstanding (JSON): ${JSON.stringify(evidenceForPrompt, null, 2)}

      TASK: Generate a complete, personalized learning module based SPECIFICALLY on the evidence. The entire output must be a single, clean JSON object with the EXACT structure below:

      {
        "title": "Título del Tema",
        "explanation": {
          "validation": "Frase que valida la dificultad y conecta con el estudiante",
          "analogy": "Analogía simple y relatable que explique el concepto",
          "core_concept": "Explicación clara del concepto fundamental"
        },
        "machote": {
          "title": "El Machote para [Tema]",
          "steps": [
            "Paso 1: Descripción clara del primer paso",
            "Paso 2: Descripción clara del segundo paso",
            "Paso 3: Descripción clara del tercer paso"
          ],
          "common_mistakes": [
            "Descripción del error más común que cometen los estudiantes"
          ]
        }
      }

      CRITICAL INSTRUCTIONS:
      1. Personalize Aggressively: The 'explanation' and 'machote' MUST directly address the 'error_rationale' from the dossier. Don't just give a generic definition. Start by fixing the user's specific misunderstanding.
      2. Language: The entire JSON output MUST be in natural, encouraging Spanish.
      3. Clarity is King: Use simple language. Break down complex ideas.
      4. Structure: Follow the EXACT JSON structure above. Do not add or remove fields.
      5. Output Format: The final output must be ONLY the valid JSON object matching the structure above.
    `;
    
    const result = await model.generateContent(moduleGenerationPrompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const learningModule = JSON.parse(cleanedText);

    const aiEndTime = Date.now();
    const generationTime = aiEndTime - aiStartTime;

    // 5. --- CACHE THE GENERATED MODULE ---
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('learning_modules')
        .upsert({
          user_id: user.id,
          topic_id: topicId,
          title: learningModule.title || topicName,
          content: learningModule,
          evidence_hash: evidenceHash,
          evidence_count: evidenceForPrompt.length,
          ai_model: 'gemini-1.5-flash',
          generation_time_ms: generationTime,
          access_count: 1,
          last_accessed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,topic_id'
        });

      console.log(`Cached new learning module for user ${user.id}, topic ${topicId} (${generationTime}ms generation)`);
    } catch (cacheError) {
      console.error('Failed to cache learning module:', cacheError);
      // Don't fail the request if caching fails, just log the error
    }

    // 6. --- RETURN THE COMPLETE MODULE ---
    return NextResponse.json({ learningModule });

  } catch (error) {
    console.error('Error generating learning module:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate learning content', details: errorMessage }), { status: 500 });
  }
} 