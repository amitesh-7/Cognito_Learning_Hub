/**
 * Quest Seed Data Generator
 * Creates 100+ quests for each of the 7 realms
 * Run: node backend/scripts/seed-quests.js
 */

const mongoose = require("mongoose");
const Quest = require("../models/Quest");

const realms = [
  {
    name: "Algorithmic Valley",
    description: "Master algorithms, data structures, and computational thinking",
    npc: {
      name: "Oracle of Algorithms",
      role: "Algorithm Master",
      personality: "Analytical and precise, speaks in Big-O notation"
    },
    color: "purple",
  },
  {
    name: "Web Wizardry",
    description: "Learn the arts of frontend, backend, and full-stack magic",
    npc: {
      name: "Wizard of the Web",
      role: "Full Stack Sorcerer",
      personality: "Creative and dynamic, weaves code like spells"
    },
    color: "blue",
  },
  {
    name: "Data Kingdom",
    description: "Unlock the secrets of databases, analytics, and data science",
    npc: {
      name: "Data Dragon",
      role: "Data Sovereign",
      personality: "Wise and insightful, sees patterns in chaos"
    },
    color: "green",
  },
  {
    name: "AI Sanctuary",
    description: "Explore machine learning, neural networks, and artificial intelligence",
    npc: {
      name: "AI Sage",
      role: "Neural Network Monk",
      personality: "Contemplative and futuristic, teaches machines to think"
    },
    color: "pink",
  },
  {
    name: "System Fortress",
    description: "Build mastery in operating systems, networks, and infrastructure",
    npc: {
      name: "System Guardian",
      role: "Infrastructure Keeper",
      personality: "Steadfast and reliable, protects the foundation"
    },
    color: "red",
  },
  {
    name: "Security Citadel",
    description: "Defend against threats with cybersecurity and ethical hacking",
    npc: {
      name: "Security Sentinel",
      role: "Cyber Defender",
      personality: "Vigilant and strategic, thinks like an attacker"
    },
    color: "yellow",
  },
  {
    name: "Cloud Highlands",
    description: "Scale the peaks of cloud computing, DevOps, and distributed systems",
    npc: {
      name: "Cloud Keeper",
      role: "DevOps Shepherd",
      personality: "Visionary and scalable, orchestrates the clouds"
    },
    color: "cyan",
  },
];

const generateQuests = (realm, startIndex = 0) => {
  const quests = [];
  const chapters = [
    "Fundamentals",
    "Intermediate Concepts",
    "Advanced Techniques",
    "Expert Challenges",
    "Mastery",
  ];

  const questsPerChapter = 20;
  let questId = startIndex;

  chapters.forEach((chapter, chapterIndex) => {
    for (let i = 1; i <= questsPerChapter; i++) {
      questId++;
      const difficulty = ["easy", "medium", "hard", "expert"][
        Math.floor(chapterIndex / 1.5)
      ];
      const xpReward = { easy: 50, medium: 100, hard: 200, expert: 500 }[
        difficulty
      ];

      // Generate quest based on realm
      let title, description, objectives, requirements;

      if (realm.name === "Algorithmic Valley") {
        title = generateAlgorithmQuestTitle(chapterIndex, i);
        description = generateAlgorithmDescription(chapterIndex, i);
        objectives = generateAlgorithmObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      } else if (realm.name === "Web Wizardry") {
        title = generateWebQuestTitle(chapterIndex, i);
        description = generateWebDescription(chapterIndex, i);
        objectives = generateWebObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      } else if (realm.name === "Data Kingdom") {
        title = generateDataQuestTitle(chapterIndex, i);
        description = generateDataDescription(chapterIndex, i);
        objectives = generateDataObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      } else if (realm.name === "AI Sanctuary") {
        title = generateAIQuestTitle(chapterIndex, i);
        description = generateAIDescription(chapterIndex, i);
        objectives = generateAIObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      } else if (realm.name === "System Fortress") {
        title = generateSystemQuestTitle(chapterIndex, i);
        description = generateSystemDescription(chapterIndex, i);
        objectives = generateSystemObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      } else if (realm.name === "Security Citadel") {
        title = generateSecurityQuestTitle(chapterIndex, i);
        description = generateSecurityDescription(chapterIndex, i);
        objectives = generateSecurityObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      } else if (realm.name === "Cloud Highlands") {
        title = generateCloudQuestTitle(chapterIndex, i);
        description = generateCloudDescription(chapterIndex, i);
        objectives = generateCloudObjectives(chapterIndex, i);
        requirements = { minLevel: chapterIndex * 5, prerequisiteQuests: [] };
      }

      quests.push({
        questId: `${realm.name.toLowerCase().replace(/\s/g, "-")}-${questId}`,
        title,
        description,
        realm: realm.name,
        chapter,
        difficulty,
        objectives,
        rewards: {
          xp: xpReward,
          coins: xpReward / 10,
          items: chapterIndex >= 3 ? [`${realm.name} Badge`] : [],
        },
        requirements,
        status: "available",
        npcDialogue: {
          start: `${realm.npc.name} greets you: "Welcome to ${realm.name}, brave coder! Ready for your next challenge?"`,
          progress: `${realm.npc.name} encourages: "${realm.npc.personality}. You're doing great!"`,
          complete: `${realm.npc.name} celebrates: "Excellent work! You've earned ${xpReward} XP in ${realm.name}!"`,
        },
      });
    }
  });

  return quests;
};

