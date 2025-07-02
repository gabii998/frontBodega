import axios from 'axios';
import {Workday} from '../model/Workday';

export const workdayService = {
  async getByQuarter(quarterId: string): Promise<Workday[]> {
    const response = await axios.get<Workday[]>(`/api/jornales/${quarterId}`);
    return response.data.map(workday => ({
      ...workday,
      fecha: workday.fecha.split('T')[0] 
    }));
  },
  async getStructureByYear(idFarm:number): Promise<Workday[]> {
    const response = await axios.get<Workday[]>(`/api/jornales/estructura/${new Date().getFullYear()}/finca/${idFarm}`);
    return response.data.map(workday => ({
      ...workday,
      fecha: workday.fecha.split('T')[0] 
    }));
  },
  async create(workday: Workday): Promise<Workday> {
    const [year, month, day] = workday.fecha.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  
    workday.fecha = fechaUTC.toISOString();
    const response = await axios.post<Workday>('/api/jornales', workday);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async update(workday: Workday): Promise<Workday> {
    const [year, month, day] = workday.fecha.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    workday.fecha = fechaUTC.toISOString();
    const response = await axios.put<Workday>(`/api/jornales/${workday.id}`, workday);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/jornales/${id}`);
  }
};