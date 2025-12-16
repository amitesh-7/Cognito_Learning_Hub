import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function ReportManagement() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => adminAPI.getReports(),
  })

  const { data: stats } = useQuery({
    queryKey: ['reportStats'],
    queryFn: adminAPI.getReportStats,
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution }) => adminAPI.resolveReport(id, resolution),
    onSuccess: () => {
      toast.success('Report resolved')
      queryClient.invalidateQueries(['reports'])
      queryClient.invalidateQueries(['reportStats'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteReport,
    onSuccess: () => {
      toast.success('Report deleted')
      queryClient.invalidateQueries(['reports'])
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Report Management</h2>
        <p className="text-gray-400">Review and manage user reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Reports', value: stats?.total || 0, color: 'bg-blue-500' },
          { label: 'Pending', value: stats?.pending || 0, color: 'bg-yellow-500' },
          { label: 'Resolved', value: stats?.resolved || 0, color: 'bg-green-500' },
          { label: 'Rejected', value: stats?.rejected || 0, color: 'bg-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="admin-card">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <AlertTriangle size={20} className="text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="admin-card text-center py-8 text-gray-400">Loading...</div>
        ) : data?.reports?.length === 0 ? (
          <div className="admin-card text-center py-8 text-gray-400">No reports found</div>
        ) : (
          data?.reports?.map((report) => (
            <div key={report._id || report.id} className="admin-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {report.status}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      {report.type}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{report.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Reported by: {report.reportedBy?.name}</span>
                    <span>•</span>
                    <span>{format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveMutation.mutate({ id: report.id, resolution: 'resolved' })}
                      className="btn-success text-sm flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Resolve
                    </button>
                    <button
                      onClick={() => resolveMutation.mutate({ id: report.id, resolution: 'rejected' })}
                      className="btn-danger text-sm flex items-center gap-1"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
