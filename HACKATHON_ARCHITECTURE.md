# LearnLoop AI — Hackathon Architecture

## Implemented learning loop

```text
10-question diagnostic assessment
        ↓
Concept mapper + response evidence
        ↓
Prerequisite-aware gap analyzer
        ↓
Mastery and confidence update
        ↓
Personalized curriculum synthesizer
        ↓
Micro-lesson → guided drill → checkpoint
        ↓
Fresh adaptive practice set
```

## What is implemented in the prototype

- **Diagnostic Assessment Module:** the first quiz is labeled as a diagnostic baseline and contains 10 questions.
- **Concept Graph:** `client/src/data/conceptGraph.ts` defines stable concept IDs, prerequisite edges, grounded lesson summaries, examples, and checks.
- **Gap Analyzer:** incorrect responses map to direct concepts and propagate attention to under-evidenced prerequisites.
- **Mastery Model:** `client/src/lib/adaptiveLearning.ts` computes concept-level mastery, confidence, evidence count, and trend from stored response events.
- **Personalized Curriculum Synthesizer:** the engine creates ordered micro-lesson, guided-drill, and checkpoint steps from the highest-priority gaps.
- **Adaptive Feedback Loop:** every submitted response is stored with a concept ID; the next dashboard view recalculates mastery and curriculum from the updated evidence.
- **Fresh practice:** question IDs from completed attempts are excluded from the next subject practice set whenever at least 10 unseen questions remain.
- **Transparent fallback:** lessons and question explanations come from grounded local content, so the demo works offline and does not expose provider API keys in browser code.

## Optional production AI architecture

For a production deployment, keep the current `adaptiveLearning.ts` interface and replace only the curriculum-content adapter behind a server boundary:

```text
React client
   ↓ authenticated API
Next.js / Node learning service
   ├── adaptive state engine (deterministic)
   ├── gap analyzer (deterministic)
   ├── retrieval adapter (Chroma, pgvector, or managed vector DB)
   └── content generator adapter (OpenAI, Anthropic, or Groq via LangChain/LlamaIndex)
```

LLM-generated lessons should be returned as schema-validated JSON, grounded in retrieved concept sources, cached by concept and mastery state, and always fall back to the local lesson templates if generation fails. Mastery must never be set directly by a model response; it should remain determined by assessment evidence.

## Suggested judge walkthrough

1. Create a learner profile and select Python or Data Structures & Algorithms.
2. Complete the diagnostic quiz and submit varied answers.
3. Open Results to see the weakest response topic.
4. Read the weak-topic theory and start a fresh practice set.
5. Return to the dashboard to see concept mastery, confidence, detected prerequisite gaps, and the generated learning path.
6. Repeat practice to show the updated evidence and changing mastery trend.
