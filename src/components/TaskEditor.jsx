import React, { useState } from 'react'
import dbClient from '../lib/dbClient'
import { useAuth } from '../lib/useAuth'
import { v4 as uuidv4 } from 'uuid'



export default function TaskEditor({ onClose }){
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [deadline, setDeadline] = useState('')
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)

  const handleFiles = (e)=> setFiles(Array.from(e.target.files))

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setSaving(true)
    try{
      await dbClient.createTask({
        title,
        description,
        professorId: user.uid,
        tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
        deadline: deadline ? new Date(deadline) : null,
        attachments: files,
      })

      onClose && onClose()
    }catch(err){
      console.error(err)
      alert(err.message)
    }finally{
      setSaving(false)
    }
  }

  return (
    <div className="p-4 mb-6 rounded card">
      <h3 className="font-semibold mb-3">Create Task</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
       <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="w-full p-2 rounded bg-gray-800" />
        <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 rounded bg-gray-800" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 rounded bg-gray-800" />
        <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full p-2 rounded bg-gray-800" />
        <input type="file" onChange={handleFiles} multiple className="w-full p-2" />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="py-2 px-4 rounded bg-indigo-600">{saving ? 'Saving...' : 'Create'}</button>
          <button type="button" onClick={onClose} className="py-2 px-4 rounded bg-gray-700">Cancel</button>
        </div>
      </form>
    </div>
  )
}
