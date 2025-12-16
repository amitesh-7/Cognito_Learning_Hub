import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Users, Search, Edit, Trash2, Ban, CheckCircle, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function UserManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, roleFilter, page }],
    queryFn: () => adminAPI.getUsers({ search, role: roleFilter !== 'all' ? roleFilter : undefined, page }),
  })

  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: adminAPI.getUserStats,
  })

  const toggleStatusMutation = useMutation({
    mutationFn: adminAPI.toggleUserStatus,
    onSuccess: () => {
      toast.success('User status updated')
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['userStats'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['userStats'])
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
        <p className="text-gray-400">Manage platform users and their permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats?.total || 0, color: 'bg-blue-500' },
          { label: 'Students', value: stats?.students || 0, color: 'bg-green-500' },
          { label: 'Teachers', value: stats?.teachers || 0, color: 'bg-purple-500' },
          { label: 'Admins', value: stats?.admins || 0, color: 'bg-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="admin-card">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <Users size={20} className="text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td>
              </tr>
            ) : data?.users?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">No users found</td>
              </tr>
            ) : (
              data?.users?.map((user) => (
                <tr key={user._id || user.id} className="border-b border-gray-700 hover:bg-admin-dark">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatusMutation.mutate(user.id)}
                        className="p-2 hover:bg-gray-700 rounded text-blue-400"
                        title={user.status === 'active' ? 'Ban User' : 'Activate User'}
                      >
                        {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this user?')) {
                            deleteMutation.mutate(user.id)
                          }
                        }}
                        className="p-2 hover:bg-gray-700 rounded text-red-400"
                        title="Delete User"
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

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-admin-dark hover:bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 bg-admin-dark hover:bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
