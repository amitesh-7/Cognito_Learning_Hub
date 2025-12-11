/**
 * Academic Quest Seed Data Generator
 * Creates 100+ quests for each of the 7 academic realms
 * Run: node backend/scripts/seed-quests-academic.js
 */

const mongoose = require("mongoose");
const Quest = require("../models/Quest");

const realms = [
  {
    name: "Mathematics Kingdom",
    description: "Master the art of numbers, equations, and mathematical reasoning",
    npc: {
      name: "Professor Arithmos",
      role: "Math Sage",
      personality: "Wise and patient, loves patterns and puzzles"
    },
    color: "blue",
  },
  {
    name: "Physics Universe",
    description: "Explore the laws of nature, motion, and the cosmos",
    npc: {
      name: "Dr. Quantum",
      role: "Physics Master",
      personality: "Energetic and curious, fascinated by how things work"
    },
    color: "purple",
  },
  {
    name: "Chemistry Lab",
    description: "Discover the secrets of matter, reactions, and molecules",
    npc: {
      name: "Alchemist Luna",
      role: "Chemistry Expert",
      personality: "Experimental and precise, loves chemical mysteries"
    },
    color: "green",
  },
  {
    name: "Biology Forest",
    description: "Understand the living world, ecosystems, and life sciences",
    npc: {
      name: "Botanist Willow",
      role: "Life Science Guide",
      personality: "Nurturing and observant, passionate about nature"
    },
    color: "emerald",
  },
  {
    name: "Computer Science Hub",
    description: "Code your way to mastery in programming and algorithms",
    npc: {
      name: "Tech Wizard Ada",
      role: "Code Master",
      personality: "Logical and innovative, dreams in binary"
    },
    color: "indigo",
  },
  {
    name: "History Archives",
    description: "Journey through time and uncover the stories of humanity",
    npc: {
      name: "Chronicler Sage",
      role: "History Keeper",
      personality: "Storyteller and historian, keeper of ancient wisdom"
    },
    color: "amber",
  },
  {
    name: "Language Realm",
    description: "Master the power of words, grammar, and communication",
    npc: {
      name: "Linguist Oracle",
      role: "Language Master",
      personality: "Articulate and expressive, weaver of words"
    },
    color: "rose",
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

      let title, description, objectives;

      // Generate quest based on realm
      switch (realm.name) {
        case "Mathematics Kingdom":
          ({ title, description, objectives } = generateMathQuest(chapterIndex, i));
          break;
        case "Physics Universe":
          ({ title, description, objectives } = generatePhysicsQuest(chapterIndex, i));
          break;
        case "Chemistry Lab":
          ({ title, description, objectives } = generateChemistryQuest(chapterIndex, i));
          break;
        case "Biology Forest":
          ({ title, description, objectives } = generateBiologyQuest(chapterIndex, i));
          break;
        case "Computer Science Hub":
          ({ title, description, objectives } = generateCSQuest(chapterIndex, i));
          break;
        case "History Archives":
          ({ title, description, objectives } = generateHistoryQuest(chapterIndex, i));
          break;
        case "Language Realm":
          ({ title, description, objectives } = generateLanguageQuest(chapterIndex, i));
          break;
      }

      quests.push({
        questId: `${realm.name.toLowerCase().replace(/\s/g, "-")}-ch${chapterIndex + 1}-q${i}`,
        title,
        description,
        realm: realm.name,
        chapter,
        difficulty,
        objectives,
        rewards: {
          xp: xpReward,
          coins: Math.floor(xpReward / 10),
          items: chapterIndex >= 3 ? [`${realm.name} Badge - Level ${chapterIndex}`] : [],
        },
        requirements: {
          minLevel: chapterIndex * 5,
          prerequisiteQuests: i > 1 ? [`${realm.name.toLowerCase().replace(/\s/g, "-")}-ch${chapterIndex + 1}-q${i - 1}`] : [],
        },
        status: "available",
        npcDialogue: {
          start: `${realm.npc.name} greets you: "Welcome, eager learner! Are you ready for a new challenge in ${realm.name}?"`,
          progress: `${realm.npc.name} encourages: "You're making excellent progress! ${realm.npc.personality.split(',')[0]} appreciates your dedication!"`,
          complete: `${realm.npc.name} celebrates: "Magnificent work! You've mastered this challenge and earned ${xpReward} XP!"`,
        },
      });
    }
  });

  return quests;
};

