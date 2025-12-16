import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import {
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  RotateCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function GeminiMonitor() {
  const queryClient = useQueryClient()
  const [showAddKey, setShowAddKey] = useState(false)
  const [newKey, setNewKey] = useState({ name: '', key: '', priority: 0 })

  const { data: stats, refetch } = useQuery({
    queryKey: ['geminiStats'],
    queryFn: adminAPI.getGeminiStats,
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const { data: keys } = useQuery({
    queryKey: ['geminiKeys'],
    queryFn: adminAPI.getGeminiKeyHealth,
    refetchInterval: 10000,
  })

  const switchKeyMutation = useMutation({
    mutationFn: adminAPI.switchGeminiKey,
    onSuccess: () => {
      toast.success('API key switched successfully')
      queryClient.invalidateQueries(['geminiKeys'])
      queryClient.invalidateQueries(['geminiStats'])
    },
    onError: () => {
      toast.error('Failed to switch API key')
    },
  })

  const addKeyMutation = useMutation({
    mutationFn: adminAPI.updateGeminiKey,
    onSuccess: () => {
      toast.success('API key added successfully')
      setShowAddKey(false)
      setNewKey({ name: '', key: '', priority: 0 })
      queryClient.invalidateQueries(['geminiKeys'])
    },
    onError: () => {
      toast.error('Failed to add API key')
    },
  })

  const getKeyStatusColor = (key) => {
    if (!key.healthy) return 'text-red-400 bg-red-500/20'
    if (key.errorCount > 0) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  const getKeyStatusIcon = (key) => {
    if (!key.healthy) return <XCircle size={20} className="text-red-400" />
    if (key.errorCount > 0) return <AlertTriangle size={20} className="text-yellow-400" />
    return <CheckCircle size={20} className="text-green-400" />
  }

  const getRateLimitPercentage = (used, limit) => {
    if (!limit) return 0
    return Math.round((used / limit) * 100)
  }

  const shouldShowWarning = (percentage) => {
    return percentage >= 80
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gemini AI Monitor</h2>
          <p className="text-gray-400">Monitor API keys, usage, and performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddKey(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add API Key
          </button>
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      {stats?.circuitBreaker && (
        <div className={`admin-card border-2 ${
          stats.circuitBreaker.state === 'OPEN' ? 'border-red-500' : 
          stats.circuitBreaker.state === 'HALF-OPEN' ? 'border-yellow-500' : 
          'border-green-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                stats.circuitBreaker.state === 'OPEN' ? 'bg-red-500/20' : 
                stats.circuitBreaker.state === 'HALF-OPEN' ? 'bg-yellow-500/20' : 
                'bg-green-500/20'
              }`}>
                <Activity size={32} className={
                  stats.circuitBreaker.state === 'OPEN' ? 'text-red-400' : 
                  stats.circuitBreaker.state === 'HALF-OPEN' ? 'text-yellow-400' : 
                  'text-green-400'
                } />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Circuit Breaker Status
                </h3>
                <p className="text-sm text-gray-400">
                  {stats.circuitBreaker.state === 'CLOSED' && 'All systems operational'}
                  {stats.circuitBreaker.state === 'HALF-OPEN' && 'Testing service recovery'}
                  {stats.circuitBreaker.state === 'OPEN' && '⚠️ Service protection activated - using fallback keys'}
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full font-bold text-lg ${
              stats.circuitBreaker.state === 'OPEN' ? 'bg-red-500/20 text-red-400' : 
              stats.circuitBreaker.state === 'HALF-OPEN' ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-green-500/20 text-green-400'
            }`}>
              {stats.circuitBreaker.state}
            </div>
          </div>

          {/* Circuit Breaker Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-400">Success Rate</p>
              <p className="text-xl font-bold text-white mt-1">
                {stats.circuitBreaker.stats?.successRate || 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Failed Requests</p>
              <p className="text-xl font-bold text-white mt-1">
                {stats.circuitBreaker.stats?.failures || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Requests</p>
              <p className="text-xl font-bold text-white mt-1">
                {stats.circuitBreaker.stats?.total || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Timeout (ms)</p>
              <p className="text-xl font-bold text-white mt-1">
                {stats.circuitBreaker.options?.timeout || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Management */}
      <div className="grid grid-cols-1 gap-6">
        {keys?.healthStatus?.map((key) => {
          const isActive = key.name === keys.currentKey
          const rateLimitUsage = getRateLimitPercentage(
            key.requestsUsed || 0,
            key.requestsLimit || 0
          )
          const showWarning = shouldShowWarning(rateLimitUsage)

          return (
            <div
              key={key.name}
              className={`admin-card ${isActive ? 'ring-2 ring-primary-500' : ''} ${
                showWarning ? 'border-2 border-yellow-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getKeyStatusIcon(key)}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                      {isActive && (
                        <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium">
                          ACTIVE
                        </span>
                      )}
                      {showWarning && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <AlertTriangle size={12} />
                          QUOTA WARNING
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Priority: {key.priority || 0} | Error Count: {key.errorCount || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKeyStatusColor(key)}`}>
                    {key.healthy ? 'Healthy' : 'Unhealthy'}
                  </span>
                  {!isActive && key.healthy && (
                    <button
                      onClick={() => switchKeyMutation.mutate(key.name)}
                      disabled={switchKeyMutation.isLoading}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <RotateCw size={14} />
                      Switch
                    </button>
                  )}
                </div>
              </div>

              {/* Rate Limit Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">API Usage</span>
                  <span className={`text-sm font-medium ${
                    rateLimitUsage >= 90 ? 'text-red-400' :
                    rateLimitUsage >= 80 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {key.requestsUsed || 0} / {key.requestsLimit || '∞'} ({rateLimitUsage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      rateLimitUsage >= 90 ? 'bg-red-500' :
                      rateLimitUsage >= 80 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(rateLimitUsage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <p className="text-xs text-gray-400">Success Rate</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {key.successRate || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Response Time</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {key.avgResponseTime || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Requests</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {key.totalRequests || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Failures</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {key.failures || 0}
                  </p>
                </div>
              </div>

              {/* Last Error */}
              {key.lastError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-400 font-medium mb-1">Last Error:</p>
                  <p className="text-xs text-red-300">{key.lastError}</p>
                </div>
              )}

              {/* Warning Message */}
              {showWarning && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400 mb-1">
                        ⚠️ Rate Limit Warning
                      </p>
                      <p className="text-xs text-yellow-300">
                        This API key has used {rateLimitUsage}% of its quota. Consider switching to a backup key or adding more keys to distribute the load.
                      </p>
                      {!isActive && (
                        <button
                          onClick={() => switchKeyMutation.mutate(key.name)}
                          className="mt-2 text-xs text-yellow-400 underline hover:text-yellow-300"
                        >
                          Switch to a less-used key
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Usage Chart */}
      {stats?.usageHistory && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">API Usage (Last 24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.usageHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e2139', border: '1px solid #374151' }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Requests"
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#ef4444"
                strokeWidth={2}
                name="Errors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add API Key Modal */}
      {showAddKey && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-admin-sidebar rounded-lg max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Add New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  placeholder="e.g., FALLBACK_3"
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority (0-10)
                </label>
                <input
                  type="number"
                  value={newKey.priority}
                  onChange={(e) => setNewKey({ ...newKey, priority: parseInt(e.target.value) })}
                  min="0"
                  max="10"
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => addKeyMutation.mutate(newKey)}
                disabled={!newKey.name || !newKey.key || addKeyMutation.isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {addKeyMutation.isLoading ? 'Adding...' : 'Add Key'}
              </button>
              <button
                onClick={() => setShowAddKey(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
