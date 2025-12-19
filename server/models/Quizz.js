import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    question: { type: String, required: true },
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true }
    }
  },
  { _id: false }
)

const QuizSchema = new mongoose.Schema(
  {
    quizId: { type: Number, required: true, unique: true, index: true },
    class: { type: String, required: true },
    name: { type: String, required: true },
    questions: [QuestionSchema]
  },
  { timestamps: true }
)

export default mongoose.model('Quiz', QuizSchema)
