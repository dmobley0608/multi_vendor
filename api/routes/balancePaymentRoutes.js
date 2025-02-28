import express from 'express';
import {
    getAllBalancePayments,
    getBalancePaymentById,
    createBalancePayment,
    updateBalancePayment,
    deleteBalancePayment,
    getPaymentsByVendorId
} from '../controllers/balancePayment.js';
import { authMiddleware, isStaff } from '../middleware/authMiddleware.js';


const router = express.Router();

router.use(authMiddleware, isStaff);


router.get('/', getAllBalancePayments);
router.get('/:id', getBalancePaymentById);
router.post('/', createBalancePayment);
router.put('/:id', updateBalancePayment);
router.delete('/:id', deleteBalancePayment);
router.get('/vendor/:vendorId', getPaymentsByVendorId);

export default router;
