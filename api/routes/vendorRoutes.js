import express from 'express';
import { getAllVendors, getVendorById, createVendor, updateVendor, deleteVendor, getVendorMonthlyReport, updateVendorBalance, resetVendorPassword, getVendorByUser } from '../controllers/vendor.js';
import { authMiddleware, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', isStaff, getAllVendors);
router.get('/:id', getVendorById);
router.get('/user/vendor', getVendorByUser);
router.post('/', isStaff, createVendor);
router.post('/reset-password', isStaff, resetVendorPassword);
router.put('/:id', updateVendor);
router.put('/:id/balance', isStaff, updateVendorBalance);
router.delete('/:id', isStaff, deleteVendor);
router.get('/reports/monthly/:year/:month', getVendorMonthlyReport);

export default router;
