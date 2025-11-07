import React, { useState, useContext } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sun, Moon, Menu, X } from "lucide-react";
import { ToastProvider } from "./components/ui/Toast";
import Button from "./components/ui/Button";
import { fadeInUp, staggerContainer, staggerItem } from "./lib/utils";

// Import Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ModeratorRoute from "./components/ModeratorRoute";

// Import Pages
import Home from "./pages/Home";
import QuizList from "./pages/QuizList";
import QuizTaker from "./pages/QuizTaker";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import EditQuiz from "./pages/EditQuiz";
import QuizMaker from "./pages/QuizMaker";
import TopicQuizGenerator from "./pages/TopicQuizGenerator";
import ManualQuizCreator from "./pages/ManualQuizCreator";
import FileQuizGenerator from "./pages/FileQuizGenerator";
import DoubtSolver from "./pages/DoubtSolver";
import ChatSystem from "./pages/ChatSystem";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Leaderboard from "./pages/Leaderboard";
import ReportsDashboard from "./pages/ReportsDashboard";
import AchievementDashboard from "./pages/AchievementDashboard";
import EnhancedQuizCreator from "./pages/EnhancedQuizCreator";
import GamifiedQuizTaker from "./pages/GamifiedQuizTaker";
import PDFQuizGenerator from "./pages/PDFQuizGenerator";
import SocialDashboard from "./pages/SocialDashboard";
import ChallengeCreator from "./pages/ChallengeCreator";
import AdminBroadcast from "./pages/AdminBroadcast";
import Features from "./pages/Features";
import LiveSessionHost from "./pages/LiveSessionHost";
import LiveSessionJoin from "./pages/LiveSessionJoin";
import LiveSessionAnalytics from "./pages/LiveSessionAnalytics";
import LiveSessionHistory from "./pages/LiveSessionHistory";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const { user, logout } = useContext(AuthContext);
  const [theme, toggleTheme] = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <SocketProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-200 transition-all duration-300">
          <motion.header
            className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/" className="flex items-center space-x-3 group">
                  <motion.div
                    className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Brain className="h-6 w-6" />
                  </motion.div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                    Cognito Learning Hub
                  </h1>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <motion.div
                className="hidden md:flex items-center space-x-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {user ? (
                  <>
                    <motion.span
                      className="font-medium text-gray-700 dark:text-gray-300 mr-4"
                      variants={staggerItem}
                    >
                      Welcome,{" "}
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {user.name}!
                      </span>
                    </motion.span>

                    <motion.div variants={staggerItem}>
                      <Link
                        to="/dashboard"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Dashboard
                      </Link>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <Link
                        to="/quizzes"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Take a Quiz
                      </Link>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <Link
                        to="/doubt-solver"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        AI Tutor
                      </Link>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <Link
                        to="/achievements"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Achievements
                      </Link>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <Link
                        to="/social"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Social Hub
                      </Link>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <Link
                        to="/chat"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Chat
                      </Link>
                    </motion.div>

                    {user.role === "Teacher" && (
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/teacher-dashboard"
                          className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                        >
                          My Quizzes
                        </Link>
                      </motion.div>
                    )}

                    {user.role === "Admin" && (
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/admin-broadcast"
                          className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200"
                        >
                          Broadcast
                        </Link>
                      </motion.div>
                    )}

                    {(user.role === "Admin" || user.role === "Moderator") && (
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/moderator"
                          className="px-3 py-2 font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200"
                        >
                          Moderator
                        </Link>
                      </motion.div>
                    )}

                    {user.role === "Admin" && (
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/admin"
                          className="px-3 py-2 font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200"
                        >
                          Admin
                        </Link>
                      </motion.div>
                    )}

                    <motion.div variants={staggerItem}>
                      <Button
                        onClick={handleLogout}
                        variant="default"
                        size="sm"
                      >
                        Logout
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={staggerItem}>
                      <Link
                        to="/features"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Features
                      </Link>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <Link
                        to="/login"
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-200"
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <Button asChild variant="default" size="sm">
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </motion.div>
                  </>
                )}

                <motion.div variants={staggerItem}>
                  <Button
                    onClick={toggleTheme}
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                  >
                    {theme === "light" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-2">
                <Button onClick={toggleTheme} variant="ghost" size="icon">
                  {theme === "light" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  variant="ghost"
                  size="icon"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </nav>
          </motion.header>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-40 p-6"
                initial={{ opacity: 0, y: "-50%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-50%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col space-y-6 pt-20 text-center text-xl">
                  {user ? (
                    <>
                      <Link
                        onClick={closeMenu}
                        to="/dashboard"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Dashboard
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/quizzes"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Take a Quiz
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/doubt-solver"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        AI Tutor
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/achievements"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Achievements
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/social"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Social Hub
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/chat"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Chat
                      </Link>
                      {user.role === "Teacher" && (
                        <>
                          <Link
                            onClick={closeMenu}
                            to="/teacher-dashboard"
                            className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                          >
                            My Quizzes
                          </Link>
                          <Link
                            onClick={closeMenu}
                            to="/quiz-maker"
                            className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                          >
                            Quiz Maker
                          </Link>
                        </>
                      )}
                      {(user.role === "Admin" || user.role === "Moderator") && (
                        <Link
                          onClick={closeMenu}
                          to="/moderator"
                          className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                        >
                          Moderator
                        </Link>
                      )}
                      {user.role === "Admin" && (
                        <Link
                          onClick={closeMenu}
                          to="/admin"
                          className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                        >
                          Admin
                        </Link>
                      )}
                      {user.role === "Admin" && (
                        <Link
                          onClick={closeMenu}
                          to="/admin-broadcast"
                          className="text-gray-800 dark:text-gray-200 hover:text-red-600"
                        >
                          Broadcast
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        onClick={closeMenu}
                        to="/features"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Features
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/login"
                        className="text-gray-800 dark:text-gray-200 hover:text-indigo-600"
                      >
                        Login
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/signup"
                        className="mt-4 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="container mx-auto p-6 lg:p-8 mt-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-dashboard"
                element={
                  <ProtectedRoute>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute>
                    <QuizList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <QuizTaker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/edit/:quizId"
                element={
                  <ProtectedRoute>
                    <EditQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-maker"
                element={
                  <ProtectedRoute>
                    <QuizMaker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-maker/topic"
                element={
                  <ProtectedRoute>
                    <TopicQuizGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-maker/manual"
                element={
                  <ProtectedRoute>
                    <ManualQuizCreator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-maker/enhanced"
                element={
                  <ProtectedRoute>
                    <EnhancedQuizCreator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-maker/file"
                element={
                  <ProtectedRoute>
                    <FileQuizGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pdf-quiz-generator"
                element={
                  <ProtectedRoute>
                    <PDFQuizGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social"
                element={
                  <ProtectedRoute>
                    <SocialDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-challenge"
                element={
                  <ProtectedRoute>
                    <ChallengeCreator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/gamified"
                element={
                  <ProtectedRoute>
                    <GamifiedQuizTaker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <AchievementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doubt-solver"
                element={
                  <ProtectedRoute>
                    <DoubtSolver />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatSystem />
                  </ProtectedRoute>
                }
              />

              {/* Live Session Routes */}
              <Route
                path="/live/host/:quizId"
                element={
                  <ProtectedRoute>
                    <LiveSessionHost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live/join"
                element={
                  <ProtectedRoute>
                    <LiveSessionJoin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live/analytics/:sessionCode"
                element={
                  <ProtectedRoute>
                    <LiveSessionAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live/history"
                element={
                  <ProtectedRoute>
                    <LiveSessionHistory />
                  </ProtectedRoute>
                }
              />

              {/* Admin & Moderator Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin-broadcast"
                element={
                  <AdminRoute>
                    <AdminBroadcast />
                  </AdminRoute>
                }
              />
              <Route
                path="/moderator"
                element={
                  <ModeratorRoute>
                    <ModeratorDashboard />
                  </ModeratorRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ModeratorRoute>
                    <ReportsDashboard />
                  </ModeratorRoute>
                }
              />
            </Routes>
          </main>

          <footer className="bg-white dark:bg-gray-900 mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; 2025{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Cognito Learning Hub
                </span>
                . All Rights Reserved.
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Made with <span className="text-red-500">❤️</span> by team
                <span className="font-medium"> OPTIMISTIC MUTANT CODERS</span>
              </p>

              {/* Social Links */}
              <div className="mt-4 flex justify-center space-x-4">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/priyanshu-chaurasia-326979335/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5h4V24h-4V8.5zm7 0h3.8v2.1h.1c.5-1 1.7-2.1 3.6-2.1 3.9 0 4.6 2.6 4.6 6V24h-4v-7.7c0-1.8 0-4.1-2.5-4.1s-2.9 2-2.9 4V24h-4V8.5z" />
                  </svg>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/priyanshu-1006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.34.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.2-.9.1-.9.1-.9 1.3.1 2 1.3 2 1.3 1.2 2 3.2 1.4 4 .9.1-.9.5-1.4.9-1.7-2.7-.3-5.6-1.3-5.6-6 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a11.7 11.7 0 0 1 6.2 0C18 5.3 19 5.6 19 5.6c.6 1.7.2 3 .1 3.3.8.9 1.2 2 1.2 3.3 0 4.7-2.9 5.6-5.6 6 .5.4 1 .8 1 1.8v2.7c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </SocketProvider>
  );
}

export default App;
