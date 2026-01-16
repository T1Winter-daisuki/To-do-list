import express from 'express';
import { verifyToken } from '../../2_auth/3middleware/authMiddleware.js';
import { create, getTasks, update, remove } from "../4controllers/taskController.js";
import { validTask } from "../3middleware/taskMiddleware.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Tạo công việc mới
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ (Thiếu title hoặc sai deadline)
 *       401:
 *         description: Chưa đăng nhập (Thiếu Token)
 */
router.post('/', validTask, create);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Lấy danh sách công việc của User hiện tại
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       is_completed:
 *                         type: boolean
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/', getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Cập nhật công việc (Sửa tên, mô tả, đánh dấu hoàn thành)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của công việc cần sửa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Lỗi dữ liệu hoặc ID không đúng
 *       401:
 *         description: Chưa đăng nhập
 */
router.put('/:id', validTask, update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Xóa công việc
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của công việc cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.delete('/:id', remove);

export default router;