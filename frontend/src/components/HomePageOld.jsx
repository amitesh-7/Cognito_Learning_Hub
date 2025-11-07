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

// Section animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

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
        className="py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
          <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Get Started in 3 Easy Steps</h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">From concept to quiz in minutes.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12 text-center">
                  <div>
                      <div className="text-5xl font-bold text-indigo-200 dark:text-indigo-500 mb-2">1</div>
                      <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Create</h3>
                      <p className="text-gray-600 dark:text-gray-300">Choose your method: generate with AI from a topic or file, or build your quiz manually for full control.</p>
                  </div>
                  <div>
                      <div className="text-5xl font-bold text-indigo-200 dark:text-indigo-500 mb-2">2</div>
                      <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Play & Share</h3>
                      <p className="text-gray-600 dark:text-gray-300">Take quizzes with our interactive player. Teachers can easily share quizzes with their students.</p>
                  </div>
                  <div>
                      <div className="text-5xl font-bold text-indigo-200 dark:text-indigo-500 mb-2">3</div>
                      <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Learn & Improve</h3>
                      <p className="text-gray-600 dark:text-gray-300">Track your scores on your personal dashboard and use the AI Doubt Solver to understand difficult concepts.</p>
                  </div>
              </div>
          </div>
      </motion.section>
      
      {/* Statistics Section */}
      <motion.section 
        className="text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
          <div className="grid md:grid-cols-3 gap-8">
              <div>
                  <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">10,000+</p>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-2">Quizzes Taken</p>
              </div>
              <div>
                  <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">500+</p>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-2">Teachers Onboard</p>
              </div>
              <div>
                  <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">95%</p>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-2">Positive Feedback</p>
              </div>
          </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-16"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
          <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Loved by Students and Teachers</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 italic">"Quizwise-AI has been a game-changer for my classroom. I can create differentiated quizzes in minutes, not hours. My students are more engaged than ever!"</p>
                  <p className="mt-4 font-bold text-right text-gray-900 dark:text-white">- Reena Chaurasia, High School Teacher</p>
              </div>
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 italic">"The AI Doubt Solver is my favorite feature. It's like having a 24/7 tutor. I finally understand complex topics I used to struggle with."</p>
                  <p className="mt-4 font-bold text-right text-gray-900 dark:text-white">- Shashank, 11th Grade Student</p>
              </div>
          </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        className="text-center py-20 bg-indigo-600 dark:bg-indigo-800 rounded-2xl"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
          <h2 className="text-4xl font-extrabold text-white">Ready to Revolutionize Your Learning?</h2>
          <div className="mt-8">
              <Link to="/signup" className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105">
                  Sign Up Now - It's Free!
              </Link>
    
          </div>
      </motion.section>
    </div>
    </div>
  );
}
