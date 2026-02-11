import express from 'express';
import { handleRegister, handleLogin, refreshToken, logout, handleUpdate } from "../4controllers/authController.js";
import { validRegister, registerRateLimit, registerRateLimitDaily, 
         validLogin, loginRateLimit, verifyToken, validUpdate
} from "../3middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
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
 *               - passwordConfirm
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
 *                       properties:
 *                          username:
 *                              type: string
 *                          email:
 *                              type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Lỗi dữ liệu đầu vào hoặc trùng lặp
 *       429:
 *         description: Gửi quá nhiều yêu cầu (Rate Limit)
 */
router.post('/register', registerRateLimit, registerRateLimitDaily, validRegister, handleRegister);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
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
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username hoặc Email đều được
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đăng nhập thành công!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Thiếu thông tin đăng nhập (Validation error)
 *       401:
 *         description: Sai tài khoản hoặc mật khẩu
 *       429:
 *         description: Quá nhiều lần đăng nhập sai (Rate Limit)
 */
router.post('/login', loginRateLimit, validLogin, handleLogin);

router.post('/refresh', refreshToken);

router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 description: Họ đệm
 *                 example: Nguyễn Văn
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 description: Tên
 *                 example: A
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *                 description: Số điện thoại
 *                 example: "0987654321"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh
 *                 example: "2000-01-01"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật hồ sơ thành công!"
 *                 data:
 *                   type: object
 *                   description: Thông tin user mới nhất
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     dob:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Lỗi dữ liệu (Validation Error) hoặc Thiếu Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Token không hợp lệ hoặc hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/update', verifyToken, validUpdate, handleUpdate);

export default router;