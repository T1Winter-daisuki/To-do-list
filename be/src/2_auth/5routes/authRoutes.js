import express from 'express';
import { handleRegister } from "../4controllers/authController.js";
import { validRegister, registerRateLimit } from "../3middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: min4max30
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Itnhat8kitu
 *               passwordConfirm:
 *                  type: string
 *                  format: password
 *               email:
 *                 type: string
 *                 format: email
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Lỗi dữ liệu đầu vào hoặc trùng lặp
 *       429:
 *         description: Gửi quá nhiều yêu cầu (Rate Limit)
 */
router.post('/register', registerRateLimit, validRegister, handleRegister);

export default router;