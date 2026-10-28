import { getConcept, getConceptForTopic, learningConcepts, type LearningConcept } from "@/data/conceptGraph";
import type { QuizAttempt, QuizResponse } from "@/lib/learnwiseStorage";

export type ConceptMastery = {
  conceptId: string;
  conceptName: string;
  subjectId: string;
  mastery: number;
  confidence: number;
  correct: number;
  incorrect: number;
  evidence: number;
  trend: "improving" | "declining" | "steady";
};

export type LearningGap = {
  conceptId: string;
  conceptName: string;
  subjectId: string;
  mastery: number;
  priority: number;
  kind: "direct" | "prerequisite";
  reason: string;
  evidence: number;
};

export type CurriculumStep = {
  id: string;
  kind: "micro-lesson" | "guided-drill" | "check-point";
  title: string;
  description: string;
  conceptId: string;
  duration: number;
  action: string;
};

export type AdaptiveSnapshot = {
  mastery: ConceptMastery[];
  gaps: LearningGap[];
  curriculum: CurriculumStep[];
  diagnosticReady: boolean;
};

function responseConcept(response: QuizResponse, subjectId: string) {
  return getConcept(response.conceptId ?? getConceptForTopic(subjectId, response.topic).id);
}

function responseWeight(attemptIndex: number) {
  return 1 + Math.min(0.8, attemptIndex * 0.08);
}

export function calculateMastery(attempts: QuizAttempt[]): ConceptMastery[] {
  const byConcept = new Map<string, { subjectId: string; correct: number; incorrect: number; weightedScore: number; weightedTotal: number; recent: boolean[] }>();
  const chronological = [...attempts].sort((a, b) => +new Date(a.completedAt) - +new Date(b.completedAt));
  chronological.forEach((attempt, attemptIndex) => {
    attempt.responses.forEach(response => {
      const concept = responseConcept(response, attempt.subjectId);
      if (!concept) return;
      const entry = byConcept.get(concept.id) ?? { subjectId: attempt.subjectId, correct: 0, incorrect: 0, weightedScore: 0, weightedTotal: 0, recent: [] };
      const weight = responseWeight(attemptIndex);
      entry.correct += response.isCorrect ? 1 : 0;
      entry.incorrect += response.isCorrect ? 0 : 1;
      entry.weightedScore += response.isCorrect ? weight : 0;
      entry.weightedTotal += weight;
      entry.recent.push(response.isCorrect);
      byConcept.set(concept.id, entry);
    });
  });
  return Array.from(byConcept.entries()).map(([conceptId, entry]) => {
    const concept = getConcept(conceptId) ?? learningConcepts[0];
    const mastery = Math.round(Math.max(0, Math.min(100, (entry.weightedScore + 1.5) / (entry.weightedTotal + 3) * 100)));
    const recent = entry.recent.slice(-4);
    const recentAccuracy = recent.length ? recent.filter(Boolean).length / recent.length : 0;
    const overallAccuracy = entry.correct / Math.max(1, entry.correct + entry.incorrect);
    return { conceptId, conceptName: concept.name, subjectId: entry.subjectId, mastery, confidence: Math.min(100, entry.recent.length * 18), correct: entry.correct, incorrect: entry.incorrect, evidence: entry.recent.length, trend: (recent.length >= 3 && recentAccuracy - overallAccuracy >= 0.12 ? "improving" : recent.length >= 3 && recentAccuracy - overallAccuracy <= -0.12 ? "declining" : "steady") as ConceptMastery["trend"] };
  }).sort((a, b) => a.mastery - b.mastery);
}

export function analyzeGaps(attempts: QuizAttempt[]): LearningGap[] {
  const mastery = calculateMastery(attempts);
  const masteryMap = new Map(mastery.map(item => [item.conceptId, item]));
  const direct = new Map<string, number>();
  attempts.forEach(attempt => attempt.responses.filter(response => !response.isCorrect).forEach(response => {
    const concept = responseConcept(response, attempt.subjectId);
    if (concept) direct.set(concept.id, (direct.get(concept.id) ?? 0) + 1);
  }));
  const gaps: LearningGap[] = [];
  direct.forEach((incorrect, conceptId) => {
    const concept = getConcept(conceptId);
    const item = masteryMap.get(conceptId);
    if (!concept || !item) return;
    gaps.push({ conceptId, conceptName: concept.name, subjectId: concept.subjectId, mastery: item.mastery, priority: incorrect * 3 + (100 - item.mastery), kind: "direct", reason: `${incorrect} incorrect response${incorrect === 1 ? "" : "s"} mapped directly to this concept.`, evidence: item.evidence });
    concept.prerequisites.forEach(prerequisiteId => {
      const prerequisite = getConcept(prerequisiteId);
      const prerequisiteMastery = masteryMap.get(prerequisiteId);
      if (prerequisite && (!prerequisiteMastery || prerequisiteMastery.mastery < 70)) gaps.push({ conceptId: prerequisite.id, conceptName: prerequisite.name, subjectId: prerequisite.subjectId, mastery: prerequisiteMastery?.mastery ?? 35, priority: incorrect * 2 + (100 - (prerequisiteMastery?.mastery ?? 35)), kind: "prerequisite", reason: `Prerequisite for ${concept.name}; strengthen this foundation before retrying.`, evidence: prerequisiteMastery?.evidence ?? 0 });
    });
  });
  const deduped = new Map<string, LearningGap>();
  gaps.forEach(gap => { const existing = deduped.get(gap.conceptId); if (!existing || gap.priority > existing.priority) deduped.set(gap.conceptId, gap); });
  return Array.from(deduped.values()).sort((a, b) => b.priority - a.priority);
}

export function synthesizeCurriculum(gaps: LearningGap[]): CurriculumStep[] {
  const steps: CurriculumStep[] = [];
  gaps.slice(0, 3).forEach((gap, index) => {
    const concept = getConcept(gap.conceptId);
    if (!concept) return;
    steps.push({ id: `lesson-${concept.id}`, kind: "micro-lesson", title: `Learn: ${concept.name}`, description: concept.lesson.summary, conceptId: concept.id, duration: 5, action: "Read lesson" });
    steps.push({ id: `drill-${concept.id}`, kind: "guided-drill", title: `Drill: ${concept.name}`, description: `Work through a fresh example: ${concept.lesson.example}`, conceptId: concept.id, duration: 7, action: "Start drill" });
    if (index === 0) steps.push({ id: `checkpoint-${concept.id}`, kind: "check-point", title: `Check mastery: ${concept.name}`, description: concept.lesson.check, conceptId: concept.id, duration: 3, action: "Take checkpoint" });
  });
  return steps;
}

export function getAdaptiveSnapshot(attempts: QuizAttempt[]): AdaptiveSnapshot {
  const mastery = calculateMastery(attempts);
  const gaps = analyzeGaps(attempts);
  return { mastery, gaps, curriculum: synthesizeCurriculum(gaps), diagnosticReady: attempts.length > 0 };
}
