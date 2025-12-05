import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
import dayjs from 'dayjs'
export default function TeacherDashboard() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [tasks, setTasks] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '' , deadline: ''})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('classes')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/classes')
      const teacherClasses = resp.data.filter((c) => c.teacher?._id === user?.uid)
      setClasses(teacherClasses)
      if (teacherClasses.length > 0 && !selectedClass) {
        setSelectedClass(teacherClasses[0])
        setStudents(teacherClasses[0].students || [])
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectClass = (cls) => {
    setSelectedClass(cls)
    setStudents(cls.students || [])
    fetchTasksForClass(cls._id)
  }

  const fetchTasksForClass = async (classId) => {
    try {
      const resp = await api.get(`/tasks/class/${classId}`)
      setTasks(resp.data)
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
      fetchTasksForClass(selectedClass._id)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task')
    }
  }

  const handleEnrollStudent = async () => {
    const email = prompt('Enter student email:')
    if (!email) return

    try {
      const usersResp = await api.get('/users')
      const student = usersResp.data.find((u) => u.email === email)
      if (!student) {
        alert('Student not found')
        return
      }

      await api.post(`/classes/${selectedClass._id}/enroll`, { studentId: student._id })
      handleSelectClass(selectedClass)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student')
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student?')) return

    try {
      await api.post(`/classes/${selectedClass._id}/remove-student`, { studentId })
      handleSelectClass(selectedClass)
    } catch (err) {
      alert('Failed to remove student')
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Teacher Dashboard</h2>

          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar - Classes */}
                <div className="lg:col-span-1">
                  <div className="rounded card p-4">
                    <h3 className="font-semibold mb-4">My Classes</h3>
                    <div className="space-y-2">
                      {classes.map((cls) => (
                        <button
                          key={cls._id}
                          onClick={() => handleSelectClass(cls)}
                          className={`w-full text-left p-3 rounded border ${
                            selectedClass?._id === cls._id
                              ? 'bg-indigo-900 border-indigo-600'
                              : 'border-gray-800 hover:bg-gray-900'
                          }`}
                        >
                          <div className="font-medium">{cls.name}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {cls.students?.length || 0} students
                          </div>
                        </button>
                      ))}
                    </div>
                    {classes.length === 0 && (
                      <p className="text-slate-400 text-sm">No classes assigned yet</p>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedClass && (
                    <>
                      {/* Tabs */}
                      <div className="flex gap-4 border-b border-gray-800">
                        <button
                          onClick={() => setActiveTab('students')}
                          className={`pb-3 px-2 ${activeTab === 'students' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                        >
                          Students
                        </button>
                        <button
                          onClick={() => setActiveTab('tasks')}
                          className={`pb-3 px-2 ${activeTab === 'tasks' ? 'border-b-2 border-indigo-600 text-indigo-400' : 'text-slate-400'}`}
                        >
                          Tasks
                        </button>
                      </div>

                      {/* Students Tab */}
                      {activeTab === 'students' && (
                        <div className="rounded card p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Students ({students.length})</h4>
                            <button
                              onClick={handleEnrollStudent}
                              className="py-1 px-3 bg-indigo-600 text-sm rounded hover:bg-indigo-700"
                            >
                              Enroll Student
                            </button>
                          </div>

                          <div className="space-y-2">
                            {students.map((student) => (
                              <div key={student._id} className="flex justify-between items-center p-3 border border-gray-800 rounded">
                                <div>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-sm text-slate-400">{student.email}</div>
                                </div>
                                <button
                                  onClick={() => handleRemoveStudent(student._id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          {students.length === 0 && (
                            <p className="text-slate-400 text-sm">No students enrolled yet</p>
                          )}
                        </div>
                      )}

                      {/* Tasks Tab */}
                      {activeTab === 'tasks' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Tasks ({tasks.length})</h4>
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
                            {tasks.map((task) => (
                              <div key={task._id} className="p-4 rounded card border border-gray-800">
                                <h5 className="font-semibold text-lg">{task.title}</h5>
                                <p className="text-slate-300 mt-2">{task.description}</p>
                                <div className="mt-3 text-sm text-slate-400">
                                  Created: {new Date(task.createdAt).toLocaleDateString()}
                                </div>
                                 <p className="text-sm text-slate-400 mt-3"> Deadline: {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : '—'}</p>
                              </div>
                            ))}
                          </div>
                          {tasks.length === 0 && (
                            <p className="text-slate-400 text-sm">No tasks yet</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {!selectedClass && (
                    <div className="p-4 rounded card text-slate-400 text-center">
                      Select a class to get started
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
