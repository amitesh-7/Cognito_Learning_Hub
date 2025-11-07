
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizDisplay from '../components/QuizDisplay';

// Icons
const SparklesIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 21l1.9-4.8 4.8-1.9-4.8-1.9L12 3z" /><path d="M5 8h2" /><path d="M17 8h2" /><path d="M8 5v2" /><path d="M8 17v2" /></svg>);
const LightbulbIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.09a7 7 0 0 1-8.18-8.18C7.41 3.73 11.05 2 12 2a7.02 7.02 0 0 1 7 7c0 .95-.73 4.68-4.91 7.09z"/><path d="M12 20v-2"/><path d="M6.34 17.66l-1.41-1.41"/><path d="M17.66 6.34L19.07 4.93"/></svg>;
const ClipboardCheckIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>;


// --- Animation Variants ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } }};
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }};


export default function TopicQuizGenerator() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedQuiz(null);
    setError('');

    try {
      const token = localStorage.getItem('quizwise-token');
      if (!token) throw new Error("You must be logged in to generate a quiz.");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-quiz-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ topic, numQuestions, difficulty }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      setGeneratedQuiz(data.quiz.questions);

    } catch (err) {
      console.error("Failed to fetch quiz:", err);
      setError(err.message);
      setGeneratedQuiz([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setGeneratedQuiz(null);
    setError('');
    setTopic('');
  }

  if (isLoading) return <LoadingSpinner />;
  if (generatedQuiz) return <QuizDisplay quizData={generatedQuiz} onRetry={handleRetry} />;

  return (
    <motion.div 
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.div className="text-center mb-12" variants={itemVariants}>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Generate Quiz from Topic</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">The fastest way to create. Just provide a topic, and let our AI do the rest.</p>
      </motion.div>

      <motion.div className="grid lg:grid-cols-5 gap-12 items-start" variants={itemVariants}>
        {/* Left Column: Form */}
        <div className="lg:col-span-3 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic or Description</label>
                    <textarea id="topic" name="topic" rows="5" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g., 'The basics of photosynthesis', 'Key events of World War II', or paste a few paragraphs of text..." value={topic} onChange={(e) => setTopic(e.target.value)} required></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
                        <input type="number" id="numQuestions" name="numQuestions" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} min="1" max="20" required />
                    </div>
                    <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                        <select id="difficulty" name="difficulty" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                            <option>Expert</option>
                        </select>
                    </div>
                </div>

                <div>
                    <button type="submit" className="w-full flex justify-center items-center gap-2 p-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed transform hover:scale-105" disabled={!topic.trim() || isLoading}>
                        <SparklesIcon className="h-5 w-5" />
                        {isLoading ? 'Generating...' : 'Generate Quiz'}
                    </button>
                </div>
            </form>
        </div>

        {/* Right Column: Information Cards */}
        <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-gray-700 p-3 rounded-full"><LightbulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/></div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Tips for Best Results</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Be specific! Instead of "History," try "The American Revolution from 1775 to 1783."</p>
                </div>
            </div>
             <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-gray-700 p-3 rounded-full"><ClipboardCheckIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/></div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Paste Content Directly</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You can also paste up to 1,000 words of text directly into the description box for the AI to analyze.</p>
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
