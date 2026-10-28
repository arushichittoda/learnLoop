import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Code2,
  Coffee,
  Database,
  Flame,
  Gauge,
  GraduationCap,
  History,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  emptyState,
  formatDate,
  formatTimeAgo,
  getDashboardStats,
  getRecommendations,
  getSmartPractice,
  getTopicPerformance,
  getWeakTopic,
  loadState,
  saveState,
  type LearnWiseState,
  type QuizAttempt,
  type QuizResponse,
} from "@/lib/learnwiseStorage";
import { getAdaptiveSnapshot } from "@/lib/adaptiveLearning";
import { getConceptForTopic } from "@/data/conceptGraph";
import {
  getQuestionsForSubject,
  getSubject,
  getTheory,
  subjectCategories,
  subjects,
  type QuizQuestion,
  type Subject,
} from "@/data/quizData";

type AppView = "details" | "subjects" | "theory" | "quiz" | "results" | "review" | "dashboard" | "smart" | "progress" | "history" | "profile";
type QuizSession = {
  subjectId: string;
  mode?: "diagnostic" | "adaptive-practice";
  questions: QuizQuestion[];
  currentIndex: number;
  selectedIndex: number | null;
  submitted: boolean;
  responses: QuizResponse[];
  startedAt: number;
};

const ACTIVE_QUIZ_KEY = "learnwise-ai-active-quiz-v1";

function loadActiveQuiz(): QuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_QUIZ_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizSession;
    if (!parsed.subjectId || !Array.isArray(parsed.questions) || !parsed.questions.length || parsed.currentIndex < 0 || parsed.currentIndex >= parsed.questions.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "quiet" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

function ActionButton({ children, onClick, variant = "primary", disabled, type = "button", className = "" }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`action-button action-${variant} ${className}`}>
      {children}
    </button>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark"><span>L</span><i /></span>
      <span className="brand-copy"><strong>LearnLoop</strong><em>AI</em></span>
    </div>
  );
}

function EvidenceBadge({ children, tone = "indigo" }: { children: ReactNode; tone?: "indigo" | "green" | "amber" }) {
  return <span className={`evidence-badge evidence-${tone}`}><span className="evidence-dot" />{children}</span>;
}

function SubjectIcon({ subject, size = 20 }: { subject: Subject; size?: number }) {
  const Icon = ({
    code: Code2,
    braces: Braces,
    database: Database,
    network: Network,
    layers: Layers3,
    terminal: Terminal,
    coffee: Coffee,
  } as Record<Subject["icon"], LucideIcon>)[subject.icon];
  return <Icon size={size} strokeWidth={1.8} />;
}

