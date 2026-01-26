import axios from "./api.js";

const createTask = async(taskData) => {
    return axios.post('/api/tasks/', taskData);
}

const getTasks = async() => {
    return axios.get('/api/tasks/');
}

const updateTask = async(id, taskData) => {
    return axios.put(`/api/tasks/${id}`, taskData);
}

const deleteTask = async(id) => {
    return axios.delete(`/api/tasks/${id}`);
}

export { createTask, getTasks, updateTask, deleteTask };