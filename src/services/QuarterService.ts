import axios from 'axios';
import { Quarter } from '../model/Quarter';

export const quarterService = {
  async getAll(fincaId: number): Promise<Quarter[]> {
    const response = await axios.get<Quarter[]>(`/api/cuarteles?fincaId=${fincaId}`);
    return response.data;
  },

  async get(quartedId: string): Promise<Quarter> {
    const response = await axios.get<Quarter>(`/api/cuarteles/${quartedId}`);
    return response.data;
  },

  async create(quarter: Quarter): Promise<Quarter> {
    const response = await axios.post<Quarter>('/api/cuarteles', quarter);
    return response.data;
  },

  async update(quarter: Quarter): Promise<Quarter> {
    const response = await axios.put<Quarter>(`/api/cuarteles/${quarter.id}`, quarter);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/cuarteles/${id}`);
  }
};