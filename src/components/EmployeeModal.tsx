import React from 'react';
import { X } from 'lucide-react';
import EmployeeModalProps from '../model/EmployeeModalProps';
import Employee from '../model/Employee';
import axios from 'axios';

const EmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  employee,
  isLoading = false
}: EmployeeModalProps) => {
  const [formData, setFormData] = React.useState<Employee>({
    nombre: employee?.nombre || '',
    dni: employee?.dni || ''
  });

  const [validationErrors, setValidationErrors] = React.useState({
    name: '',
    dni: ''
  });

  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id,
        nombre: employee.nombre,
        dni: employee.dni
      });
    } else {
      setFormData({ nombre: '', dni: '' });
    }
    // Limpiar errores al abrir el modal
    setValidationErrors({ name: '', dni: '' });
    setServerError(null);
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { name: '', dni: '' };

    if (!formData.nombre.trim()) {
      newErrors.name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
      isValid = false;
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setServerError(null);
      try {
        await onSave(formData);
        // Éxito - el componente padre se encargará de cerrar el modal
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Capturar y mostrar el error del servidor
          if (error.response && error.response.data && error.response.data.message) {
            setServerError(error.response.data.message);
          } else {
            setServerError('Ocurrió un error al guardar el empleado. Intente nuevamente.');
          }
        } else if(error instanceof Error) {
          setServerError(error.message);
        } else {
          setServerError('Ocurrió un error al guardar el empleado. Intente nuevamente.');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
          type="button"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h2>

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={isLoading}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI
            </label>
            <input
              type="text"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.dni ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={isLoading}
            />
            {validationErrors.dni && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.dni}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;