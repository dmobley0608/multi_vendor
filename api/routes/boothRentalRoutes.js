import express from 'express';
import { createCharge, getAllCharges, getChargeById, deleteCharge, updateCharge, getVendorCharges } from '../controllers/boothRental.js';
import { authMiddleware, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(isStaff);

router.post('/', createCharge);
router.get('/', getAllCharges);
router.get('/vendor/:vendorId', getVendorCharges);
router.get('/:id', getChargeById);
router.put('/:id', updateCharge);
router.delete('/:id', deleteCharge);

export default router;
