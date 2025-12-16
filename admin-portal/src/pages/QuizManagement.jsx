import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { FileQuestion, Search, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { format } from 'date-fns'

export default function QuizManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes', { search, page }],
    queryFn: () => adminAPI.getQuizzes({ search, page }),
  })

  const { data: stats } = useQuery({
    queryKey: ['quizStats'],
    queryFn: adminAPI.getQuizStats,
  })

  const toggleMutation = useMutation({
    mutationFn: adminAPI.toggleQuizStatus,
    onSuccess: () => {
      toast.success('Quiz status updated')
      queryClient.invalidateQueries(['quizzes'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteQuiz,
    onSuccess: () => {
      toast.success('Quiz deleted')
      queryClient.invalidateQueries(['quizzes'])
      queryClient.invalidateQueries(['quizStats'])
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Management</h2>
        <p className="text-gray-400">Manage all quizzes on the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Quizzes', value: stats?.total || 0, color: 'bg-blue-500' },
          { label: 'Public', value: stats?.public || 0, color: 'bg-green-500' },
          { label: 'Private', value: stats?.private || 0, color: 'bg-purple-500' },
          { label: 'AI Generated', value: stats?.aiGenerated || 0, color: 'bg-pink-500' },
        ].map((stat, idx) => (
          <div key={idx} className="admin-card">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <FileQuestion size={20} className="text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="admin-card">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Questions</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : data?.quizzes?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No quizzes found</td></tr>
            ) : (
              data?.quizzes?.map((quiz) => (
                <tr key={quiz._id || quiz.id} className="border-b border-gray-700 hover:bg-admin-dark">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium">{quiz.title}</p>
                    <p className="text-xs text-gray-400">by {quiz.createdBy?.name || 'Unknown'}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{quiz.category}</td>
                  <td className="py-3 px-4 text-gray-300">{quiz.questions?.length || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quiz.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {quiz.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {format(new Date(quiz.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleMutation.mutate(quiz.id)}
                        className="p-2 hover:bg-gray-700 rounded text-blue-400"
                        title="Toggle Status"
                      >
                        {quiz.isPublic ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this quiz?')) {
                            deleteMutation.mutate(quiz.id)
                          }
                        }}
                        className="p-2 hover:bg-gray-700 rounded text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
