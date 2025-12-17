import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Settings,
  Eye,
  CheckSquare,
  Circle,
  FileEdit,
  Save,
  Printer,
  BookOpen,
  Clock,
  Users,
  Star,
  Layout,
  Brain,
  Sparkles,
  Image,
  Mic,
  Upload,
  Globe,
  Award,
  Target,
  BookMarked,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { AuthContext } from "../context/AuthContext";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const questionTypes = [
  {
    id: "mcq",
    name: "Multiple Choice",
    icon: CheckSquare,
    color: "blue",
    description: "Questions with 4 options",
  },
  {
    id: "truefalse",
    name: "True/False",
    icon: Circle,
    color: "green",
    description: "Simple true or false questions",
  },
  {
    id: "descriptive",
    name: "Descriptive",
    icon: FileEdit,
    color: "purple",
    description: "Long answer questions",
  },
];

// Indian Education Boards
const indianBoards = [
  { id: "CBSE", name: "CBSE" },
  { id: "ICSE", name: "ICSE/ISC" },
  { id: "Maharashtra", name: "Maharashtra State Board" },
  { id: "Karnataka", name: "Karnataka State Board" },
  { id: "TamilNadu", name: "Tamil Nadu State Board" },
  { id: "UP", name: "UP Board" },
  { id: "Kerala", name: "Kerala State Board" },
];

// Bloom's Taxonomy Levels
const bloomsLevels = [
  { id: "remember", name: "Remember", color: "bg-blue-100", desc: "Recall facts" },
  { id: "understand", name: "Understand", color: "bg-green-100", desc: "Explain ideas" },
  { id: "apply", name: "Apply", color: "bg-yellow-100", desc: "Use information" },
  { id: "analyze", name: "Analyze", color: "bg-orange-100", desc: "Draw connections" },
  { id: "evaluate", name: "Evaluate", color: "bg-red-100", desc: "Justify decisions" },
  { id: "create", name: "Create", color: "bg-purple-100", desc: "Produce new work" },
];

// NEP 2020 Competencies
const nepCompetencies = [
  "Critical Thinking",
  "Communication",
  "Collaboration",
  "Creativity",
  "Digital Literacy",
  "Problem Solving",
  "Self-awareness",
  "Empathy",
];

// Languages
const languages = [
  { id: "english", name: "English" },
  { id: "hindi", name: "हिंदी (Hindi)" },
  { id: "marathi", name: "मराठी (Marathi)" },
  { id: "tamil", name: "தமிழ் (Tamil)" },
  { id: "telugu", name: "తెలుగు (Telugu)" },
  { id: "kannada", name: "ಕನ್ನಡ (Kannada)" },
  { id: "bengali", name: "বাংলা (Bengali)" },
];

// Exam Patterns
const examPatterns = [
  { id: "standard", name: "Standard Format" },
  { id: "jee", name: "JEE Pattern (Single/Multiple Correct)" },
  { id: "neet", name: "NEET Pattern (180 MCQs)" },
  { id: "board", name: "Board Exam Pattern" },
  { id: "cbse-term", name: "CBSE Term Exam" },
];

