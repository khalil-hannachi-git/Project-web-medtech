import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import classRoutes from './routes/classes.js'
import taskRoutes from './routes/tasks.js'
import submissionRoutes from './routes/submissions.js'
import uploadRoutes from './routes/uploads.js'
import quizzes from './routes/quizzes.js'
import path from 'path'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Connect DB
connectDB()

// Configure CORS properly
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow only your frontend
  credentials: true, // Allow cookies/sessions if used
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '5mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')))

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.get('/', (req, res) => res.json({ ok: true, message: 'UniTasks API Server' }))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/quizzes', quizzes)
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})