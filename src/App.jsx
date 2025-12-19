import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import ManageUsers from './pages/ManageUsers'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import TaskDetail from './pages/TaskDetail'
import Profile from './pages/Profile'
import ClassManagement from './pages/ClassManagement'
import TaskManagement from './pages/TaskManagement'
import QuizzManagement from './pages/QuizzManagement'
import { useAuth } from './lib/useAuth'


function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900"><div className="text-xl">Loading...</div></div>

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      
      {/* Role-based dashboards */}
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <AdminDashboard /> : user?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={<ProtectedRoute requiredRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute requiredRoles={['admin']}><ClassManagement /></ProtectedRoute>} />
      
      <Route path="/teacher/classes" element={<ProtectedRoute requiredRoles={['teacher']}><ClassManagement /></ProtectedRoute>} />
      <Route path="/teacher/tasks" element={<ProtectedRoute requiredRoles={['teacher']}><TaskManagement /></ProtectedRoute>} />
      <Route path="/teacher/quizzes" element={<ProtectedRoute requiredRoles={['teacher']}><QuizzManagement /></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute requiredRoles={['student']}><QuizzManagement /></ProtectedRoute>} />
      <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
