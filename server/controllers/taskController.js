import Task from '../models/Task.js'
import ClassModel from '../models/Class.js'
import path from 'path'

export async function createTask(req, res) {
  const { title, description, deadline, classId } = req.body
  const attachments = (req.files || []).map(f => `/uploads/${path.basename(f.path)}`)
  const t = new Task({ title, description, deadline, class: classId, createdBy: req.userId, attachments })
  await t.save()
  await ClassModel.findByIdAndUpdate(classId, { $addToSet: { tasks: t._id } })
  res.json(t)
}

export async function listTasksForClass(req, res) {
  const classId = req.params.classId
  const tasks = await Task.find({ class: classId }).sort({ createdAt: -1 })
  res.json(tasks)
}

export async function getTask(req, res) {
  const t = await Task.findById(req.params.id).populate('comments.author', 'name profilePicture')
  if (!t) return res.status(404).json({ message: 'Not found' })
  res.json(t)
}

export async function deleteTask(req, res) {
  await Task.findByIdAndDelete(req.params.id)
  res.json({ message: 'deleted' })
}

export async function addComment(req, res) {
  const { id } = req.params
  const { content } = req.body
  if (!content || !content.trim()) return res.status(400).json({ message: 'Content required' })
  const t = await Task.findById(id)
  if (!t) return res.status(404).json({ message: 'Task not found' })
  t.comments.push({ author: req.userId, content })
  await t.save()
  const last = t.comments[t.comments.length - 1]
  await last.populate('author', 'name profilePicture')
  res.json(last)
}
