import axios from 'axios';
import Farm from '../model/Farm';

export const getFarms = async (): Promise<Farm[]> => {
  try {
    const response = await axios.get<Farm[]>('/api/fincas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener fincas:', error);
    return [];
  }
};

export const createFarm = async (farmName: string): Promise<Farm | null> => {
  try {
    const response = await axios.post<Farm>('/api/fincas', { nombre: farmName });
    return response.data;
  } catch (error) {
    console.error('Error al crear finca:', error);
    return null;
  }
};

export const updateFarm = async (farmId: number, farmName: string): Promise<Farm | null> => {
  try {
    const response = await axios.put<Farm>(`/api/fincas/${farmId}`, { id: farmId, nombre: farmName });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar finca:', error);
    return null;
  }
};

export const deleteFarm = async (farmId: number): Promise<boolean> => {
  try {
    await axios.delete(`/api/fincas/${farmId}`);
    return true;
  } catch (error) {
    console.error('Error al eliminar finca:', error);
    return false;
  }
};