export default function PDFQuizGenerator() {
  const { user } = useContext(AuthContext);
  const [quiz, setQuiz] = useState({
    title: "",
    subject: "",
    duration: 60,
    totalMarks: 0,
    instructions: "",
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    explanation: "",
    difficulty: "medium", // easy, medium, hard
    tags: [],
    image: null,
    voiceNote: null,
    bloomsLevel: "understand", // remember, understand, apply, analyze, evaluate, create
    nepCompetency: "", // NEP 2020 competencies
    ncertChapter: "",
    curriculum: "CBSE", // CBSE, ICSE, State Board
    language: "english", // english, hindi, regional
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportConfig, setShowExportConfig] = useState(false);
  const [showIndianCurriculum, setShowIndianCurriculum] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  // Indian Education System Config
  const [curriculumConfig, setCurriculumConfig] = useState({
    board: "CBSE", // CBSE, ICSE, Maharashtra, Karnataka, etc.
    class: "10",
    subject: "Mathematics",
    language: "english",
    ncertChapter: "",
    examPattern: "standard", // standard, jee, neet, board
    competencyBased: false, // NEP 2020
  });
  const [exportOptions, setExportOptions] = useState({
    includeAnswerKey: true,
    separateAnswerKey: true,
    includeExplanations: true,
    includeStudentInfo: true,
    layoutStyle: 'standard', // standard, compact, spacious
    showDifficulty: true,
    showPoints: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    twoColumn: false,
    includeScoringGuide: true,
    headerText: '',
    footerText: 'Cognito Learning Hub',
    showQuestionNumbers: true,
    pageNumbers: true
  });

  // AI Generation States
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiQuestionTypes, setAiQuestionTypes] = useState(["mcq"]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Helper function to render markdown text component for PDF preview
  const MarkdownText = ({ children }) => (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );

  // Helper to clean markdown for PDF text (preserves math formulas)
  const cleanMarkdownForPDF = (text) => {
    if (!text) return "";
    // Remove markdown formatting but keep math formulas
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // bold
      .replace(/\*(.*?)\*/g, "$1") // italic
      .replace(/`(.*?)`/g, "$1") // code
      .replace(/#{1,6}\s/g, "") // headings
      .replace(/\[(.*?)\]\(.*?\)/g, "$1"); // links
  };

  // Generate AI Questions
  const generateAIQuestions = async () => {
    if (!aiTopic.trim()) {
      alert("Please enter a topic for AI question generation");
      return;
    }

    if (aiQuestionTypes.length === 0) {
      alert("Please select at least one question type");
      return;
    }

    setIsGeneratingAI(true);

    try {
      const token = localStorage.getItem("quizwise-token");

      const apiUrl = `${
        import.meta.env.VITE_API_URL
      }/api/generate-pdf-questions`;
      console.log("Making request to:", apiUrl);
      console.log("Request body:", {
        topic: aiTopic,
        numQuestions: aiQuestionCount,
        difficulty: aiDifficulty,
        questionTypes: aiQuestionTypes,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          topic: aiTopic,
          numQuestions: aiQuestionCount,
          difficulty: aiDifficulty,
          questionTypes: aiQuestionTypes,
          curriculum: curriculumConfig.board,
          class: curriculumConfig.class,
          language: curriculumConfig.language,
          examPattern: curriculumConfig.examPattern,
          ncertChapter: curriculumConfig.ncertChapter,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Response text:", responseText);
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(
            `HTTP ${response.status}: ${responseText.substring(0, 200)}`
          );
        }
        throw new Error(errorData.message || "Failed to generate AI questions");
      }

      const data = await response.json();
      const aiQuestions = data.questions;

      if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
        throw new Error("No questions were generated");
      }

      // Add AI generated questions to the quiz
      const formattedQuestions = aiQuestions.map((q, index) => ({
        id: Date.now() + index,
        number: quiz.questions.length + index + 1,
        type: q.type || "mcq",
        question: q.question || `AI Generated Question ${index + 1}`,
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
        marks: parseInt(q.marks) || 2,
        explanation: q.explanation || "",
        difficulty: q.difficulty || aiDifficulty,
        bloomsLevel: q.bloomsLevel || "understand",
        nepCompetency: q.nepCompetency || "",
        curriculum: curriculumConfig.board,
        language: curriculumConfig.language,
      }));

      setQuiz((prev) => ({
        ...prev,
        questions: [...prev.questions, ...formattedQuestions],
        totalMarks:
          prev.totalMarks +
          formattedQuestions.reduce((sum, q) => sum + parseInt(q.marks), 0),
      }));

      alert(
        `Successfully generated ${formattedQuestions.length} AI questions!`
      );
      setShowAIPanel(false);

      // Reset AI form
      setAiTopic("");
      setAiQuestionCount(5);
      setAiDifficulty("medium");
    } catch (error) {
      console.error("Error generating AI questions:", error);
      alert(`Failed to generate AI questions: ${error.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Parse AI response when JSON parsing fails
  const parseAIResponse = (text) => {
    const questions = [];
    const lines = text.split("\n");
    let currentQuestion = null;

    lines.forEach((line) => {
      line = line.trim();
      if (line.toLowerCase().includes("question") && line.includes(":")) {
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = {
          question: line.split(":").slice(1).join(":").trim(),
          type: "mcq",
          options: [],
          marks: 2,
        };
      } else if (
        currentQuestion &&
        (line.match(/^[A-D]\)/i) || line.match(/^[a-d]\./))
      ) {
        currentQuestion.options.push(line.substring(2).trim());
      } else if (currentQuestion && line.toLowerCase().includes("answer:")) {
        currentQuestion.correctAnswer = line.split(":")[1].trim();
      } else if (
        currentQuestion &&
        line.toLowerCase().includes("explanation:")
      ) {
        currentQuestion.explanation = line.split(":")[1].trim();
      }
    });

    if (currentQuestion) questions.push(currentQuestion);
    return questions;
  };

  // Add question to quiz
  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (
      currentQuestion.type === "mcq" &&
      currentQuestion.options.some((opt) => !opt.trim())
    ) {
      alert("Please fill all options for MCQ");
      return;
    }

    if (currentQuestion.type === "mcq" && !currentQuestion.correctAnswer) {
      alert("Please select the correct answer");
      return;
    }

    if (
      currentQuestion.type === "truefalse" &&
      !currentQuestion.correctAnswer
    ) {
      alert("Please select True or False");
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: Date.now(),
      number: quiz.questions.length + 1,
    };

    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalMarks: prev.totalMarks + parseInt(currentQuestion.marks),
    }));

    // Reset current question
    setCurrentQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      explanation: "",
    });
  };

  // Remove question
  const removeQuestion = (questionId) => {
    const questionToRemove = quiz.questions.find((q) => q.id === questionId);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      totalMarks: prev.totalMarks - parseInt(questionToRemove.marks),
    }));
  };

  // Update question option
  const updateOption = (index, value) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  // Shuffle array helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentQuestion(prev => ({
          ...prev,
          image: { file, preview: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setCurrentQuestion(prev => ({
          ...prev,
          voiceNote: { blob, url }
        }));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      alert('Microphone access denied or not available');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Export to Moodle XML format
  const exportToMoodle = () => {
    if (quiz.questions.length === 0) {
      alert('Please add questions first');
      return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
`;

    quiz.questions.forEach((q, index) => {
      if (q.type === 'mcq') {
        xml += `  <question type="multichoice">
    <name>
      <text>Question ${index + 1}</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[${q.question}]]></text>
    </questiontext>
    <defaultgrade>${q.marks}</defaultgrade>
    <penalty>0.3333333</penalty>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
`;
        q.options.forEach((opt, i) => {
          const fraction = opt === q.correctAnswer ? '100' : '0';
          xml += `    <answer fraction="${fraction}">
      <text><![CDATA[${opt}]]></text>
    </answer>
`;
        });
        xml += `  </question>
`;
      } else if (q.type === 'truefalse') {
        xml += `  <question type="truefalse">
    <name>
      <text>Question ${index + 1}</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[${q.question}]]></text>
    </questiontext>
    <defaultgrade>${q.marks}</defaultgrade>
    <answer fraction="${q.correctAnswer === 'True' ? '100' : '0'}">
      <text>true</text>
    </answer>
    <answer fraction="${q.correctAnswer === 'False' ? '100' : '0'}">
      <text>false</text>
    </answer>
  </question>
`;
      } else if (q.type === 'descriptive') {
        xml += `  <question type="essay">
    <name>
      <text>Question ${index + 1}</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[${q.question}]]></text>
    </questiontext>
    <defaultgrade>${q.marks}</defaultgrade>
  </question>
`;
      }
    });

    xml += `</quiz>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title || 'quiz'}_moodle.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to Canvas QTI format
  const exportToCanvas = () => {
    if (quiz.questions.length === 0) {
      alert('Please add questions first');
      return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">
  <assessment title="${quiz.title || 'Quiz'}">
    <section>
`;

    quiz.questions.forEach((q, index) => {
      const qId = `q${index + 1}`;
      xml += `      <item title="Question ${index + 1}" ident="${qId}">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>${q.type === 'mcq' ? 'multiple_choice_question' : q.type === 'truefalse' ? 'true_false_question' : 'essay_question'}</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>${q.marks}</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">${q.question}</mattext>
          </material>
`;

      if (q.type === 'mcq') {
        xml += `          <response_lid ident="response1" rcardinality="Single">
            <render_choice>
`;
        q.options.forEach((opt, i) => {
          xml += `              <response_label ident="${i}">
                <material>
                  <mattext>${opt}</mattext>
                </material>
              </response_label>
`;
        });
        xml += `            </render_choice>
          </response_lid>
`;
      }

      xml += `        </presentation>
      </item>
`;
    });

    xml += `    </section>
  </assessment>
</questestinterop>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title || 'quiz'}_canvas_qti.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate PDF with advanced formatting
  const generatePDF = () => {
    if (quiz.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = margin;
      let pageNumber = 1;

      // Prepare questions (shuffle if needed)
      let questionsToRender = exportOptions.shuffleQuestions 
        ? shuffleArray(quiz.questions)
        : [...quiz.questions];

      // Add page numbers footer
      const addPageNumber = () => {
        if (exportOptions.pageNumbers) {
          pdf.setFontSize(9);
          pdf.setTextColor(128);
          pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          if (exportOptions.footerText) {
            pdf.text(exportOptions.footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });
          }
          pageNumber++;
        }
      };

      // Check page break with better spacing
      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - 25) {
          addPageNumber();
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Draw decorative header box
      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, 0, pageWidth, 15, 'F');
      
      yPosition = 10;

      // Main Title
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(quiz.title || "Quiz Paper", pageWidth / 2, yPosition, { align: "center" });

      yPosition = 25;
      pdf.setTextColor(0);

      // Custom header text
      if (exportOptions.headerText) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100);
        pdf.text(exportOptions.headerText, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
      }

      // Quiz information box
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'S');

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0);

      // Quiz details in two columns
      const col1X = margin + 5;
      const col2X = pageWidth / 2 + 5;
      
      pdf.text(`Subject: ${quiz.subject || "General"}`, col1X, yPosition);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, col2X, yPosition);
      yPosition += 6;
      
      pdf.text(`Duration: ${quiz.duration} minutes`, col1X, yPosition);
      pdf.text(`Total Marks: ${quiz.totalMarks}`, col2X, yPosition);
      yPosition += 6;
      
      pdf.text(`Total Questions: ${quiz.questions.length}`, col1X, yPosition);
      pdf.text(`Teacher: ${user?.name || "Teacher"}`, col2X, yPosition);
      yPosition += 10;

      // Student Information Section
      if (exportOptions.includeStudentInfo) {
        yPosition += 5;
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'FD');
        
        yPosition += 7;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("Student Name: ___________________________", margin + 5, yPosition);
        pdf.text("Roll No: _____________", col2X, yPosition);
        yPosition += 6;
        pdf.text("Class/Section: ___________", margin + 5, yPosition);
        pdf.text("Marks Obtained: _____/${quiz.totalMarks}", col2X, yPosition);
        yPosition += 10;
      }

      yPosition += 5;

      // Instructions Section
      checkPageBreak(40);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(146, 64, 14);
      pdf.text("INSTRUCTIONS", margin + 5, yPosition + 6);
      yPosition += 12;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0);

      const allInstructions = [
        "1. Read all questions carefully before attempting.",
        "2. Write your answers clearly in the space provided.",
        "3. For Multiple Choice Questions (MCQ), circle or mark the correct option.",
        "4. For True/False questions, circle T for True or F for False.",
        "5. Manage your time wisely according to the marks allocated.",
        "6. Review your answers before submission.",
      ];

      if (quiz.instructions) {
        allInstructions.push(`7. ${quiz.instructions}`);
      }

      const instructionHeight = allInstructions.length * 5 + 16;
      pdf.setFillColor(254, 243, 199);
      pdf.setDrawColor(251, 191, 36);
      pdf.roundedRect(margin, yPosition - 6, contentWidth, instructionHeight, 3, 3, 'FD');

      allInstructions.forEach((instruction) => {
        const lines = pdf.splitTextToSize(instruction, contentWidth - 10);
        lines.forEach(line => {
          pdf.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
      });

      yPosition += 10;

      // Separator line
      pdf.setDrawColor(79, 70, 229);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Questions Section
      questionsToRender.forEach((question, index) => {
        // Check if we need a new page
        checkPageBreak(exportOptions.layoutStyle === 'compact' ? 60 : 80);

        // Question header bar
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F');
        
        // Question number
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        if (exportOptions.showQuestionNumbers) {
          pdf.text(`Question ${index + 1}`, margin + 3, yPosition + 5.5);
        }

        // Difficulty badge
        if (exportOptions.showDifficulty && question.difficulty) {
          const difficultyColors = {
            easy: { bg: [34, 197, 94], text: "EASY" },
            medium: { bg: [234, 179, 8], text: "MEDIUM" },
            hard: { bg: [239, 68, 68], text: "HARD" }
          };
          const diffColor = difficultyColors[question.difficulty] || difficultyColors.medium;
          
          pdf.setFillColor(...diffColor.bg);
          pdf.roundedRect(margin + 70, yPosition + 1.5, 18, 5, 1, 1, 'F');
          pdf.setFontSize(7);
          pdf.setTextColor(255, 255, 255);
          pdf.text(diffColor.text, margin + 79, yPosition + 4.5, { align: 'center' });
        }

        // Marks allocation
        if (exportOptions.showPoints) {
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(79, 70, 229);
          pdf.text(
            `[${question.marks} mark${question.marks > 1 ? "s" : ""}]`,
            pageWidth - margin - 3,
            yPosition + 5.5,
            { align: "right" }
          );
        }

        yPosition += 12;

        // Question text
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0);
        const cleanedQuestion = cleanMarkdownForPDF(question.question);
        const questionLines = pdf.splitTextToSize(cleanedQuestion, contentWidth - 6);
        
        questionLines.forEach((line) => {
          if (checkPageBreak(7)) {
            // Continuation marker if question breaks across pages
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "italic");
            pdf.text("(continued...)", margin, yPosition);
            checkPageBreak(0);
          }
          pdf.text(line, margin + 3, yPosition);
          yPosition += exportOptions.layoutStyle === 'compact' ? 5 : 6;
        });

        // Add image if present
        if (question.image && question.image.preview) {
          checkPageBreak(60);
          yPosition += 5;
          try {
            const imgWidth = Math.min(80, contentWidth - 20);
            const imgHeight = 50;
            pdf.addImage(question.image.preview, 'JPEG', margin + 10, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;
          } catch (error) {
            console.error('Error adding image to PDF:', error);
          }
        }

        yPosition += exportOptions.layoutStyle === 'spacious' ? 8 : 5;

        // Render options based on question type
        if (question.type === "mcq") {
          const optionsToRender = exportOptions.shuffleOptions 
            ? shuffleArray(question.options)
            : question.options;

          optionsToRender.forEach((option, optIndex) => {
            checkPageBreak(10);
            
            const optionLetter = String.fromCharCode(65 + optIndex);
            const cleanedOption = cleanMarkdownForPDF(option);
            
            // Option bubble/circle
            pdf.setDrawColor(156, 163, 175);
            pdf.setLineWidth(0.5);
            pdf.circle(margin + 8, yPosition - 1.5, 2, 'S');
            
            // Option letter
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text(optionLetter, margin + 8, yPosition, { align: 'center', baseline: 'middle' });
            
            // Option text
            pdf.setFont("helvetica", "normal");
            const optionLines = pdf.splitTextToSize(cleanedOption, contentWidth - 20);
            optionLines.forEach((line, lineIdx) => {
              pdf.text(line, margin + 13, yPosition + (lineIdx * 5));
            });
            
            yPosition += Math.max(7, optionLines.length * 5 + 2);
          });
        } else if (question.type === "truefalse") {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "italic");
          pdf.text("Circle the correct answer:", margin + 5, yPosition);
          yPosition += 8;
          
          // True/False circles
          pdf.setLineWidth(1);
          pdf.setDrawColor(34, 197, 94);
          pdf.circle(margin + 20, yPosition - 2, 4, 'S');
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.text("TRUE", margin + 27, yPosition);
          
          pdf.setDrawColor(239, 68, 68);
          pdf.circle(margin + 60, yPosition - 2, 4, 'S');
          pdf.text("FALSE", margin + 67, yPosition);
          
          yPosition += 10;
        } else if (question.type === "descriptive") {
          checkPageBreak(30);
          
          // Answer space with lines
          const lineCount = Math.max(4, Math.ceil(question.marks / 2));
          const lineSpacing = exportOptions.layoutStyle === 'compact' ? 8 : 10;
          
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(100);
          pdf.text("Write your answer below:", margin + 5, yPosition);
          yPosition += 6;
          
          for (let i = 0; i < lineCount; i++) {
            checkPageBreak(lineSpacing + 5);
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.3);
            pdf.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
            yPosition += lineSpacing;
          }
          yPosition += 5;
        }

        yPosition += exportOptions.layoutStyle === 'spacious' ? 12 : (exportOptions.layoutStyle === 'compact' ? 6 : 8);
        
        // Question separator line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += exportOptions.layoutStyle === 'spacious' ? 8 : 5;
      });

      addPageNumber();

      // Answer Key Section (separate page or at end)
      if (exportOptions.includeAnswerKey) {
        if (exportOptions.separateAnswerKey) {
          addPageNumber();
          pdf.addPage();
          yPosition = margin;
          pageNumber++;
        } else {
          checkPageBreak(40);
          yPosition += 15;
        }

        // Answer Key Header
        pdf.setFillColor(220, 38, 38);
        pdf.rect(0, yPosition, pageWidth, 20, 'F');
        
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text("ANSWER KEY", pageWidth / 2, yPosition + 8, { align: "center" });
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "italic");
        pdf.text("(Confidential - For Teacher/Examiner Use Only)", pageWidth / 2, yPosition + 15, { align: "center" });
        
        yPosition += 28;
        pdf.setTextColor(0);

        // Answer summary table header
        if (exportOptions.includeScoringGuide) {
          pdf.setFillColor(241, 245, 249);
          pdf.rect(margin, yPosition, contentWidth, 8, 'FD');
          
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text("Q.No", margin + 5, yPosition + 5.5);
          pdf.text("Type", margin + 25, yPosition + 5.5);
          pdf.text("Correct Answer", margin + 50, yPosition + 5.5);
          pdf.text("Points", pageWidth - margin - 20, yPosition + 5.5);
          
          yPosition += 10;
        }

        // Detailed answers with perfect alignment
        questionsToRender.forEach((question, index) => {
          checkPageBreak(exportOptions.includeExplanations ? 35 : 20);

          // Question row background (alternating) - Calculate height first
          const rowHeight = exportOptions.includeExplanations ? 25 : 12;
          if (index % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin, yPosition - 2, contentWidth, rowHeight, 'F');
          }

          // Question number with colored badge
          pdf.setFillColor(79, 70, 229);
          pdf.roundedRect(margin + 2, yPosition - 1, 12, 6, 1, 1, 'F');
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
          pdf.text(`Q${index + 1}`, margin + 8, yPosition + 3, { align: 'center' });

          pdf.setTextColor(0);
          
          // Question type badge
          const typeColors = {
            mcq: [59, 130, 246],
            truefalse: [34, 197, 94],
            descriptive: [168, 85, 247]
          };
          const typeColor = typeColors[question.type] || [100, 100, 100];
          pdf.setFillColor(...typeColor);
          pdf.roundedRect(margin + 20, yPosition - 1, 22, 6, 1, 1, 'F');
          pdf.setFontSize(7);
          pdf.setTextColor(255, 255, 255);
          const typeText = question.type === 'mcq' ? 'MCQ' : question.type === 'truefalse' ? 'T/F' : 'DESC';
          pdf.text(typeText, margin + 31, yPosition + 3, { align: 'center' });

          pdf.setTextColor(0);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          // Correct answer with proper alignment
          let answerText = "";
          let answerX = margin + 48;
          
          if (question.type === "mcq") {
            const correctIndex = question.options.findIndex(
              (opt) => opt === question.correctAnswer
            );
            const correctLetter = String.fromCharCode(65 + correctIndex);
            const cleanedAnswer = cleanMarkdownForPDF(question.correctAnswer);
            
            // Highlight correct option
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(34, 197, 94);
            answerText = `${correctLetter})  ${cleanedAnswer.substring(0, 40)}${cleanedAnswer.length > 40 ? '...' : ''}`;
          } else if (question.type === "truefalse") {
            pdf.setFont("helvetica", "bold");
            if (question.correctAnswer === "True") {
              pdf.setTextColor(34, 197, 94);
            } else {
              pdf.setTextColor(239, 68, 68);
            }
            answerText = question.correctAnswer;
          } else {
            pdf.setFont("helvetica", "italic");
            pdf.setTextColor(100);
            answerText = "See explanation below";
          }

          pdf.text(answerText, answerX, yPosition + 3);

          // Points
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(79, 70, 229);
          pdf.text(`${question.marks}`, pageWidth - margin - 15, yPosition + 3, { align: 'center' });

          yPosition += 8;

          // Explanation section
          if (exportOptions.includeExplanations && question.explanation) {
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "italic");
            pdf.setTextColor(60);
            
            const cleanedExplanation = cleanMarkdownForPDF(question.explanation);
            const explanationLines = pdf.splitTextToSize(cleanedExplanation, contentWidth - 15);
            
            pdf.text("💡 ", margin + 5, yPosition);
            explanationLines.forEach((line, lineIdx) => {
              if (lineIdx === 0) {
                pdf.text(line, margin + 10, yPosition);
              } else {
                checkPageBreak(5);
                pdf.text(line, margin + 10, yPosition + (lineIdx * 4));
              }
            });
            yPosition += explanationLines.length * 4 + 5;
          } else {
            yPosition += 4;
          }

          pdf.setTextColor(0);
        });

        // Scoring guide summary
        if (exportOptions.includeScoringGuide) {
          checkPageBreak(40);
          yPosition += 10;
          
          pdf.setFillColor(254, 249, 195);
          pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
          pdf.setDrawColor(251, 191, 36);
          pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'S');
          
          yPosition += 7;
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(146, 64, 14);
          pdf.text("SCORING GUIDE", margin + 5, yPosition);
          
          yPosition += 7;
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0);
          
          const scoringDetails = [
            `Total Questions: ${questionsToRender.length}`,
            `Total Marks: ${quiz.totalMarks}`,
            `MCQ Questions: ${questionsToRender.filter(q => q.type === 'mcq').length}`,
            `True/False: ${questionsToRender.filter(q => q.type === 'truefalse').length}`,
            `Descriptive: ${questionsToRender.filter(q => q.type === 'descriptive').length}`,
          ];
          
          const col1 = margin + 5;
          const col2 = margin + contentWidth / 2;
          
          scoringDetails.forEach((detail, idx) => {
            const x = idx < 3 ? col1 : col2;
            const y = yPosition + ((idx % 3) * 5);
            pdf.text(detail, x, y);
          });
        }

        addPageNumber();
      }

      // Save PDF
      const fileName = `${quiz.title || "Quiz"}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                AI-Powered PDF Quiz Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Create printable quiz papers with AI assistance or manual
                control
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quiz Settings */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quiz Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) =>
                      setQuiz((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={quiz.subject}
                    onChange={(e) =>
                      setQuiz((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={quiz.duration}
                    onChange={(e) =>
                      setQuiz((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 60,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={quiz.totalMarks}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions (Optional)
                </label>
                <textarea
                  value={quiz.instructions}
                  onChange={(e) =>
                    setQuiz((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Enter special instructions for the quiz"
                />
              </div>
            </CardContent>
          </Card>

          {/* Indian Curriculum Configuration */}
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-900 dark:text-orange-100">Indian Education System</span>
                </div>
                <Button
                  onClick={() => setShowIndianCurriculum(!showIndianCurriculum)}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  {showIndianCurriculum ? "Hide" : "Configure"}
                </Button>
              </CardTitle>
            </CardHeader>
            {showIndianCurriculum && (
              <CardContent className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Board/Curriculum</label>
                    <select
                      value={curriculumConfig.board}
                      onChange={(e) => setCurriculumConfig(prev => ({...prev, board: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      {indianBoards.map(board => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Class/Grade</label>
                    <select
                      value={curriculumConfig.class}
                      onChange={(e) => setCurriculumConfig(prev => ({...prev, class: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={curriculumConfig.language}
                      onChange={(e) => setCurriculumConfig(prev => ({...prev, language: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      {languages.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Exam Pattern</label>
                    <select
                      value={curriculumConfig.examPattern}
                      onChange={(e) => setCurriculumConfig(prev => ({...prev, examPattern: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      {examPatterns.map(pattern => (
                        <option key={pattern.id} value={pattern.id}>{pattern.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">NCERT Chapter (Optional)</label>
                    <input
                      type="text"
                      value={curriculumConfig.ncertChapter}
                      onChange={(e) => setCurriculumConfig(prev => ({...prev, ncertChapter: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="e.g., Chapter 5: Quadratic Equations"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={curriculumConfig.competencyBased}
                      onChange={(e) => setCurriculumConfig(prev => ({...prev, competencyBased: e.target.checked}))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">NEP 2020 Competency-Based Assessment</span>
                  </label>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> AI will generate questions based on {curriculumConfig.board} syllabus,
                    Class {curriculumConfig.class} level, in {languages.find(l => l.id === curriculumConfig.language)?.name} language,
                    following {examPatterns.find(p => p.id === curriculumConfig.examPattern)?.name}.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Question Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Question Creation</span>
                <Button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  variant={showAIPanel ? "default" : "outline"}
                  size="sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {showAIPanel ? "Manual Mode" : "AI Generate"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAIPanel ? (
                /* AI Generation Panel */
                <div className="space-y-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        AI Question Generator
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Let AI create questions for your topic
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Topic/Subject *
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Photosynthesis in Plants, World War 2, Python Programming"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Questions
                      </label>
                      <select
                        value={aiQuestionCount}
                        onChange={(e) =>
                          setAiQuestionCount(parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {[3, 5, 8, 10, 15, 20].map((num) => (
                          <option key={num} value={num}>
                            {num} questions
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question Types
                      </label>
                      <div className="space-y-1">
                        {["mcq", "truefalse", "descriptive"].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={aiQuestionTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAiQuestionTypes([
                                    ...aiQuestionTypes,
                                    type,
                                  ]);
                                } else {
                                  setAiQuestionTypes(
                                    aiQuestionTypes.filter((t) => t !== type)
                                  );
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">
                              {type === "mcq"
                                ? "Multiple Choice"
                                : type === "truefalse"
                                ? "True/False"
                                : "Descriptive"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={generateAIQuestions}
                    disabled={
                      isGeneratingAI ||
                      !aiTopic.trim() ||
                      aiQuestionTypes.length === 0
                    }
                    className="w-full"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating AI Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate {aiQuestionCount} Questions with AI
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                /* Manual Question Types */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {questionTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            type: type.id,
                            options: type.id === "mcq" ? ["", "", "", ""] : [],
                            correctAnswer: "",
                          }))
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          currentQuestion.type === type.id
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900`
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mx-auto mb-2 ${
                            currentQuestion.type === type.id
                              ? `text-${type.color}-600 dark:text-${type.color}-400`
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Question Builder */}
          {!showAIPanel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question *
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion((prev) => ({
                        ...prev,
                        question: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Enter your question here"
                  />
                </div>

                {/* Media Upload Section */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Add Media (Optional)</span>
                    <Button
                      onClick={() => setShowMediaUpload(!showMediaUpload)}
                      variant="outline"
                      size="sm"
                    >
                      {showMediaUpload ? "Hide" : "Show"} Media Options
                    </Button>
                  </div>

                  {showMediaUpload && (
                    <div className="space-y-3">
                      {/* Image Upload */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                          <Image className="w-4 h-4" />
                          <span className="text-sm">Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {currentQuestion.image && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckSquare className="w-4 h-4" />
                            Image added
                            <button
                              onClick={() => setCurrentQuestion(prev => ({...prev, image: null}))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Image Preview */}
                      {currentQuestion.image && (
                        <div className="relative">
                          <img
                            src={currentQuestion.image.preview}
                            alt="Question"
                            className="max-w-full h-32 object-contain border rounded"
                          />
                        </div>
                      )}

                      {/* Voice Recording */}
                      <div className="flex items-center gap-3">
                        {!isRecording ? (
                          <button
                            onClick={startVoiceRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <Mic className="w-4 h-4" />
                            <span className="text-sm">Record Voice Note</span>
                          </button>
                        ) : (
                          <button
                            onClick={stopVoiceRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg animate-pulse"
                          >
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            <span className="text-sm">Stop Recording</span>
                          </button>
                        )}
                        {currentQuestion.voiceNote && (
                          <div className="flex items-center gap-2">
                            <audio controls src={currentQuestion.voiceNote.url} className="h-8" />
                            <button
                              onClick={() => setCurrentQuestion(prev => ({...prev, voiceNote: null}))}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        Add images for diagrams, graphs, or visual questions. Voice notes for pronunciation or instructions.
                      </p>
                    </div>
                  )}
                </div>

                {/* MCQ Options */}
                {currentQuestion.type === "mcq" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {String.fromCharCode(65 + index)})
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder={`Option ${String.fromCharCode(
                              65 + index
                            )}`}
                          />
                          <button
                            onClick={() =>
                              setCurrentQuestion((prev) => ({
                                ...prev,
                                correctAnswer: option,
                              }))
                            }
                            className={`px-3 py-2 rounded-lg text-sm ${
                              currentQuestion.correctAnswer === option
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {currentQuestion.correctAnswer === option
                              ? "Correct"
                              : "Mark Correct"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* True/False Options */}
                {currentQuestion.type === "truefalse" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Correct Answer *
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            correctAnswer: "True",
                          }))
                        }
                        className={`px-4 py-2 rounded-lg ${
                          currentQuestion.correctAnswer === "True"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        True
                      </button>
                      <button
                        onClick={() =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            correctAnswer: "False",
                          }))
                        }
                        className={`px-4 py-2 rounded-lg ${
                          currentQuestion.correctAnswer === "False"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        False
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Marks *
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.marks}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          marks: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Explanation (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.explanation}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          explanation: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Brief explanation"
                    />
                  </div>
                </div>

                {/* Bloom's Taxonomy & NEP Competency */}
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Bloom's Taxonomy Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {bloomsLevels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setCurrentQuestion(prev => ({...prev, bloomsLevel: level.id}))}
                          className={`p-2 rounded text-xs border-2 transition-all ${
                            currentQuestion.bloomsLevel === level.id
                              ? `${level.color} border-blue-500 font-bold`
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          title={level.desc}
                        >
                          {level.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {curriculumConfig.competencyBased && (
                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        NEP 2020 Competency
                      </label>
                      <select
                        value={currentQuestion.nepCompetency}
                        onChange={(e) =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            nepCompetency: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      >
                        <option value="">Select Competency</option>
                        {nepCompetencies.map(comp => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <Button onClick={addQuestion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quiz Summary & Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Quiz Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {quiz.questions.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Questions
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <Star className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quiz.totalMarks}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Marks
                  </p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {quiz.duration}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Minutes
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <Layout className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    PDF
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Format
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setShowExportConfig(true)}
                  disabled={quiz.questions.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Export Options
                </Button>

                <Button
                  onClick={generatePDF}
                  disabled={quiz.questions.length === 0 || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Quick Export PDF
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isPreviewMode ? "Hide Preview" : "Preview Quiz"}
                </Button>
              </div>

              {/* LMS Export Options */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Export to LMS
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={exportToMoodle}
                    disabled={quiz.questions.length === 0}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <BookMarked className="w-4 h-4 mr-2" />
                    Export to Moodle XML
                  </Button>
                  <Button
                    onClick={exportToCanvas}
                    disabled={quiz.questions.length === 0}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Export to Canvas QTI
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Import directly into your Learning Management System
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Question List */}
          {quiz.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions ({quiz.questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              question.type === "mcq"
                                ? "default"
                                : question.type === "truefalse"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {question.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {question.marks} mark{question.marks > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {question.question.length > 60
                            ? question.question.substring(0, 60) + "..."
                            : question.question}
                        </p>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Export Configuration Modal */}
      <AnimatePresence>
        {showExportConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl max-h-[90vh] overflow-y-auto p-6 w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    PDF Export Configuration
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize your quiz export settings</p>
                </div>
                <Button variant="outline" onClick={() => setShowExportConfig(false)}>✕</Button>
              </div>

              <div className="space-y-6">
                {/* Layout Options */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Layout Style
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[{value: 'standard', label: 'Standard', desc: 'Balanced spacing'}, 
                      {value: 'compact', label: 'Compact', desc: 'Save paper'},
                      {value: 'spacious', label: 'Spacious', desc: 'More room'}].map(style => (
                      <button
                        key={style.value}
                        onClick={() => setExportOptions(prev => ({...prev, layoutStyle: style.value}))}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          exportOptions.layoutStyle === style.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-3">Display Options</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.showDifficulty}
                        onChange={(e) => setExportOptions(prev => ({...prev, showDifficulty: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Show Difficulty Badges</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.showPoints}
                        onChange={(e) => setExportOptions(prev => ({...prev, showPoints: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Show Points</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeStudentInfo}
                        onChange={(e) => setExportOptions(prev => ({...prev, includeStudentInfo: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Student Info Section</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.showQuestionNumbers}
                        onChange={(e) => setExportOptions(prev => ({...prev, showQuestionNumbers: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Question Numbers</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.pageNumbers}
                        onChange={(e) => setExportOptions(prev => ({...prev, pageNumbers: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Page Numbers</span>
                    </label>
                  </div>
                </div>

                {/* Answer Key Options */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-3">Answer Key Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeAnswerKey}
                        onChange={(e) => setExportOptions(prev => ({...prev, includeAnswerKey: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Include Answer Key</span>
                    </label>
                    {exportOptions.includeAnswerKey && (
                      <div className="ml-6 space-y-2">
                        <label className="flex items-center gap-2 p-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.separateAnswerKey}
                            onChange={(e) => setExportOptions(prev => ({...prev, separateAnswerKey: e.target.checked}))}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Separate Answer Key Page</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.includeExplanations}
                            onChange={(e) => setExportOptions(prev => ({...prev, includeExplanations: e.target.checked}))}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Include Explanations</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.includeScoringGuide}
                            onChange={(e) => setExportOptions(prev => ({...prev, includeScoringGuide: e.target.checked}))}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Include Scoring Guide</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-3">Advanced Options</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.shuffleQuestions}
                        onChange={(e) => setExportOptions(prev => ({...prev, shuffleQuestions: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Shuffle Questions</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={exportOptions.shuffleOptions}
                        onChange={(e) => setExportOptions(prev => ({...prev, shuffleOptions: e.target.checked}))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Shuffle MCQ Options</span>
                    </label>
                  </div>
                </div>

                {/* Custom Headers/Footers */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Custom Text</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Header Text</label>
                      <input
                        type="text"
                        value={exportOptions.headerText}
                        onChange={(e) => setExportOptions(prev => ({...prev, headerText: e.target.value}))}
                        placeholder="e.g., Midterm Examination 2025"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Footer Text</label>
                      <input
                        type="text"
                        value={exportOptions.footerText}
                        onChange={(e) => setExportOptions(prev => ({...prev, footerText: e.target.value}))}
                        placeholder="e.g., Institution Name"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowExportConfig(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => { setShowExportConfig(false); generatePDF(); }} 
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {isGenerating ? 'Generating...' : 'Export PDF with These Settings'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quiz Preview
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewMode(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h1 className="text-xl font-bold">
                    {quiz.title || "Quiz Title"}
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                    <p>
                      <strong>Subject:</strong> {quiz.subject || "General"}
                    </p>
                    <p>
                      <strong>Duration:</strong> {quiz.duration} min
                    </p>
                    <p>
                      <strong>Total Marks:</strong> {quiz.totalMarks}
                    </p>
                    <p>
                      <strong>Questions:</strong> {quiz.questions.length}
                    </p>
                  </div>
                </div>

                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">Q{index + 1}.</h3>
                        <div className="text-gray-700 dark:text-gray-300">
                          <MarkdownText>{question.question}</MarkdownText>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {question.marks} mark{question.marks > 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {question.type === "mcq" && (
                      <div className="space-y-1 ml-4">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`${
                              option === question.correctAnswer
                                ? "text-green-600 font-medium"
                                : ""
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIndex)}){" "}
                            </span>
                            <MarkdownText>{option}</MarkdownText>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "truefalse" && (
                      <div className="ml-4">
                        <p>True / False</p>
                        <p className="text-green-600 font-medium text-sm">
                          Answer: {question.correctAnswer}
                        </p>
                      </div>
                    )}

                    {question.type === "descriptive" && (
                      <div className="ml-4 space-y-2">
                        {Array.from({
                          length: Math.max(3, Math.ceil(question.marks / 2)),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className="border-b border-gray-300 h-6"
                          ></div>
                        ))}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="ml-4 mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                        <span className="font-medium">Explanation: </span>
                        <MarkdownText>{question.explanation}</MarkdownText>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
