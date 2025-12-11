/**
 * Realm Quiz Seed Data Generator for Quiz Microservice
 * Creates quizzes for each realm's demo quests (20 quizzes per realm)
 * Run: node microservices/quiz-service/scripts/seed-realm-quizzes.js
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Load models
const Quiz = require("../models/Quiz");
const User = require("../models/User");

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/cognito-learning-hub";

const realms = [
  // Beginner realms (Easy difficulty)
  { name: "Mathematics Kingdom", category: "Mathematics", baseDifficulty: 0 },
  { name: "Language Realm", category: "Languages", baseDifficulty: 0 },
  // Easy-Medium realms
  { name: "Physics Universe", category: "Physics", baseDifficulty: 1 },
  { name: "Chemistry Lab", category: "Chemistry", baseDifficulty: 1 },
  { name: "Biology Forest", category: "Biology", baseDifficulty: 1 },
  { name: "History Archives", category: "History", baseDifficulty: 1 },
  // Medium realms
  {
    name: "Computer Science Hub",
    category: "Computer Science",
    baseDifficulty: 2,
  },
  { name: "Web Wizardry", category: "Web Development", baseDifficulty: 2 },
  { name: "Data Kingdom", category: "Data Science", baseDifficulty: 2 },
  // Medium-Hard realms
  { name: "Algorithmic Valley", category: "Algorithms", baseDifficulty: 3 },
  { name: "System Fortress", category: "Systems", baseDifficulty: 3 },
  // Hard realms
  {
    name: "AI Sanctuary",
    category: "Artificial Intelligence",
    baseDifficulty: 4,
  },
  { name: "Security Citadel", category: "Cybersecurity", baseDifficulty: 4 },
  { name: "Cloud Highlands", category: "Cloud Computing", baseDifficulty: 4 },
];

// Generate quiz questions based on realm and quest number
const generateQuizQuestions = (realm, questNum, difficulty) => {
  const realmQuestions = {
    "Mathematics Kingdom": [
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct_answer: "4",
        explanation: "Basic addition: 2 + 2 = 4",
      },
      {
        question: "What is the square root of 16?",
        options: ["2", "3", "4", "5"],
        correct_answer: "4",
        explanation: "√16 = 4 because 4 × 4 = 16",
      },
      {
        question: "What is 5 × 7?",
        options: ["30", "35", "40", "45"],
        correct_answer: "35",
        explanation: "5 multiplied by 7 equals 35",
      },
      {
        question: "What is 100 ÷ 4?",
        options: ["20", "25", "30", "35"],
        correct_answer: "25",
        explanation: "100 divided by 4 equals 25",
      },
      {
        question: "What is the value of π (pi) approximately?",
        options: ["2.14", "3.14", "4.14", "5.14"],
        correct_answer: "3.14",
        explanation: "Pi is approximately 3.14159...",
      },
    ],
    "Physics Universe": [
      {
        question: "What is the speed of light?",
        options: [
          "300,000 km/s",
          "150,000 km/s",
          "450,000 km/s",
          "600,000 km/s",
        ],
        correct_answer: "300,000 km/s",
        explanation:
          "The speed of light in vacuum is approximately 300,000 km/s",
      },
      {
        question: "What is Newton's First Law?",
        options: [
          "F=ma",
          "An object at rest stays at rest",
          "E=mc²",
          "Every action has a reaction",
        ],
        correct_answer: "An object at rest stays at rest",
        explanation:
          "Newton's First Law states that an object will remain at rest or in uniform motion unless acted upon by an external force",
      },
      {
        question: "What is gravity on Earth?",
        options: ["9.8 m/s²", "8.9 m/s²", "10.5 m/s²", "7.5 m/s²"],
        correct_answer: "9.8 m/s²",
        explanation:
          "Earth's gravitational acceleration is approximately 9.8 m/s²",
      },
      {
        question: "What is kinetic energy?",
        options: [
          "Energy of position",
          "Energy of motion",
          "Energy of heat",
          "Energy of light",
        ],
        correct_answer: "Energy of motion",
        explanation:
          "Kinetic energy is the energy an object possesses due to its motion",
      },
      {
        question: "What is the unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correct_answer: "Newton",
        explanation: "Force is measured in Newtons (N)",
      },
    ],
    "Chemistry Lab": [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "H2"],
        correct_answer: "H2O",
        explanation: "Water is composed of 2 hydrogen atoms and 1 oxygen atom",
      },
      {
        question: "What is the atomic number of Carbon?",
        options: ["4", "6", "8", "12"],
        correct_answer: "6",
        explanation: "Carbon has 6 protons, giving it an atomic number of 6",
      },
      {
        question: "What is the pH of pure water?",
        options: ["5", "7", "9", "11"],
        correct_answer: "7",
        explanation: "Pure water has a neutral pH of 7",
      },
      {
        question: "What is an element?",
        options: ["A mixture", "A compound", "A pure substance", "A solution"],
        correct_answer: "A pure substance",
        explanation:
          "An element is a pure substance that cannot be broken down by chemical means",
      },
      {
        question: "What is the symbol for Gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct_answer: "Au",
        explanation: "Gold's chemical symbol is Au from the Latin 'aurum'",
      },
    ],
    "Biology Forest": [
      {
        question: "What is photosynthesis?",
        options: [
          "Plants eating soil",
          "Plants making food from sunlight",
          "Plants breathing",
          "Plants drinking water",
        ],
        correct_answer: "Plants making food from sunlight",
        explanation:
          "Photosynthesis is the process where plants convert light energy into chemical energy",
      },
      {
        question: "What is DNA?",
        options: [
          "A type of cell",
          "Genetic material",
          "A protein",
          "An enzyme",
        ],
        correct_answer: "Genetic material",
        explanation:
          "DNA (Deoxyribonucleic acid) carries genetic instructions for all living organisms",
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        correct_answer: "Mitochondria",
        explanation: "Mitochondria generate most of the cell's energy (ATP)",
      },
      {
        question: "What is evolution?",
        options: [
          "Growth of organisms",
          "Change over time",
          "Reproduction",
          "Adaptation only",
        ],
        correct_answer: "Change over time",
        explanation:
          "Evolution is the change in heritable characteristics over successive generations",
      },
      {
        question: "What are genes made of?",
        options: ["Proteins", "DNA", "RNA only", "Carbohydrates"],
        correct_answer: "DNA",
        explanation:
          "Genes are segments of DNA that contain hereditary information",
      },
    ],
    "Computer Science Hub": [
      {
        question: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Utility",
          "Core Processing Unit",
        ],
        correct_answer: "Central Processing Unit",
        explanation:
          "CPU is the main processor that executes instructions in a computer",
      },
      {
        question: "What is a variable in programming?",
        options: [
          "A fixed value",
          "A container for storing data",
          "A function",
          "An error",
        ],
        correct_answer: "A container for storing data",
        explanation:
          "Variables are used to store and manipulate data in programs",
      },
      {
        question: "What is binary code?",
        options: [
          "A language",
          "Base-2 number system",
          "A programming language",
          "A data type",
        ],
        correct_answer: "Base-2 number system",
        explanation: "Binary uses only 0s and 1s to represent data",
      },
      {
        question: "What is an algorithm?",
        options: [
          "A bug",
          "Step-by-step instructions",
          "A data structure",
          "A variable",
        ],
        correct_answer: "Step-by-step instructions",
        explanation: "An algorithm is a set of instructions to solve a problem",
      },
      {
        question: "What does RAM stand for?",
        options: [
          "Read Access Memory",
          "Random Access Memory",
          "Rapid Access Mode",
          "Real Application Memory",
        ],
        correct_answer: "Random Access Memory",
        explanation:
          "RAM is temporary memory used by computers for active tasks",
      },
    ],
    "History Archives": [
      {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct_answer: "1945",
        explanation: "World War II ended in 1945 with the surrender of Japan",
      },
      {
        question: "Who was the first President of the United States?",
        options: [
          "Thomas Jefferson",
          "George Washington",
          "John Adams",
          "Benjamin Franklin",
        ],
        correct_answer: "George Washington",
        explanation:
          "George Washington served as the first President from 1789 to 1797",
      },
      {
        question: "When did the French Revolution begin?",
        options: ["1776", "1789", "1800", "1812"],
        correct_answer: "1789",
        explanation: "The French Revolution began in 1789",
      },
      {
        question: "What was the Renaissance?",
        options: ["A war", "Cultural rebirth", "A plague", "A religion"],
        correct_answer: "Cultural rebirth",
        explanation:
          "The Renaissance was a period of cultural, artistic, and intellectual rebirth",
      },
      {
        question: "Who discovered America in 1492?",
        options: [
          "Vasco da Gama",
          "Christopher Columbus",
          "Ferdinand Magellan",
          "Marco Polo",
        ],
        correct_answer: "Christopher Columbus",
        explanation: "Christopher Columbus reached the Americas in 1492",
      },
    ],
    "Language Realm": [
      {
        question: "What is a noun?",
        options: [
          "An action word",
          "A describing word",
          "A person, place, or thing",
          "A connecting word",
        ],
        correct_answer: "A person, place, or thing",
        explanation:
          "A noun is a word that names a person, place, thing, or idea",
      },
      {
        question: "What is a synonym?",
        options: [
          "Opposite meaning",
          "Same meaning",
          "Different pronunciation",
          "Similar spelling",
        ],
        correct_answer: "Same meaning",
        explanation: "Synonyms are words with similar or identical meanings",
      },
      {
        question: "What is a verb?",
        options: [
          "A naming word",
          "An action word",
          "A describing word",
          "A connecting word",
        ],
        correct_answer: "An action word",
        explanation:
          "A verb expresses an action, occurrence, or state of being",
      },
      {
        question: "What is an adjective?",
        options: [
          "Names things",
          "Describes actions",
          "Describes nouns",
          "Connects sentences",
        ],
        correct_answer: "Describes nouns",
        explanation: "An adjective describes or modifies a noun",
      },
      {
        question: "What is an antonym?",
        options: [
          "Same meaning",
          "Opposite meaning",
          "Similar sound",
          "Rhyming word",
        ],
        correct_answer: "Opposite meaning",
        explanation: "Antonyms are words with opposite meanings",
      },
    ],
    "Algorithmic Valley": [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct_answer: "O(log n)",
        explanation:
          "Binary search has logarithmic time complexity as it divides the search space in half each time",
      },
      {
        question: "What data structure uses LIFO?",
        options: ["Queue", "Stack", "Array", "Tree"],
        correct_answer: "Stack",
        explanation: "Stack follows Last In First Out (LIFO) principle",
      },
      {
        question: "What is recursion?",
        options: [
          "Looping",
          "A function calling itself",
          "Sorting",
          "Searching",
        ],
        correct_answer: "A function calling itself",
        explanation:
          "Recursion is when a function calls itself to solve a problem",
      },
      {
        question: "What is a linked list?",
        options: [
          "Array with fixed size",
          "Nodes connected by pointers",
          "Stack implementation",
          "Hash table",
        ],
        correct_answer: "Nodes connected by pointers",
        explanation:
          "A linked list is a data structure where each node points to the next",
      },
      {
        question: "What does FIFO stand for?",
        options: [
          "First In First Out",
          "Fast In Fast Out",
          "Final In Final Out",
          "Fixed Input Fixed Output",
        ],
        correct_answer: "First In First Out",
        explanation: "FIFO is the principle used by queues",
      },
    ],
    "Web Wizardry": [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language",
        ],
        correct_answer: "Hyper Text Markup Language",
        explanation:
          "HTML is the standard markup language for creating web pages",
      },
      {
        question: "What does CSS stand for?",
        options: [
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Creative Style Syntax",
          "Colorful Style Sheets",
        ],
        correct_answer: "Cascading Style Sheets",
        explanation: "CSS is used to style and layout web pages",
      },
      {
        question: "What is JavaScript?",
        options: [
          "A markup language",
          "A styling language",
          "A programming language",
          "A database",
        ],
        correct_answer: "A programming language",
        explanation:
          "JavaScript is a programming language for web interactivity",
      },
      {
        question: "What is responsive design?",
        options: [
          "Fast loading",
          "Adapts to screen sizes",
          "Interactive elements",
          "Animated content",
        ],
        correct_answer: "Adapts to screen sizes",
        explanation:
          "Responsive design ensures websites work on all device sizes",
      },
      {
        question: "What is the DOM?",
        options: [
          "Database Object Model",
          "Document Object Model",
          "Dynamic Output Method",
          "Data Operation Mode",
        ],
        correct_answer: "Document Object Model",
        explanation: "DOM is the programming interface for web documents",
      },
    ],
    "Data Kingdom": [
      {
        question: "What does SQL stand for?",
        options: [
          "Structured Query Language",
          "Simple Question Language",
          "System Query Language",
          "Standard Quality Language",
        ],
        correct_answer: "Structured Query Language",
        explanation: "SQL is used to manage and query relational databases",
      },
      {
        question: "What is a primary key?",
        options: [
          "A foreign key",
          "A unique identifier",
          "An index",
          "A constraint",
        ],
        correct_answer: "A unique identifier",
        explanation:
          "A primary key uniquely identifies each record in a database table",
      },
      {
        question: "What is data mining?",
        options: [
          "Deleting data",
          "Extracting patterns from data",
          "Storing data",
          "Encrypting data",
        ],
        correct_answer: "Extracting patterns from data",
        explanation:
          "Data mining discovers patterns and knowledge from large datasets",
      },
      {
        question: "What is a database?",
        options: [
          "A file",
          "Organized collection of data",
          "A spreadsheet",
          "A program",
        ],
        correct_answer: "Organized collection of data",
        explanation:
          "A database is a structured collection of data that can be accessed and managed",
      },
      {
        question: "What is Big Data?",
        options: [
          "Large files",
          "Extremely large datasets",
          "Cloud storage",
          "Database backup",
        ],
        correct_answer: "Extremely large datasets",
        explanation:
          "Big Data refers to datasets too large for traditional processing",
      },
    ],
    "AI Sanctuary": [
      {
        question: "What is machine learning?",
        options: [
          "Computers learning to think",
          "Algorithms that improve from experience",
          "Robots learning to walk",
          "AI that copies humans",
        ],
        correct_answer: "Algorithms that improve from experience",
        explanation:
          "Machine learning enables systems to learn and improve from experience without being explicitly programmed",
      },
      {
        question: "What is a neural network?",
        options: [
          "A computer network",
          "A brain-inspired computing model",
          "An internet connection",
          "A data structure",
        ],
        correct_answer: "A brain-inspired computing model",
        explanation:
          "Neural networks are computing systems inspired by biological neural networks",
      },
      {
        question: "What is supervised learning?",
        options: [
          "Learning without data",
          "Learning with labeled data",
          "Unsupervised clustering",
          "Random learning",
        ],
        correct_answer: "Learning with labeled data",
        explanation:
          "Supervised learning uses labeled training data to learn patterns",
      },
      {
        question: "What is deep learning?",
        options: [
          "Machine learning with deep thought",
          "Neural networks with many layers",
          "Surface learning",
          "Basic AI",
        ],
        correct_answer: "Neural networks with many layers",
        explanation:
          "Deep learning uses neural networks with multiple hidden layers",
      },
      {
        question: "What is NLP?",
        options: [
          "New Learning Process",
          "Natural Language Processing",
          "Neural Logic Programming",
          "Network Layer Protocol",
        ],
        correct_answer: "Natural Language Processing",
        explanation:
          "NLP enables computers to understand and process human language",
      },
    ],
    "System Fortress": [
      {
        question: "What is an operating system?",
        options: [
          "A hardware component",
          "System software that manages computer resources",
          "An application",
          "A programming language",
        ],
        correct_answer: "System software that manages computer resources",
        explanation:
          "An OS manages hardware and software resources and provides services for programs",
      },
      {
        question: "What is a process?",
        options: ["A program in execution", "A file", "A folder", "A command"],
        correct_answer: "A program in execution",
        explanation: "A process is an instance of a running program",
      },
      {
        question: "What is multitasking?",
        options: [
          "Using multiple computers",
          "Running multiple processes concurrently",
          "Multiple users",
          "Multiple monitors",
        ],
        correct_answer: "Running multiple processes concurrently",
        explanation:
          "Multitasking allows an OS to run multiple processes at the same time",
      },
      {
        question: "What is virtual memory?",
        options: [
          "Cloud storage",
          "Disk space used as RAM",
          "Cache memory",
          "ROM",
        ],
        correct_answer: "Disk space used as RAM",
        explanation: "Virtual memory extends RAM by using disk storage",
      },
      {
        question: "What is a kernel?",
        options: [
          "A program",
          "Core of the OS",
          "A file system",
          "A device driver",
        ],
        correct_answer: "Core of the OS",
        explanation:
          "The kernel is the central component that manages system resources",
      },
    ],
    "Security Citadel": [
      {
        question: "What is encryption?",
        options: [
          "Deleting data",
          "Converting data to code",
          "Backing up data",
          "Compressing data",
        ],
        correct_answer: "Converting data to code",
        explanation:
          "Encryption converts data into a coded format to prevent unauthorized access",
      },
      {
        question: "What does SSL stand for?",
        options: [
          "Secure Socket Layer",
          "System Security Level",
          "Safe Server Link",
          "Standard Security Language",
        ],
        correct_answer: "Secure Socket Layer",
        explanation:
          "SSL is a security protocol for establishing encrypted links",
      },
      {
        question: "What is phishing?",
        options: [
          "A virus",
          "Social engineering attack",
          "Firewall breach",
          "Data mining",
        ],
        correct_answer: "Social engineering attack",
        explanation:
          "Phishing tricks users into revealing sensitive information",
      },
      {
        question: "What is a firewall?",
        options: [
          "Antivirus software",
          "Network security system",
          "Password manager",
          "Backup system",
        ],
        correct_answer: "Network security system",
        explanation: "A firewall monitors and controls network traffic",
      },
      {
        question: "What is two-factor authentication?",
        options: [
          "Two passwords",
          "Two security layers",
          "Two users",
          "Two devices",
        ],
        correct_answer: "Two security layers",
        explanation:
          "2FA requires two different authentication factors for access",
      },
    ],
    "Cloud Highlands": [
      {
        question: "What is cloud computing?",
        options: [
          "Weather prediction",
          "Computing services over the internet",
          "Local storage",
          "Wireless technology",
        ],
        correct_answer: "Computing services over the internet",
        explanation:
          "Cloud computing delivers computing services including servers, storage, and applications over the internet",
      },
      {
        question: "What is virtualization?",
        options: [
          "Virtual reality",
          "Creating virtual versions of resources",
          "Cloud storage",
          "Internet connection",
        ],
        correct_answer: "Creating virtual versions of resources",
        explanation:
          "Virtualization creates virtual versions of physical resources like servers and storage",
      },
      {
        question: "What is SaaS?",
        options: [
          "Software as a Service",
          "Storage as a Service",
          "Security as a Service",
          "System as a Service",
        ],
        correct_answer: "Software as a Service",
        explanation: "SaaS delivers software applications over the internet",
      },
      {
        question: "What is DevOps?",
        options: [
          "A cloud provider",
          "Development + Operations collaboration",
          "A programming language",
          "A database",
        ],
        correct_answer: "Development + Operations collaboration",
        explanation: "DevOps combines software development and IT operations",
      },
      {
        question: "What is containerization?",
        options: [
          "Packaging applications with dependencies",
          "Cloud storage",
          "Data compression",
          "Network isolation",
        ],
        correct_answer: "Packaging applications with dependencies",
        explanation:
          "Containers package applications with all their dependencies for consistent deployment",
      },
    ],
  };

  const baseQuestions =
    realmQuestions[realm.name] || realmQuestions["Mathematics Kingdom"];

  // Generate 10 questions per quiz (more questions for better learning)
  const numQuestions = 10;
  return Array.from({ length: numQuestions }, (_, i) => {
    const baseQ = baseQuestions[i % baseQuestions.length];
    // Vary the question slightly to make each one unique
    const variations = [
      "",
      " - Challenge",
      " - Practice",
      " - Master",
      " - Quiz Mode",
      " - Test",
      " - Review",
      " - Recall",
      " - Apply",
      " - Analyze",
    ];
    return {
      question: `${baseQ.question}${variations[i % variations.length]}`,
      type: "multiple-choice",
      options: baseQ.options,
      correct_answer: baseQ.correct_answer,
      explanation: baseQ.explanation,
      points: difficulty === "Hard" ? 3 : difficulty === "Medium" ? 2 : 1,
      difficulty: difficulty,
    };
  });
};

const seedQuizzes = async () => {
  try {
    console.log("🌱 Starting quiz seeding process for microservices...\n");

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Find or create a system user for quiz creation
    let systemUser = await User.findOne({ email: "system@cognito.com" });

    if (!systemUser) {
      console.log("📝 Creating system user for quiz creation...");
      systemUser = await User.create({
        name: "System Admin",
        email: "system@cognito.com",
        role: "Teacher",
      });
      console.log("✅ System user created\n");
    } else {
      console.log("✅ Using existing system user\n");
    }

    // Clear existing realm quizzes by title pattern (Quest X Quiz)
    const deleteResult = await Quiz.deleteMany({ title: /Quest.*Quiz/ });
    console.log(
      `🗑️  Cleared ${deleteResult.deletedCount} existing realm quizzes\n`
    );

    const allQuizzes = [];

    // Difficulty progression by realm (baseDifficulty: 0=Easy, 1=Easy-Med, 2=Med, 3=Med-Hard, 4=Hard)
    const getDifficultyForRealm = (baseDiff, questNum) => {
      // Quest 1-5: Base difficulty, 6-10: +1, 11-15: +1, 16-20: +1 (capped at Hard)
      const chapterBonus = Math.floor((questNum - 1) / 5);
      const totalDiff = baseDiff + chapterBonus;

      if (totalDiff <= 1) return "Easy";
      if (totalDiff <= 3) return "Medium";
      return "Hard";
    };

    // Generate quizzes for each realm
    for (const realm of realms) {
      console.log(
        `📚 Generating quizzes for ${realm.name} (base difficulty: ${
          realm.baseDifficulty || 0
        })...`
      );

      // Generate 20 quizzes per realm (matching the 20 demo quests)
      for (let i = 1; i <= 20; i++) {
        const chapter = Math.floor((i - 1) / 5) + 1;
        const difficulty = getDifficultyForRealm(realm.baseDifficulty || 0, i);

        const quiz = {
          title: `${realm.name} Quest ${i} Quiz`,
          description: `Complete this quiz to master the concepts of ${realm.name}. This is part of Chapter ${chapter}. Difficulty: ${difficulty}`,
          questions: generateQuizQuestions(realm, i, difficulty),
          difficulty: difficulty,
          category: realm.category,
          tags: [realm.name, `Chapter ${chapter}`, difficulty],
          isPublic: true,
          createdBy: systemUser._id,
        };

        allQuizzes.push(quiz);
      }

      console.log(`  ✓ Created 20 quizzes for ${realm.name}`);
    }

    // Bulk insert all quizzes
    console.log(`\n💾 Inserting ${allQuizzes.length} quizzes into database...`);
    const insertedQuizzes = await Quiz.insertMany(allQuizzes);

    console.log(`\n✅ Successfully seeded ${insertedQuizzes.length} quizzes!`);
    console.log(`📊 Breakdown:`);

    realms.forEach((realm) => {
      const count = insertedQuizzes.filter(
        (q) => q.tags && q.tags.includes(realm.name)
      ).length;
      console.log(`   - ${realm.name}: ${count} quizzes`);
    });

    console.log("\n🎉 Quiz seeding complete!\n");
  } catch (error) {
    console.error("❌ Error seeding quizzes:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
};

// Run the seeding script
seedQuizzes();
