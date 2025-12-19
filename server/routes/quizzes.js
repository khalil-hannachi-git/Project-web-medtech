import express from 'express';
import { getQuizById,getQuizzes, deleteQuiz,getQuizzesbyClass,createQuizz,deleteallQuiz } from '../controllers/QuizzController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth)
router.post('/', requireRole('teacher','admin'), createQuizz)
router.get('/:id', requireAuth, getQuizById)
router.get('/', requireAuth, getQuizzes)
router.get('/c/:class', requireAuth, getQuizzesbyClass)
router.delete('/:id', requireRole('teacher','admin'), deleteQuiz)
router.delete('/all/quizzes', requireAuth, deleteallQuiz)
export default router