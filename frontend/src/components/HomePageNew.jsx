import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Gamepad2, MessageCircle, Brain, Zap, Users, Award, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import FloatingIconsBackground from './FloatingIconsBackground';
import { staggerContainer, staggerItem, fadeInUp } from '../lib/utils';
import '../animations.css';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <FloatingIconsBackground />
      <div className="relative z-10 space-y-24 md:space-y-32">
        
        {/* Hero Section */}
        <motion.section 
          className="grid md:grid-cols-2 gap-12 items-center pt-12 pb-20"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className="text-center md:text-left space-y-6" variants={staggerItem}>
            <motion.div variants={fadeInUp}>
              <Badge variant="gradient" size="lg" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight"
              variants={fadeInUp}
            >
              The <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Smarter</span> Way to Learn and Teach.
            </motion.h1>
            
            <motion.p 
              className="max-w-xl mx-auto md:mx-0 text-lg text-gray-600 dark:text-gray-300"
              variants={fadeInUp}
            >
              Create engaging quizzes in seconds with AI, challenge your knowledge with interactive tests, and get instant help from your personal AI tutor.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
              variants={fadeInUp}
            >
              <Button asChild size="lg" className="group">
                <Link to="/signup">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/quizzes">Browse Quizzes</Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hidden md:block" 
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-3xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <video 
                src="/QuizWise-AI-Video.mp4" 
                className="relative rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
                loop
                autoPlay
                muted
                playsInline
              />
            </div>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-12"
        >
          <motion.div className="text-center space-y-4" variants={staggerItem}>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools for both students and educators to create, learn, and grow together.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <Card className="h-full text-center group">
                <CardContent className="p-8">
                  <motion.div 
                    className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 mx-auto text-white"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sparkles className="h-8 w-8" />
                  </motion.div>
                  <CardTitle className="mb-4">AI-Powered Creation</CardTitle>
                  <CardDescription className="text-base">
                    Generate quizzes from a topic, PDF, or simple text description. Save hours of prep time with intelligent AI assistance.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <Card className="h-full text-center group">
                <CardContent className="p-8">
                  <motion.div 
                    className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 mb-6 mx-auto text-white"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Gamepad2 className="h-8 w-8" />
                  </motion.div>
                  <CardTitle className="mb-4">Interactive Quizzes</CardTitle>
                  <CardDescription className="text-base">
                    Engage with a modern quiz player that provides instant feedback, tracks progress, and celebrates achievements.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <Card className="h-full text-center group">
                <CardContent className="p-8">
                  <motion.div 
                    className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-6 mx-auto text-white"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageCircle className="h-8 w-8" />
                  </motion.div>
                  <CardTitle className="mb-4">AI Tutor Support</CardTitle>
                  <CardDescription className="text-base">
                    Get instant help with any academic question from your personal AI tutor, available 24/7 for all subjects.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white"
        >
          <motion.div className="grid md:grid-cols-4 gap-8 text-center" variants={staggerContainer}>
            <motion.div variants={staggerItem}>
              <div className="space-y-2">
                <motion.div 
                  className="text-4xl font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  10K+
                </motion.div>
                <p className="text-indigo-100">Quizzes Created</p>
              </div>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <div className="space-y-2">
                <motion.div 
                  className="text-4xl font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  50K+
                </motion.div>
                <p className="text-indigo-100">Students Learning</p>
              </div>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <div className="space-y-2">
                <motion.div 
                  className="text-4xl font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  5K+
                </motion.div>
                <p className="text-indigo-100">Educators Teaching</p>
              </div>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <div className="space-y-2">
                <motion.div 
                  className="text-4xl font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  99%
                </motion.div>
                <p className="text-indigo-100">Satisfaction Rate</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12"
        >
          <motion.div className="text-center space-y-4 mb-12" variants={staggerItem}>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From concept to quiz in minutes.
            </p>
          </motion.div>
          
          <motion.div className="grid md:grid-cols-3 gap-12" variants={staggerContainer}>
            <motion.div className="text-center" variants={staggerItem}>
              <motion.div 
                className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6 mx-auto text-2xl font-bold"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                1
              </motion.div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign Up</h4>
              <p className="text-gray-600 dark:text-gray-300">Create your free account and choose your role: Student or Teacher.</p>
            </motion.div>
            
            <motion.div className="text-center" variants={staggerItem}>
              <motion.div 
                className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white mb-6 mx-auto text-2xl font-bold"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                2
              </motion.div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create or Take</h4>
              <p className="text-gray-600 dark:text-gray-300">Teachers create quizzes with AI, students browse and take them.</p>
            </motion.div>
            
            <motion.div className="text-center" variants={staggerItem}>
              <motion.div 
                className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white mb-6 mx-auto text-2xl font-bold"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                3
              </motion.div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Learn & Improve</h4>
              <p className="text-gray-600 dark:text-gray-300">Track progress, compete on leaderboards, and learn with AI assistance.</p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-12"
        >
          <motion.div className="text-center space-y-4" variants={staggerItem}>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Loved by Students and Teachers
            </h2>
          </motion.div>
          
          <motion.div className="grid md:grid-cols-2 gap-8" variants={staggerContainer}>
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardContent className="p-8">
                  <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                    "Quizwise-AI has completely transformed how I create quizzes for my students. The AI generates high-quality questions in seconds!"
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      MS
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Maria Sanchez</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">High School Teacher</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <Card className="h-full">
                <CardContent className="p-8">
                  <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                    "The AI Doubt Solver is amazing! I can get instant help with complex topics anytime I'm studying."
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      AK
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Alex Kumar</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">College Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <motion.div className="space-y-6" variants={staggerItem}>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of students and educators who are already using QuizWise-AI to make learning more engaging and effective.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              variants={staggerItem}
            >
              <Button asChild size="lg" className="group">
                <Link to="/signup">
                  Start Learning Today
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/quizzes">Explore Quizzes</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
