import axios from 'axios';
import {Workday} from '../model/Workday';

const parseFecha = (fecha: string): Date => {
  const [year, month, day] = fecha.split('-').map(Number);
  if (!year || !month || !day || year < 2000 || year > 2100) {
    throw new Error(`Fecha inválida: "${fecha}"`);
  }
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

export const workdayService = {
  async getByQuarter(quarterId: string): Promise<Workday[]> {
    const response = await axios.get<Workday[]>(`/api/jornales/${quarterId}`);
    return response.data.map(workday => ({
      ...workday,
      fecha: workday.fecha.split('T')[0] 
    }));
  },
  async getStructureByYear(idFarm: number, year: number): Promise<Workday[]> {
    const response = await axios.get<Workday[]>(`/api/jornales/estructura/${year}/finca/${idFarm}`);
    return response.data.map(workday => ({
      ...workday,
      fecha: workday.fecha.split('T')[0] 
    }));
  },
  async create(workday: Workday): Promise<Workday> {
    const fechaUTC = parseFecha(workday.fecha);
    workday.fecha = fechaUTC.toISOString();
    const response = await axios.post<Workday>('/api/jornales', workday);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async update(workday: Workday): Promise<Workday> {
    const fechaUTC = parseFecha(workday.fecha);
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
