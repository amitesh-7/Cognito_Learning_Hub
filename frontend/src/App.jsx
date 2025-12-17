import React, { useContext, Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastProvider } from "./components/ui/Toast";
import ParticleBackground from "./components/ParticleBackground";
import FloatingShapes from "./components/FloatingShapes";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import LenisScroll from "./components/LenisScroll";
import { useTheme } from "./hooks/useTheme";
import { useIsMobile } from "./hooks/useReducedMotion";
import NetworkStatusIndicator from "./components/ui/NetworkStatusIndicator";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";
import OnboardingTour from "./components/OnboardingTour";
import HelpWidget from "./components/HelpWidget";
import { AuthContext } from "./context/AuthContext";

// Accessibility Components
import {
  AccessibilityProvider,
  ScreenReaderAnnouncer,
  KeyboardNavigation,
  SkipLinks,
  KeyboardShortcutsModal,
} from "./components/Accessibility";

// Import route wrapper components (never lazy load these)
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ModeratorRoute from "./components/ModeratorRoute";
import { SocketProvider } from "./context/SocketContext";
import { GamificationProvider } from "./context/GamificationContext";
import { AvatarProvider } from "./context/AvatarContext";
import { AchievementNotification } from "./components/Gamification";
import { FeatureUnlockNotificationWrapper } from "./components/Gamification/FeatureUnlockNotificationWrapper";

// Lazy load pages for better performance (code splitting)
// Critical pages - load immediately
import Home from "./pages/Home";

// Auth Pages - Modern 2025 Design
const Login = lazy(() => import("./pages/AuthPages/Login"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));

