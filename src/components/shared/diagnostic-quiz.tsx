'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'

// Define the types for the data we expect to receive and send
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

type DiagnosticQuizProps = {
  questions: Question[];
  onComplete: (answers: AnswerPayload[]) => void;
};

export function DiagnosticQuiz({ questions, onComplete }: DiagnosticQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerPayload[]>([]);
  const [startTime, setStartTime] = useState(Date.now());

  const handleAnswerClick = (optionId: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = currentQuestion.question_options.find(opt => opt.id === optionId);
    
    if (!selectedOption) return;

    const responseTime = Date.now() - startTime;
    
    const answer: AnswerPayload = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect: selectedOption.is_correct,
      responseTimeMs: responseTime,
      topicId: currentQuestion.topic_id,
    };

    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStartTime(Date.now()); // Reset timer for the next question
    } else {
      onComplete(newAnswers); // Send all answers back to the parent page
    }
  };

  if (!questions || questions.length === 0) {
    return <div>Cargando preguntas...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-500">
      <CardHeader>
        <div className="mb-4">
          <p className="text-sm font-medium text-center mb-2">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </p>
          <Progress value={progressValue} />
        </div>
        <CardTitle className="text-2xl leading-relaxed text-center">
          {currentQuestion.content.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {currentQuestion.question_options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              size="lg"
              className="h-auto py-4 text-base whitespace-normal"
              onClick={() => handleAnswerClick(option.id)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 