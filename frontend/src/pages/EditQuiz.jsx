import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Save, 
  Trash2, 
  CheckCircle, 
  ArrowLeft, 
  Plus, 
  AlertTriangle,
  GripVertical,
  Sparkles,
  Brain,
  FileEdit,
  CheckCircle2,
  XCircle,
  Wand2,
  RefreshCw,
  Copy,
  Settings2,
  Layers,
} from 'lucide-react';

// --- Animation Variants ---
const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      duration: 0.6 
    } 
  } 
};

const itemVariants = { 
  hidden: { y: 20, opacity: 0 }, 
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: "easeOut" 
    } 
  } 
};

const questionVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    } 
  },
  exit: { 
    opacity: 0, 
    x: 50, 
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

// --- Enhanced Success Modal Component ---
const SuccessModal = ({ isOpen, onClose, message }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
                <motion.div 
                  className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl text-center max-w-md mx-auto border border-gray-200 dark:border-gray-700 relative overflow-hidden" 
                  initial={{ scale: 0.8, opacity: 0, y: 50 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }} 
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20" />
                    
                    <div className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="relative mb-8"
                      >
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                          <CheckCircle className="w-14 h-14 text-white" />
                        </div>
                        
                        {/* Sparkle effects */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                            className="absolute"
                            style={{
                              top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 55}%`,
                              left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 55}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <Sparkles className="w-5 h-5 text-green-400" />
                          </motion.div>
                        ))}
                      </motion.div>

                      <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">Success!</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">{message}</p>
                      
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose} 
                        className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl text-lg"
                      >
                        Continue
                      </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);


export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error('Could not fetch quiz data.');
        const data = await response.json();
        setQuizTitle(data.title);
        setQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId]);

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

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
        alert("A quiz must have at least one question.");
        return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuiz = async () => {
    setError('');
    setIsSaving(true);
    const token = localStorage.getItem('quizwise-token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/${quizId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ title: quizTitle, questions })
        });
        if (!response.ok) throw new Error('Failed to update quiz.');
        setShowSuccessModal(true);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-0 max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative mb-6"
          >
            <div className="w-20 h-20 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
            <FileEdit className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Loading Quiz Editor</h3>
          <p className="text-gray-600 dark:text-gray-300">Preparing your quiz for editing...</p>
        </motion.div>
      </div>
    );
  }
  
  if (error && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-0 max-w-md"
        >
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Quiz</h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl"
        />
      </div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => navigate(-1)}
        message="Your quiz has been updated successfully!"
      />
      
      <motion.div 
        className="max-w-6xl mx-auto px-4 relative z-10" 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <FileEdit className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Edit Quiz
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
            <Layers className="w-5 h-5" />
            <span>{questions.length} Questions</span>
            <span className="text-gray-400">•</span>
            <span>Refine your quiz below</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Details & Actions */}
          <motion.div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6" variants={itemVariants}>
            {/* Quiz Title Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border-0 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <label htmlFor="quizTitle" className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white mb-4">
                <Brain className="w-5 h-5 text-indigo-500" />
                Quiz Title
              </label>
              <input 
                type="text" 
                id="quizTitle" 
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 text-lg font-medium" 
                value={quizTitle} 
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title..."
              />
            </motion.div>
            
            {/* Actions Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border-0"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-purple-500" />
                Actions
              </h3>
              <div className="space-y-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateQuiz} 
                  disabled={isSaving} 
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl disabled:shadow-none"
                >
                  {isSaving ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="h-5 w-5" />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold rounded-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Cancel
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl shadow-xl border border-indigo-200 dark:border-indigo-800"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Quiz Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Total Questions</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{questions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Potential XP</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">+{questions.length * 10}</span>
                </div>
              </div>
            </motion.div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Questions */}
          <motion.div className="lg:col-span-2 space-y-6" variants={containerVariants}>
            <AnimatePresence mode="popLayout">
              {questions.map((q, qIndex) => (
                <motion.div 
                  key={qIndex} 
                  className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-0"
                  variants={questionVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div className="p-8 space-y-6">
                    {/* Question Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          whileHover={{ rotate: 5 }}
                          className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                          <span className="text-xl font-black text-white">{qIndex + 1}</span>
                        </motion.div>
                        <div>
                          <span className="text-lg font-bold text-gray-800 dark:text-white">Question {qIndex + 1}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">4 answer options</p>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeQuestion(qIndex)} 
                        className="p-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl transition-all duration-300" 
                        title="Remove Question"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </motion.button>
                    </div>
                    
                    {/* Question Text */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <Brain className="w-4 h-4 text-indigo-500" />
                        Question Text
                      </label>
                      <textarea 
                        className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 text-lg resize-none min-h-[100px]" 
                        value={q.question} 
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        placeholder="Enter your question here..."
                        rows={2}
                      />
                    </div>
                    
                    {/* Answer Options */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        <Layers className="w-4 h-4 text-purple-500" />
                        Answer Options
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIndex) => (
                          <motion.div 
                            key={oIndex} 
                            whileHover={{ scale: 1.02 }}
                            className="relative group"
                          >
                            <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                              q.correct_answer === opt 
                                ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
                                : "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-600 dark:text-indigo-400 group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white"
                            }`}>
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <input 
                              type="text" 
                              className={`w-full pl-14 pr-4 py-4 border-2 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${
                                q.correct_answer === opt 
                                  ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20" 
                                  : "border-gray-200 dark:border-gray-600 focus:border-indigo-400"
                              }`}
                              value={opt} 
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            />
                            {q.correct_answer === opt && (
                              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Correct Answer Selector */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Correct Answer
                      </label>
                      <select 
                        className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-300 font-medium" 
                        value={q.correct_answer} 
                        onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                      >
                        <option value="" disabled>Select the correct option</option>
                        {q.options.map((opt, oIndex) => ( 
                          opt && <option key={oIndex} value={opt}>✓ {String.fromCharCode(65 + oIndex)}: {opt}</option> 
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
