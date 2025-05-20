import axios from 'axios';
import Workday from '../model/Workday';

export const workdayService = {
  async getByQuarter(quarterId: string): Promise<Workday[]> {
    const response = await axios.get<Workday[]>(`/api/jornales/${quarterId}`);
    return response.data.map(workday => ({
      ...workday,
      fecha: workday.fecha.split('T')[0] // Formato de fecha
    }));
  },

  async create(workday: Workday): Promise<Workday> {
    const [year, month, day] = workday.fecha.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    
    const apiData = {
      fecha: fechaUTC.toISOString(),
      jornales: workday.jornales,
      empleadoId: workday.empleadoId,
      tareaId: workday.tareaId,
      variedadId: workday.variedadId || null,
      cuartelId: workday.cuartelId
    };
    
    const response = await axios.post<Workday>('/api/jornales', apiData);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async update(workday: Workday): Promise<Workday> {
    const [year, month, day] = workday.fecha.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    
    const apiData = {
      id:workday.id,
      fecha: fechaUTC.toISOString(),
      jornales: workday.jornales,
      empleadoId: workday.empleadoId,
      tareaId: workday.tareaId,
      variedadId: workday.variedadId || null,
      cuartelId: workday.cuartelId
    };
    
    const response = await axios.put<Workday>(`/api/jornales/${workday.id}`, apiData);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/jornales/${id}`);
  }
};