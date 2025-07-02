import axios from 'axios';
import JornalNoProductivo from '../model/JornalNoProductivo';

export const jornalNoProductivoService = {
  async listAll(idFarm:number): Promise<JornalNoProductivo[]> {
    const response = await axios.get<JornalNoProductivo[]>(`/api/jornalesnp/finca/${idFarm}`);
    return response.data.map(workday => ({
      ...workday,
      fecha: workday.fecha.split('T')[0] 
    }));
  },
  async create(workday: JornalNoProductivo): Promise<JornalNoProductivo> {
    const [year, month, day] = workday.fecha.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    workday.fecha = fechaUTC.toISOString();
    const response = await axios.post<JornalNoProductivo>('/api/jornalesnp', workday);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async update(workday: JornalNoProductivo): Promise<JornalNoProductivo> {
    const [year, month, day] = workday.fecha.split('-').map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    workday.fecha = fechaUTC.toISOString();
    const response = await axios.put<JornalNoProductivo>(`/api/jornalesnp/${workday.id}`, workday);
    return {
      ...response.data,
      fecha: response.data.fecha.split('T')[0]
    };
  },

  async delete(id: number|null|undefined): Promise<void> {
    await axios.delete(`/api/jornalesnp/${id}`);
  }
};