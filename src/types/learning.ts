export interface LearningModule {
  title: string;
  explanation: {
    validation: string;
    analogy: string;
    core_concept: string;
  };
  machote: {
    title: string;
    steps: string[];
    common_mistakes: string[];
  };
}

export interface LearningPageProps {
  params: Promise<{ topicId: string }>;
} 