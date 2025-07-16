// Diagnostic System Types
export interface DiagnosticQuestion {
  id: string;
  content: {
    text: string;
  };
  topic: {
    id: string;
    name: string;
  };
  question_options: DiagnosticQuestionOption[];
}

export interface DiagnosticQuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface DiagnosticAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  topicId: string;
  topicName: string;
}

export interface DiagnosticSession {
  id: string;
  user_id: string;
  exam_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  result_summary?: DiagnosticZonaRoja[];
  completed_at?: string;
  created_at: string;
}

export interface DiagnosticZonaRoja {
  title: string;
  description: string;
}

export interface DiagnosticAPIRequest {
  examType: 'ucr' | 'tec';
  answers: DiagnosticAnswer[];
}

export interface DiagnosticAPIResponse {
  zonasRojas: DiagnosticZonaRoja[];
}

export type ExamType = 'ucr' | 'tec';

// Error Types
export interface APIError {
  error: string;
  details?: string;
  code?: string;
}
