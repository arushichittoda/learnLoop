# LearnLoop

LearnLoop is an adaptive computer science learning platform. It begins with a diagnostic assessment, maps answers to concept nodes, identifies direct and prerequisite learning gaps, tracks concept mastery, and creates a personalized practice and curriculum loop.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm or pnpm

### Installation

From the project root directory:

```bash
npm install
```

### Running Locally

To start the development server:

```bash
npm run dev:static
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.

To start the full-stack server:

```bash
npm run dev
```

### Building for Production

```bash
npm run build:static
```

Static build artifacts will be output to `dist/public/`.

## Architecture Overview

| File | Purpose |
|---|---|
| `client/src/pages/Home.tsx` | Main application interface (onboarding, quiz engine, dashboard, progress) |
| `client/src/data/quizData.ts` | Subject catalog, curated questions, and theory explanations |
| `client/src/data/conceptGraph.ts` | Prerequisite-aware concept graph definitions |
| `client/src/lib/adaptiveLearning.ts` | Mastery calculation, gap identification, and personalized curriculum sequencing |
| `client/src/lib/learnwiseStorage.ts` | Local client-side storage persistence and session history |
| `client/src/index.css` | Styling and responsive design |
