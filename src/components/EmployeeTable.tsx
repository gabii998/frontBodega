import { ReactNode, useEffect, useState } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import TableShimmer from './TableShimmer';
import EmployeeModal from './EmployeeModal';
import { Employee } from '../model/Employee';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import Toast from './Toast';
import { apiCall } from '../utils/apiUtil';
import { employeeService } from '../services/employeeService';
import Table from '../common/Table';
import Title from '../common/Title';
import ErrorBanner from '../common/ErrorBanner';

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

  const onEmployeeSaved = (data: Employee, isEdit: boolean) => {
    setEmployees(isEdit ? employees.map(emp => emp.id === selectedEmployee?.id ? data : emp) : [...employees, data]);
    setToast(successToast('Empleado'+(isEdit ? 'actualizado' : 'creado')+'correctamente'));
    setIsModalOpen(false);
    setSelectedEmployee(undefined);
  }

  const handleSaveEmployee = async (employeeData: Employee) => {
    const isEdit = Boolean(selectedEmployee?.id);
    const call = isEdit ? employeeService.update(selectedEmployee?.id ?? -1, employeeData) : employeeService.create(employeeData);
    apiCall({
        setLoading: setIsLoading,
        setError: setError,
        serverCall: call,
        onSuccess: (data) => onEmployeeSaved(data,isEdit),
      });
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

  const tableContent = (employee: Employee,): ReactNode[] => {
    return [
      employee.nombre,
      <div className='text-center'>{employee.dni}</div>,
      <div className="flex space-x-3 justify-end">
        <button
          onClick={() => handleOpenModal(employee)}
          className="edit-button"
          disabled={isLoading}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDeleteEmployee(employee.id!)}
          className="delete-button"
          disabled={isLoading}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    ];
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
      <div className="content">
        <Title title="Empleados" />
        <button
          onClick={() => handleOpenModal()}
          className="toolbar-button"
          disabled={isLoading}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Nuevo Empleado
        </button>
      </div>

      {error && (
        <ErrorBanner error={error} retry={fetchEmployees} />
      )}

      {isLoading ? (
        <TableShimmer columns={[40, 40, 20]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            header={["Nombre", "DNI", "Acciones"]}
            emptyMessage='No hay empleados registrados'
            data={employees}
            content={tableContent}
          />
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