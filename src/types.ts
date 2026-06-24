export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // used internally for login
  score: number; // cumulative score/correct answers
  level: number; // 1-5, derived from totalPoints
  totalPoints: number; // score * 10 per quiz, accumulated
  streak: number; // consecutive days with at least one quiz
  lastQuizTime: number; // epoch millis of last quiz taken
  profileImageUri: string | null;
  isAdmin: boolean;
  role: 'admin' | 'user';
  createdAt: number;
}

export interface Question {
  id: string;
  category: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  isFavorite: boolean; // defaults to false
  isCustom: boolean; // default false for seeded, true for custom
}

export interface QuizResult {
  id: string;
  userId: string;
  quizDate: number; // timestamp (epoch millis)
  score: number; // number correct
  totalQuestions: number;
  category: string;
  note: string; // optional user note added after a quiz
  userName?: string; // transient, for view models
}

export interface CategoryStats {
  category: string;
  questionCount: number;
  totalAttempts: number;
  avgScore: number;
  correctRate: number; // percentage correct across all attempts
}

export interface QuestionStats {
  questionId: string;
  questionText: string;
  category: string;
  totalAttempts: number;
  wrongAttempts: number;
  difficultyRate: number; // % wrong answers
}

export interface AnalyticsSummary {
  totalQuestions: number;
  totalCategories: number;
  totalUsers: number;
  totalAttempts: number;
  categoryStats: CategoryStats[];
  difficultyStats: QuestionStats[];
  dailyActiveUsers: { date: string; count: number }[];
}
