import express from 'express';
import { getAllSettings, getSetting,  deleteSetting, updateSettingByKey } from '../controllers/settings.js';
import { authMiddleware, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(authMiddleware);


router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.put('/:key',isStaff, updateSettingByKey);
router.delete('/:key',isStaff, deleteSetting);

export default router;
