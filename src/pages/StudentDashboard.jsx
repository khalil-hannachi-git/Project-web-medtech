import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../lib/useAuth';
import api from '../api/client';
import QuizzView from '../components/QuizzView';

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [classes, setClasses] = useState([])
  const [allClasses, setAllClasses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')
  const [viewingQuiz, setViewingQuiz] = useState(null) // For viewing a quiz

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all classes
      const classesResp = await api.get('/classes')
      setAllClasses(classesResp.data)

      // Filter classes for this student
      const studentClasses = classesResp.data.filter((c) =>
        c.students?.some((s) => s._id === user?.uid)
      )
      setClasses(studentClasses)

      // Fetch all tasks for student's classes
      const allTasks = []
      for (const cls of studentClasses) {
        const tasksResp = await api.get(`/tasks/class/${cls._id}`)
        allTasks.push(...tasksResp.data)
      }
      setTasks(allTasks)

      // Fetch submissions for this student
      const submissionsResp = await api.get('/submissions/student')
      setSubmissions(submissionsResp.data)

      // Fetch quizzes for student's classes
      await fetchQuizzes(studentClasses)

    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch quizzes for the student's enrolled classes
  const fetchQuizzes = async (studentClasses) => {
    try {
      const resp = await api.get('/quizzes')
      // Get class names of enrolled classes
      const enrolledClassNames = studentClasses.map(cls => cls.name)
      // Filter quizzes that belong to enrolled classes
      const studentQuizzes = resp.data.filter((q) => 
        enrolledClassNames.includes(q.class)
      )
      setQuizzes(studentQuizzes)
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setQuizzes([])
    }
  }

  const getSubmissionStatus = (taskId) => {
    const submission = submissions.find((s) => s.task?._id === taskId)
    return submission?.status || 'not-submitted'
  }

  const handleEnroll = async (classId) => {
    try {
      await api.post(`/classes/${classId}/enroll-self`)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll')
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-transparent mb-3">
                My Learning Dashboard
              </h1>
              <p className="text-slate-400 text-lg">Track your tasks, submissions, and enrollment</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-slate-400 text-lg">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mr-3"></div>
                  Loading your dashboard...
                </div>
              </div>
            ) : (
              <>
                {/* Modern Tab Navigation - Updated with Quizzes tab */}
                <div className="mb-10 flex gap-3 border-b border-gray-800">
                  {[
                    { id: 'tasks', label: '📋 Tasks', count: tasks.length },
                    { id: 'quizzes', label: '🧠 Quizzes', count: quizzes.length }, // New Quizzes tab
                    { id: 'submissions', label: '✅ Submissions', count: submissions.length },
                    { id: 'classes', label: '📚 Classes', count: classes.length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 font-medium transition-all duration-300 border-b-2 ${
                        activeTab === tab.id
                          ? 'border-pink-500 text-pink-400'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-800">{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* Tasks Tab (Unchanged) */}
                {activeTab === 'tasks' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Your Tasks</h2>
                      <p className="text-slate-400">All tasks from your enrolled classes</p>
                    </div>
                    {tasks.length === 0 ? (
                      <div className="flex items-center justify-center h-80 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-dashed border-gray-700">
                        <div className="text-center">
                          <p className="text-4xl mb-3">📭</p>
                          <p className="text-slate-400 text-lg font-medium">No tasks yet</p>
                          <p className="text-slate-500 text-sm mt-2">Enroll in a class to start receiving tasks</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => {
                          const status = getSubmissionStatus(task._id)
                          const statusConfig = {
                            'approved': { bg: 'from-green-900 to-green-800', border: 'border-green-700', text: 'text-green-200', label: '✅ Approved', icon: '🎉' },
                            'rejected': { bg: 'from-red-900 to-red-800', border: 'border-red-700', text: 'text-red-200', label: '❌ Rejected', icon: '📍' },
                            'pending': { bg: 'from-yellow-900 to-yellow-800', border: 'border-yellow-700', text: 'text-yellow-200', label: '⏳ Pending', icon: '🕐' },
                            'not-submitted': { bg: 'from-slate-900 to-slate-800', border: 'border-slate-700', text: 'text-slate-300', label: '⭕ Not Submitted', icon: '📤' }
                          }
                          const config = statusConfig[status]
                          return (
                            <div
                              key={task._id}
                              className={`group rounded-2xl bg-gradient-to-br ${config.bg} border-2 ${config.border} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-white group-hover:text-pink-300 transition">{task.title}</h4>
                                </div>
                                <span className={`text-2xl ml-3 group-hover:scale-125 transition-transform`}>{config.icon}</span>
                              </div>
                              <p className="text-slate-300 text-sm mb-4 line-clamp-2">{task.description}</p>  
                              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${config.border.split('-')[1]}` }}>
                                <span className={`text-xs font-semibold ${config.text}`}>
                                  {config.label}
                                </span>
                                <Link
                                  to={`/tasks/${task._id}`}
                                  className="py-2 px-4 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg"
                                >
                                  Open →
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* NEW Quizzes Tab */}
                {activeTab === 'quizzes' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Your Quizzes</h2>
                      <p className="text-slate-400">Quizzes from your enrolled classes</p>
                    </div>
                    {quizzes.length === 0 ? (
                      <div className="flex items-center justify-center h-80 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-dashed border-gray-700">
                        <div className="text-center">
                          <p className="text-4xl mb-3">🧠</p>
                          <p className="text-slate-400 text-lg font-medium">No quizzes available</p>
                          <p className="text-slate-500 text-sm mt-2">Your classes don't have any quizzes yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                          <div
                            key={quiz._id}
                            className="group rounded-2xl bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-700 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-white group-hover:text-purple-300 transition">{quiz.name}</h4>
                                <p className="text-xs text-slate-300 mt-1">Class: {quiz.class}</p>
                                <p className="text-sm text-slate-300 mt-2">
                                  Questions: {quiz.questions?.length || 0}
                                </p>
                              </div>
                              <span className="text-2xl ml-3 group-hover:scale-125 transition-transform">📝</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-purple-600">
                              <span className="text-xs font-semibold text-purple-200">
                                Quiz ID: {quiz.quizId || quiz._id}
                              </span>
                              <button
                                onClick={() => setViewingQuiz(quiz)}
                                className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg"
                              >
                                View Quiz →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Submissions Tab (Unchanged) */}
                {activeTab === 'submissions' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Your Submissions</h2>
                      <p className="text-slate-400">Review your submitted work and grades</p>
                    </div>
                    {submissions.length === 0 ? (
                      <div className="flex items-center justify-center h-80 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-dashed border-gray-700">
                        <div className="text-center">
                          <p className="text-4xl mb-3">🎯</p>
                          <p className="text-slate-400 text-lg font-medium">No submissions yet</p>
                          <p className="text-slate-500 text-sm mt-2">Submit your first task to see it here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submissions.map((submission) => {
                          const statusColors = {
                            'approved': 'from-green-900 to-green-800 border-green-700',
                            'rejected': 'from-red-900 to-red-800 border-red-700',
                            'pending': 'from-yellow-900 to-yellow-800 border-yellow-700'
                          }
                          return (
                            <div
                              key={submission._id}
                              className={`rounded-2xl bg-gradient-to-r ${statusColors[submission.status]} border-2 p-6 shadow-md hover:shadow-lg transition-all duration-300`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-white">{submission.task?.title}</h4>
                                  <p className="text-sm opacity-75 mt-1">
                                    📅 {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not submitted'}
                                  </p>
                                </div>
                                <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
                                  submission.status === 'approved' ? 'bg-green-700 text-green-100' :
                                  submission.status === 'rejected' ? 'bg-red-700 text-red-100' :
                                  'bg-yellow-700 text-yellow-100'
                                }`}>
                                  {submission.status}
                                </span>
                              </div>
                              <div className="bg-black bg-opacity-30 rounded-lg p-4 mt-4">
                                <p className="text-slate-200 text-sm leading-relaxed">{submission.content}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Classes Tab (Unchanged) */}
                {activeTab === 'classes' && (
                  <div className="space-y-10">
                    {/* Enrolled Classes */}
                    <div>
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            📚 My Classes
                            <span className="text-sm px-3 py-1 rounded-full bg-pink-600 text-pink-100 font-semibold">{classes.length}</span>
                          </h2>
                          <p className="text-slate-400 mt-2">Classes you're enrolled in</p>
                        </div>
                      </div>
                      {classes.length === 0 ? (
                        <div className="flex items-center justify-center h-64 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-dashed border-gray-700">
                          <div className="text-center">
                            <p className="text-4xl mb-3">🎓</p>
                            <p className="text-slate-400 text-lg font-medium">Not enrolled yet</p>
                            <p className="text-slate-500 text-sm mt-2">Explore available classes below</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {classes.map((cls) => (
                            <div
                              key={cls._id}
                              className="group rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-800 border-2 border-indigo-700 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <h4 className="font-bold text-lg text-indigo-100 flex-1 group-hover:text-white transition">{cls.name}</h4>
                                <span className="text-2xl">✓</span>
                              </div>
                              <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-2 text-sm text-indigo-200">
                                  <span>👨‍🏫</span>
                                  <div>
                                    <p className="text-xs opacity-75">Teacher</p>
                                    <p className="font-semibold">{cls.teacher?.name || 'Unassigned'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-indigo-200">
                                  <span>👥</span>
                                  <div>
                                    <p className="text-xs opacity-75">Students</p>
                                    <p className="font-semibold">{cls.students?.length || 0} enrolled</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-indigo-200">
                                  <span>📋</span>
                                  <div>
                                    <p className="text-xs opacity-75">Tasks</p>
                                    <p className="font-semibold">{cls.tasks?.length || 0} available</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-indigo-200">
                                  <span>🧠</span>
                                  <div>
                                    <p className="text-xs opacity-75">Quizzes</p>
                                    <p className="font-semibold">{quizzes.filter(q => q.class === cls.name).length || 0} available</p>
                                  </div>
                                </div>
                              </div>
                              <button
                                disabled
                                className="w-full py-3 bg-white bg-opacity-20 text-indigo-100 rounded-lg text-sm font-semibold cursor-default border border-indigo-500 border-opacity-50"
                              >
                                ✓ Enrolled
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Available Classes */}
                    <div>
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            🔓 Explore Classes
                            <span className="text-sm px-3 py-1 rounded-full bg-green-600 text-green-100 font-semibold">
                              {allClasses.filter(cls => !classes.some(c => c._id === cls._id)).length}
                            </span>
                          </h2>
                          <p className="text-slate-400 mt-2">Available classes to join</p>
                        </div>
                      </div>
                      {allClasses.filter(cls => !classes.some(c => c._id === cls._id)).length === 0 ? (
                        <div className="flex items-center justify-center h-64 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-dashed border-gray-700">
                          <div className="text-center">
                            <p className="text-4xl mb-3">🎉</p>
                            <p className="text-slate-400 text-lg font-medium">All set!</p>
                            <p className="text-slate-500 text-sm mt-2">You're enrolled in all available classes</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {allClasses
                            .filter(cls => !classes.some(c => c._id === cls._id))
                            .map((cls) => (
                              <div
                                key={cls._id}
                                className="group rounded-2xl bg-gradient-to-br from-gray-900 to-gray-850 border-2 border-gray-700 hover:border-green-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                              >
                                <h4 className="font-bold text-lg text-white group-hover:text-green-300 transition mb-4">{cls.name}</h4>
                                <div className="space-y-3 mb-6">
                                  <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span>👨‍🏫</span>
                                    <div>
                                      <p className="text-xs opacity-75">Teacher</p>
                                      <p className="font-semibold">{cls.teacher?.name || 'Unassigned'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span>👥</span>
                                    <div>
                                      <p className="text-xs opacity-75">Students</p>
                                      <p className="font-semibold">{cls.students?.length || 0} enrolled</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span>📋</span>
                                    <div>
                                      <p className="text-xs opacity-75">Tasks</p>
                                      <p className="font-semibold">{cls.tasks?.length || 0} available</p>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleEnroll(cls._id)}
                                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
                                >
                                  Join Class →
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quizz Modal - Same as in QuizzManagement */}
      {viewingQuiz && (
        <QuizzView quiz={viewingQuiz} onClose={() => setViewingQuiz(null)} />
      )}
    </div>
  )
}