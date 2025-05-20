import { useEffect, useState } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import TableShimmer from './TableShimmer';
import EmployeeModal from './EmployeeModal';
import {Employee} from '../model/Employee';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import Toast from './Toast';
import { apiCall } from '../utils/apiUtil';
import { employeeService } from '../services/employeeService';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    apiCall({
      setLoading: setIsLoading,
      setError: setError,
      onSuccess: setEmployees,
      serverCall: employeeService.getAll(),
      errorMessage: 'No se pudieron cargar los empleados. Por favor, intente de nuevo.'
    })
  };

  const handleOpenModal = (employee?: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Employee): Promise<void> => {
    if (selectedEmployee?.id) {
      apiCall({
        setLoading: setIsLoading,
        setError: (err) => { throw err; },
        serverCall: employeeService.update(selectedEmployee.id, employeeData),
        onSuccess: (data) => {
          setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? data : emp));
          setToast(successToast('Empleado actualizado correctamente'));
          setIsModalOpen(false);
          setSelectedEmployee(undefined);
        },
      });
    } else {
      apiCall({
        setLoading: setIsLoading,
        setError: (err) => { throw err; },
        serverCall: employeeService.create(employeeData),
        onSuccess: (data) => {
          setEmployees([...employees, data]);
          setToast(successToast('Empleado creado correctamente'));
          setIsModalOpen(false);
          setSelectedEmployee(undefined);
        },
      });
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
      apiCall({
        setLoading: setIsLoading,
        setError: setErrorToast,
        serverCall: employeeService.delete(id),
        errorMessage: 'No se pudo eliminar el empleado',
        onSuccess: () => {
          setEmployees(employees.filter(emp => emp.id !== id));
          setToast(successToast('Empleado eliminado correctamente'));
        },
      });
    }
  };

  const setErrorToast = (error: string | null) => {
    setToast(errorToast(error ?? ''));
  }

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
                    <td className="px-6 py-4 whitespace-nowrap">{employee.nombre}</td>
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