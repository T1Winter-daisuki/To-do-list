import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as taskServices from '../1services/taskServices';

export const useTasks = (userId) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // D
    const fetchTasks = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const res = await taskServices.getTasks(userId);
            setTasks(res.data || []);
        } catch (error) {
            console.error("Lỗi khi tải task:", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [userId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // C, U
    const handleCreateOrUpdateTask = async (payload, isEditing) => {
        try {
            if (isEditing) {
                const res = await taskServices.updateTask(isEditing, payload);
                setTasks(prev => prev.map(t => t.id === isEditing ? res.data : t));
                toast.success("Đã cập nhật!");
                return { success: true, data: res.data };
            } else {
                const res = await taskServices.createTask(payload);
                setTasks(prev => [res.data, ...prev]);
                toast.success("Đã thêm mới!");
                return { success: true, data: res.data };
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            toast.error(msg);
            return { success: false };
        }
    };

    // U
    const handleToggleComplete = async (task) => {
        try {
            const payload = { ...task, is_completed: !task.is_completed };
            const res = await taskServices.updateTask(task.id, payload);
            setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
            if (payload.is_completed) toast.info("Đã xong!");
            return true;
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            toast.error(msg);
            return false;
        }
    };

    // D
    const handleDeleteTask = async (deleteTaskId) => {
        try {
            await taskServices.deleteTask(deleteTaskId);
            setTasks(prev => prev.filter(t => t.id !== deleteTaskId));
            toast.success("Đã xóa task!");
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    return {
        tasks,
        isLoading,
        handleCreateOrUpdateTask,
        handleToggleComplete,
        handleDeleteTask
    };
};