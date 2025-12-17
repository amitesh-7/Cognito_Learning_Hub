import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureRoadmap from '../components/FeatureRoadmap';

export default function FeatureRoadmapPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30 py-8 px-4">
      {/* Back button */}
      <div className="max-w-5xl mx-auto mb-6">
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl hover:shadow-lg transition-all text-gray-700 dark:text-gray-300"
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Dashboard</span>
        </motion.button>
      </div>

      {/* Roadmap component */}
      <div className="max-w-5xl mx-auto">
        <FeatureRoadmap />
      </div>
    </div>
  );
}
