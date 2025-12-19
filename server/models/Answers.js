const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    name: { type: String, required: true },
  index: {
    type: Number,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