// Less critical pages - lazy load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const QuickActions = lazy(() => import("./pages/QuickActions"));
const QuizList = lazy(() => import("./pages/QuizList"));
const QuestPage = lazy(() => import("./pages/QuestPage"));
const SmartQuizRouter = lazy(() => import("./pages/SmartQuizRouter"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ModeratorDashboard = lazy(() => import("./pages/ModeratorDashboard"));
const EditQuiz = lazy(() => import("./pages/EditQuiz"));
const QuizMaker = lazy(() => import("./pages/QuizMaker"));
const TopicQuizGenerator = lazy(() => import("./pages/TopicQuizGenerator"));
const ManualQuizCreator = lazy(() => import("./pages/ManualQuizCreator"));
const FileQuizGenerator = lazy(() => import("./pages/FileQuizGenerator"));
const AITutor = lazy(() => import("./pages/AITutorNew"));
const ChatSystem = lazy(() => import("./pages/ChatSystem"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ReportsDashboard = lazy(() => import("./pages/ReportsDashboard"));
const AchievementDashboard = lazy(() => import("./pages/AchievementDashboard"));
const RewardsPage = lazy(() => import("./pages/RewardsPage"));
const EnhancedQuizCreator = lazy(() => import("./pages/EnhancedQuizCreator"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GamifiedQuizTaker = lazy(() => import("./pages/GamifiedQuizTaker"));
const PDFQuizGenerator = lazy(() => import("./pages/PDFQuizGenerator"));
const SocialDashboard = lazy(() => import("./pages/SocialDashboard"));
const ChallengeCreator = lazy(() => import("./pages/ChallengeCreator"));
const AdminBroadcast = lazy(() => import("./pages/AdminBroadcast"));
const LiveSessionHost = lazy(() => import("./pages/LiveSessionHost"));
const LiveSessionJoin = lazy(() => import("./pages/LiveSessionJoin"));
const LiveSessionAnalytics = lazy(() => import("./pages/LiveSessionAnalytics"));
const LiveSessionHistory = lazy(() => import("./pages/LiveSessionHistory"));
const LiveSessionSelector = lazy(() => import("./pages/LiveSessionSelector"));
const DuelMode = lazy(() => import("./pages/DuelMode"));
const DuelBattle = lazy(() => import("./pages/DuelBattle"));
const TeachingHub = lazy(() => import("./pages/TeachingHub"));
const AIQuizOpponent = lazy(() => import("./pages/AIQuizOpponent"));
const QuizHistory = lazy(() => import("./pages/QuizHistory"));
const QuizResultDetail = lazy(() => import("./pages/QuizResultDetail"));
const MyQuizzes = lazy(() => import("./pages/MyQuizzes"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// Avatar Routes
const AvatarCustomization = lazy(() => import("./pages/AvatarCustomization"));

// Video Meeting Routes
const TeacherMeetingStart = lazy(() => import("./pages/TeacherMeetingStart"));
const StudentJoinMeeting = lazy(() => import("./pages/StudentJoinMeeting"));
const MeetingRoom = lazy(() => import("./pages/MeetingRoom"));

// Public Pages - Modern 2025 Design
const Features = lazy(() => import("./pages/PublicPages/Features"));
const FeatureComparison = lazy(() => import("./pages/PublicPages/FeatureComparison"));
const About = lazy(() => import("./pages/PublicPages/About"));
const Contact = lazy(() => import("./pages/PublicPages/Contact"));
const Pricing = lazy(() => import("./pages/PublicPages/Pricing"));

function App() {
  const [theme] = useTheme();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Routes that need full-screen layout without navbar/padding
  const fullScreenRoutes = ["/doubt-solver", "/meeting", "/live/join"];
  const isFullScreen = fullScreenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <AccessibilityProvider>
      <SocketProvider>
        <GamificationProvider>
          <AvatarProvider>
            <ToastProvider>
              <LenisScroll>
                <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 transition-all duration-300 relative overflow-x-hidden">
                  {/* Accessibility Components */}
                  <SkipLinks />
                  <KeyboardNavigation />
                  <ScreenReaderAnnouncer />
                  <KeyboardShortcutsModal />

                  {/* Network Status Indicator */}
                  <NetworkStatusIndicator />

                  {/* PWA Install Prompt */}
                  <PWAInstallPrompt />

                  {/* Real-time Achievement Notifications */}
                  <AchievementNotification />

                  {/* Feature Unlock Notifications */}
                  <FeatureUnlockNotificationWrapper />

                  {/* Onboarding Tour for New Users */}
                  {user && <OnboardingTour />}

                  {/* Help Widget - Always Available */}
                  <HelpWidget />

                  {/* Animated Background Layers - Disabled on mobile for performance */}
                  {!isMobile && (
                    <>
                      <ParticleBackground isDark={theme === "dark"} />
                      <FloatingShapes />
                    </>
                  )}

                  {/* Modern Glassmorphism Navbar with Scroll Behavior */}
                  {!isFullScreen && <Navbar />}

                  {/* Main Content */}
                  <main
                    id="main-content"
                    className={isFullScreen ? "" : "relative z-10"}
                    role="main"
                    aria-label="Main content"
                  >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <LoadingSpinner />
                      </div>
                    }
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Routes location={location}>
                          {/* Public Routes */}
                          <Route path="/" element={<Home />} />
                          <Route path="/features" element={<Features />} />
                          <Route path="/compare" element={<FeatureComparison />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/pricing" element={<Pricing />} />
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
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute>
                                <Settings />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/quick-actions"
                            element={
                              <ProtectedRoute>
                                <QuickActions />
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
                            path="/teaching-hub"
                            element={
                              <ProtectedRoute>
                                <TeachingHub />
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
                            path="/quests"
                            element={
                              <ProtectedRoute>
                                <QuestPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/quizzes/my-quizzes"
                            element={
                              <ProtectedRoute>
                                <MyQuizzes />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/quiz/:quizId"
                            element={
                              <ProtectedRoute>
                                <SmartQuizRouter />
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
                            path="/quiz/:quizId/ai-battle"
                            element={
                              <ProtectedRoute>
                                <AIQuizOpponent />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/quiz-history"
                            element={
                              <ProtectedRoute>
                                <QuizHistory />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/quiz/result/:resultId"
                            element={
                              <ProtectedRoute>
                                <QuizResultDetail />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/leaderboard"
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
                            path="/rewards"
                            element={
                              <ProtectedRoute>
                                <RewardsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/avatar/customize"
                            element={
                              <ProtectedRoute>
                                <AvatarCustomization />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/doubt-solver"
                            element={
                              <ProtectedRoute>
                                <AITutor />
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
                            path="/live"
                            element={
                              <ProtectedRoute>
                                <LiveSessionSelector />
                              </ProtectedRoute>
                            }
                          />
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
                          <Route
                            path="/live/start"
                            element={
                              <ProtectedRoute>
                                <LiveSessionSelector />
                              </ProtectedRoute>
                            }
                          />

                          {/* 1v1 Duel Routes */}
                          <Route
                            path="/duel"
                            element={
                              <ProtectedRoute>
                                <DuelMode />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/duel/:quizId"
                            element={
                              <ProtectedRoute>
                                <DuelBattle />
                              </ProtectedRoute>
                            }
                          />

                          {/* Video Meeting Routes */}
                          <Route
                            path="/meeting/create"
                            element={
                              <ProtectedRoute>
                                <TeacherMeetingStart />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/meeting/join"
                            element={
                              <ProtectedRoute>
                                <StudentJoinMeeting />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/meeting/:roomId"
                            element={
                              <ProtectedRoute>
                                <MeetingRoom />
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

                          {/* 404 Not Found - Catch all */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </motion.div>
                    </AnimatePresence>
                  </Suspense>
                </main>

                {/* Modern Footer with Glassmorphism - Hide on full screen routes */}
                {!isFullScreen && (
                  <motion.footer
                    className="relative mt-12 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-indigo-100/50 dark:border-indigo-900/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
                    <div className="container mx-auto px-4 text-center relative z-10">
                      <motion.p
                        className="text-sm text-gray-600 dark:text-gray-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        &copy; 2025{" "}
                        <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                          Cognito Learning Hub
                        </span>
                        . All Rights Reserved.
                      </motion.p>

                      <motion.p
                        className="mt-2 text-sm text-gray-500 dark:text-gray-500"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        Made with{" "}
                        <motion.span
                          className="inline-block text-red-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ❤️
                        </motion.span>{" "}
                        by team{" "}
                        <span className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                          OPTIMISTIC MUTANT CODERS
                        </span>
                      </motion.p>
                    </div>
                  </motion.footer>
                )}
              </div>
            </LenisScroll>
          </ToastProvider>
        </AvatarProvider>
      </GamificationProvider>
    </SocketProvider>
    </AccessibilityProvider>
  );
}

export default App;
