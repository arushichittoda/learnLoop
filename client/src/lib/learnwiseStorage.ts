import { getSubject, subjects } from "@/data/quizData";

const STORAGE_KEY = "learnwise-ai-state-v1";

export type StudentProfile = {
  name: string;
  email: string;
};

export type QuizResponse = {
  questionId: string;
  conceptId?: string;
  question: string;
  selectedIndex: number;
  selectedAnswer: string;
  correctIndex: number;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  topic: string;
};

export type QuizAttempt = {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  responses: QuizResponse[];
  score: number;
  total: number;
  accuracy: number;
  completedAt: string;
};

export type LearnWiseState = {
  profile: StudentProfile | null;
  selectedSubjectId: string | null;
  attempts: QuizAttempt[];
};

export const emptyState: LearnWiseState = {
  profile: null,
  selectedSubjectId: null,
  attempts: [],
};

function isValidResponse(value: unknown): value is QuizResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<QuizResponse>;
  return typeof response.questionId === "string" && typeof response.question === "string" && typeof response.selectedIndex === "number" && typeof response.selectedAnswer === "string" && typeof response.correctIndex === "number" && typeof response.correctAnswer === "string" && typeof response.isCorrect === "boolean" && typeof response.explanation === "string" && typeof response.topic === "string";
}

function isValidAttempt(value: unknown): value is QuizAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<QuizAttempt>;
  return typeof attempt.id === "string" && typeof attempt.subjectId === "string" && typeof attempt.subjectName === "string" && typeof attempt.topic === "string" && typeof attempt.score === "number" && typeof attempt.total === "number" && typeof attempt.accuracy === "number" && typeof attempt.completedAt === "string" && !Number.isNaN(new Date(attempt.completedAt).getTime()) && Array.isArray(attempt.responses) && attempt.responses.every(isValidResponse);
}

export function loadState(): LearnWiseState {
  if (typeof window === "undefined") return emptyState;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyState;
    const parsed = JSON.parse(stored) as Partial<LearnWiseState>;
    const profile = parsed.profile && typeof parsed.profile.name === "string" && typeof parsed.profile.email === "string" ? parsed.profile : null;
    return {
      profile,
      selectedSubjectId: typeof parsed.selectedSubjectId === "string" ? parsed.selectedSubjectId : null,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts.filter(isValidAttempt) : [],
    };
  } catch {
    return emptyState;
  }
}

