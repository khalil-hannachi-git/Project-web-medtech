import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
import dayjs from 'dayjs';
export default function TaskManagement() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/classes')
      const teacherClasses = resp.data.filter((c) => c.teacher?._id === user?.uid)
      setClasses(teacherClasses)
      if (teacherClasses.length > 0) {
        selectClass(teacherClasses[0])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectClass = async (cls) => {
    setSelectedClass(cls)
    await fetchTasksAndSubmissions(cls._id)
  }

  const fetchTasksAndSubmissions = async (classId) => {
    try {
      const [tasksResp, submissionsResp] = await Promise.all([
        api.get(`/tasks/class/${classId}`),
        api.get('/submissions/task/' + classId).catch(() => ({ data: [] }))
      ])
      setTasks(tasksResp.data)
      //reading the first element of tasks
      console.log(`I have ${JSON.stringify(tasksResp.data[0], null, 2)}`)

      setSubmissions(submissionsResp.data)
    } catch (err) {
      console.error('Error fetching tasks:', err)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      await api.post('/tasks', {
        ...newTask,
        classId: selectedClass._id
      })
      setNewTask({ title: '', description: '', deadline: '' })
      setShowTaskForm(false)
      fetchTasksAndSubmissions(selectedClass._id)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return

    try {
      await api.delete(`/tasks/${taskId}`)
      fetchTasksAndSubmissions(selectedClass._id)
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  const fetchTaskSubmissions = async (taskId) => {
    try {
      const resp = await api.get(`/submissions/task/${taskId}`)
      setSubmissions(resp.data)
      setActiveTab('submissions')
    } catch (err) {
      console.error('Error fetching submissions:', err)
    }
  }

  const handleGradeSubmission = async (submissionId, status) => {
    try {
      await api.post(`/submissions/${submissionId}/grade`, { status })
      fetchTasksAndSubmissions(selectedClass._id)
    } catch (err) {
      alert('Failed to grade submission')
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Task Management</h2>

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Classes Sidebar */}
              <div className="lg:col-span-1">
                <div className="rounded card p-4 sticky top-24">
                  <h3 className="font-semibold mb-4">My Classes</h3>
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <button
                        key={cls._id}
                        onClick={() => selectClass(cls)}
                        className={`w-full text-left p-3 rounded border ${
                          selectedClass?._id === cls._id
                            ? 'bg-indigo-900 border-indigo-600'
                            : 'border-gray-800 hover:bg-gray-900'
                        }`}
                      >
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {tasks?.length || 0} tasks
                        </div>
                      </button>
                    ))}
                  </div>
                  {classes.length === 0 && (
                    <p className="text-slate-400 text-sm">No classes assigned</p>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                {selectedClass ? (
                  <>
                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-gray-800">
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className={`pb-3 px-2 ${activeTab === 'tasks' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                      >
                        Tasks
                      </button>
                      <button
                        onClick={() => setActiveTab('submissions')}
                        className={`pb-3 px-2 ${activeTab === 'submissions' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                      >
                        Submissions
                      </button>
                    </div>

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-lg">Tasks</h4>
                          <button
                            onClick={() => setShowTaskForm(!showTaskForm)}
                            className="py-1 px-3 bg-indigo-600 text-sm rounded hover:bg-indigo-700"
                          >
                            {showTaskForm ? 'Cancel' : 'Create Task'}
                          </button>
                        </div>

                        {showTaskForm && (
                          <form onSubmit={handleCreateTask} className="p-4 mb-4 rounded card space-y-3">
                              <p className="text-sm text-slate-400 mb-2">Set Deadline</p>                            
                              <input type="date"
                                value={newTask.deadline}
                                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                                
                              />
                            <input
                              required
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                              placeholder="Task Title"
                              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            />
                            <textarea
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              placeholder="Task Description"
                              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                              rows={3}
                            />
                            <button type="submit" className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700">
                              Create
                            </button>
                          </form>
                        )}

                        <div className="space-y-3">
                          {tasks.length === 0 ? (
                            <p className="text-slate-400">No tasks yet</p>
                          ) : (
                            tasks.map((task) => (
                              <div key={task._id} className="p-4 rounded card border border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-lg">{task.title}</h5>
                                    <p className="text-slate-300 text-sm mt-1">{task.description}</p>
                                    <p className="text-xs text-slate-400 mt-1">Due {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : '—'}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="text-red-400 hover:text-red-300 text-sm ml-2"
                                  >
                                    Delete
                                  </button>
                                </div>
                                <button
                                  onClick={() => fetchTaskSubmissions(task._id)}
                                  className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                  View Submissions
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submissions Tab */}
                    {activeTab === 'submissions' && (
                      <div>
                        <h4 className="font-semibold text-lg mb-4">Submissions</h4>
                        {submissions.length === 0 ? (
                          <p className="text-slate-400">No submissions yet</p>
                        ) : (
                          <div className="space-y-3">
                            {submissions.map((submission) => (
                              <div key={submission._id} className="p-4 rounded card border border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold">{submission.student?.name}</h5>
                                    <p className="text-sm text-slate-400 mt-1">
                                      Email: {submission.student?.email}
                                    </p>
                                    <p className="text-slate-300 text-sm mt-2">{submission.content}</p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                                      submission.status === 'approved'
                                        ? 'bg-green-900 text-green-200'
                                        : submission.status === 'rejected'
                                        ? 'bg-red-900 text-red-200'
                                        : 'bg-yellow-900 text-yellow-200'
                                    }`}
                                  >
                                    {submission.status}
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => handleGradeSubmission(submission._id, 'approved')}
                                    className="py-1 px-3 bg-green-900 hover:bg-green-800 text-green-200 text-sm rounded"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleGradeSubmission(submission._id, 'rejected')}
                                    className="py-1 px-3 bg-red-900 hover:bg-red-800 text-red-200 text-sm rounded"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center rounded card text-slate-400">
                    Select a class to manage tasks
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
