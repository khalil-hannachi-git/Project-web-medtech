const Answer = require('../models/Answers');

// Get all answers
exports.getAllAnswers = async (req, res) => {
    try {
        const answers = await Answer.find();
        res.status(200).json(answers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get answer by ID
exports.getAnswerById = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });
        res.status(200).json(answer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create answer
exports.createAnswer = async (req, res) => {
    const answer = new Answer(req.body);
    try {
        const savedAnswer = await answer.save();
        res.status(201).json(savedAnswer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update answer
exports.updateAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(answer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete answer
exports.deleteAnswer = async (req, res) => {
    try {
        await Answer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Answer deleted' });
        } catch (error) {
        res.status(500).json({ message: error.message });
    }
};