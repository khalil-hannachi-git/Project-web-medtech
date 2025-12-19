import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function Sidebar(){
  const { user } = useAuth()

  return (
    <aside className="w-64 p-4 border-r border-gray-800 min-h-screen bg-black sticky top-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">UniTasks</h1>
        <p className="text-sm text-slate-400">Task Management</p>
      </div>

      {user && (
        <div className="mb-6 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-300">{user.name?.[0]}</div>
              )}
            </div>
            <div className="text-sm">
              <p className="text-slate-400 text-xs">Signed in as</p>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-2">
        <NavLink to="/" end className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
          Dashboard
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <NavLink to="/admin/users" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
              Manage Users
            </NavLink>
            <NavLink to="/admin/classes" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
              Manage Classes
            </NavLink>
          </>
        )}

        {user?.role === 'teacher' && (
          <>
            <NavLink to="/teacher/classes" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
              My Classes
            </NavLink>
            <NavLink to="/teacher/tasks" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
              Manage Tasks
            </NavLink>
            <NavLink to="/teacher/quizzes" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
              Manage Quizzes
            </NavLink>
          </>
        )}

        <NavLink to="/profile" className={({isActive})=>`block p-2 rounded ${isActive? 'bg-gray-800':'hover:bg-gray-900'}`}>
          My Profile
        </NavLink>
      </nav>

      <div className="mt-6 text-xs text-slate-500">
        <p>Version 1.0</p>
        <p>School Task Manager</p>
      </div>
    </aside>
  )
}
