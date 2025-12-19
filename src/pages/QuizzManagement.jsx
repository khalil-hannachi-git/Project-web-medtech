import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../lib/useAuth';
import api from '../api/client';
import QuizzView from '../components/QuizzView'; // Import the view modal
import dayjs from 'dayjs';

export default function QuizzManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingQuiz, setViewingQuiz] = useState(null); // For viewing a quiz

  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch all classes of the teacher
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/classes');
      const teacherClasses = resp.data.filter((c) => c.teacher?._id === user?.uid);
      setClasses(teacherClasses);
      if (teacherClasses.length > 0) {
        selectClass(teacherClasses[0]);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a class and fetch its quizzes
  const selectClass = async (cls) => {
    setSelectedClass(cls);
    await fetchQuizzes(cls.name); // pass class name for filtering
  };

  // Fetch quizzes for a given class name
  const fetchQuizzes = async (className) => {
    try {
      const resp = await api.get('/quizzes');
      const classQuizzes = resp.data.filter((q) => q.class === className);
      setQuizzes(classQuizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setQuizzes([]);
    }
  };

  // Delete a quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      if (selectedClass) fetchQuizzes(selectedClass.name);
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex-1 p-6 bg-gray-950">
          <h2 className="text-2xl font-bold mb-6">Quiz Management</h2>

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
                          {quizzes?.filter((q) => q.class === cls.name).length || 0} Quizzes
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
                  <div className="space-y-3">
                    {quizzes.length === 0 ? (
                      <p className="text-slate-400">No quizzes yet for this class</p>
                    ) : (
                      quizzes.map((quiz) => (
                        <div key={quiz._id} className="p-4 rounded card border border-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-lg">{quiz.name}</h5>
                              <p className="text-xs text-slate-400 mt-1">Quiz ID: {quiz.quizId}</p>
                              <p className="text-sm mt-1">Questions: {quiz.questions.length}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setViewingQuiz(quiz)}
                                className="py-1 px-3 bg-indigo-600 text-sm rounded hover:bg-indigo-700"
                              >
                                View Quiz
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(quiz._id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded card text-slate-400">
                    Select a class to manage quizzes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quizz Modal */}
          {viewingQuiz && (
            <QuizzView quiz={viewingQuiz} onClose={() => setViewingQuiz(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
