# Running LearnLoop on Your Local PC

## Quick Start

1. Open a terminal in the project directory.
2. Ensure you have Node.js installed (v18 or newer recommended).
3. Install dependencies:

```bash
npm install
```

4. Start the application:

```bash
npm run dev:static
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
learnloop/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── pages/
│       │   ├── Home.tsx
│       │   └── NotFound.tsx
│       ├── data/
│       │   ├── quizData.ts
│       │   └── conceptGraph.ts
│       └── lib/
│           ├── adaptiveLearning.ts
│           └── learnwiseStorage.ts
└── README.md
```
