import * as taskService from "../2services/taskService.js";

export const create = async(req, res) => {
    try {
        const user_id = req.user.id;
        const { title, description, start_time, deadline, is_completed } = req.body;
        const task = await taskService.createTask(
            user_id, 
            { title, description, start_time, deadline, is_completed }
        );
        res.status(201).json({
            message: "Tạo thành công",
            data: task
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getTasks = async(req, res) => {
    try {
        const user_id = req.user.id;
        const tasks = await taskService.getTasks(user_id);
        res.status(200).json({
            data: tasks
        })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const update = async(req, res) => {
    try {   
        const user_id = req.user.id;
        const task_id = req.params.id;
        const { title, description, start_time, deadline, is_completed } = req.body;
        const task = await taskService.updateTask(
            task_id, 
            user_id, 
            { title, description, start_time, deadline, is_completed });
        res.status(200).json({
            message: "Cập nhật thành công",
            data: task
        })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const remove = async(req, res) => {
    try {
        const user_id = req.user.id;
        const task_id = req.params.id;
        await taskService.deleteTask(
            task_id, 
            user_id
        );
        res.status(200).json({
            message: "Xóa thành công"
        })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}