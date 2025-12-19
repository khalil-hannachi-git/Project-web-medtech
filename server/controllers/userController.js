  import User from '../models/User.js'

export async function listUsers(req, res) {
  const users = await User.find().select('-password')
  res.json(users)
}

export async function getUser(req, res) {
  const u = await User.findById(req.params.id).select('-password')
  if (!u) return res.status(404).json({ message: 'Not found' })
  res.json(u)
}

export async function updateUser(req, res) {
  const patch = req.body
  if (patch.password) delete patch.password // handle password separately
  const u = await User.findByIdAndUpdate(req.params.id, patch, { new: true }).select('-password')
  if (!u) return res.status(404).json({ message: 'Not found' })
  res.json(u)
}

export async function deleteUser(req, res) {
  await User.findByIdAndDelete(req.params.id)
  res.json({ message: 'deleted' })
}
