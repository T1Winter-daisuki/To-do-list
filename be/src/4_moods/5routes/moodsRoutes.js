import express from 'express';
import { getMoods, saveMoods } from '../4controllers/moodsController.js';
import { validateMoodsPayload } from '../3middleware/moodsMiddleware.js';
import { authMiddleware } from '../../2_auth/3middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// VD: /api/moods?year=2026
router.get('/', getMoods);

router.post('/', validateMoodsPayload, saveMoods);

export default router;