import React from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import TableShimmer from './TableShimmer';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';
import Toast from './Toast';

// Interfaces
interface Employee {
  id?: number;
  name: string;
  dni: string;
}

// Interface para la respuesta de la API
interface ApiEmployee {
  id: number;
  nombre: string;
  dni: string;
}

const EmployeeTable = () => {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<Toast | null>(null);

  // Función para transformar la respuesta de la API al formato del frontend
  const transformApiData = (data: ApiEmployee[]): Employee[] => {
    return data.map(emp => ({
      id: emp.id,
      name: emp.nombre, // Convertir de 'nombre' a 'name'
      dni: emp.dni
    }));
  };

  // Cargar empleados desde el backend
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiEmployee[]>('/api/empleados');
      setEmployees(transformApiData(response.data));
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('No se pudieron cargar los empleados. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenModal = (employee?: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Employee): Promise<void> => {
    setIsLoading(true);
    try {
      if (selectedEmployee?.id) {
        // Actualizar empleado existente
        const response = await axios.put<ApiEmployee>(`/api/empleados/${selectedEmployee.id}`, {
          nombre: employeeData.name,
          dni: employeeData.dni
        });
        
        // Transformar la respuesta y actualizar el estado
        const updatedEmployee = {
          id: response.data.id,
          name: response.data.nombre,
          dni: response.data.dni
        };
        
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ));
        
        // Mostrar mensaje de éxito para actualización
        setToast({
          type: 'success',
          message: 'Empleado actualizado correctamente'
        });
      } else {
        // Crear nuevo empleado
        const response = await axios.post<ApiEmployee>('/api/empleados', {
          nombre: employeeData.name,
          dni: employeeData.dni
        });
        
        // Transformar la respuesta y actualizar el estado
        const newEmployee = {
          id: response.data.id,
          name: response.data.nombre,
          dni: response.data.dni
        };
        
        setEmployees([...employees, newEmployee]);
        
        // Mostrar mensaje de éxito para creación
        setToast({
          type: 'success',
          message: 'Empleado creado correctamente'
        });
      }
      
      // Cerrar el modal si la operación fue exitosa
      setIsModalOpen(false);
      setSelectedEmployee(undefined);
      
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      // Propagamos el error para que lo maneje el modal
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
      setIsLoading(true);
      try {
        await axios.delete(`/api/empleados/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
        
        // Mostrar mensaje de éxito para eliminación
        setToast({
          type: 'success',
          message: 'Empleado eliminado correctamente'
        });
      } catch (err) {
        console.error('Error al eliminar empleado:', err);
        setToast({
          type: 'error',
          message: 'No se pudo eliminar el empleado'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
       {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Empleados</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Nuevo Empleado
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchEmployees}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading ? (
        <TableShimmer columns={[40, 40, 20]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No hay empleados registrados
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{employee.dni}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleOpenModal(employee)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee.id!)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

<EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(undefined);
        }}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EmployeeTable;