export function saveState(state: LearnWiseState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatTimeAgo(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export type TopicPerformance = {
  subjectId: string;
  subjectName: string;
  attempts: number;
  latestScore: number;
  latestTotal: number;
  accuracy: number;
  questions: number;
  correct: number;
  accent: string;
  trend: "improving" | "declining" | "steady";
};

export function getTopicPerformance(attempts: QuizAttempt[]): TopicPerformance[] {
  const grouped = new Map<string, QuizAttempt[]>();
  attempts.forEach(attempt => {
    const group = grouped.get(attempt.subjectId) ?? [];
    group.push(attempt);
    grouped.set(attempt.subjectId, group);
  });

  return Array.from(grouped.entries())
    .map(([subjectId, group]) => {
      const subject = getSubject(subjectId);
      const questions = group.reduce((sum, attempt) => sum + attempt.total, 0);
      const correct = group.reduce((sum, attempt) => sum + attempt.score, 0);
      const chronological = [...group].sort((a, b) => +new Date(a.completedAt) - +new Date(b.completedAt));
      const latest = chronological[chronological.length - 1];
      const trendDelta = latest.accuracy - chronological[0].accuracy;
      return {
        subjectId,
        subjectName: subject?.name ?? latest.subjectName,
        attempts: group.length,
        latestScore: latest.score,
        latestTotal: latest.total,
        accuracy: questions ? Math.round((correct / questions) * 100) : 0,
        questions,
        correct,
        accent: subject?.accent ?? "#4F46E5",
        trend: (group.length > 1 && trendDelta >= 5 ? "improving" : group.length > 1 && trendDelta <= -5 ? "declining" : "steady") as TopicPerformance["trend"],
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function getDashboardStats(attempts: QuizAttempt[]) {
  const questionsAttempted = attempts.reduce((sum, attempt) => sum + attempt.total, 0);
  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return {
    quizzes: attempts.length,
    questions: questionsAttempted,
    correct: correctAnswers,
    accuracy: questionsAttempted ? Math.round((correctAnswers / questionsAttempted) * 100) : 0,
    topics: new Set(attempts.map(attempt => attempt.subjectId)).size,
    progress: questionsAttempted ? Math.min(100, Math.round((correctAnswers / questionsAttempted) * 100)) : 0,
  };
}

export function getWeakTopic(attempt: QuizAttempt) {
  const groups = new Map<string, { correct: number; total: number }>();
  attempt.responses.forEach(response => {
    const group = groups.get(response.topic) ?? { correct: 0, total: 0 };
    group.total += 1;
    if (response.isCorrect) group.correct += 1;
    groups.set(response.topic, group);
  });
  const weakest = Array.from(groups.entries()).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];
  return weakest ? { topic: weakest[0], accuracy: Math.round((weakest[1].correct / weakest[1].total) * 100), incorrect: weakest[1].total - weakest[1].correct } : { topic: attempt.subjectName, accuracy: attempt.accuracy, incorrect: attempt.total - attempt.score };
}

export function getSmartPractice(attempts: QuizAttempt[]) {
  const performance = getTopicPerformance(attempts);
  if (!performance.length) {
    return {
      type: "empty" as const,
      title: "Your next best step is waiting",
      description: "Complete a few quizzes to receive personalized practice recommendations.",
      subjectId: null,
      subjectName: null,
      accuracy: null,
    };
  }
  const weakest = performance[0];
  return {
    type: "recommendation" as const,
    title: `Build confidence in ${weakest.subjectName}`,
    description: `Your accuracy is ${weakest.accuracy}%, lower than your other practiced topics. Try a focused quiz to strengthen this area.`,
    subjectId: weakest.subjectId,
    subjectName: weakest.subjectName,
    accuracy: weakest.accuracy,
  };
}

export function getRecommendations(attempts: QuizAttempt[]) {
  if (!attempts.length) {
    return [{
      id: "first-quiz",
      eyebrow: "START HERE",
      title: "Take your first quiz",
      description: "Complete one topic to unlock evidence-led progress and practice suggestions.",
      action: "Explore subjects",
      subjectId: null,
    }];
  }

  const performance = getTopicPerformance(attempts);
  const weakest = performance[0];
  const recommendations: Array<{
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    subjectId: string | null;
  }> = [
    {
      id: "weakest-topic",
      eyebrow: "PRACTICE NOW",
      title: `Review ${weakest.subjectName}`,
      description: `Your stored attempts show ${weakest.accuracy}% accuracy across ${weakest.questions} questions. A short retry can make the next attempt count.`,
      action: "Practice topic",
      subjectId: weakest.subjectId,
    },
  ];

  const incorrect = attempts.flatMap(attempt => attempt.responses.filter(response => !response.isCorrect));
  if (incorrect.length) {
    recommendations.push({
      id: "missed-questions",
      eyebrow: "REVISIT",
      title: "Revisit missed questions",
      description: `You have ${incorrect.length} stored incorrect response${incorrect.length === 1 ? "" : "s"}. Read the explanations, then try the topic again.`,
      action: "View history",
      subjectId: null,
    });
  }

  const trendTopic = performance.find(item => item.trend !== "steady");
  if (trendTopic) {
    const improving = trendTopic.trend === "improving";
    recommendations.push({
      id: "trend-signal",
      eyebrow: improving ? "MOMENTUM" : "CHECK-IN",
      title: improving ? `${trendTopic.subjectName} is moving up` : `Pause on ${trendTopic.subjectName}`,
      description: improving ? "Your latest attempt is stronger than your first one here. Keep the rhythm going." : "Your latest attempt dipped from your first one here. Review the misses before your next retry.",
      action: "View history",
      subjectId: null,
    });
  }

  const unpracticed = subjects.find(subject => !performance.some(item => item.subjectId === subject.id));
  if (unpracticed) {
    recommendations.push({
      id: "new-topic",
      eyebrow: "EXPLORE",
      title: `Try ${unpracticed.name}`,
      description: "A new topic gives you another way to grow your learning map.",
      action: "Explore subject",
      subjectId: unpracticed.id,
    });
  }
  return recommendations.slice(0, 3);
}