function StepBar({ active }: { active: 1 | 2 | 3 | 4 }) {
  return (
    <div className="step-bar" aria-label="Onboarding progress">
      {["Your details", "Choose a topic", "Read the theory", "Practice test"].map((label, index) => {
        const step = index + 1;
        return (
          <div key={label} className={`step ${step <= active ? "step-active" : ""} ${step < active ? "step-complete" : ""}`}>
            <span className="step-number">{step < active ? <Check size={13} /> : `0${step}`}</span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function AuthShell({ children, step }: { children: ReactNode; step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside-top"><Brand /><span className="aside-tag">STUDY STUDIO / 01</span></div>
        <div className="auth-quote">
          <p className="eyebrow eyebrow-light">A clearer way to practice</p>
          <h1>Make your next attempt count.</h1>
          <p>LearnLoop turns each answer into a useful next step — so you can practice with intention, not guesswork.</p>
        </div>
        <div className="aside-note">
          <div className="note-icon"><Sparkles size={17} /></div>
          <div><strong>Built around your evidence</strong><span>Scores, feedback, and recommendations come from your actual attempts.</span></div>
        </div>
        <div className="aside-foot"><span>01</span><span className="aside-line" /><span>FOCUS · FEEDBACK · FORWARD</span></div>
      </aside>
      <main className="auth-main">
        <div className="auth-mobile-brand"><Brand compact /></div>
        <div className="auth-content">
          <StepBar active={step} />
          {children}
        </div>
        <p className="auth-disclaimer"><LockKeyhole size={13} /> Prototype mode · your password is only used for this session and is never saved.</p>
      </main>
    </div>
  );
}

function DetailsScreen({ onContinue }: { onContinue: (name: string, email: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Add your full name to continue.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Create a password for this session.";
    else if (password.length < 6) nextErrors.password = "Use at least 6 characters.";
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onContinue(name.trim(), email.trim());
  };

  return (
    <AuthShell step={1}>
      <div className="auth-card auth-card-details">
        <div className="auth-heading">
          <EvidenceBadge>WELCOME TO YOUR STUDY STUDIO</EvidenceBadge>
          <h2>Start with a little context.</h2>
          <p>Tell us who is learning. We’ll use it to make your dashboard feel like yours.</p>
        </div>
        <form onSubmit={submit} className="details-form" noValidate>
          <label className="field-label">Full name <span>Required</span><div className={`field-wrap ${errors.name ? "field-error" : ""}`}><UserRound size={17} /><input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Aisha Rahman" autoComplete="name" /></div>{errors.name && <small className="error-text"><CircleAlert size={13} />{errors.name}</small>}</label>
          <label className="field-label">Email address <span>Required</span><div className={`field-wrap ${errors.email ? "field-error" : ""}`}><Search size={17} /><input value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></div>{errors.email && <small className="error-text"><CircleAlert size={13} />{errors.email}</small>}</label>
          <label className="field-label">Session password <span>Required</span><div className={`field-wrap ${errors.password ? "field-error" : ""}`}><LockKeyhole size={17} /><input value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" type={showPassword ? "text" : "password"} autoComplete="new-password" /><button type="button" className="field-toggle" onClick={() => setShowPassword(current => !current)}>{showPassword ? "Hide" : "Show"}</button></div>{errors.password && <small className="error-text"><CircleAlert size={13} />{errors.password}</small>}</label>
          <ActionButton type="submit" className="button-full">Continue to LearnLoop <ArrowRight size={17} /></ActionButton>
        </form>
        <div className="form-footnote"><CheckCircle2 size={15} /><span>No account backend in this prototype. Your progress stays in this browser.</span></div>
      </div>
    </AuthShell>
  );
}

function SubjectCard({ subject, selected, onSelect }: { subject: Subject; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`subject-card ${selected ? "subject-selected" : ""}`} onClick={onSelect} type="button" aria-pressed={selected}>
      <span className="subject-icon" style={{ backgroundColor: `${subject.accent}14`, color: subject.accent }}><SubjectIcon subject={subject} /></span>
      <span className="subject-card-copy"><strong>{subject.name}</strong><small>{subject.description}</small></span>
      <span className="subject-select-indicator">{selected ? <Check size={15} /> : <ArrowUpRight size={16} />}</span>
    </button>
  );
}

function SubjectSelection({ selectedSubjectId, onSelect, onStart, onBack, embedded = false }: { selectedSubjectId: string | null; onSelect: (id: string) => void; onStart: () => void; onBack?: () => void; embedded?: boolean }) {
  const content = (
    <div className="selection-screen">
      <div className="selection-heading"><div><EvidenceBadge tone="green">CHOOSE ONE FOCUS AREA</EvidenceBadge><h2>Where should we start?</h2><p>Pick a programming language or concept. Your quiz will stay focused on this topic.</p></div><div className="selection-count"><span>{subjects.length}</span><small>curated topics</small></div></div>
      <div className="category-stack">
        {subjectCategories.map(category => (
          <section className="subject-category" key={category}>
            <div className="category-label"><span className="category-line" /><span>{category}</span><span className="category-line category-line-right" /></div>
            <div className="subject-grid">{subjects.filter(subject => subject.category === category).map(subject => <SubjectCard key={subject.id} subject={subject} selected={selectedSubjectId === subject.id} onSelect={() => onSelect(subject.id)} />)}</div>
          </section>
        ))}
      </div>
      <div className="selection-footer">{onBack && <button className="back-link" onClick={onBack} type="button"><ArrowLeft size={15} /> Back to details</button>}<ActionButton onClick={onStart} disabled={!selectedSubjectId}>Start focused quiz <ArrowRight size={17} /></ActionButton></div>
    </div>
  );
  if (embedded) return <div className="embedded-selection">{content}</div>;
  return <AuthShell step={2}>{content}</AuthShell>;
}

function TheoryScreen({ subject, focusTopic, onStart, onBack }: { subject: Subject; focusTopic?: string; onStart: () => void; onBack: () => void }) {
  const theory = getTheory(subject.id);
  return (
    <AuthShell step={3}>
      <div className="theory-screen">
        <div className="theory-heading"><div><EvidenceBadge tone="green">THEORY FOR YOUR WEAKEST AREA</EvidenceBadge><h2>{focusTopic ? `Strengthen ${focusTopic}` : theory.headline}</h2><p>{focusTopic ? `Your latest quiz showed that ${focusTopic} needs more attention. Read this ${subject.name} lesson before taking a fresh practice test.` : theory.summary}</p></div><span className="theory-subject-mark" style={{ color: subject.accent, background: `${subject.accent}14` }}><SubjectIcon subject={subject} size={24} /></span></div>
        <div className="theory-layout">
          <section className="theory-main">
            <div className="theory-section-label"><span className="category-line" />WHY THIS MATTERS</div>
            <p className="theory-why">{theory.whyItMatters}</p>
            <div className="theory-section-label"><span className="category-line" />KEY IDEAS</div>
            <div className="theory-ideas">{theory.keyIdeas.map((idea, index) => <article className="theory-idea" key={idea.title}><span>0{index + 1}</span><div><strong>{idea.title}</strong><p>{idea.body}</p></div></article>)}</div>
          </section>
          <aside className="theory-example"><div className="example-top"><span className="example-dot example-dot-red" /><span className="example-dot example-dot-yellow" /><span className="example-dot example-dot-green" /><small>WORKED EXAMPLE</small></div><h3>{theory.example.title}</h3><pre><code>{theory.example.code}</code></pre><div className="example-walkthrough"><Lightbulb size={15} /><p>{theory.example.walkthrough}</p></div></aside>
        </div>
        <div className="theory-footer"><button className="back-link" onClick={onBack} type="button"><ArrowLeft size={15} /> Choose another topic</button><ActionButton onClick={onStart}>I understand — start practice <ArrowRight size={17} /></ActionButton></div>
      </div>
    </AuthShell>
  );
}

function QuizScreen({ session, subject, onSelect, onSubmit, onNext, onExit }: { session: QuizSession; subject: Subject; onSelect: (index: number) => void; onSubmit: () => void; onNext: () => void; onExit: () => void }) {
  const question = session.questions[session.currentIndex];
  const progress = ((session.currentIndex + (session.submitted ? 1 : 0)) / session.questions.length) * 100;
  const isCorrect = session.submitted && session.selectedIndex === question.correctIndex;
  return (
    <div className="quiz-shell">
      <header className="quiz-header"><Brand compact /><div className="quiz-header-meta"><span>{subject.name}</span><span className="header-divider" /><span>{session.mode === "diagnostic" ? "Diagnostic baseline" : "Adaptive practice"}</span></div><button className="quiz-exit" onClick={onExit} type="button"><X size={16} /> Exit quiz</button></header>
      <main className="quiz-main">
        <div className="quiz-context"><div><p className="eyebrow">{session.mode === "diagnostic" ? "DIAGNOSTIC ASSESSMENT" : "ADAPTIVE PRACTICE"} / {subject.name.toUpperCase()}</p><h1>{session.mode === "diagnostic" ? "Let’s map what you already know." : "Strengthen the concepts that need you most."}</h1></div><div className="quiz-counter"><strong>{String(session.currentIndex + 1).padStart(2, "0")}</strong><span>/ {String(session.questions.length).padStart(2, "0")}</span></div></div>
        <div className="quiz-progress-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="quiz-layout">
          <section className="quiz-question-card">
            <div className="question-meta"><span className="question-number">Question {session.currentIndex + 1} of {session.questions.length}</span><span className="question-topic"><Target size={14} />{question.topic}</span></div>
            <h2>{question.prompt}</h2>
            <div className="answer-list">
              {question.options.map((option, index) => {
                const selected = session.selectedIndex === index;
                const correct = session.submitted && index === question.correctIndex;
                const incorrect = session.submitted && selected && !isCorrect;
                return <button key={option} type="button" disabled={session.submitted} onClick={() => onSelect(index)} className={`answer-option ${selected ? "answer-selected" : ""} ${correct ? "answer-correct" : ""} ${incorrect ? "answer-incorrect" : ""}`}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{correct && <CheckCircle2 className="answer-status-icon" size={19} />}{incorrect && <CircleAlert className="answer-status-icon" size={19} />}</button>;
              })}
            </div>
            {session.submitted && <div className={`feedback-box ${isCorrect ? "feedback-success" : "feedback-warning"}`}><div className="feedback-icon">{isCorrect ? <CheckCircle2 size={21} /> : <CircleAlert size={21} />}</div><div><strong>{isCorrect ? "Correct — nice work." : "Not quite this time."}</strong><p>Correct answer: <b>{question.options[question.correctIndex]}</b></p><span>{question.explanation}</span></div></div>}
            <div className="quiz-actions">{!session.submitted ? <ActionButton onClick={onSubmit} disabled={session.selectedIndex === null}>Submit answer <ArrowRight size={17} /></ActionButton> : <ActionButton onClick={onNext}>{session.currentIndex === session.questions.length - 1 ? "View results" : "Next question"} <ArrowRight size={17} /></ActionButton>}</div>
          </section>
          <aside className="quiz-side-note"><div className="side-note-head"><span className="side-note-icon"><Lightbulb size={17} /></span><strong>Practice note</strong></div><p>Take a moment to choose. You’ll see the correct answer and why it works immediately after submitting.</p><div className="side-note-rule" /><span className="side-note-caption">FEEDBACK IS PART OF THE LESSON</span></aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: LucideIcon; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon stat-icon-${tone}`}><Icon size={17} /></div><div className="stat-label">{label}</div><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></div>;
}

function EmptyState({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><BookOpenCheck size={19} /></span><strong>{title}</strong><p>{description}</p>{action && <ActionButton variant="secondary" onClick={onAction}>{action} <ArrowRight size={15} /></ActionButton>}</div>;
}

function PanelHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="panel-heading">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<div className="panel-heading-row"><h2>{title}</h2>{action && <button className="text-action" onClick={onAction} type="button">{action}<ArrowUpRight size={15} /></button>}</div></div>;
}

function AppShell({ view, onNavigate, children }: { view: AppView; onNavigate: (view: AppView) => void; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: Array<{ id: AppView; label: string; icon: LucideIcon }> = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "subjects", label: "Explore subjects", icon: Search },
    { id: "smart", label: "Smart practice", icon: Sparkles },
    { id: "progress", label: "My progress", icon: BarChart3 },
    { id: "history", label: "Quiz history", icon: History },
  ];
  const handleNav = (next: AppView) => { onNavigate(next); setMobileOpen(false); };
  return <div className="app-shell"><aside className={`app-sidebar ${mobileOpen ? "sidebar-open" : ""}`}><div className="sidebar-top"><Brand /><button className="sidebar-close" onClick={() => setMobileOpen(false)} type="button"><PanelLeftClose size={17} /></button></div><div className="sidebar-section-label">STUDY STUDIO</div><nav className="main-nav">{navItems.map(item => <button key={item.id} className={`nav-item ${view === item.id ? "nav-active" : ""}`} onClick={() => handleNav(item.id)} type="button"><item.icon size={17} /><span>{item.label}</span>{view === item.id && <span className="nav-active-dot" />}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><Zap size={15} /><span>Stay curious.<br /><b>Keep going.</b></span></div><button className={`nav-item ${view === "profile" ? "nav-active" : ""}`} onClick={() => handleNav("profile")} type="button"><Settings2 size={17} /><span>Profile & settings</span></button><div className="sidebar-version">LEARNLOOP AI <span>v1.0 · LOCAL</span></div></div></aside><div className="app-content"><header className="mobile-app-header"><button className="mobile-menu" type="button" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><Brand compact /><span className="mobile-header-label">STUDY STUDIO</span></header>{children}</div></div>;
}

function AdaptiveLearningPanel({ state, onStartQuiz }: { state: LearnWiseState; onStartQuiz: (subjectId?: string) => void }) {
  const snapshot = useMemo(() => getAdaptiveSnapshot(state.attempts), [state.attempts]);
  const strongestGap = snapshot.gaps[0];
  const gapSubject = strongestGap ? getSubject(strongestGap.subjectId) : null;
  return <section className="adaptive-panel"><div className="adaptive-panel-heading"><div><EvidenceBadge tone={snapshot.diagnosticReady ? "green" : "amber"}>{snapshot.diagnosticReady ? "LEARNING INTELLIGENCE ACTIVE" : "READY FOR YOUR DIAGNOSTIC"}</EvidenceBadge><h2>Your adaptive learning loop</h2><p>{snapshot.diagnosticReady ? "Every answer updates concept mastery, surfaces prerequisite gaps, and reshapes your next steps." : "Your first diagnostic quiz will calibrate concept mastery and unlock a personalized curriculum."}</p></div><div className="adaptive-engine-mark"><span>AI</span><small>LOOP</small></div></div><div className="adaptive-pipeline"><span><b>01</b> Diagnose</span><ArrowRight size={14} /><span><b>02</b> Find gaps</span><ArrowRight size={14} /><span><b>03</b> Teach</span><ArrowRight size={14} /><span><b>04</b> Recalibrate</span></div>{snapshot.diagnosticReady ? <div className="adaptive-grid"><div className="adaptive-mastery"><div className="adaptive-subhead"><span className="eyebrow">CONCEPT MASTERY</span><strong>{snapshot.mastery.length} concept{snapshot.mastery.length === 1 ? "" : "s"} measured</strong></div>{snapshot.mastery.slice(0, 4).map(item => <div className="mastery-row" key={item.conceptId}><div className="mastery-row-top"><span><strong>{item.conceptName}</strong><small>{item.evidence} evidence point{item.evidence === 1 ? "" : "s"} · {item.confidence}% confidence</small></span><b>{item.mastery}%</b></div><div className="progress-rail"><span style={{ width: `${item.mastery}%`, background: item.mastery < 60 ? "#E07A5F" : item.mastery < 78 ? "#D0A34A" : "#4F46E5" }} /></div></div>)}</div><div className="adaptive-curriculum"><div className="adaptive-subhead"><span className="eyebrow">PERSONALIZED CURRICULUM</span><strong>{strongestGap ? `Start with ${strongestGap.conceptName}` : "Your next lesson"}</strong></div>{strongestGap && <div className="gap-callout"><span className="gap-callout-icon"><Target size={16} /></span><div><strong>{strongestGap.kind === "prerequisite" ? "Prerequisite gap detected" : "Direct concept gap detected"}</strong><p>{strongestGap.reason}</p></div></div>}{snapshot.curriculum.slice(0, 3).map(step => <button type="button" className="curriculum-row" key={step.id} onClick={() => onStartQuiz(strongestGap?.subjectId)}><span className={`curriculum-kind curriculum-${step.kind}`} /> <span><strong>{step.title}</strong><small>{step.duration} min · {step.description}</small></span><ArrowUpRight size={15} /></button>)}{gapSubject && <button type="button" className="adaptive-cta" onClick={() => onStartQuiz(gapSubject.id)}>Start targeted practice <ArrowRight size={14} /></button>}</div></div> : <div className="adaptive-empty"><div className="adaptive-empty-step"><span>01</span><strong>Take the diagnostic</strong><p>Complete a 10-question baseline assessment so LearnLoop can measure concepts, not just a single score.</p></div><div className="adaptive-empty-step"><span>02</span><strong>See your gaps</strong><p>Incorrect answers map to prerequisite concepts and explain why the next lesson was chosen.</p></div><div className="adaptive-empty-step"><span>03</span><strong>Get a learning path</strong><p>Micro-lessons, guided drills, and checkpoints will be synthesized from your evidence.</p></div></div>}</section>;
}

function DashboardView({ state, onNavigate, onStartQuiz, onReview }: { state: LearnWiseState; onNavigate: (view: AppView) => void; onStartQuiz: (subjectId?: string) => void; onReview: (attempt: QuizAttempt) => void }) {
  const stats = useMemo(() => getDashboardStats(state.attempts), [state.attempts]);
  const performance = useMemo(() => getTopicPerformance(state.attempts), [state.attempts]);
  const smartPractice = useMemo(() => getSmartPractice(state.attempts), [state.attempts]);
  const recommendations = useMemo(() => getRecommendations(state.attempts), [state.attempts]);
  const accuracyData = performance.map(item => ({ name: item.subjectName.length > 15 ? `${item.subjectName.slice(0, 13)}…` : item.subjectName, accuracy: item.accuracy }));
  const scoreData = [...state.attempts].slice(0, 7).reverse().map((attempt, index) => ({ name: `#${index + 1}`, score: attempt.accuracy }));
  const answerData = [{ name: "Correct", value: stats.correct, fill: "#4F46E5" }, { name: "Incorrect", value: Math.max(0, stats.questions - stats.correct), fill: "#F1A38F" }];
  const firstName = state.profile?.name.split(" ")[0] ?? "Learner";
  return <div className="page-wrap"><div className="page-header dashboard-header"><div><span className="eyebrow">YOUR LEARNING STUDIO / OVERVIEW</span><h1>Welcome back, {firstName}.</h1><p>Keep learning, keep practicing, and make progress every day.</p></div><div className="header-actions"><ActionButton variant="secondary" onClick={() => onNavigate("smart")}><Sparkles size={16} /> Smart practice</ActionButton><ActionButton onClick={() => onStartQuiz()}><Play size={15} fill="currentColor" /> Start a quiz</ActionButton></div></div>
    <section className="insight-hero"><div className="insight-main"><div className="insight-overline"><EvidenceBadge tone={smartPractice.type === "empty" ? "amber" : "green"}>{smartPractice.type === "empty" ? "READY WHEN YOU ARE" : "RULE-BASED NEXT STEP"}</EvidenceBadge><span className="hero-kicker">SMART PRACTICE</span></div><h2>{smartPractice.title}</h2><p>{smartPractice.description}</p><button className="hero-link" type="button" onClick={() => smartPractice.subjectId ? onStartQuiz(smartPractice.subjectId) : onNavigate("subjects")}>{smartPractice.subjectId ? "Practice this topic" : "Explore your first topic"}<ArrowRight size={16} /></button></div><div className="insight-graphic"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="graphic-center"><Target size={23} /></span><span className="graphic-label graphic-label-one">FOCUS</span><span className="graphic-label graphic-label-two">FEEDBACK</span><span className="graphic-label graphic-label-three">FORWARD</span></div></section>
    <section className="stats-grid"><StatCard label="Quizzes completed" value={stats.quizzes} detail={stats.quizzes ? `${formatTimeAgo(state.attempts[0].completedAt)}` : "Your first one is ahead"} icon={Trophy} tone="indigo" /><StatCard label="Questions attempted" value={stats.questions} detail={stats.questions ? `${stats.correct} answered correctly` : "No attempts yet"} icon={BookOpenCheck} tone="blue" /><StatCard label="Overall accuracy" value={`${stats.accuracy}%`} detail={stats.questions ? "Across stored attempts" : "Calculated after your first quiz"} icon={Target} tone="green" /><StatCard label="Topics practiced" value={stats.topics} detail={stats.topics ? `${subjects.length - stats.topics} topics still open` : `${subjects.length} topics to explore`} icon={Layers3} tone="amber" /></section>
    <div className="dashboard-grid"><section className="panel chart-panel"><PanelHeading eyebrow="SIGNALS FROM YOUR ATTEMPTS" title="Accuracy by topic" action="View progress" onAction={() => onNavigate("progress")} />{accuracyData.length ? <div className="chart-wrap chart-bar-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={accuracyData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#E7E8F0" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8A8D9E", fontSize: 11 }} interval={0} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8A8D9E", fontSize: 11 }} domain={[0, 100]} tickFormatter={value => `${value}%`} /><Tooltip cursor={{ fill: "#F8F8FC" }} contentStyle={{ border: "1px solid #E8E8F0", borderRadius: 10, fontSize: 12 }} formatter={(value) => [`${value}%`, "Accuracy"]} /><Bar dataKey="accuracy" fill="#4F46E5" radius={[5, 5, 2, 2]} barSize={26} /></BarChart></ResponsiveContainer></div> : <EmptyState title="Your first signal starts here" description="Complete a quiz to see your performance by topic." action="Explore subjects" onAction={() => onNavigate("subjects")} />}</section>
      <section className="panel chart-panel"><PanelHeading eyebrow="RECENT MOMENTUM" title="Scores over time" />{scoreData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={scoreData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}><CartesianGrid vertical={false} stroke="#E7E8F0" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8A8D9E", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8A8D9E", fontSize: 11 }} domain={[0, 100]} tickFormatter={value => `${value}%`} /><Tooltip contentStyle={{ border: "1px solid #E8E8F0", borderRadius: 10, fontSize: 12 }} formatter={(value) => [`${value}%`, "Score"]} /><Line type="monotone" dataKey="score" stroke="#2C2F48" strokeWidth={2.5} dot={{ r: 4, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div> : <EmptyState title="No trend yet" description="Your completed quizzes will create a learning trend here." action="Start a quiz" onAction={() => onStartQuiz()} />}</section>
      <section className="panel topic-panel"><PanelHeading eyebrow="YOUR LEARNING MAP" title="Practiced topics" action="Explore all" onAction={() => onNavigate("subjects")} />{performance.length ? <div className="topic-list">{performance.slice(0, 4).map(item => <button className="topic-row" type="button" key={item.subjectId} onClick={() => onStartQuiz(item.subjectId)}><span className="topic-row-icon" style={{ color: item.accent, background: `${item.accent}15` }}>{getSubject(item.subjectId) && <SubjectIcon subject={getSubject(item.subjectId)!} size={17} />}</span><span className="topic-row-copy"><strong>{item.subjectName}</strong><small>{item.questions} questions · {item.attempts} attempt{item.attempts === 1 ? "" : "s"}</small></span><span className="topic-row-score"><b>{item.accuracy}%</b><span className="mini-progress"><i style={{ width: `${item.accuracy}%`, background: item.accent }} /></span></span><ChevronRight size={16} className="topic-chevron" /></button>)}</div> : <EmptyState title="Your learning map is blank" description="Pick a programming topic and complete a quiz to start building it." action="Explore subjects" onAction={() => onNavigate("subjects")} />}</section>
      <section className="panel activity-panel"><PanelHeading eyebrow="LATEST ACTIVITY" title="Keep the thread going" action="View history" onAction={() => onNavigate("history")} />{state.attempts.length ? <div className="activity-list">{state.attempts.slice(0, 4).map(attempt => <button className="activity-row" type="button" key={attempt.id} onClick={() => onReview(attempt)}><span className="activity-date">{formatTimeAgo(attempt.completedAt)}</span><span className="activity-status"><span className="activity-status-dot" />Quiz completed</span><span className="activity-name">{attempt.subjectName}</span><strong>{attempt.accuracy}%</strong><ArrowUpRight size={15} /></button>)}</div> : <EmptyState title="No recent activity" description="Your latest quiz will appear here with its score and review link." />}</section>
    </div>
    <AdaptiveLearningPanel state={state} onStartQuiz={onStartQuiz} />
    <section className="recommendation-strip"><div className="recommendation-intro"><span className="recommendation-mark"><Lightbulb size={18} /></span><div><span className="eyebrow">PERSONALIZED RECOMMENDATIONS</span><h2>Small steps, chosen for you.</h2></div></div><div className="recommendation-list">{recommendations.map(rec => <button className="recommendation-card" type="button" key={rec.id} onClick={() => rec.subjectId ? onStartQuiz(rec.subjectId) : rec.id === "missed-questions" ? onNavigate("history") : onNavigate("subjects")}><span>{rec.eyebrow}</span><strong>{rec.title}</strong><p>{rec.description}</p><em>{rec.action} <ArrowRight size={13} /></em></button>)}</div></section>
  </div>;
}

function SmartPracticeView({ state, onStartQuiz, onNavigate }: { state: LearnWiseState; onStartQuiz: (subjectId?: string) => void; onNavigate: (view: AppView) => void }) {
  const smart = getSmartPractice(state.attempts);
  const performance = getTopicPerformance(state.attempts);
  const recommendations = getRecommendations(state.attempts);
  return <div className="page-wrap"><div className="page-header"><div><span className="eyebrow">SMART PRACTICE / A CLEARER NEXT STEP</span><h1>Practice with a little more intention.</h1><p>Recommendations here are transparent, based on your stored accuracy and mistakes.</p></div><ActionButton onClick={() => smart.subjectId ? onStartQuiz(smart.subjectId) : onNavigate("subjects")}><Sparkles size={16} /> {smart.subjectId ? "Practice weakest topic" : "Explore subjects"}</ActionButton></div><div className="smart-hero"><div className="smart-hero-icon"><Sparkles size={24} /></div><div><EvidenceBadge tone={smart.type === "empty" ? "amber" : "green"}>{smart.type === "empty" ? "INSUFFICIENT DATA" : "BASED ON YOUR ATTEMPTS"}</EvidenceBadge><h2>{smart.title}</h2><p>{smart.description}</p></div>{smart.accuracy !== null && <div className="smart-score"><span>Current accuracy</span><strong>{smart.accuracy}%</strong></div>}</div><div className="smart-grid"><section className="panel"><PanelHeading eyebrow="NEXT BEST STEPS" title="Recommendations" />{recommendations.map(rec => <button className="smart-recommendation" key={rec.id} type="button" onClick={() => rec.subjectId ? onStartQuiz(rec.subjectId) : rec.id === "missed-questions" ? onNavigate("history") : onNavigate("subjects")}><span className="smart-rec-icon"><ArrowUpRight size={17} /></span><span><span className="eyebrow">{rec.eyebrow}</span><strong>{rec.title}</strong><p>{rec.description}</p><em>{rec.action} <ArrowRight size={13} /></em></span></button>)}</section><section className="panel"><PanelHeading eyebrow="TOPIC EVIDENCE" title="Where you stand" />{performance.length ? <div className="smart-topic-list">{performance.map(item => <div className="smart-topic" key={item.subjectId}><div className="smart-topic-head"><span><strong>{item.subjectName}</strong><small>{item.questions} questions · {item.correct} correct</small></span><b>{item.accuracy}%</b></div><div className="progress-rail"><span style={{ width: `${item.accuracy}%`, background: item.accuracy < 70 ? "#E07A5F" : "#4F46E5" }} /></div><button type="button" onClick={() => onStartQuiz(item.subjectId)}>Practice <ArrowRight size={13} /></button></div>)}</div> : <EmptyState title="Not enough evidence yet" description="Complete a few quizzes to receive personalized practice recommendations." action="Choose a topic" onAction={() => onNavigate("subjects")} />}</section></div></div>;
}

function ProgressView({ state, onStartQuiz }: { state: LearnWiseState; onStartQuiz: (subjectId?: string) => void }) {
  const stats = getDashboardStats(state.attempts);
  const performance = getTopicPerformance(state.attempts);
  const answerData = [{ name: "Correct", value: stats.correct, fill: "#4F46E5" }, { name: "Incorrect", value: Math.max(0, stats.questions - stats.correct), fill: "#F1A38F" }];
  return <div className="page-wrap"><div className="page-header"><div><span className="eyebrow">MY PROGRESS / THE BIG PICTURE</span><h1>See the work adding up.</h1><p>Your analytics are calculated from completed quizzes saved in this browser.</p></div><ActionButton variant="secondary" onClick={() => onStartQuiz()}><Play size={15} fill="currentColor" /> Add a new attempt</ActionButton></div><div className="stats-grid stats-grid-progress"><StatCard label="Accuracy" value={`${stats.accuracy}%`} detail={stats.questions ? `${stats.correct} correct answers` : "No quiz data yet"} icon={Target} tone="green" /><StatCard label="Questions" value={stats.questions} detail="Across every attempt" icon={BookOpenCheck} tone="blue" /><StatCard label="Topics" value={stats.topics} detail="With stored activity" icon={Layers3} tone="indigo" /><StatCard label="Learning progress" value={`${stats.progress}%`} detail={stats.progress ? "Based on correct answers" : "Starts with your first quiz"} icon={Flame} tone="amber" /></div><div className="progress-grid"><section className="panel progress-subjects"><PanelHeading eyebrow="TOPIC PERFORMANCE" title="Your learning map" />{performance.length ? performance.map(item => <div className="progress-subject-row" key={item.subjectId}><div className="progress-subject-meta"><span className="topic-row-icon" style={{ color: item.accent, background: `${item.accent}15` }}>{getSubject(item.subjectId) && <SubjectIcon subject={getSubject(item.subjectId)!} size={17} />}</span><span><strong>{item.subjectName}</strong><small>{item.attempts} attempt{item.attempts === 1 ? "" : "s"} · {item.questions} questions</small></span><b>{item.accuracy}%</b></div><div className="progress-rail"><span style={{ width: `${item.accuracy}%`, background: item.accent }} /></div><button type="button" onClick={() => onStartQuiz(item.subjectId)}>Practice again <ArrowRight size={13} /></button></div>) : <EmptyState title="Your first quiz will start the map" description="Choose a topic to see accuracy, questions, and progress here." action="Explore subjects" onAction={() => onStartQuiz()} />}</section><section className="panel answer-panel"><PanelHeading eyebrow="ANSWER BREAKDOWN" title="Correct vs incorrect" />{state.attempts.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={answerData} innerRadius={56} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">{answerData.map(item => <Cell key={item.name} fill={item.fill} />)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>{stats.accuracy}%</strong><span>accuracy</span></div></div><div className="answer-legend">{answerData.map(item => <div key={item.name}><span className="legend-dot" style={{ background: item.fill }} /><span>{item.name}</span><b>{item.value}</b></div>)}</div></> : <EmptyState title="Nothing to break down yet" description="Complete a quiz to see how your answers are landing." action="Start a quiz" onAction={() => onStartQuiz()} />}</section></div></div>;
}

function HistoryView({ state, onReview, onStartQuiz }: { state: LearnWiseState; onReview: (attempt: QuizAttempt) => void; onStartQuiz: () => void }) {
  return <div className="page-wrap"><div className="page-header"><div><span className="eyebrow">QUIZ HISTORY / YOUR NOTEBOOK</span><h1>Every attempt leaves a trail.</h1><p>Review your answers, revisit explanations, and notice your progress over time.</p></div><ActionButton onClick={onStartQuiz}><Play size={15} fill="currentColor" /> New quiz</ActionButton></div><section className="panel history-panel"><PanelHeading eyebrow="MOST RECENT FIRST" title={`${state.attempts.length} saved attempt${state.attempts.length === 1 ? "" : "s"}`} />{state.attempts.length ? <div className="history-list">{state.attempts.map(attempt => <div className="history-row" key={attempt.id}><span className="history-date"><strong>{new Date(attempt.completedAt).toLocaleDateString("en", { day: "2-digit" })}</strong><small>{new Date(attempt.completedAt).toLocaleDateString("en", { month: "short" })}</small></span><span className="history-subject"><strong>{attempt.subjectName}</strong><small>{attempt.total} questions · {formatDate(attempt.completedAt)}</small></span><span className="history-score"><strong>{attempt.accuracy}%</strong><small>{attempt.score}/{attempt.total} correct</small></span><button className="history-review" type="button" onClick={() => onReview(attempt)}>Review answers <ArrowRight size={14} /></button></div>)}</div> : <EmptyState title="Your quiz history is ready for its first page" description="Complete a quiz and your attempt will be saved here automatically." action="Explore subjects" onAction={onStartQuiz} />}</section></div>;
}

function ProfileView({ state, onReset }: { state: LearnWiseState; onReset: () => void }) {
  return <div className="page-wrap"><div className="page-header"><div><span className="eyebrow">PROFILE / LOCAL SESSION</span><h1>Your learning identity.</h1><p>These details personalize your experience without sending anything to a backend.</p></div></div><div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">{state.profile?.name.slice(0, 1).toUpperCase() ?? "L"}</div><div><EvidenceBadge tone="green">LOCAL PROFILE</EvidenceBadge><h2>{state.profile?.name ?? "Learner"}</h2><p>{state.profile?.email ?? "No email saved"}</p></div><div className="profile-divider" /><div className="profile-detail"><span><UserRound size={15} /> Name</span><strong>{state.profile?.name ?? "—"}</strong></div><div className="profile-detail"><span><Search size={15} /> Email</span><strong>{state.profile?.email ?? "—"}</strong></div></section><section className="panel privacy-card"><div className="privacy-icon"><LockKeyhole size={19} /></div><span className="eyebrow">PROTOTYPE PRIVACY NOTE</span><h2>Your password is not stored.</h2><p>LearnLoop uses your password only to validate this onboarding form. The prototype stores your name, email, and quiz attempts in browser localStorage so your progress survives a refresh.</p><button className="reset-link" type="button" onClick={onReset}><RotateCcw size={14} /> Reset local learning data</button></section></div></div>;
}

function ResultsView({ attempt, onDashboard, onReview, onTheory }: { attempt: QuizAttempt; onDashboard: () => void; onReview: () => void; onTheory: () => void }) {
  const message = attempt.accuracy >= 80 ? "Great work! You have a strong understanding of this topic." : attempt.accuracy >= 50 ? "Good progress! A little more practice can help you improve." : "Keep going! Review the explanations and try Smart Practice to strengthen your understanding.";
  const weakTopic = getWeakTopic(attempt);
  return <div className="page-wrap results-wrap"><div className="results-top"><button className="back-link" type="button" onClick={onDashboard}><ArrowLeft size={15} /> Dashboard</button><EvidenceBadge tone="green">QUIZ COMPLETE</EvidenceBadge></div><div className="results-heading"><span className="eyebrow">YOUR PERFORMANCE / {attempt.subjectName.toUpperCase()}</span><h1>That’s a useful signal.</h1><p>{message}</p></div><section className="results-grid"><div className="panel score-panel"><div className="score-ring" style={{ background: `conic-gradient(#4F46E5 ${attempt.accuracy * 3.6}deg, #ECECF4 0deg)` }}><div><strong>{attempt.accuracy}%</strong><span>accuracy</span></div></div><div className="score-caption"><span className="eyebrow">FINAL SCORE</span><strong>{attempt.score} <small>/ {attempt.total}</small></strong><span>{attempt.subjectName} · {formatDate(attempt.completedAt)}</span></div></div><div className="panel results-summary"><PanelHeading eyebrow="WHAT HAPPENED" title="Your answer summary" /><div className="result-stat-row"><div><span className="result-icon result-correct"><Check size={16} /></span><span><strong>{attempt.score}</strong><small>Correct answers</small></span></div><div><span className="result-icon result-incorrect"><X size={16} /></span><span><strong>{attempt.total - attempt.score}</strong><small>Incorrect answers</small></span></div></div><div className="result-bar"><span style={{ width: `${attempt.accuracy}%` }} /></div><p className="result-note"><Lightbulb size={15} /> Weakest area: <b>{weakTopic.topic}</b> ({weakTopic.accuracy}%). Read the theory before your next practice set.</p></div></section><div className="results-actions"><ActionButton variant="secondary" onClick={onReview}><BookOpenCheck size={16} /> Review answers</ActionButton><ActionButton variant="secondary" onClick={onTheory}><Lightbulb size={16} /> Read weak-topic theory</ActionButton><ActionButton onClick={onDashboard}>Go to dashboard <ArrowRight size={16} /></ActionButton></div></div>;
}

function ReviewView({ attempt, onBack, onRetry }: { attempt: QuizAttempt; onBack: () => void; onRetry: () => void }) {
  return <div className="page-wrap review-wrap"><div className="page-header"><div><button className="back-link" type="button" onClick={onBack}><ArrowLeft size={15} /> Back to results</button><span className="eyebrow review-eyebrow">REVIEW / {attempt.subjectName.toUpperCase()}</span><h1>Review the reasoning, not just the score.</h1><p>{attempt.score} of {attempt.total} answers were correct on {formatDate(attempt.completedAt)}.</p></div><ActionButton variant="secondary" onClick={onRetry}><RotateCcw size={15} /> Try this topic again</ActionButton></div><div className="review-list">{attempt.responses.map((response, index) => <article className={`panel review-card ${response.isCorrect ? "review-card-correct" : "review-card-incorrect"}`} key={response.questionId}><div className="review-number">0{index + 1}</div><div className="review-content"><div className="review-meta"><span>{response.topic}</span><strong>{response.isCorrect ? <><CheckCircle2 size={14} /> Correct</> : <><CircleAlert size={14} /> Review this</>}</strong></div><h2>{response.question}</h2><div className="review-answer-row"><span>Your answer</span><b className={response.isCorrect ? "review-answer-good" : "review-answer-bad"}>{response.selectedAnswer}</b></div><div className="review-answer-row"><span>Correct answer</span><b className="review-answer-good">{response.correctAnswer}</b></div><div className="review-explanation"><Lightbulb size={15} /><p>{response.explanation}</p></div></div></article>)}</div></div>;
}

export default function Home() {
  const [appState, setAppState] = useState<LearnWiseState>(() => loadState());
  const [view, setView] = useState<AppView>(() => (appState.profile ? (loadActiveQuiz() ? "quiz" : "dashboard") : "details"));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(() => appState.selectedSubjectId);
  const [quiz, setQuiz] = useState<QuizSession | null>(() => loadActiveQuiz());
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(() => appState.attempts[0] ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (quiz) window.localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(quiz));
    else window.localStorage.removeItem(ACTIVE_QUIZ_KEY);
  }, [quiz]);

  const updateState = (updater: (state: LearnWiseState) => LearnWiseState) => {
    setAppState(previous => {
      const next = updater(previous);
      saveState(next);
      return next;
    });
  };

  const continueWithProfile = (name: string, email: string) => {
    updateState(previous => ({ ...previous, profile: { name, email } }));
    setView("subjects");
  };

  const startQuiz = (subjectId = selectedSubjectId ?? subjects[0].id) => {
    const subject = getSubject(subjectId);
    if (!subject) return;
    setSelectedSubjectId(subjectId);
    updateState(previous => ({ ...previous, selectedSubjectId: subjectId }));
    beginPractice(subjectId, appState.attempts.length ? "adaptive-practice" : "diagnostic");
  };

  const beginPractice = (subjectId = selectedSubjectId ?? subjects[0].id, mode: QuizSession["mode"] = "adaptive-practice") => {
    const subject = getSubject(subjectId);
    const usedQuestionIds = appState.attempts.filter(attempt => attempt.subjectId === subjectId).flatMap(attempt => attempt.responses.map(response => response.questionId));
    const questions = getQuestionsForSubject(subjectId, usedQuestionIds);
    if (!subject || questions.length < 10) return;
    setSelectedSubjectId(subjectId);
    updateState(previous => ({ ...previous, selectedSubjectId: subjectId }));
    setQuiz({ subjectId, mode, questions, currentIndex: 0, selectedIndex: null, submitted: false, responses: [], startedAt: Date.now() });
    setView("quiz");
  };

  const currentResponse = (session: QuizSession): QuizResponse | null => {
    const question = session.questions[session.currentIndex];
    if (session.selectedIndex === null) return null;
    return { questionId: question.id, conceptId: getConceptForTopic(session.subjectId, question.topic).id, question: question.prompt, selectedIndex: session.selectedIndex, selectedAnswer: question.options[session.selectedIndex], correctIndex: question.correctIndex, correctAnswer: question.options[question.correctIndex], isCorrect: session.selectedIndex === question.correctIndex, explanation: question.explanation, topic: question.topic };
  };

  const submitAnswer = () => {
    if (!quiz || quiz.selectedIndex === null || quiz.submitted) return;
    setQuiz(previous => previous ? { ...previous, submitted: true } : previous);
  };

  const finishQuiz = (responses: QuizResponse[]) => {
    if (!quiz) return;
    const subject = getSubject(quiz.subjectId);
    if (!subject) return;
    const score = responses.filter(response => response.isCorrect).length;
    const attempt: QuizAttempt = { id: `attempt-${Date.now()}`, subjectId: quiz.subjectId, subjectName: subject.name, topic: subject.name, responses, score, total: responses.length, accuracy: responses.length ? Math.round((score / responses.length) * 100) : 0, completedAt: new Date().toISOString() };
    updateState(previous => ({ ...previous, attempts: [attempt, ...previous.attempts], selectedSubjectId: quiz.subjectId }));
    setLastAttempt(attempt);
    setQuiz(null);
    setView("results");
  };

  const nextQuestion = () => {
    if (!quiz || !quiz.submitted) return;
    const response = currentResponse(quiz);
    if (!response) return;
    const responses = [...quiz.responses, response];
    if (quiz.currentIndex >= quiz.questions.length - 1) finishQuiz(responses);
    else setQuiz(previous => previous ? { ...previous, responses, currentIndex: previous.currentIndex + 1, selectedIndex: null, submitted: false } : previous);
  };

  const reviewAttempt = (attempt: QuizAttempt) => { setLastAttempt(attempt); setView("review"); };
  const reset = () => { if (!window.confirm("Reset your local profile and quiz history?")) return; clearBrowserState(); };
  const clearBrowserState = () => { window.localStorage.removeItem("learnwise-ai-state-v1"); window.localStorage.removeItem(ACTIVE_QUIZ_KEY); setAppState(emptyState); setSelectedSubjectId(null); setLastAttempt(null); setQuiz(null); setView("details"); };

  if (view === "details") return <DetailsScreen onContinue={continueWithProfile} />;
  if (view === "subjects" && !appState.profile) return <SubjectSelection selectedSubjectId={selectedSubjectId} onSelect={setSelectedSubjectId} onStart={() => startQuiz()} onBack={() => setView("details")} />;
  if (view === "theory" && selectedSubjectId) {
    const subject = getSubject(selectedSubjectId);
    if (subject) return <TheoryScreen subject={subject} focusTopic={lastAttempt ? getWeakTopic(lastAttempt).topic : undefined} onStart={() => beginPractice(subject.id)} onBack={() => setView(lastAttempt ? "results" : "subjects")} />;
  }
  if (view === "quiz" && quiz) {
    const subject = getSubject(quiz.subjectId);
    if (subject) return <QuizScreen session={quiz} subject={subject} onSelect={index => setQuiz(previous => previous && !previous.submitted ? { ...previous, selectedIndex: index } : previous)} onSubmit={submitAnswer} onNext={nextQuestion} onExit={() => { setQuiz(null); setView("dashboard"); }} />;
  }
  if (view === "results" && lastAttempt) return <AppShell view="dashboard" onNavigate={next => next === "subjects" ? setView("subjects") : setView(next)}><ResultsView attempt={lastAttempt} onDashboard={() => setView("dashboard")} onReview={() => setView("review")} onTheory={() => { setSelectedSubjectId(lastAttempt.subjectId); setView("theory"); }} /></AppShell>;
  if (view === "review" && lastAttempt) return <AppShell view="history" onNavigate={next => next === "subjects" ? setView("subjects") : setView(next)}><ReviewView attempt={lastAttempt} onBack={() => setView("results")} onRetry={() => { setSelectedSubjectId(lastAttempt.subjectId); setView("theory"); }} /></AppShell>;

  const navigate = (next: AppView) => {
    if (next === "subjects") setSelectedSubjectId(null);
    setView(next);
  };
  return <AppShell view={view} onNavigate={navigate}>{view === "dashboard" && <DashboardView state={appState} onNavigate={navigate} onStartQuiz={startQuiz} onReview={reviewAttempt} />}{view === "subjects" && <SubjectSelection embedded selectedSubjectId={selectedSubjectId} onSelect={setSelectedSubjectId} onStart={() => startQuiz()} />}{view === "smart" && <SmartPracticeView state={appState} onStartQuiz={startQuiz} onNavigate={navigate} />}{view === "progress" && <ProgressView state={appState} onStartQuiz={startQuiz} />}{view === "history" && <HistoryView state={appState} onReview={reviewAttempt} onStartQuiz={() => navigate("subjects")} />}{view === "profile" && <ProfileView state={appState} onReset={reset} />}</AppShell>;
}
