import * as taskModel from "../1models/taskModel.js";

export const createTask = async(user_id, data) => {
    const exist = await taskModel.checkExist(user_id, data.title);
    if (exist) throw new Error("Task đã tồn tại");

    const task = {
        user_id: user_id,
        title: data.title,
        description: data.description,
        is_completed: data.is_completed,
        start_time: data.start_time,
        deadline: data.deadline
    }
    return await taskModel.create(task);
}

export const getTasks = async(user_id) => {
    return taskModel.findTasks(user_id);
}

export const updateTask = async(id, user_id, data) => {
    const task = {
        id: id,
        user_id: user_id,
        title: data.title,
        description: data.description,
        is_completed: data.is_completed,
        start_time: data.start_time,
        deadline: data.deadline
    }
    const updatedTask = await taskModel.update(task);
    if (!updatedTask) throw new Error("Bạn không có quyền chỉnh sửa");
    return updatedTask;
}

export const deleteTask = async(id, user_id) => {
    const deletedTask = await taskModel.remove(
        id, user_id
    );
    if (!deletedTask) throw new Error("Không tìm thấy task");
    return deletedTask;
}