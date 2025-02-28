import express from 'express';
import { createTransaction, getAllTransactions, getTransactionById, deleteTransaction, getTodaysTransactions, updateTransactionItem, updateTransaction, deleteTransactionItem, getWeeklyTransactions, getMonthlyTransactions, getTransactionsByMonthYear } from '../controllers/transaction.js';
import { authMiddleware, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(authMiddleware);
router.use(isStaff);

router.get('/today', getTodaysTransactions);
router.get('/weekly', getWeeklyTransactions);
router.get('/monthly', getMonthlyTransactions);
router.get('/monthly/:year/:month', getTransactionsByMonthYear);
router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.put('/items/:id', updateTransactionItem);
router.delete('/:id', deleteTransaction);
router.delete('/items/:id', deleteTransactionItem);

export default router;
