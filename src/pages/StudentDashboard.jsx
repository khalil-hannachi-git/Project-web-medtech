import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../lib/useAuth';
import api from '../api/client';
import QuizzView from '../components/QuizzView'; // import modal

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]); // store quizzes
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [viewingQuiz, setViewingQuiz] = useState(null); // for modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all classes
      const classesResp = await api.get('/classes');
      setAllClasses(classesResp.data);

      // Filter classes for this student
      const studentClasses = classesResp.data.filter((c) =>
        c.students?.some((s) => s._id === user?.uid)
      );
      setClasses(studentClasses);

      // Fetch all tasks for student's classes
      const allTasks = [];
      for (const cls of studentClasses) {
        const tasksResp = await api.get(`/tasks/class/${cls._id}`);
        allTasks.push(...tasksResp.data);
      }
      setTasks(allTasks);

      // Fetch submissions for this student
      const submissionsResp = await api.get('/submissions/student');
      setSubmissions(submissionsResp.data);

      // Fetch all quizzes and filter by enrolled classes
      const quizzesResp = await api.get('/quizzes');
      const studentQuizzes = quizzesResp.data.filter((q) =>
        studentClasses.some((cls) => cls.name === q.class)
      );
      setQuizzes(studentQuizzes);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (taskId) => {
    const submission = submissions.find((s) => s.task?._id === taskId);
    return submission?.status || 'not-submitted';
  };

  const handleEnroll = async (classId) => {
    try {
      await api.post(`/classes/${classId}/enroll-self`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

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
              <p className="text-slate-400 text-lg">Track your tasks, submissions, quizzes, and enrollment</p>
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
                {/* Tabs */}
                <div className="mb-10 flex gap-3 border-b border-gray-800">
                  {[
                    { id: 'tasks', label: '📋 Tasks', count: tasks.length },
                    { id: 'submissions', label: '✅ Submissions', count: submissions.length },
                    { id: 'quizzes', label: '📝 Quizzes', count: quizzes.length },
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

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                  <div className="space-y-6">
                    {/* existing task rendering code... */}
                  </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                  <div className="space-y-6">
                    {/* existing submissions rendering code... */}
                  </div>
                )}

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">My Quizzes</h2>
                    {quizzes.length === 0 ? (
                      <div className="text-slate-400">No quizzes available yet</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                          <div key={quiz._id} className="p-4 rounded card border border-gray-800 hover:shadow-lg transition cursor-pointer">
                            <h4 className="font-semibold text-lg">{quiz.name}</h4>
                            <p className="text-sm text-slate-400">Class: {quiz.class}</p>
                            <p className="text-sm text-slate-400">Questions: {quiz.questions.length}</p>
                            <button
                              onClick={() => setViewingQuiz(quiz)}
                              className="mt-2 py-1 px-3 bg-indigo-600 text-sm rounded hover:bg-indigo-700"
                            >
                              View Quiz
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                  <div className="space-y-10">
                    {/* existing classes rendering code... */}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quiz Modal */}
        {viewingQuiz && (
          <QuizzView quiz={viewingQuiz} onClose={() => setViewingQuiz(null)} />
        )}
      </div>
    </div>
  );
}
