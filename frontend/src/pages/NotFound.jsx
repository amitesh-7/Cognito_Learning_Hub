import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <h1 className="text-9xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.button>
          </Link>

          <Link to="/quizzes">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 rounded-xl font-bold border-2 border-violet-300 dark:border-violet-600 hover:bg-violet-50 dark:hover:bg-slate-700 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" />
              Browse Quizzes
            </motion.button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-12 text-6xl"
        >
          🧭
        </motion.div>
      </motion.div>
    </div>
  );
}
