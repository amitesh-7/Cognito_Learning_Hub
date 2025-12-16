import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Mail, Plus, Edit, Trash2, Send, Eye } from 'lucide-react'

const TEMPLATE_TYPES = [
  { value: 'registration_student', label: 'Student Registration', description: 'Welcome email for new students' },
  { value: 'registration_teacher', label: 'Teacher Registration', description: 'Welcome email for new teachers' },
  { value: 'registration_admin', label: 'Admin Registration', description: 'Welcome email for new admins' },
  { value: 'quiz_created', label: 'Quiz Created', description: 'Confirmation after quiz creation' },
  { value: 'quiz_completed', label: 'Quiz Completed', description: 'Results after quiz completion' },
  { value: 'password_reset', label: 'Password Reset', description: 'Password reset instructions' },
  { value: 'account_verification', label: 'Account Verification', description: 'Email verification link' },
]

export default function EmailTemplates() {
  const queryClient = useQueryClient()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showTestModal, setShowTestModal] = useState(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: adminAPI.getEmailTemplates,
  })

  const createMutation = useMutation({
    mutationFn: adminAPI.createEmailTemplate,
    onSuccess: () => {
      toast.success('Template created successfully')
      setShowEditor(false)
      setSelectedTemplate(null)
      queryClient.invalidateQueries(['emailTemplates'])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateEmailTemplate(id, data),
    onSuccess: () => {
      toast.success('Template updated successfully')
      setShowEditor(false)
      setSelectedTemplate(null)
      queryClient.invalidateQueries(['emailTemplates'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteEmailTemplate,
    onSuccess: () => {
      toast.success('Template deleted successfully')
      queryClient.invalidateQueries(['emailTemplates'])
    },
  })

  const testMutation = useMutation({
    mutationFn: ({ templateId, email }) => adminAPI.testEmailTemplate(templateId, email),
    onSuccess: () => {
      toast.success('Test email sent successfully')
      setShowTestModal(null)
      setTestEmail('')
    },
  })

  const handleSave = () => {
    if (selectedTemplate?.id) {
      updateMutation.mutate({ id: selectedTemplate.id, data: selectedTemplate })
    } else {
      createMutation.mutate(selectedTemplate)
    }
  }

  const handleNew = (type) => {
    setSelectedTemplate({
      type: type.value,
      name: type.label,
      subject: '',
      htmlContent: '',
      textContent: '',
      variables: [],
    })
    setShowEditor(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Templates</h2>
          <p className="text-gray-400">Manage automated email templates for user communication</p>
        </div>
      </div>

      {/* Template Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_TYPES.map((type) => {
          const existing = templates?.find(t => t.type === type.value)
          return (
            <div key={type.value} className="admin-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{type.label}</h3>
                    <p className="text-xs text-gray-400">{type.description}</p>
                  </div>
                </div>
              </div>

              {existing ? (
                <div className="space-y-2 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(existing)
                        setShowEditor(true)
                      }}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowTestModal(existing)}
                      className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
                    >
                      <Send size={14} />
                      Test
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this template?')) {
                        deleteMutation.mutate(existing.id)
                      }
                    }}
                    className="w-full btn-danger text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNew(type)}
                  className="w-full btn-primary text-sm flex items-center justify-center gap-1 mt-4"
                >
                  <Plus size={14} />
                  Create Template
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Editor Modal */}
      {showEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-admin-sidebar rounded-lg max-w-4xl w-full p-6 border border-gray-700 my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedTemplate.id ? 'Edit' : 'Create'} Email Template
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
                <input
                  type="text"
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Subject</label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                  placeholder="Welcome to Cognito Learning Hub!"
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HTML Content
                  <span className="text-xs text-gray-400 ml-2">(Use {"{{variable}}"} for dynamic content)</span>
                </label>
                <textarea
                  value={selectedTemplate.htmlContent}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, htmlContent: e.target.value })}
                  rows={12}
                  placeholder="<h1>Welcome {{name}}!</h1>"
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plain Text Fallback</label>
                <textarea
                  value={selectedTemplate.textContent}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, textContent: e.target.value })}
                  rows={6}
                  placeholder="Welcome {{name}}!"
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="flex-1 btn-success"
              >
                {(createMutation.isLoading || updateMutation.isLoading) ? 'Saving...' : 'Save Template'}
              </button>
              <button
                onClick={() => {
                  setShowEditor(false)
                  setSelectedTemplate(null)
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-admin-sidebar rounded-lg max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Send Test Email</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300">
                  This will send a test email using sample data to verify the template.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => testMutation.mutate({ templateId: showTestModal.id, email: testEmail })}
                disabled={!testEmail || testMutation.isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {testMutation.isLoading ? 'Sending...' : 'Send Test'}
              </button>
              <button
                onClick={() => {
                  setShowTestModal(null)
                  setTestEmail('')
                }}
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
