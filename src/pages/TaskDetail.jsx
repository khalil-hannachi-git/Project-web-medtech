import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
import dayjs from 'dayjs'

export default function TaskDetail(){
  const { id } = useParams()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(()=>{
    fetchTask()
    if(user?.role !== 'student') {
      fetchSubmissions()
    }
  },[id])

  const fetchTask = async () => {
    try {
      const resp = await api.get(`/tasks/${id}`)
      setTask(resp.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching task:', err)
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const resp = await api.get(`/submissions/task/${id}`)
      setSubmissions(resp.data)
    } catch (err) {
      console.error('Error fetching submissions:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && files.length === 0) {
      alert('Please enter submission content or attach files')
      return
    }

    try {
      const form = new FormData()
      form.append('taskId', id)
      form.append('content', content)
      for (const f of files) form.append('attachments', f)
      await api.post('/submissions', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setContent('')
      setFiles([])
      setShowSubmitForm(false)
      alert('Submission successful!')
      fetchSubmissions()
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed')
    }
  }

  const handleGradeSubmission = async (submissionId, status) => {
    try {
      if (status === 'approved') {
        const gradeStr = prompt('Enter grade (0-100):')
        const grade = gradeStr ? Number(gradeStr) : undefined
        await api.post(`/submissions/${submissionId}/grade`, { status, grade })
      } else if (status === 'rejected') {
        const feedback = prompt('Enter feedback for the student:')
        await api.post(`/submissions/${submissionId}/grade`, { status, feedback })
      }
      fetchSubmissions()
    } catch (err) {
      alert('Failed to grade submission')
    }
  }

  if(loading) return <div className="p-8">Loading...</div>
  if(!task) return <div className="p-8">Task not found</div>

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <div className="max-w-4xl">
              <div className="p-6 rounded card mb-6 border border-gray-800">
              <h2 className="text-3xl font-bold mb-3">{task.title}</h2>
              <p className="text-slate-300 mb-4">{task.description}</p>
              {task.attachments?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-slate-400 mb-2">Attachments</h4>
                  <div className="flex gap-3">
                    {task.attachments.map((a, i) => (
                      <a key={i} href={a} target="_blank" rel="noreferrer" className="text-indigo-300 text-sm underline">
                        File {i+1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Comments preview */}
              <div className="mb-4">
                <button onClick={() => setShowComments(!showComments)} className="text-sm text-slate-400 underline">
                  {showComments ? 'Hide Comments' : `Comments (${task.comments?.length || 0})`}
                </button>
                {showComments && (
                  <div className="mt-3 space-y-3">
                    {task.comments?.map((c) => (
                      <div key={c._id} className="p-3 bg-gray-900 border border-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
                            {c.author?.profilePicture ? (
                              <img src={c.author.profilePicture} alt={c.author.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-xs text-slate-300 flex items-center justify-center h-full">{c.author?.name?.[0]}</div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{c.author?.name}</div>
                            <div className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <p className="text-slate-300 mt-2">{c.content}</p>
                      </div>
                    ))}

                    {/* Add comment */}
                    <div className="p-3 bg-gray-900 border border-gray-800 rounded">
                      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded" rows={2} placeholder="Add a comment..." />
                      <div className="mt-2 flex gap-2">
                        <button onClick={async () => {
                          if (!newComment.trim()) return alert('Enter comment')
                          try {
                            await api.post(`/tasks/${id}/comments`, { content: newComment })
                            setNewComment('')
                            await fetchTask()
                          } catch (err) { alert('Failed to post comment') }
                        }} className="py-1 px-3 bg-indigo-600 rounded text-sm">Post</button>
                        <button onClick={() => setNewComment('')} className="py-1 px-3 bg-gray-700 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-slate-400">
                Created: {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : new Date(task.createdAt).toLocaleDateString()}
                
              </div>
              <div className="text-sm text-slate-400">
                Due: {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : '—'}</div>
            </div>

            {/* Student submission section */}
            {user?.role === 'student' && (
              <div className="mb-6 p-6 rounded card border border-gray-800">
                <h3 className="font-semibold mb-4">Submit Your Work</h3>
                {!showSubmitForm ? (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded"
                  >
                    Submit Task
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your submission content..."
                      className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                      rows={4}
                    />
                    <div>
                      <label className="text-sm text-slate-400">Attach files (optional)</label>
                      <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="mt-2" />
                      {files.length > 0 && <div className="text-sm text-slate-300 mt-2">{files.length} file(s) selected</div>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubmitForm(false)
                          setContent('')
                        }}
                        className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Teacher submission review section */}
            {user?.role === 'teacher' && (
              <div className="p-6 rounded card border border-gray-800">
                <h3 className="font-semibold mb-4">Student Submissions ({submissions.length})</h3>
                {submissions.length === 0 ? (
                  <p className="text-slate-400">No submissions yet</p>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission._id} className="p-4 border border-gray-700 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{submission.student?.name}</h4>
                            <p className="text-sm text-slate-400">{submission.student?.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            submission.status === 'approved'
                              ? 'bg-green-900 text-green-200'
                              : submission.status === 'rejected'
                              ? 'bg-red-900 text-red-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-slate-300 my-3">{submission.content}</p>
                        {submission.attachments?.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm text-slate-400 mb-2">Attachments</div>
                            <div className="flex gap-3">
                              {submission.attachments.map((a, i) => (
                                <a key={i} href={a} target="_blank" rel="noreferrer" className="text-indigo-300 text-sm underline">File {i+1}</a>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mb-3">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
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
                        {submission.grade !== undefined && (
                          <div className="mt-3 text-sm text-slate-300">Grade: <span className="font-bold text-white">{submission.grade}/100</span></div>
                        )}
                        {submission.feedback && (
                          <div className="mt-2 text-sm text-slate-400">Feedback: {submission.feedback}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
