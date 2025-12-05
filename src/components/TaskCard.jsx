import React from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

export default function TaskCard({ task }){
  return (
    <div className="p-4 rounded card">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <div className="text-sm text-slate-400">{task.professorId ? 'Prof' : ''}</div>
      </div>
      <p className="text-sm text-slate-300 my-3">{task.description?.slice(0, 140)}</p>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          {(task.tags||[]).slice(0,3).map((t, i)=> <span key={i} className="px-2 py-0.5 text-xs bg-gray-800 rounded">{t}</span>)}
        </div>
      <div className="text-xs text-slate-400">Due {task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : '—'}</div>
      </div>

      <div className="mt-4">
        <Link to={`/tasks/${task.id}`} className="text-sm text-indigo-400">View</Link>
      </div>
    </div>
  )
}
