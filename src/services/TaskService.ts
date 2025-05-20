import axios from 'axios';
import Task from '../model/Task';

export const taskService = {
  async getAll(): Promise<Task[]> {
    const response = await axios.get<Task[]>('/api/tareas');
    return response.data;
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const response = await axios.post<Task>('/api/tareas', task);
    return response.data;
  },

  async update(id: number, task: Omit<Task, 'id'>): Promise<Task> {
    const response = await axios.put<Task>(`/api/tareas/${id}`, task);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/tareas/${id}`);
  }
};