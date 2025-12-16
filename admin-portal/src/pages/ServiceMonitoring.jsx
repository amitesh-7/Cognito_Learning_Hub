import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Activity, Server, AlertCircle, CheckCircle, Clock, Trash2, RefreshCw, Search, Filter, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function ServiceMonitoring() {
  const queryClient = useQueryClient()
  const [selectedService, setSelectedService] = useState('all')
  const [logLevel, setLogLevel] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Health check query with auto-refresh
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['servicesHealth'],
    queryFn: async () => {
      const response = await adminAPI.getServicesHealth()
      console.log('Health response:', response)
      
      // Handle if response is an array (API Gateway format)
      if (Array.isArray(response)) {
        return {
          summary: {
            total: response.length,
            healthy: response.filter(r => r.status === 'healthy').length,
            unhealthy: response.filter(r => r.status !== 'healthy').length,
          },
          services: response
        }
      }
      
      // Handle if response has data property (direct admin service format)
      const data = response.data || response
      console.log('Health data:', data)
      return data
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
  })

  // Service stats query
  const { data: statsData } = useQuery({
    queryKey: ['servicesStats'],
    queryFn: async () => {
      const response = await adminAPI.getServicesStats()
      console.log('Stats response:', response)
      // Response interceptor already unwraps response.data
      const data = response.data || response
      console.log('Stats data:', data)
      return data
    },
    refetchInterval: autoRefresh ? 60000 : false,
  })

  // Logs query
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['serviceLogs', { selectedService, logLevel, search, page }],
    queryFn: async () => {
      const response = await adminAPI.getServiceLogs({
        page,
        limit: 50,
        serviceName: selectedService !== 'all' ? selectedService : '',
        level: logLevel !== 'all' ? logLevel : '',
        search
      })
      return response.data || response
    },
  })

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: (days) => adminAPI.clearServiceLogs(days),
    onSuccess: (response) => {
      toast.success(response.message || 'Logs cleared successfully')
      queryClient.invalidateQueries(['serviceLogs'])
      queryClient.invalidateQueries(['servicesStats'])
    },
  })

  const handleClearLogs = (days) => {
    if (confirm(`Are you sure you want to clear logs older than ${days} days?`)) {
      clearLogsMutation.mutate(days)
    }
  }

  const getStatusColor = (status) => {
    return status === 'healthy' ? 'text-green-400' : 'text-red-400'
  }

  const getStatusIcon = (status) => {
    return status === 'healthy' ? <CheckCircle size={20} /> : <XCircle size={20} />
  }

  const getLevelColor = (level) => {
    const colors = {
      error: 'text-red-400 bg-red-500/10',
      warn: 'text-yellow-400 bg-yellow-500/10',
      info: 'text-blue-400 bg-blue-500/10',
      debug: 'text-gray-400 bg-gray-500/10',
    }
    return colors[level] || colors.info
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Service Monitoring</h2>
          <p className="text-gray-400">Monitor microservices health, logs, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => {
              refetchHealth()
              queryClient.invalidateQueries(['servicesStats'])
              queryClient.invalidateQueries(['serviceLogs'])
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh All
          </button>
        </div>
      </div>

      {/* Service Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
            <Server size={20} className="text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Services</p>
          <p className="text-2xl font-bold text-white">{healthData?.summary?.total || 0}</p>
        </div>
        
        <div className="admin-card">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Healthy</p>
          <p className="text-2xl font-bold text-green-400">{healthData?.summary?.healthy || 0}</p>
        </div>
        
        <div className="admin-card">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Unhealthy</p>
          <p className="text-2xl font-bold text-red-400">{healthData?.summary?.unhealthy || 0}</p>
        </div>
        
        <div className="admin-card">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Recent Errors (24h)</p>
          <p className="text-2xl font-bold text-yellow-400">{statsData?.recentErrors || 0}</p>
        </div>
      </div>

      {/* Services Status Table */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-white mb-4">Services Status</h3>
        {healthLoading ? (
          <p className="text-gray-400 text-center py-8">Loading services...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Port</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Response Time</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">URL</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {healthData?.services?.map((service, idx) => (
                  <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Server size={16} className="text-gray-400" />
                        <span className="text-white font-medium">{service.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-2 ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{service.port}</td>
                    <td className="py-3 px-4 text-gray-300">{service.responseTime}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{service.url}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {service.error || service.details?.message || 'OK'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Service Logs</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleClearLogs(7)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm flex items-center gap-2"
            >
              <Trash2 size={14} />
              Clear Old Logs (7d)
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Services</option>
            {healthData?.services?.map((service) => (
              <option key={service.name} value={service.name}>{service.name}</option>
            ))}
          </select>
          
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            className="px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        {/* Logs Table */}
        {logsLoading ? (
          <p className="text-gray-400 text-center py-8">Loading logs...</p>
        ) : logsData?.logs?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No logs found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Level</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData?.logs?.map((log) => (
                    <tr key={log._id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-3 px-4 text-gray-400 text-sm whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{log.serviceName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm max-w-2xl truncate">
                        {log.message}
                        {log.stack && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-primary-400 text-xs">Stack trace</summary>
                            <pre className="mt-2 text-xs text-gray-400 bg-gray-800 p-2 rounded overflow-x-auto">
                              {log.stack}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsData?.pagination && logsData.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-400">
                  Showing {((logsData.pagination.page - 1) * logsData.pagination.limit) + 1} to{' '}
                  {Math.min(logsData.pagination.page * logsData.pagination.limit, logsData.pagination.total)} of{' '}
                  {logsData.pagination.total} logs
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(logsData.pagination.pages, p + 1))}
                    disabled={page === logsData.pagination.pages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Service Statistics Breakdown */}
      {statsData?.serviceBreakdown && statsData.serviceBreakdown.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-white mb-4">Log Statistics by Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsData.serviceBreakdown.map((stat) => (
              <div key={stat._id} className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">{stat._id}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Logs:</span>
                    <span className="text-white">{stat.totalLogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Errors:</span>
                    <span className="text-red-400 font-medium">{stat.errors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Warnings:</span>
                    <span className="text-yellow-400 font-medium">{stat.warnings}</span>
                  </div>
                  {stat.lastLog && (
                    <div className="flex justify-between text-xs pt-2 border-t border-gray-600">
                      <span className="text-gray-400">Last Log:</span>
                      <span className="text-gray-400">{format(new Date(stat.lastLog), 'MMM dd, HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
