import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import {
  Users,
  FileQuestion,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: adminAPI.getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: metrics } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: adminAPI.getSystemMetrics,
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      change: stats?.users?.change || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Quizzes',
      value: stats?.quizzes?.total || 0,
      change: stats?.quizzes?.change || 0,
      icon: FileQuestion,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Reports',
      value: stats?.reports?.pending || 0,
      change: stats?.reports?.change || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Active Services',
      value: `${stats?.services?.active || 0}/${stats?.services?.total || 0}`,
      change: stats?.services?.health || 100,
      icon: Activity,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="admin-card bg-gradient-to-r from-primary-600 to-purple-600">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Admin Portal</h1>
        <p className="text-blue-100">
          Monitor and manage your Cognito Learning Hub platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0
          return (
            <div key={index} className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e2139', border: '1px solid #374151' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz Statistics */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Quiz Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.quizStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e2139', border: '1px solid #374151' }}
              />
              <Legend />
              <Bar dataKey="count" fill="#10b981" name="Quizzes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Status and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Status */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
          <div className="space-y-3">
            {metrics?.services?.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-admin-dark rounded-lg">
                <div className="flex items-center gap-3">
                  {service.status === 'healthy' ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <span className="text-white font-medium">{service.name}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.status === 'healthy'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {stats?.recentReports?.map((report, index) => (
              <div key={index} className="p-3 bg-admin-dark rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{report.type}</span>
                  <span className="text-xs text-gray-400">{report.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{report.description}</p>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-4">No recent reports</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
