import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import ReportModal from '../components/ReportModal';

// Icons
const BookOpenIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const HelpCircleIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const UserIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SearchIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const ClockIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>);
const TrendingUpIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);
const StarIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>);
const ActivityIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
const PlayIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21"/></svg>);
const FlagIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>);

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const activityVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes`);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes.');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(quiz => 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return (b.timesTaken || 0) - (a.timesTaken || 0);
        case 'questions':
          return b.questions.length - a.questions.length;
        default:
          return 0;
      }
    });

  // Generate activity feed data
  const recentActivity = quizzes
    .slice(0, 5)
    .map((quiz, index) => ({
      id: quiz._id,
      type: 'quiz_created',
      title: quiz.title,
      user: quiz.createdBy?.name || 'Unknown',
      time: new Date(quiz.createdAt).toLocaleDateString(),
      questions: quiz.questions.length,
      difficulty: quiz.difficulty || 'Medium'
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Explore Quizzes 📚
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover engaging quizzes created by teachers and challenge yourself with interactive learning
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Sidebar - Activity Feed */}
        <motion.div 
          className="xl:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <ActivityIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    variants={activityVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <BookOpenIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {activity.user}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.questions} questions
                        </Badge>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {quizzes.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Search and Filter Section */}
          <motion.div 
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search quizzes or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="questions">Most Questions</option>
            </select>
          </motion.div>

          {/* Featured Quiz Highlight */}
          {filteredQuizzes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <StarIcon className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-lg font-semibold">Featured Quiz</h3>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{filteredQuizzes[0].title}</h4>
                  <p className="text-indigo-100 mb-4">
                    Created by {filteredQuizzes[0].createdBy?.name || 'Unknown'} • {filteredQuizzes[0].questions.length} questions
                  </p>
                  <Link to={`/quiz/${filteredQuizzes[0]._id}`}>
                    <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Quiz Grid */}
          {filteredQuizzes.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <BookOpenIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No quizzes found' : 'No quizzes available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? `Try searching for something else` : 'Ask a teacher to create the first quiz!'}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredQuizzes.slice(1).map((quiz, index) => (
                <motion.div
                  key={quiz._id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300">
                    <div className="p-6 flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                          <BookOpenIcon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {quiz.difficulty || 'Medium'}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {quiz.title}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <HelpCircleIcon className="w-4 h-4 mr-2 flex-shrink-0"/>
                          <span>{quiz.questions.length} questions</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <UserIcon className="w-4 h-4 mr-2 flex-shrink-0"/>
                          <span>by {quiz.createdBy?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0"/>
                          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex gap-3">
                      <Link to={`/quiz/${quiz._id}/leaderboard`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <TrendingUpIcon className="w-4 h-4 mr-2" />
                          Leaderboard
                        </Button>
                      </Link>
                      <Link to={`/quiz/${quiz._id}`} className="flex-1">
                        <Button className="w-full">
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Play Quiz
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowReportModal(true);
                        }}
                        className="px-3 text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
                      >
                        <FlagIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Report Modal */}
      {selectedQuiz && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedQuiz(null);
          }}
          quiz={selectedQuiz}
          questionText=""
        />
      )}
    </div>
  );
}
