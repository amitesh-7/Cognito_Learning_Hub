import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ServiceMonitoring from './pages/ServiceMonitoring'
import GeminiMonitor from './pages/GeminiMonitor'
import EmailTemplates from './pages/EmailTemplates'
import UserManagement from './pages/UserManagement'
import QuizManagement from './pages/QuizManagement'
import ReportManagement from './pages/ReportManagement'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="services" element={<ServiceMonitoring />} />
        <Route path="gemini" element={<GeminiMonitor />} />
        <Route path="email-templates" element={<EmailTemplates />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="quizzes" element={<QuizManagement />} />
        <Route path="reports" element={<ReportManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