// Mathematics Kingdom Quest Generators
function generateMathQuest(chapter, num) {
  const topics = [
    // Chapter 0: Fundamentals
    [
      "Basic Arithmetic", "Number Systems", "Fractions & Decimals", "Percentages",
      "Order of Operations", "Prime Numbers", "Factors & Multiples", "Exponents",
      "Square Roots", "Basic Algebra", "Linear Equations", "Word Problems",
      "Ratio & Proportion", "Simple Interest", "Area & Perimeter", "Volume Basics",
      "Coordinate Geometry", "Basic Statistics", "Mean & Median", "Probability Intro"
    ],
    // Chapter 1: Intermediate
    [
      "Quadratic Equations", "Polynomials", "Functions", "Graphing",
      "Systems of Equations", "Inequalities", "Matrices", "Sequences & Series",
      "Logarithms", "Trigonometry Basics", "Sine & Cosine", "Tangent",
      "Pythagorean Theorem", "Circle Theorems", "3D Geometry", "Vectors",
      "Complex Numbers", "Statistical Analysis", "Standard Deviation", "Correlation"
    ],
    // Chapter 2: Advanced
    [
      "Calculus Introduction", "Limits", "Derivatives", "Integration",
      "Differential Equations", "Multivariable Calculus", "Linear Algebra", "Eigenvalues",
      "Advanced Trigonometry", "Fourier Series", "Laplace Transform", "Complex Analysis",
      "Abstract Algebra", "Group Theory", "Ring Theory", "Number Theory",
      "Combinatorics", "Graph Theory", "Topology", "Set Theory"
    ],
    // Chapter 3: Expert
    [
      "Real Analysis", "Functional Analysis", "Measure Theory", "Probability Theory",
      "Stochastic Processes", "Game Theory", "Optimization", "Numerical Methods",
      "Cryptography Math", "Quantum Math", "Differential Geometry", "Algebraic Geometry",
      "Category Theory", "Logic & Proof", "Model Theory", "Computability",
      "Complexity Theory", "Information Theory", "Coding Theory", "Knot Theory"
    ],
    // Chapter 4: Mastery
    [
      "Research Methods", "Mathematical Modeling", "Advanced Proofs", "Theorem Development",
      "Cross-Domain Applications", "AI Mathematics", "Financial Math", "Physics Math",
      "Engineering Math", "Computer Science Math", "Biology Math", "Economics Math",
      "Actuarial Science", "Operations Research", "Decision Theory", "Chaos Theory",
      "Fractal Geometry", "Advanced Algorithms", "Math Competitions", "Original Research"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Quest: ${topic}`,
    description: `Master ${topic} through theoretical understanding and practical problem-solving. ${chapter === 0 ? "Build your foundation in mathematics." : chapter === 1 ? "Develop intermediate mathematical skills." : chapter === 2 ? "Tackle advanced mathematical concepts." : chapter === 3 ? "Challenge yourself with expert-level mathematics." : "Achieve mastery and apply mathematics creatively."}`,
    objectives: [
      { description: `Understand the core concepts of ${topic}`, completed: false },
      { description: `Solve practice problems correctly`, completed: false },
      { description: `Apply ${topic} to real-world scenarios`, completed: false },
    ]
  };
}

// Physics Universe Quest Generators
function generatePhysicsQuest(chapter, num) {
  const topics = [
    // Fundamentals
    [
      "Motion & Speed", "Acceleration", "Newton's Laws", "Force & Mass",
      "Gravity", "Friction", "Energy Basics", "Work & Power",
      "Simple Machines", "Momentum", "Pressure", "Density",
      "Temperature", "Heat Transfer", "States of Matter", "Light Basics",
      "Sound Waves", "Magnetism", "Static Electricity", "Circuits"
    ],
    // Intermediate
    [
      "Kinematics", "Projectile Motion", "Circular Motion", "Rotational Dynamics",
      "Torque", "Angular Momentum", "Oscillations", "Wave Motion",
      "Doppler Effect", "Optics", "Reflection & Refraction", "Lenses",
      "Thermodynamics", "Gas Laws", "Entropy", "Electromagnetic Induction",
      "AC/DC Circuits", "Capacitors", "Inductors", "Transformers"
    ],
    // Advanced
    [
      "Lagrangian Mechanics", "Hamiltonian Mechanics", "Fluid Dynamics", "Bernoulli's Principle",
      "Special Relativity", "Time Dilation", "Quantum Mechanics Intro", "Wave-Particle Duality",
      "Schrödinger Equation", "Quantum States", "Statistical Mechanics", "Maxwell's Equations",
      "Electromagnetic Waves", "Plasma Physics", "Nuclear Physics", "Radioactivity",
      "Particle Physics", "Semiconductors", "Superconductivity", "Crystallography"
    ],
    // Expert
    [
      "General Relativity", "Black Holes", "Cosmology", "Quantum Field Theory",
      "Standard Model", "Higgs Mechanism", "String Theory", "Loop Quantum Gravity",
      "Quantum Entanglement", "Quantum Computing", "Condensed Matter", "Topological Physics",
      "Astrophysics", "Stellar Evolution", "Gravitational Waves", "Dark Matter",
      "Dark Energy", "High Energy Physics", "Accelerator Physics", "Experimental Design"
    ],
    // Mastery
    [
      "Theoretical Physics Research", "Computational Physics", "Quantum Information", "Quantum Cryptography",
      "Quantum Teleportation", "Multiverse Theory", "Physics of Consciousness", "Emergent Phenomena",
      "Complex Systems", "Chaos & Nonlinearity", "Biophysics", "Neurophysics",
      "Econophysics", "Sociophysics", "Quantum Biology", "Nanotechnology",
      "Metamaterials", "Photonics", "Spintronics", "Original Research"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Physics Challenge: ${topic}`,
    description: `Explore ${topic} through experiments, calculations, and theoretical analysis. ${chapter < 2 ? "Discover the fundamental laws governing our universe." : "Delve into cutting-edge physics research."}`,
    objectives: [
      { description: `Master the principles of ${topic}`, completed: false },
      { description: `Conduct virtual experiments and analyze results`, completed: false },
      { description: `Solve complex physics problems`, completed: false },
    ]
  };
}

// Chemistry Lab Quest Generators
function generateChemistryQuest(chapter, num) {
  const topics = [
    // Fundamentals
    [
      "Atomic Structure", "Periodic Table", "Elements", "Compounds",
      "Chemical Bonds", "Ionic Bonds", "Covalent Bonds", "Metallic Bonds",
      "Molecular Structure", "Chemical Formulas", "Balancing Equations", "Mole Concept",
      "Stoichiometry", "Solutions", "Acids & Bases", "pH Scale",
      "Oxidation & Reduction", "Chemical Reactions", "Reaction Types", "Safety in Lab"
    ],
    // Intermediate
    [
      "Gas Laws", "Kinetic Theory", "Thermochemistry", "Enthalpy",
      "Entropy", "Gibbs Free Energy", "Chemical Equilibrium", "Le Chatelier's Principle",
      "Reaction Kinetics", "Rate Laws", "Catalysis", "Electrochemistry",
      "Galvanic Cells", "Electrolysis", "Organic Chemistry", "Hydrocarbons",
      "Functional Groups", "Isomers", "Reaction Mechanisms", "Spectroscopy"
    ],
    // Advanced
    [
      "Quantum Chemistry", "Molecular Orbitals", "Coordination Chemistry", "Transition Metals",
      "Organometallic Chemistry", "Polymer Chemistry", "Biochemistry", "Enzymes",
      "Protein Structure", "Nucleic Acids", "Metabolism", "Analytical Chemistry",
      "Chromatography", "Mass Spectrometry", "NMR Spectroscopy", "X-ray Crystallography",
      "Computational Chemistry", "Green Chemistry", "Nanotechnology", "Materials Science"
    ],
    // Expert
    [
      "Advanced Organic Synthesis", "Total Synthesis", "Asymmetric Catalysis", "Photochemistry",
      "Supramolecular Chemistry", "Host-Guest Chemistry", "Molecular Recognition", "Self-Assembly",
      "Chemical Biology", "Drug Design", "Medicinal Chemistry", "Pharmacology",
      "Toxicology", "Environmental Chemistry", "Atmospheric Chemistry", "Marine Chemistry",
      "Astrochemistry", "Nuclear Chemistry", "Radiochemistry", "Industrial Chemistry"
    ],
    // Mastery
    [
      "Chemical Research Methods", "Laboratory Innovation", "Synthesis Planning", "Retrosynthesis",
      "Advanced Spectroscopic Techniques", "Computational Drug Discovery", "Chemical Informatics", "Systems Chemistry",
      "Chemical Engineering", "Process Optimization", "Quality Control", "Regulatory Chemistry",
      "Patent Chemistry", "Entrepreneurship in Chemistry", "Science Communication", "Ethics in Chemistry",
      "Sustainable Chemistry", "Circular Economy", "Innovation Projects", "Original Research"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Lab Experiment: ${topic}`,
    description: `Investigate ${topic} through virtual experiments and chemical analysis. ${chapter < 2 ? "Learn safe laboratory practices and fundamental chemistry." : "Engage in advanced chemical research and synthesis."}`,
    objectives: [
      { description: `Understand the chemistry behind ${topic}`, completed: false },
      { description: `Perform virtual lab experiments safely`, completed: false },
      { description: `Analyze experimental data and draw conclusions`, completed: false },
    ]
  };
}

// Biology Forest Quest Generators
function generateBiologyQuest(chapter, num) {
  const topics = [
    // Fundamentals
    [
      "Cell Structure", "Cell Membrane", "Organelles", "Prokaryotes vs Eukaryotes",
      "Cell Division", "Mitosis", "Meiosis", "DNA Structure",
      "DNA Replication", "RNA", "Protein Synthesis", "Enzymes",
      "Cellular Respiration", "Photosynthesis", "Plant Cell", "Animal Cell",
      "Tissues", "Organs", "Systems", "Classification"
    ],
    // Intermediate
    [
      "Genetics", "Mendelian Inheritance", "Punnett Squares", "Genetic Disorders",
      "Molecular Genetics", "Gene Expression", "Mutations", "Evolution",
      "Natural Selection", "Adaptation", "Speciation", "Taxonomy",
      "Ecology", "Ecosystems", "Food Chains", "Energy Flow",
      "Nutrient Cycles", "Population Dynamics", "Biodiversity", "Conservation"
    ],
    // Advanced
    [
      "Molecular Biology", "Gene Regulation", "Epigenetics", "Genomics",
      "Proteomics", "Metabolomics", "Systems Biology", "Synthetic Biology",
      "CRISPR Gene Editing", "Stem Cells", "Developmental Biology", "Embryology",
      "Immunology", "Immune System", "Antibodies", "Vaccines",
      "Microbiology", "Bacteria", "Viruses", "Fungi"
    ],
    // Expert
    [
      "Neurobiology", "Brain Structure", "Neurons", "Neurotransmitters",
      "Sensory Systems", "Motor Control", "Cognitive Neuroscience", "Behavioral Biology",
      "Evolutionary Biology", "Phylogenetics", "Comparative Anatomy", "Paleobiology",
      "Marine Biology", "Botany", "Plant Physiology", "Animal Physiology",
      "Endocrinology", "Hormones", "Reproductive Biology", "Aging Biology"
    ],
    // Mastery
    [
      "Bioinformatics", "Computational Biology", "Systems Modeling", "Network Biology",
      "Cancer Biology", "Oncology Research", "Regenerative Medicine", "Tissue Engineering",
      "Biomedical Engineering", "Biotechnology", "Pharmaceutical Biology", "Drug Discovery",
      "Clinical Trials", "Precision Medicine", "Personalized Healthcare", "Public Health",
      "Epidemiology", "Disease Prevention", "Bioethics", "Original Research"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Nature Study: ${topic}`,
    description: `Explore ${topic} through observation, experimentation, and analysis. ${chapter < 2 ? "Discover the building blocks of life." : "Investigate cutting-edge biological research."}`,
    objectives: [
      { description: `Learn the biological concepts of ${topic}`, completed: false },
      { description: `Observe and analyze biological specimens`, completed: false },
      { description: `Apply biological knowledge to real scenarios`, completed: false },
    ]
  };
}

// Computer Science Hub Quest Generators
function generateCSQuest(chapter, num) {
  const topics = [
    // Fundamentals
    [
      "Introduction to Programming", "Variables & Data Types", "Operators", "Input & Output",
      "Conditional Statements", "If-Else", "Switch Case", "Loops",
      "For Loop", "While Loop", "Functions", "Parameters",
      "Return Values", "Arrays", "Strings", "Basic Algorithms",
      "Debugging", "Code Style", "Comments", "Problem Solving"
    ],
    // Intermediate
    [
      "Object-Oriented Programming", "Classes & Objects", "Inheritance", "Polymorphism",
      "Encapsulation", "Data Structures", "Linked Lists", "Stacks",
      "Queues", "Trees", "Binary Trees", "Graphs",
      "Hash Tables", "Sorting Algorithms", "Searching Algorithms", "Recursion",
      "Dynamic Programming", "Greedy Algorithms", "File Handling", "Exception Handling"
    ],
    // Advanced
    [
      "Advanced Data Structures", "AVL Trees", "Red-Black Trees", "B-Trees",
      "Heaps", "Tries", "Segment Trees", "Disjoint Sets",
      "Algorithm Design", "Divide & Conquer", "Backtracking", "Branch & Bound",
      "Graph Algorithms", "Shortest Path", "Minimum Spanning Tree", "Network Flow",
      "Computational Complexity", "NP-Complete Problems", "Parallel Computing", "Concurrent Programming"
    ],
    // Expert
    [
      "Machine Learning", "Neural Networks", "Deep Learning", "Computer Vision",
      "Natural Language Processing", "Reinforcement Learning", "AI Algorithms", "Genetic Algorithms",
      "Web Development", "Frontend Frameworks", "Backend Systems", "Database Design",
      "System Design", "Microservices", "Cloud Computing", "DevOps",
      "Cybersecurity", "Cryptography", "Network Security", "Ethical Hacking"
    ],
    // Mastery
    [
      "Software Architecture", "Design Patterns", "Clean Code", "Code Review",
      "Testing Strategies", "CI/CD Pipelines", "Containerization", "Kubernetes",
      "Distributed Systems", "Scalability", "Performance Optimization", "Big Data",
      "Data Engineering", "MLOps", "Blockchain", "Quantum Computing",
      "Research Methods", "Technical Writing", "Open Source", "Original Projects"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Coding Challenge: ${topic}`,
    description: `Master ${topic} through hands-on programming and problem-solving. ${chapter < 2 ? "Build strong programming fundamentals." : "Tackle advanced software engineering challenges."}`,
    objectives: [
      { description: `Understand ${topic} concepts thoroughly`, completed: false },
      { description: `Write clean, efficient code`, completed: false },
      { description: `Pass all test cases and optimize solutions`, completed: false },
    ]
  };
}

// History Archives Quest Generators
function generateHistoryQuest(chapter, num) {
  const topics = [
    // Fundamentals
    [
      "Ancient Civilizations", "Mesopotamia", "Ancient Egypt", "Indus Valley",
      "Ancient China", "Ancient Greece", "Ancient Rome", "Persian Empire",
      "Mayan Civilization", "Inca Empire", "Medieval Europe", "Byzantine Empire",
      "Islamic Golden Age", "Viking Age", "Feudalism", "Crusades",
      "Renaissance", "Age of Exploration", "Colonialism", "Trade Routes"
    ],
    // Intermediate
    [
      "Scientific Revolution", "Enlightenment", "American Revolution", "French Revolution",
      "Industrial Revolution", "Napoleonic Wars", "Latin American Independence", "Imperialism",
      "Victorian Era", "American Civil War", "Unification of Italy", "Unification of Germany",
      "Scramble for Africa", "Meiji Restoration", "World War I", "Russian Revolution",
      "Interwar Period", "Great Depression", "Rise of Fascism", "World War II"
    ],
    // Advanced
    [
      "Cold War", "Decolonization", "Civil Rights Movement", "Space Race",
      "Vietnam War", "Cultural Revolution", "Fall of Berlin Wall", "End of Cold War",
      "Globalization", "Digital Revolution", "Arab Spring", "Modern Conflicts",
      "Economic History", "Social Movements", "Women's Rights", "LGBTQ+ Rights",
      "Environmental Movement", "Anti-Apartheid", "Independence Movements", "Democratic Transitions"
    ],
    // Expert
    [
      "Historiography", "Historical Methods", "Primary Sources", "Archaeological Evidence",
      "Comparative History", "World Systems Theory", "Postcolonial Studies", "Gender History",
      "Economic History Analysis", "Political History", "Cultural History", "Intellectual History",
      "Military History", "Diplomatic History", "Social History", "Urban History",
      "Rural History", "Maritime History", "Labor History", "Immigration History"
    ],
    // Mastery
    [
      "Historical Research", "Archival Research", "Oral History", "Digital Humanities",
      "Historical Writing", "Public History", "Museum Studies", "Heritage Preservation",
      "Historical Interpretation", "Contested Histories", "Memory Studies", "Historical Justice",
      "Teaching History", "History Communication", "Historical Documentaries", "Historical Fiction",
      "Comparative Civilizations", "Future of History", "Interdisciplinary History", "Original Research"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Historical Journey: ${topic}`,
    description: `Explore ${topic} through documents, artifacts, and historical analysis. ${chapter < 2 ? "Journey through the great civilizations and events of the past." : "Engage in deep historical research and interpretation."}`,
    objectives: [
      { description: `Study the historical context of ${topic}`, completed: false },
      { description: `Analyze primary and secondary sources`, completed: false },
      { description: `Understand historical significance and impact`, completed: false },
    ]
  };
}

// Language Realm Quest Generators
function generateLanguageQuest(chapter, num) {
  const topics = [
    // Fundamentals
    [
      "Alphabet & Phonetics", "Basic Vocabulary", "Nouns", "Pronouns",
      "Verbs", "Adjectives", "Adverbs", "Articles",
      "Prepositions", "Conjunctions", "Sentence Structure", "Subject-Verb Agreement",
      "Tenses", "Present Tense", "Past Tense", "Future Tense",
      "Simple Sentences", "Punctuation", "Capitalization", "Basic Grammar"
    ],
    // Intermediate
    [
      "Complex Sentences", "Compound Sentences", "Clauses", "Phrases",
      "Active & Passive Voice", "Direct & Indirect Speech", "Conditionals", "Modal Verbs",
      "Phrasal Verbs", "Idioms", "Collocations", "Synonyms & Antonyms",
      "Reading Comprehension", "Paragraph Writing", "Essay Structure", "Formal Writing",
      "Informal Writing", "Business Writing", "Email Etiquette", "Letter Writing"
    ],
    // Advanced
    [
      "Literary Devices", "Metaphors & Similes", "Symbolism", "Imagery",
      "Tone & Mood", "Point of View", "Narrative Techniques", "Poetry Analysis",
      "Drama Analysis", "Fiction Analysis", "Non-Fiction Analysis", "Critical Reading",
      "Argumentative Writing", "Persuasive Writing", "Analytical Writing", "Research Writing",
      "Citation Styles", "Academic Writing", "Technical Writing", "Creative Writing"
    ],
    // Expert
    [
      "Linguistics", "Phonology", "Morphology", "Syntax",
      "Semantics", "Pragmatics", "Sociolinguistics", "Psycholinguistics",
      "Historical Linguistics", "Comparative Linguistics", "Language Acquisition", "Bilingualism",
      "Translation Theory", "Interpretation", "Discourse Analysis", "Corpus Linguistics",
      "Computational Linguistics", "NLP Applications", "Language Documentation", "Endangered Languages"
    ],
    // Mastery
    [
      "Advanced Literary Theory", "Postmodernism", "Structuralism", "Deconstruction",
      "Feminist Criticism", "Postcolonial Theory", "Ecocriticism", "Digital Literature",
      "Multimodal Communication", "Rhetoric & Composition", "Public Speaking", "Debate",
      "Professional Communication", "Intercultural Communication", "Language Teaching", "Curriculum Design",
      "Language Assessment", "Language Policy", "Language Rights", "Original Research"
    ]
  ];

  const topic = topics[chapter][num - 1] || `Advanced Topic ${num}`;
  
  return {
    title: `Language Mastery: ${topic}`,
    description: `Master ${topic} through reading, writing, and communication practice. ${chapter < 2 ? "Build strong language fundamentals." : "Explore advanced linguistic concepts and literary analysis."}`,
    objectives: [
      { description: `Learn the principles of ${topic}`, completed: false },
      { description: `Practice through exercises and examples`, completed: false },
      { description: `Apply ${topic} in communication contexts`, completed: false },
    ]
  };
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

    // Clear existing quests
    const deleteCount = await Quest.countDocuments();
    await Quest.deleteMany({});
    console.log(`🗑️  Cleared ${deleteCount} existing quests\n`);

    // Generate quests for each realm
    let allQuests = [];
    let startIndex = 0;

    console.log("🎯 Generating Academic Quests:\n");
    for (const realm of realms) {
      console.log(`   📚 ${realm.name}...`);
      const realmQuests = generateQuests(realm, startIndex);
      allQuests = allQuests.concat(realmQuests);
      startIndex += realmQuests.length;
      console.log(`      ✓ Generated ${realmQuests.length} quests`);
    }

    // Insert all quests
    console.log(`\n💾 Inserting ${allQuests.length} quests into database...`);
    await Quest.insertMany(allQuests);
    console.log(`✅ Successfully seeded ${allQuests.length} quests!\n`);

    // Summary
    console.log("📊 SUMMARY:");
    console.log("=".repeat(50));
    for (const realm of realms) {
      const count = allQuests.filter((q) => q.realm === realm.name).length;
      console.log(`   ${realm.npc.name.padEnd(20)} | ${count.toString().padStart(3)} quests`);
    }
    console.log("=".repeat(50));
    console.log(`   ${"TOTAL".padEnd(20)} | ${allQuests.length.toString().padStart(3)} quests\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding quests:", error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedQuests();
}

module.exports = { seedQuests, generateQuests };
