
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};


export default function QuizMaker() {
  // --- NEW: State to hold the fetched animation data ---
  const [aiSparklesAnimation, setAiSparklesAnimation] = useState(null);
  const [fileUploadAnimation, setFileUploadAnimation] = useState(null);
  const [manualEditAnimation, setManualEditAnimation] = useState(null);

  // --- NEW: useEffect to fetch animations from the public folder ---
  useEffect(() => {
    const fetchAnimation = async (url, setter) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            setter(data);
        } catch (error) {
            console.error(`Failed to fetch animation from ${url}:`, error);
        }
    };

    fetchAnimation('/animations/ai-sparkles.json', setAiSparklesAnimation);
    fetchAnimation('/animations/file-upload.json', setFileUploadAnimation);
    fetchAnimation('/animations/manual-edit.json', setManualEditAnimation);
  }, []);


  return (
    <motion.div 
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.div className="text-center mb-12" variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome to the Quiz Studio</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Your creative hub for building engaging learning experiences.</p>
      </motion.div>

      <motion.div className="mb-12" variants={itemVariants}>
        <video 
            src="/studio-video.mp4" 
            alt="An animated graphic showing a teacher creating a quiz with AI"
            className="rounded-2xl shadow-xl w-full"
            loop
            autoPlay
            muted
            playsInline
        />
      </motion.div>

      <motion.div 
        className="space-y-10"
        variants={containerVariants}
      >
        {/* AI Powered Options */}
        <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-indigo-500 pl-4">AI Powered <span className="text-indigo-500 dark:text-indigo-400">(Recommended)</span></h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Link to="/quiz-maker/topic" className="group block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="w-20 h-20 mb-4">
                        {aiSparklesAnimation && <Lottie animationData={aiSparklesAnimation} loop={true} />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Generate from Topic</h3>
                    <p className="text-gray-600 dark:text-gray-400">The fastest way to create. Just provide a topic or text, and let our AI do the rest.</p>
                </Link>
                <Link to="/quiz-maker/file" className="group block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="w-20 h-20 mb-4">
                        {fileUploadAnimation && <Lottie animationData={fileUploadAnimation} loop={true} />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Generate from File</h3>
                    <p className="text-gray-600 dark:text-gray-400">Upload a PDF or text file, and we'll automatically extract the content to build your quiz.</p>
                </Link>
            </div>
        </motion.div>

        {/* Manual Option */}
        <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-gray-400 pl-4">Manual Control</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <Link to="/quiz-maker/manual" className="group block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-20 h-20">
                            {manualEditAnimation && <Lottie animationData={manualEditAnimation} loop={true} />}
                        </div>
                        <div className="ml-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Manually</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">For ultimate precision, build your quiz question by question with our step-by-step editor.</p>
                        </div>
                    </div>
                </Link>
                
                <Link to="/pdf-quiz-generator" className="group block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center">
                            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI PDF Quiz Generator</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Create printable quiz papers with AI-generated questions or manual control, with customizable marks.</p>
                        </div>
                    </div>
                </Link>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
