import axios from 'axios';
import {Employee} from '../model/Employee';
import ApiEmployee from '../model/ApiEmployee';

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const response = await axios.get<ApiEmployee[]>('/api/empleados');
    return response.data;
  },

  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const response = await axios.post<ApiEmployee>('/api/empleados', {
      nombre: employee.nombre,
      dni: employee.dni
    });
    return response.data;
  },

  async update(id: number, employee: Omit<Employee, 'id'>): Promise<Employee> {
    const response = await axios.put<ApiEmployee>(`/api/empleados/${id}`, {
      nombre: employee.nombre,
      dni: employee.dni
    });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/empleados/${id}`);
  }
};