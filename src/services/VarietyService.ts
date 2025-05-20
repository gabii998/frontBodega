import axios from 'axios';
import Variety from '../model/Variety';

export const varietyService = {
  async getAll(): Promise<Variety[]> {
    const response = await axios.get<Variety[]>('/api/variedades');
    return response.data;
  },

  async create(name: string): Promise<Variety> {
    const response = await axios.post<Variety>('/api/variedades', { 
      nombre: name 
    });
    return response.data;
  },

  async update(id: number, name: string): Promise<Variety> {
    const response = await axios.put<Variety>(`/api/variedades/${id}`, { 
      id, 
      nombre: name 
    });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/variedades/${id}`);
  }
};