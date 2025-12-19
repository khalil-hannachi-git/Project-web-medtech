import QuizzModel from '../models/Quizz.js'
import User from '../models/User.js'

export const createQuizz = async (req, res) => {
  try {
    const quizz = await QuizzModel.create(req.body)
    res.status(201).json(quizz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizzModel.find()
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getQuizById = async (req, res) => {
  try {
    const quiz = await QuizzModel.findOne({ quizId: req.params.id })
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' })
    res.json(quiz)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await QuizzModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' })
    res.json(quiz)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await QuizzModel.findByclassAndDelete(req.params.id)
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' })
    res.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export const deleteallQuiz = async (req, res) => {
  try {
    await QuizzModel.deleteMany({})
    res.json({ message: 'All quizzes deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
  export const getQuizzesbyClass = async (req, res) => {
  try {
    const quizzes = await QuizzModel.find({ class: req.params.class })
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}