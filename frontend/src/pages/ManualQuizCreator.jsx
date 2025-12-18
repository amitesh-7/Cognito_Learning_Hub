import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

// Icons
const PrinterIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const DownloadIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
// Icons
const PlusCircleIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const SaveIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
const TrashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;


// --- Animation Variants ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }};

// --- Success Modal Component ---
const SuccessModal = ({ isOpen, onClose, message }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-auto border border-gray-200 dark:border-gray-700" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                    <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                    <button onClick={onClose} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Continue</button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);


export default function ManualQuizCreator() {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct_answer: '', points: 1, difficulty: 'medium' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    includeInstructions: true,
    includeStudentInfo: true,
    includeAnswerKey: false,
    separateAnswerKey: true,
    layoutStyle: 'standard',
    showPoints: true,
    showDifficulty: false,
    timeLimit: '',
    instructions: 'Read all questions carefully. Choose the best answer for each question. Mark your answers clearly.'
  });
  const navigate = useNavigate();

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correct_answer = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_answer: '', points: 1, difficulty: 'medium' }]);
  };
  
  const removeQuestion = (index) => {
    if (questions.length <= 1) {
        alert("A quiz must have at least one question.");
        return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const exportToPDF = (withAnswers = false) => {
    if (!quizTitle.trim()) {
      alert('Please add a quiz title before exporting.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question before exporting.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Helper function to wrap text
    const wrapText = (text, maxWidth) => {
      return doc.splitTextToSize(text, maxWidth);
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // Indigo color
    const titleLines = wrapText(quizTitle, pageWidth - 2 * margin);
    titleLines.forEach((line, index) => {
      doc.text(line, pageWidth / 2, yPosition + (index * lineHeight), { align: 'center' });
    });
    yPosition += titleLines.length * lineHeight + 10;

    // Quiz info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Total Questions: ${questions.length}`, margin, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Draw separator line
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Questions
    questions.forEach((q, qIndex) => {
      // Check if we need a new page
      checkPageBreak(60);

      // Question number and text
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(`Q${qIndex + 1}.`, margin, yPosition);
      
      doc.setFont('helvetica', 'normal');
      const questionLines = wrapText(q.question, pageWidth - 2 * margin - 15);
      questionLines.forEach((line, index) => {
        doc.text(line, margin + 15, yPosition + (index * lineHeight));
      });
      yPosition += questionLines.length * lineHeight + 5;

      // Options
      doc.setFontSize(11);
      q.options.forEach((opt, oIndex) => {
        checkPageBreak(lineHeight + 2);
        
        const optionLabel = String.fromCharCode(65 + oIndex); // A, B, C, D
        const isCorrect = withAnswers && opt === q.correct_answer;
        
        if (isCorrect) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 197, 94); // Green for correct answer
          // Draw circle around correct answer
          doc.circle(margin + 5, yPosition - 2, 2);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60);
        }
        
        const optionText = `${optionLabel}) ${opt}`;
        const optionLines = wrapText(optionText, pageWidth - 2 * margin - 20);
        optionLines.forEach((line, index) => {
          doc.text(line, margin + 12, yPosition + (index * lineHeight));
        });
        yPosition += optionLines.length * lineHeight + 3;
      });

      // Answer key section (only if withAnswers is true)
      if (withAnswers) {
        checkPageBreak(lineHeight + 5);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        const answerIndex = q.options.findIndex(opt => opt === q.correct_answer);
        const answerLabel = answerIndex >= 0 ? String.fromCharCode(65 + answerIndex) : '-';
        doc.text(`✓ Correct Answer: ${answerLabel}) ${q.correct_answer}`, margin + 12, yPosition);
        yPosition += lineHeight + 2;
      }

      yPosition += 8; // Space between questions
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    const footerText = withAnswers ? 'Answer Key Included' : 'Quiz Question Paper';
    doc.text(`${footerText} - Generated by Cognito Learning Hub`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const fileName = `${quizTitle.replace(/[^a-z0-9]/gi, '_')}_${withAnswers ? 'with_answers' : 'questions'}.pdf`;
    doc.save(fileName);
  };

  const printQuiz = () => {
    if (!quizTitle.trim() || questions.length === 0) {
      alert('Please add quiz title and questions before printing.');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${quizTitle}</title>
        <style>
          @media print {
            @page { margin: 1.5cm; }
            body { font-family: Arial, sans-serif; }
          }
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 15px; }
          h1 { color: #4F46E5; margin: 0; }
          .quiz-info { display: flex; justify-content: space-between; color: #666; font-size: 14px; margin-top: 10px; }
          .question { margin: 25px 0; page-break-inside: avoid; }
          .question-number { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
          .question-text { margin-bottom: 15px; font-size: 15px; }
          .options { margin-left: 25px; }
          .option { margin: 8px 0; font-size: 14px; }
          .answer-space { margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 15px; color: #666; font-style: italic; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${quizTitle}</h1>
          <div class="quiz-info">
            <span>Total Questions: ${questions.length}</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
        ${questions.map((q, idx) => `
          <div class="question">
            <div class="question-number">Q${idx + 1}. ${q.question}</div>
            <div class="options">
              ${q.options.map((opt, oIdx) => `
                <div class="option">${String.fromCharCode(65 + oIdx)}) ${opt}</div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div class="answer-space">
          <p><strong>Answer Sheet:</strong></p>
          ${questions.map((q, idx) => `<p>Q${idx + 1}: _____</p>`).join('')}
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveQuiz = async () => {
    setError('');
    if (!quizTitle.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    const isInvalid = questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()) || !q.correct_answer.trim());
    if (isInvalid) {
        setError('Please fill out all fields for every question.');
        return;
    }

    const token = localStorage.getItem('quizwise-token');
    if (!token) {
      setError("You must be logged in to save a quiz.");
      return;
    }
    setIsSaving(true);
    const quizData = { title: quizTitle, questions };

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/save-manual-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(quizData),
        });
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        setShowSuccessModal(true);
    } catch (error) {
        setError("Failed to save quiz. Please check the console and try again.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <>
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => navigate('/teacher-dashboard')}
        message="Your quiz has been saved successfully!"
      />
      <motion.div className="max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="text-center mb-12" variants={itemVariants}>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Manual Quiz Creator</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Build your quiz from scratch for complete control.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Details & Actions */}
            <motion.div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6" variants={itemVariants}>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <label htmlFor="quizTitle" className="block text-lg font-bold text-gray-800 dark:text-white mb-2">Quiz Title</label>
                    <input type="text" id="quizTitle" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" placeholder="e.g., 'World Capitals Challenge'" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Actions</h3>
                    <div className="space-y-3">
                        <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                            <PlusCircleIcon className="h-5 w-5" /> Add Question
                        </button>
                        <button onClick={handleSaveQuiz} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
                            <SaveIcon className="h-5 w-5" /> {isSaving ? 'Saving...' : 'Save Quiz'}
                        </button>
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Export Options</h3>
                    <div className="space-y-3">
                        <button onClick={printQuiz} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                            <PrinterIcon className="h-5 w-5" /> Print Quiz
                        </button>
                        <button onClick={() => exportToPDF(false)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors">
                            <DownloadIcon className="h-5 w-5" /> Export Questions PDF
                        </button>
                        <button onClick={() => exportToPDF(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                            <DownloadIcon className="h-5 w-5" /> Export with Answers
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">Export professionally formatted PDFs with or without answer keys</p>
                </div>
                {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}
            </motion.div>

            {/* Right Column: Questions */}
            <motion.div className="lg:col-span-2 space-y-6" variants={containerVariants}>
                <AnimatePresence>
                    {questions.map((q, qIndex) => (
                    <motion.div 
                        key={qIndex} 
                        className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-4 bg-white dark:bg-gray-800 shadow-lg"
                        variants={itemVariants}
                        layout
                    >
                        <div className="flex justify-between items-center">
                            <label className="block text-md font-bold text-gray-700 dark:text-white">Question {qIndex + 1}</label>
                            <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700" title="Remove Question">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" placeholder="Enter your question here" value={q.question} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIndex) => ( <input key={oIndex} type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} /> ))}
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer</label>
                        <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" value={q.correct_answer} onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}>
                            <option value="" disabled>Select the correct option</option>
                            {q.options.map((opt, oIndex) => ( opt && <option key={oIndex} value={opt}>{opt}</option> ))}
                        </select>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
      </motion.div>
    </>
  );
}
