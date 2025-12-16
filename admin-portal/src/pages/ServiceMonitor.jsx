import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Cpu,
  HardDrive,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'

export default function ServiceMonitor() {
  const queryClient = useQueryClient()

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['servicesHealth'],
    queryFn: adminAPI.getAllServicesHealth,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const restartMutation = useMutation({
    mutationFn: adminAPI.restartService,
    onSuccess: (_, serviceName) => {
      toast.success(`${serviceName} restart initiated`)
      queryClient.invalidateQueries(['servicesHealth'])
    },
    onError: () => {
      toast.error('Failed to restart service')
    },
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 bg-green-500/20'
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'error':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={20} className="text-green-400" />
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />
      case 'error':
        return <XCircle size={20} className="text-red-400" />
      default:
        return <Activity size={20} className="text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Service Monitor</h2>
          <p className="text-gray-400">Real-time monitoring of all microservices</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={24} className="text-green-400" />
            <h3 className="text-gray-400">Healthy</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {services?.summary?.healthy || 0}
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={24} className="text-yellow-400" />
            <h3 className="text-gray-400">Warning</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {services?.summary?.warning || 0}
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <XCircle size={24} className="text-red-400" />
            <h3 className="text-gray-400">Error</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {services?.summary?.error || 0}
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={24} className="text-blue-400" />
            <h3 className="text-gray-400">Total Services</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {services?.summary?.total || 0}
          </p>
        </div>
      </div>

      {/* Service List */}
      <div className="grid grid-cols-1 gap-6">
        {services?.services?.map((service) => (
          <div key={service.name} className="admin-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(service.status)}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-400">{service.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
                <button
                  onClick={() => restartMutation.mutate(service.name)}
                  disabled={restartMutation.isLoading}
                  className="btn-secondary text-sm"
                >
                  Restart
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">CPU</p>
                  <p className="text-sm font-semibold text-white">
                    {service.metrics?.cpu || '0%'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <HardDrive size={18} className="text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Memory</p>
                  <p className="text-sm font-semibold text-white">
                    {service.metrics?.memory || '0 MB'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={18} className="text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Uptime</p>
                  <p className="text-sm font-semibold text-white">
                    {service.metrics?.uptime || '0h'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Database size={18} className="text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-400">DB Status</p>
                  <p className="text-sm font-semibold text-white">
                    {service.checks?.database || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Checks */}
            {service.checks && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Health Checks</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(service.checks).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value === 'connected' || value === 'healthy' ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                      <span className="text-xs text-gray-400 capitalize">{key}:</span>
                      <span className="text-xs text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="mt-4 text-xs text-gray-500">
              Last updated: {format(new Date(service.timestamp || Date.now()), 'PPpp')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
