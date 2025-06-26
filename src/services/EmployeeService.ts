import axios from 'axios';
import {Employee} from '../model/Employee';

export const employeeService = {
  async getAll(fincaId:number): Promise<Employee[]> {
    const response = await axios.get<Employee[]>(`/api/empleados/finca/${fincaId}`);
    return response.data;
  },

  async create(employee: Omit<Employee, 'id'>,fincaId:number): Promise<Employee> {
    employee.fincaId = fincaId;
    try {
      const response = await axios.post<Employee>('/api/empleados',employee);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async update(id: number, employee: Omit<Employee, 'id'>,fincaId:number): Promise<Employee> {
    employee.fincaId = fincaId;
    const response = await axios.put<Employee>(`/api/empleados/${id}`,employee);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/api/empleados/${id}`);
  }
};