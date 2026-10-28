export type SubjectCategory =
  | "Programming Languages"
  | "Core Programming Concepts"
  | "Computer Science Fundamentals";

export type Subject = {
  id: string;
  name: string;
  category: SubjectCategory;
  description: string;
  accent: string;
  icon: "code" | "braces" | "database" | "network" | "layers" | "terminal" | "coffee";
};

export type QuizQuestion = {
  id: string;
  subjectId: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const subjects: Subject[] = [
  { id: "python", name: "Python", category: "Programming Languages", description: "Syntax, control flow, and the building blocks of clean Python.", accent: "#3776AB", icon: "code" },
  { id: "javascript", name: "JavaScript", category: "Programming Languages", description: "Modern language fundamentals for interactive web experiences.", accent: "#D7A400", icon: "braces" },
  { id: "java", name: "Java", category: "Programming Languages", description: "Object-oriented foundations, types, and core language patterns.", accent: "#B45309", icon: "coffee" as Subject["icon"] },
  { id: "cpp", name: "C++", category: "Programming Languages", description: "Memory-aware programming, syntax, and standard library basics.", accent: "#2563EB", icon: "code" },
  { id: "c", name: "C", category: "Programming Languages", description: "The fundamentals of procedural programming and memory.", accent: "#0E7490", icon: "terminal" },
  { id: "sql", name: "SQL", category: "Programming Languages", description: "Query data confidently with relational database fundamentals.", accent: "#7C3AED", icon: "database" },
  { id: "dsa", name: "Data Structures & Algorithms", category: "Core Programming Concepts", description: "Choose the right structure and reason about efficiency.", accent: "#4F46E5", icon: "layers" },
  { id: "oop", name: "Object-Oriented Programming", category: "Core Programming Concepts", description: "Model systems with classes, objects, and clear responsibilities.", accent: "#9333EA", icon: "braces" },
  { id: "arrays", name: "Arrays & Strings", category: "Core Programming Concepts", description: "Manipulate sequences and solve everyday coding problems.", accent: "#DB2777", icon: "layers" },
  { id: "pointers", name: "Pointers & References", category: "Core Programming Concepts", description: "Build a clear mental model for values, addresses, and aliases.", accent: "#EA580C", icon: "terminal" },
  { id: "linked-lists", name: "Linked Lists", category: "Core Programming Concepts", description: "Understand nodes, links, and flexible sequence operations.", accent: "#0891B2", icon: "network" },
  { id: "stacks-queues", name: "Stacks & Queues", category: "Core Programming Concepts", description: "Practice LIFO and FIFO thinking with familiar examples.", accent: "#16A34A", icon: "layers" },
  { id: "search-sort", name: "Searching & Sorting", category: "Core Programming Concepts", description: "Compare classic algorithms and their performance trade-offs.", accent: "#CA8A04", icon: "layers" },
  { id: "recursion", name: "Recursion", category: "Core Programming Concepts", description: "Break problems down with base cases and smaller calls.", accent: "#7C3AED", icon: "code" },
  { id: "dbms", name: "Database Management Systems", category: "Computer Science Fundamentals", description: "Schemas, keys, and reliable ways to work with data.", accent: "#4F46E5", icon: "database" },
  { id: "operating-systems", name: "Operating Systems", category: "Computer Science Fundamentals", description: "Processes, memory, and the software beneath applications.", accent: "#1D4ED8", icon: "terminal" },
  { id: "networks", name: "Computer Networks", category: "Computer Science Fundamentals", description: "Move from packets to protocols with practical fundamentals.", accent: "#0F766E", icon: "network" },
  { id: "html-css", name: "HTML & CSS", category: "Computer Science Fundamentals", description: "Build accessible structure and confident visual styling.", accent: "#E11D48", icon: "code" },
  { id: "react", name: "React Fundamentals", category: "Computer Science Fundamentals", description: "Compose interfaces with components, props, and state.", accent: "#0284C7", icon: "layers" },
];

const q = (
  id: string,
  subjectId: string,
  topic: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  difficulty: QuizQuestion["difficulty"] = "Beginner",
): QuizQuestion => ({ id, subjectId, topic, prompt, options, correctIndex, explanation, difficulty });

export const questionBank: QuizQuestion[] = [
  q("py-1", "python", "Python basics", "Which keyword starts a conditional branch in Python?", ["when", "if", "check", "case"], 1, "Python uses the `if` keyword to evaluate a condition and begin a conditional block."),
  q("py-2", "python", "Python collections", "Which Python collection stores unique values without preserving duplicates?", ["List", "Tuple", "Set", "Dictionary"], 2, "A set stores distinct values. Adding the same value again does not create another copy."),
  q("js-1", "javascript", "JavaScript variables", "Which declaration creates a block-scoped variable that can be reassigned?", ["var", "let", "const", "static"], 1, "`let` creates a block-scoped binding and allows the binding to be reassigned later."),
  q("js-2", "javascript", "JavaScript arrays", "Which method adds an item to the end of a JavaScript array?", ["shift()", "slice()", "push()", "join()"], 2, "`push()` appends one or more values to the end of an array and returns the new length."),
  q("java-1", "java", "Java classes", "Which keyword is used to declare a class in Java?", ["function", "class", "define", "object"], 1, "In Java, the `class` keyword introduces a class declaration."),
  q("java-2", "java", "Java inheritance", "Which keyword lets a Java class inherit from another class?", ["inherits", "extends", "super", "implements"], 1, "A class uses `extends` to inherit from a single parent class."),
  q("cpp-1", "cpp", "C++ output", "Which stream is conventionally used for standard output in C++?", ["std::cin", "std::cout", "std::print", "std::out"], 1, "`std::cout` is the standard output stream provided by the iostream library."),
  q("cpp-2", "cpp", "C++ references", "What does a reference in C++ provide?", ["A second name for an existing object", "A new heap allocation", "A copy with a new address", "A compile-time constant"], 0, "A reference is an alias for an existing object; it does not create a separate object."),
  q("c-1", "c", "C functions", "Which function is the usual entry point of a C program?", ["start()", "run()", "main()", "program()"], 2, "Execution of a standard C program begins in the `main` function."),
  q("c-2", "c", "C pointers", "Which operator obtains the address of a variable in C?", ["*", "&", "->", "#"], 1, "The address-of operator `&` produces the memory address of its operand."),
  q("sql-1", "sql", "SQL queries", "Which SQL command retrieves rows from a table?", ["GET", "SELECT", "READ", "FETCH"], 1, "`SELECT` queries data from one or more tables or views."),
  q("sql-2", "sql", "SQL filtering", "Which clause filters rows before they are returned?", ["ORDER BY", "GROUP BY", "WHERE", "LIMIT"], 2, "The `WHERE` clause applies a row-level condition to filter query results."),
  q("dsa-1", "dsa", "Algorithm complexity", "Which notation describes the upper-bound growth of an algorithm?", ["Big O", "Big S", "Big R", "Big X"], 0, "Big O notation describes an algorithm's upper-bound growth as input size increases."),
  q("dsa-2", "dsa", "Data structures", "Which structure follows first-in, first-out order?", ["Stack", "Queue", "Tree", "Graph"], 1, "A queue removes items in the same order they were added: first in, first out."),
  q("oop-1", "oop", "OOP concepts", "Which OOP principle hides internal details behind a simpler interface?", ["Inheritance", "Abstraction", "Iteration", "Compilation"], 1, "Abstraction exposes the essential interface while keeping unnecessary implementation details hidden."),
  q("oop-2", "oop", "OOP concepts", "What is an object?", ["A blueprint for a class", "An instance of a class", "A database row only", "A compiler directive"], 1, "An object is a concrete instance created from a class definition."),
  q("arrays-1", "arrays", "Arrays", "In a zero-indexed array, what is the index of the first element?", ["0", "1", "-1", "Depends on the language"], 0, "Zero-indexed sequences begin at index 0, so the first element is stored at position 0."),
  q("arrays-2", "arrays", "Strings", "Which operation combines two strings into one?", ["Concatenation", "Hashing", "Casting", "Iteration"], 0, "Concatenation joins two strings into a single sequence of characters."),
  q("pointers-1", "pointers", "Pointers", "A pointer variable stores what?", ["A memory address", "Only a string", "A CPU instruction", "A class definition"], 0, "A pointer stores the address of another value in memory."),
  q("pointers-2", "pointers", "References", "What is the safest everyday description of a reference?", ["An alias to an existing value", "A brand-new value", "A deleted pointer", "A network request"], 0, "A reference gives another name to an existing value rather than copying it."),
  q("linked-lists-1", "linked-lists", "Linked lists", "What does a linked-list node typically contain besides its value?", ["A link to another node", "A SQL query", "A CSS rule", "A random number"], 0, "A node stores a value plus a link, often called `next`, to another node."),
  q("linked-lists-2", "linked-lists", "Linked lists", "What is a common advantage of inserting at the head of a linked list?", ["Constant-time insertion", "Always sorted output", "No memory use", "Binary search"], 0, "With a head pointer, inserting at the front can be done in constant time."),
  q("stacks-queues-1", "stacks-queues", "Stacks", "Which principle does a stack follow?", ["FIFO", "LIFO", "Random order", "Priority only"], 1, "A stack is last in, first out: the newest item is removed first."),
  q("stacks-queues-2", "stacks-queues", "Queues", "Which operation typically removes an item from a queue?", ["Enqueue", "Push", "Dequeue", "Peek-only"], 2, "Dequeue removes the item at the front of a queue."),
  q("search-sort-1", "search-sort", "Searching", "What must be true before using binary search?", ["The data is sorted", "The data is duplicated", "The data is stored in a stack", "The data is text"], 0, "Binary search repeatedly halves the search range, which requires sorted data."),
  q("search-sort-2", "search-sort", "Sorting", "Which sorting algorithm repeatedly swaps adjacent out-of-order items?", ["Merge sort", "Bubble sort", "Radix sort", "Heap sort"], 1, "Bubble sort compares adjacent items and swaps them when they are in the wrong order."),
  q("recursion-1", "recursion", "Recursion", "What must every useful recursive function include?", ["A base case", "A database", "A global variable", "A network call"], 0, "A base case stops the recursive calls when the problem is small enough to solve directly."),
  q("recursion-2", "recursion", "Recursion", "A recursive step should usually move the input toward what?", ["A larger problem", "The base case", "A random state", "A new program"], 1, "Each recursive call should reduce or simplify the input so it eventually reaches the base case."),
  q("dbms-1", "dbms", "DBMS keys", "What is the main role of a primary key?", ["Uniquely identify a row", "Sort every table", "Encrypt a database", "Create a backup"], 0, "A primary key uniquely identifies each row in a table."),
  q("dbms-2", "dbms", "DBMS queries", "What does a database index primarily help with?", ["Faster lookups", "Larger images", "Replacing backups", "Removing all constraints"], 0, "An index is an additional data structure that can make lookups more efficient."),
  q("operating-systems-1", "operating-systems", "Operating systems", "Which resource does an operating system schedule for execution?", ["Processes or threads", "Only HTML tags", "Database tables", "Image pixels"], 0, "The operating system schedules processes or threads so they can share CPU time."),
  q("operating-systems-2", "operating-systems", "Operating systems", "Virtual memory uses which storage as an extension of RAM?", ["Disk storage", "The keyboard", "A monitor", "A compiler"], 0, "Virtual memory can use disk storage to extend the address space available to programs."),
  q("networks-1", "networks", "Networks", "Which protocol is used to resolve a domain name to an IP address?", ["DNS", "HTML", "CSS", "SQL"], 0, "DNS maps human-readable domain names to IP addresses."),
  q("networks-2", "networks", "Networks", "What does HTTP primarily define?", ["Web communication rules", "CPU scheduling", "Image compression", "Database indexing"], 0, "HTTP defines how clients and servers exchange web requests and responses."),
  q("html-css-1", "html-css", "HTML", "Which element is the most appropriate top-level heading?", ["<h1>", "<head>", "<header>", "<title>"], 0, "`<h1>` is the semantic top-level heading for the main content of a page."),
  q("html-css-2", "html-css", "CSS", "Which CSS property changes the text color of an element?", ["font-style", "color", "text-decoration", "background"], 1, "The `color` property sets the foreground color of text."),
  q("react-1", "react", "React components", "What is a React component?", ["A reusable UI building block", "A database table", "A CSS file only", "A browser plugin"], 0, "A React component is a reusable piece of UI that can receive data and manage presentation."),
  q("react-2", "react", "React state", "Which hook is commonly used to add local state to a function component?", ["useEffect", "useState", "useMemo", "useRefOnly"], 1, "`useState` lets a function component store a value and update the UI when it changes."),
];

export const subjectCategories: SubjectCategory[] = [
  "Programming Languages",
  "Core Programming Concepts",
  "Computer Science Fundamentals",
];

export function getSubject(subjectId: string) {
  return subjects.find(subject => subject.id === subjectId);
}

const rotatingQuestionTemplates = [
  (name: string) => ({ topic: `${name} fundamentals`, prompt: `Which approach is most helpful when learning ${name}?`, options: ["Trace a small example and explain the result", "Memorize every advanced feature first", "Skip the inputs and inspect only the final output", "Change several parts at once"], correctIndex: 0, explanation: `A small trace makes the core idea of ${name} visible before you add complexity.` }),
  (name: string) => ({ topic: `${name} fundamentals`, prompt: `When a ${name} program behaves unexpectedly, what is a strong first step?`, options: ["Check the input and each intermediate value", "Delete the whole program", "Add random features", "Ignore the output"], correctIndex: 0, explanation: "Checking the path from input to output helps isolate where the behavior changed." }),
  (name: string) => ({ topic: `${name} fundamentals`, prompt: `What makes a beginner's ${name} solution easier to understand?`, options: ["Descriptive names and one clear responsibility per step", "The shortest possible variable names", "Unexplained clever tricks", "Many unrelated operations in one line"], correctIndex: 0, explanation: "Readable names and focused steps make reasoning and debugging easier." }),
  (name: string) => ({ topic: `${name} problem solving`, prompt: `Before optimizing ${name} code, what should you confirm first?`, options: ["That the simple version is correct", "That it uses the most advanced syntax", "That it has no comments", "That it is as short as possible"], correctIndex: 0, explanation: "Correctness is the foundation; optimization is meaningful only after the behavior is right." }),
  (name: string) => ({ topic: `${name} problem solving`, prompt: `What is a useful way to compare two ${name} solutions?`, options: ["Compare correctness, clarity, and how work grows", "Choose the one with more punctuation", "Always choose the longer one", "Ignore the input size"], correctIndex: 0, explanation: "A good comparison considers whether both solutions work, how understandable they are, and how they scale." }),
  (name: string) => ({ topic: `${name} debugging`, prompt: `Why should you change one part at a time while debugging ${name}?`, options: ["It helps connect a change to its effect", "It guarantees no errors exist", "It makes the program run without input", "It removes the need for tests"], correctIndex: 0, explanation: "Small changes make cause and effect easier to observe." }),
  (name: string) => ({ topic: `${name} debugging`, prompt: `What is the purpose of a small test case for ${name}?`, options: ["Make the behavior easier to inspect", "Hide an error from the user", "Increase the number of unknowns", "Replace all documentation"], correctIndex: 0, explanation: "A small input reduces distractions and makes the expected behavior concrete." }),
  (name: string) => ({ topic: `${name} concepts`, prompt: `When a ${name} concept feels abstract, what usually helps most?`, options: ["Connect it to a concrete example", "Skip directly to advanced theory", "Avoid asking what changes", "Use more unrelated terminology"], correctIndex: 0, explanation: "Concrete examples connect new vocabulary to an observable result." }),
  (name: string) => ({ topic: `${name} concepts`, prompt: `Which habit supports long-term improvement in ${name}?`, options: ["Review mistakes and explain the correction", "Repeat the same answer without reflection", "Avoid practice until everything is known", "Only read solutions"], correctIndex: 0, explanation: "Reviewing mistakes turns feedback into a reusable mental model." }),
  (name: string) => ({ topic: `${name} concepts`, prompt: `What should a clear ${name} explanation include?`, options: ["The idea, a small example, and why the result follows", "Only a final answer", "A list of unexplained terms", "A claim that the code is always correct"], correctIndex: 0, explanation: "A clear explanation connects the concept to an example and its outcome." }),
  (name: string) => ({ topic: `${name} practice`, prompt: `What is a sensible next step after reading about ${name}?`, options: ["Solve a small problem without copying the example", "Jump to a completely unrelated topic", "Change the example without understanding it", "Avoid checking the result"], correctIndex: 0, explanation: "A small independent attempt shows whether the idea is understood." }),
  (name: string) => ({ topic: `${name} practice`, prompt: `Why is feedback useful while practicing ${name}?`, options: ["It shows which part of the mental model needs work", "It replaces all future learning", "It proves every answer was guessed", "It makes explanations unnecessary"], correctIndex: 0, explanation: "Feedback points to the next concept or step to review." }),
  (name: string) => ({ topic: `${name} syntax`, prompt: `What should you do when you forget a small piece of ${name} syntax?`, options: ["Look it up, then use it in a tiny example", "Guess repeatedly without checking", "Stop learning the concept", "Copy a large unrelated program"], correctIndex: 0, explanation: "Looking up syntax is normal; applying it in a small example makes it stick." }),
  (name: string) => ({ topic: `${name} syntax`, prompt: `Which result is most valuable from a first ${name} attempt?`, options: ["Knowing what worked and what to improve", "Never seeing an error", "Using every feature at once", "Avoiding an explanation"], correctIndex: 0, explanation: "A first attempt is useful when it creates evidence for the next attempt." }),
  (name: string) => ({ topic: `${name} design`, prompt: `What does separating a ${name} problem into steps help you do?`, options: ["Reason about one responsibility at a time", "Make every problem harder", "Remove the need for inputs", "Guarantee perfect performance"], correctIndex: 0, explanation: "Decomposition makes a problem easier to understand, test, and change." }),
  (name: string) => ({ topic: `${name} design`, prompt: `Which question helps you choose a good ${name} approach?`, options: ["What operation or behavior matters most here?", "Which code looks most mysterious?", "How can I avoid naming values?", "Can I skip testing?"], correctIndex: 0, explanation: "The important operation or behavior should guide the design choice." }),
  (name: string) => ({ topic: `${name} review`, prompt: `What is a useful way to review a ${name} answer?`, options: ["Explain why the correct result follows from the rules", "Read only the final line", "Assume the first answer is right", "Ignore edge cases"], correctIndex: 0, explanation: "Explaining the reasoning reveals whether the concept is understood rather than guessed." }),
  (name: string) => ({ topic: `${name} review`, prompt: `What should you do after finding a mistake in ${name} practice?`, options: ["Read the explanation and retry a changed example", "Erase the result and move on", "Repeat the same choice immediately", "Avoid the topic forever"], correctIndex: 0, explanation: "A changed example checks whether the correction transfers to a new situation." }),
];

function getRotatingQuestions(subject: Subject) {
  return rotatingQuestionTemplates.map((makeQuestion, index) => {
    const template = makeQuestion(subject.name);
    const shift = index % template.options.length;
    const options = [...template.options.slice(shift), ...template.options.slice(0, shift)];
    const correctIndex = (template.correctIndex - shift + template.options.length) % template.options.length;
    return q(`rotating-${subject.id}-${index + 1}`, subject.id, template.topic, template.prompt, options, correctIndex, template.explanation);
  });
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function getQuestionsForSubject(subjectId: string, excludedIds: string[] = []) {
  const subject = getSubject(subjectId);
  if (!subject) return [];
  const pool = [...questionBank.filter(question => question.subjectId === subjectId), ...getRotatingQuestions(subject)];
  const fresh = pool.filter(question => !excludedIds.includes(question.id));
  const candidates = fresh.length >= 10 ? fresh : pool;
  return shuffle(candidates).slice(0, 10);
}


export type TheoryContent = {
  headline: string;
  summary: string;
  whyItMatters: string;
  keyIdeas: Array<{ title: string; body: string }>;
  example: { title: string; code: string; walkthrough: string };
};

const theoryContent: Record<string, TheoryContent> = {
  python: {
    headline: "Python control flow: make decisions clearly",
    summary: "Control flow is how a program decides what to do, when to repeat work, and when to stop. In Python, readable indentation makes that logic visible.",
    whyItMatters: "Most useful programs combine data with decisions. A strong grasp of conditions and loops lets you turn a set of instructions into behavior that responds to real input.",
    keyIdeas: [
      { title: "Conditions choose a path", body: "Use if, elif, and else to run different blocks depending on whether an expression is true." },
      { title: "Loops repeat intentionally", body: "Use for when you have a sequence to visit and while when you need to continue until a condition changes." },
      { title: "Indentation is structure", body: "Python uses indentation to define a block, so consistent spacing is part of the program's meaning." },
    ],
    example: { title: "Label a score", code: "score = 72\n\nif score >= 60:\n    result = \"pass\"\nelse:\n    result = \"keep practicing\"\n\nprint(result)", walkthrough: "The condition checks the score once. Because 72 is at least 60, the first block runs and the program prints pass." },
  },
  javascript: {
    headline: "JavaScript variables and decisions",
    summary: "JavaScript gives a web page behavior by combining values, variables, functions, and conditions. The browser runs these instructions in response to events and data.",
    whyItMatters: "Understanding how values change is the foundation for interactive interfaces: toggles, forms, quiz answers, and every small response a user sees.",
    keyIdeas: [
      { title: "Prefer let and const", body: "Use const when a binding should not be reassigned and let when it needs to change. Both are block-scoped." },
      { title: "Values have types", body: "Strings, numbers, booleans, arrays, and objects behave differently, so check the kind of data you are working with." },
      { title: "Events connect user and code", body: "An event handler runs a function when something happens, such as a click, input, or submit." },
    ],
    example: { title: "Respond to a score", code: "const score = 8;\nlet message;\n\nif (score >= 5) {\n  message = \"Great start\";\n} else {\n  message = \"Try once more\";\n}", walkthrough: "const keeps the score binding stable while let allows message to receive one of two values based on the condition." },
  },
  java: {
    headline: "Java classes: model a responsibility",
    summary: "A class is a blueprint for objects. It groups data with methods that describe what an object knows and what it can do.",
    whyItMatters: "Good object-oriented design keeps related behavior together, making larger programs easier to understand, test, and extend.",
    keyIdeas: [
      { title: "Classes define shape", body: "Fields describe state, while methods describe behavior. A class can have constructors to create valid objects." },
      { title: "Objects are instances", body: "The new keyword creates an object from a class. Each object gets its own state." },
      { title: "Encapsulation protects state", body: "Keep fields private and expose focused methods so other code cannot change important state arbitrarily." },
    ],
    example: { title: "A small learner object", code: "class Learner {\n  String name;\n\n  Learner(String name) {\n    this.name = name;\n  }\n\n  void greet() {\n    System.out.println(\"Hi, \" + name);\n  }\n}", walkthrough: "The class stores a name and provides a greet method. Creating new Learner(\"Aisha\") gives that object its own name." },
  },
  cpp: {
    headline: "C++ references: another name for a value",
    summary: "A reference is an alias to an existing object. It lets a function work with the original value without copying it.",
    whyItMatters: "References are useful for efficient functions and clear APIs. They also help you distinguish changing an original value from changing a copy.",
    keyIdeas: [
      { title: "A reference needs a target", body: "A reference is initialized when it is declared and is not reseated to refer to a different object later." },
      { title: "Pass by reference to mutate", body: "A function parameter such as int& can change the caller's original variable." },
      { title: "Use const for read-only access", body: "A const reference avoids a copy while promising not to change the referenced value." },
    ],
    example: { title: "Double the original", code: "void doubleValue(int& value) {\n  value = value * 2;\n}\n\nint score = 6;\ndoubleValue(score);\n// score is now 12", walkthrough: "The ampersand makes value a reference to score. Assigning through value updates score itself." },
  },
  sql: {
    headline: "SQL filtering: ask for exactly what you need",
    summary: "SQL describes the data you want from a relational database. A SELECT query can choose columns, filter rows, and order the result.",
    whyItMatters: "Precise queries protect performance and make reports trustworthy. Filtering early means the database and your application handle less unnecessary data.",
    keyIdeas: [
      { title: "SELECT chooses columns", body: "Name the fields you need instead of using * when you know the shape of the result." },
      { title: "WHERE filters rows", body: "A WHERE condition is checked for each row before the result is returned." },
      { title: "ORDER BY shapes the result", body: "Use ORDER BY when the order matters; database tables do not promise a natural order." },
    ],
    example: { title: "Find strong quiz attempts", code: "SELECT subject, score\nFROM quiz_attempts\nWHERE score >= 80\nORDER BY score DESC;", walkthrough: "The query returns only subject and score, keeps rows at 80 or above, and places the highest score first." },
  },
  dsa: {
    headline: "Data structures and algorithms: choose with intent",
    summary: "A data structure organizes information; an algorithm transforms it. Together they determine how clearly and efficiently a program solves a problem.",
    whyItMatters: "The right choice can turn a slow solution into a responsive one. Start by understanding the operations you need most often.",
    keyIdeas: [
      { title: "Match the structure to the operation", body: "Stacks, queues, arrays, linked lists, trees, and hash maps each make different operations convenient." },
      { title: "Complexity describes growth", body: "Big O helps estimate how work or memory grows as the input becomes larger." },
      { title: "Correctness comes before cleverness", body: "A simple, readable algorithm that is correct is a stronger starting point than an unexplained optimization." },
    ],
    example: { title: "Linear search", code: "for (let i = 0; i < items.length; i++) {\n  if (items[i] === target) {\n    return i;\n  }\n}\nreturn -1;", walkthrough: "The algorithm checks each item until it finds the target. In the worst case it visits every item, so its time complexity is O(n)." },
  },
};

const fallbackTheory = (subject: Subject): TheoryContent => ({
  headline: `${subject.name}: build the mental model first`,
  summary: `${subject.name} becomes easier when you understand the core idea before memorizing syntax. This short lesson gives you the vocabulary and a small example to carry into practice.`,
  whyItMatters: `A clear mental model helps you predict what code will do, explain your reasoning, and recognize which pattern to use when a new problem appears.`,
  keyIdeas: [
    { title: "Name the building blocks", body: `Identify the main values, operations, and rules that make ${subject.name} different from a guess-and-check solution.` },
    { title: "Trace one example", body: "Follow the input from start to finish. Ask what changes after each step and why the output makes sense." },
    { title: "Practice the smallest version", body: "Start with a short, readable example, then add complexity only after the first version works." },
  ],
  example: { title: `${subject.name} in one small idea`, code: "input → rule → result\n\nStart with a simple input.\nApply one clear rule.\nCheck the result before adding more steps.", walkthrough: "The goal is not to memorize this placeholder pattern. Use it as a reminder to separate input, reasoning, and output while you learn the topic." },
});

export function getTheory(subjectId: string) {
  const subject = getSubject(subjectId);
  return theoryContent[subjectId] ?? fallbackTheory(subject ?? subjects[0]);
}
