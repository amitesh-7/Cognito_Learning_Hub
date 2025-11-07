import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizDisplay from '../components/QuizDisplay';

// Icons
const FileUpIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2.4-3-4.1-5.6-4.1-1.6 0-3.1.8-4.1 2.1-1.5-1-3.4-.6-4.5 1.1-.9 1.4-1 3.3.3 4.9" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>);
const SparklesIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 21l1.9-4.8 4.8-1.9-4.8-1.9L12 3z" /><path d="M5 8h2" /><path d="M17 8h2" /><path d="M8 5v2" /><path d="M8 17v2" /></svg>);
const FileIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>);
const BrainIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h0A2.5 2.5 0 0 1 7 4.5v0A2.5 2.5 0 0 1 9.5 2m0 13.5A2.5 2.5 0 0 1 12 18v0a2.5 2.5 0 0 1-2.5 2.5h0A2.5 2.5 0 0 1 7 18v0a2.5 2.5 0 0 1 2.5-2.5m5-11A2.5 2.5 0 0 1 17 4.5v0a2.5 2.5 0 0 1-2.5 2.5h0A2.5 2.5 0 0 1 12 4.5v0a2.5 2.5 0 0 1 2.5-2.5m0 13.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h0a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5"/><path d="M12 7V4.5m0 18V18m-5-5.5a2.5 2.5 0 0 1 0-5m10 5a2.5 2.5 0 0 0 0-5"/><path d="M7 12h10"/></svg>;
const FileTextIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;


// --- Animation Variants ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } }};
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }};


export default function FileQuizGenerator() {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setGeneratedQuiz(null);
    setError('');

    const token = localStorage.getItem('quizwise-token');
    if (!token) {
        setError("You must be logged in to generate a quiz.");
        setIsLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('quizFile', file);
    formData.append('numQuestions', numQuestions);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-quiz-file`, {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Server responded with ${response.status}`);
        }
        setGeneratedQuiz(data.quiz.questions);
    } catch (err) {
        console.error("Failed to generate quiz from file:", err);
        setError(err.message);
        setGeneratedQuiz([]);
    } finally {
        setIsLoading(false);
        setFile(null);
    }
  };

  const handleRetry = () => {
    setGeneratedQuiz(null);
    setFile(null);
    setError('');
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Generate Quiz from File</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Let AI do the hard work. Upload a document, and get a quiz in seconds.</p>
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
            {!file ? (
                <div>
                <label htmlFor="file-upload" className={`relative block w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${ isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700 scale-105' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500' }`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    <div className="flex flex-col items-center justify-center h-full">
                    <FileUpIcon className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="mb-2 text-md font-semibold text-gray-700 dark:text-gray-300">
                        <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Supports PDF & TXT</p>
                    </div>
                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt"/>
                </label>
                </div>
            ) : (
                <div className="p-4 border border-green-300 bg-green-50 dark:bg-green-900 dark:border-green-700 rounded-lg flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-4">
                    <FileIcon className="h-8 w-8 text-green-600 dark:text-green-400"/>
                    <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-green-700 dark:text-green-400">{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-sm font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                    Remove
                </button>
                </div>
            )}

            <div>
                <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
                <input type="number" id="numQuestions" name="numQuestions" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} min="1" max="20" required />
            </div>

            <div>
                <button type="submit" className="w-full flex justify-center items-center gap-2 p-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed transform hover:scale-105" disabled={!file || isLoading}>
                <SparklesIcon className="h-5 w-5" />
                {isLoading ? 'Processing...' : 'Generate Quiz from File'}
                </button>
            </div>
            </form>
        </div>

        {/* Right Column: Information Cards */}
        <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-gray-700 p-3 rounded-full"><BrainIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/></div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">How It Works</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Our AI analyzes the key information in your document to create relevant questions and answers, saving you hours of manual work.</p>
                </div>
            </div>
             <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-gray-700 p-3 rounded-full"><FileTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/></div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Supported Files</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For the best results, we currently support PDF (.pdf) and Plain Text (.txt) files. Image support is coming soon!</p>
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
