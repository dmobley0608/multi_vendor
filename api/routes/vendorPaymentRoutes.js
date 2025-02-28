import express from 'express';
import { createPayment, getAllPayments, getPaymentById, deletePayment, updatePayment, getVendorPayments } from '../controllers/vendorPayment.js';
import { authMiddleware, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(isStaff);

router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/vendor/:vendorId', getVendorPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;