// Algorithmic Valley Quest Generators
function generateAlgorithmQuestTitle(chapter, num) {
  const titles = [
    [
      "Array Basics",
      "Sorting Fundamentals",
      "Search Techniques",
      "Two Pointer Method",
    ],
    [
      "Binary Search Mastery",
      "Recursion Deep Dive",
      "Dynamic Programming Intro",
      "Graph Basics",
    ],
    [
      "Tree Traversals",
      "Backtracking Challenges",
      "Greedy Algorithms",
      "Divide and Conquer",
    ],
    ["Advanced DP", "Segment Trees", "Trie Structures", "Union Find"],
    [
      "Competitive Coding",
      "System Design",
      "Algorithm Optimization",
      "Complex Problem Solving",
    ],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateAlgorithmDescription(chapter, num) {
  return `Master algorithmic problem-solving techniques used by top tech companies. Complete coding challenges and optimize your solutions.`;
}

function generateAlgorithmObjectives(chapter, num) {
  return [
    { description: "Complete the coding challenge", completed: false },
    {
      description: "Achieve time complexity O(n log n) or better",
      completed: false,
    },
    { description: "Pass all test cases", completed: false },
  ];
}

// Web Wizardry Quest Generators
function generateWebQuestTitle(chapter, num) {
  const titles = [
    [
      "HTML Foundations",
      "CSS Styling",
      "JavaScript Basics",
      "DOM Manipulation",
    ],
    [
      "React Components",
      "State Management",
      "API Integration",
      "Responsive Design",
    ],
    ["Advanced Hooks", "Performance Optimization", "Testing", "Accessibility"],
    ["Server-Side Rendering", "GraphQL", "WebSockets", "Progressive Web Apps"],
    [
      "Microservices",
      "Cloud Deployment",
      "CI/CD Pipelines",
      "Full Stack Architecture",
    ],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateWebDescription(chapter, num) {
  return `Build modern web applications using cutting-edge frameworks and best practices. Create interactive, responsive, and scalable solutions.`;
}

function generateWebObjectives(chapter, num) {
  return [
    { description: "Build the required component/feature", completed: false },
    { description: "Ensure mobile responsiveness", completed: false },
    { description: "Pass code review checklist", completed: false },
  ];
}

// Data Kingdom Quest Generators
function generateDataQuestTitle(chapter, num) {
  const titles = [
    ["SQL Basics", "Database Design", "CRUD Operations", "Query Optimization"],
    [
      "Joins and Aggregations",
      "Indexing Strategies",
      "NoSQL Fundamentals",
      "Data Modeling",
    ],
    ["ETL Pipelines", "Data Warehousing", "Big Data Basics", "Analytics"],
    [
      "Machine Learning Prep",
      "Feature Engineering",
      "Data Visualization",
      "Statistical Analysis",
    ],
    [
      "Data Science Projects",
      "Predictive Modeling",
      "Real-time Analytics",
      "Data Architecture",
    ],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateDataDescription(chapter, num) {
  return `Harness the power of data through database management, analytics, and data science techniques. Transform raw data into insights.`;
}

function generateDataObjectives(chapter, num) {
  return [
    { description: "Design the database schema", completed: false },
    { description: "Write optimized queries", completed: false },
    { description: "Analyze and visualize results", completed: false },
  ];
}

// AI Sanctuary Quest Generators
function generateAIQuestTitle(chapter, num) {
  const titles = [
    [
      "ML Fundamentals",
      "Linear Regression",
      "Classification Basics",
      "Model Evaluation",
    ],
    ["Neural Networks", "Deep Learning Intro", "CNNs", "RNNs"],
    ["Transfer Learning", "GANs", "Reinforcement Learning", "NLP Basics"],
    ["Transformers", "BERT", "GPT", "Computer Vision"],
    ["AI Ethics", "Model Deployment", "MLOps", "Advanced AI Projects"],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateAIDescription(chapter, num) {
  return `Explore artificial intelligence and machine learning. Build intelligent systems that learn from data and make predictions.`;
}

function generateAIObjectives(chapter, num) {
  return [
    { description: "Train the ML model", completed: false },
    { description: "Achieve 85%+ accuracy", completed: false },
    { description: "Document model architecture", completed: false },
  ];
}

// System Fortress Quest Generators
function generateSystemQuestTitle(chapter, num) {
  const titles = [
    ["OS Basics", "Process Management", "Memory Management", "File Systems"],
    ["Networking Fundamentals", "TCP/IP", "HTTP/HTTPS", "DNS"],
    ["Concurrency", "Threading", "IPC", "Synchronization"],
    ["System Design", "Load Balancing", "Caching", "Message Queues"],
    [
      "Distributed Systems",
      "Microservices",
      "Container Orchestration",
      "Infrastructure",
    ],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateSystemDescription(chapter, num) {
  return `Build robust system infrastructure and understand how operating systems, networks, and distributed systems work at scale.`;
}

function generateSystemObjectives(chapter, num) {
  return [
    { description: "Implement system component", completed: false },
    { description: "Optimize for performance", completed: false },
    { description: "Handle edge cases", completed: false },
  ];
}

// Security Citadel Quest Generators
function generateSecurityQuestTitle(chapter, num) {
  const titles = [
    ["Security Basics", "Authentication", "Authorization", "Encryption"],
    ["Web Security", "OWASP Top 10", "SQL Injection", "XSS Prevention"],
    ["Network Security", "Firewalls", "VPN", "Penetration Testing"],
    ["Cryptography", "PKI", "Security Audits", "Threat Modeling"],
    ["Ethical Hacking", "Bug Bounty", "Security Architecture", "Compliance"],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateSecurityDescription(chapter, num) {
  return `Defend systems against cyber threats. Learn ethical hacking, cryptography, and security best practices.`;
}

function generateSecurityObjectives(chapter, num) {
  return [
    { description: "Identify vulnerabilities", completed: false },
    { description: "Implement security fixes", completed: false },
    { description: "Document security measures", completed: false },
  ];
}

// Cloud Highlands Quest Generators
function generateCloudQuestTitle(chapter, num) {
  const titles = [
    ["Cloud Basics", "AWS Intro", "Azure Fundamentals", "GCP Basics"],
    ["Virtual Machines", "Storage Solutions", "Networking", "IAM"],
    ["Containers", "Kubernetes", "Serverless", "Auto Scaling"],
    ["CI/CD", "Infrastructure as Code", "Monitoring", "Cost Optimization"],
    [
      "Multi-Cloud",
      "Cloud Architecture",
      "DevOps Mastery",
      "Cloud Native Apps",
    ],
  ];
  return titles[chapter][num % 4] + ` ${Math.floor((num - 1) / 4) + 1}`;
}

function generateCloudDescription(chapter, num) {
  return `Master cloud computing and DevOps practices. Deploy scalable, reliable applications in the cloud.`;
}

function generateCloudObjectives(chapter, num) {
  return [
    { description: "Deploy to cloud platform", completed: false },
    { description: "Configure auto-scaling", completed: false },
    { description: "Implement monitoring", completed: false },
  ];
}

// Main seeding function
async function seedQuests() {
  try {
    // Connect to MongoDB
    const MONGO_URI =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/cognito_learning_hub";

    console.log("\n🔗 Connecting to MongoDB...");
    console.log(MONGO_URI.includes("@") ? "   Using MongoDB Atlas" : "   Using Local MongoDB");
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing CS-focused quests only
    const csRealms = [
      "Algorithmic Valley", 
      "Web Wizardry", 
      "Data Kingdom", 
      "AI Sanctuary", 
      "System Fortress", 
      "Security Citadel", 
      "Cloud Highlands"
    ];
    const deleteCount = await Quest.countDocuments({ realm: { $in: csRealms } });
    await Quest.deleteMany({ realm: { $in: csRealms } });
    console.log(`🗑️  Cleared ${deleteCount} existing CS-focused quests\n`);

    // Generate quests for each realm
    let allQuests = [];
    let startIndex = 700; // Start after academic quests

    console.log("🎯 Generating CS-Focused Tech Quests:\n");
    for (const realm of realms) {
      console.log(`   💻 ${realm.name}...`);
      const realmQuests = generateQuests(realm, startIndex);
      allQuests = allQuests.concat(realmQuests);
      startIndex += realmQuests.length;
      console.log(`      ✓ Generated ${realmQuests.length} quests`);
    }

    // Insert all quests
    console.log(`\n💾 Inserting ${allQuests.length} quests into database...`);
    await Quest.insertMany(allQuests);
    console.log(`✅ Successfully seeded ${allQuests.length} CS-focused quests!\n`);

    // Summary
    console.log("📊 SUMMARY:");
    console.log("=".repeat(50));
    for (const realm of realms) {
      const count = allQuests.filter((q) => q.realm === realm.name).length;
      console.log(`   ${realm.npc.name.padEnd(25)} | ${count.toString().padStart(3)} quests`);
    }
    console.log("=".repeat(50));
    console.log(`   ${"TOTAL CS-FOCUSED".padEnd(25)} | ${allQuests.length.toString().padStart(3)} quests\n`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding quests:", error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedQuests();
}

module.exports = { seedQuests, generateQuests };
