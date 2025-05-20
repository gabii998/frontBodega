import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import EmployeeModalProps from '../model/EmployeeModalProps';
import {createEmployee, Employee} from '../model/Employee';
import { apiCall } from '../utils/apiUtil';

const EmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  employee,
  isLoading = false
}: EmployeeModalProps) => {
  const [formData, setFormData] = useState<Employee>({
    nombre: employee?.nombre || '',
    dni: employee?.dni || ''
  });
  const [validationErrors, setValidationErrors] = useState(createEmployee);
  const [serverError, setServerError] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState("modalIn");

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setFormData({
          id: employee.id,
          nombre: employee.nombre,
          dni: employee.dni
        });
      } else {
        setFormData(createEmployee);
      }
      setValidationErrors(createEmployee);
      setServerError(null);
      setAnimationClass("modalIn");

      // Bloquear desplazamiento del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Restaurar desplazamiento cuando se desmonta el componente
      document.body.style.overflow = 'auto';
    };
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { nombre: '', dni: '' };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
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

  const handleClose = () => {
    setAnimationClass("modalOut");
  };

  const handleAnimationEnd = () => {
    if (animationClass === "modalOut") {
      onClose();
      // Restaurar desplazamiento cuando se cierra el modal
      document.body.style.overflow = 'auto';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      apiCall<void>({
        setError: setServerError,
        onSuccess: handleClose,
        serverCall: onSave(formData),
        setLoading: null,
        errorMessage: 'Ocurrió un error al guardar el empleado. Intente nuevamente.'
      })
    }
  };

  // Usar createPortal para renderizar el modal directamente en el body
  return createPortal(
    <div className="modal-overlay">
      {/* Overlay de fondo - cubrir toda la pantalla */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
        style={{ opacity: animationClass === "modalOut" ? 0 : 1, transition: "opacity 0.3s" }}
      ></div>

      {/* Contenedor centrado del modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl ${animationClass}`}
          onClick={(e) => e.stopPropagation()}
          onAnimationEnd={handleAnimationEnd}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isLoading}
              />
              {validationErrors.nombre && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.nombre}</p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${validationErrors.dni ? 'border-red-500' : 'border-gray-300'
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
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 transition-colors hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Guardando...
                  </span>
                ) : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body // Renderiza el modal directamente en el body para evitar problemas de posicionamiento
  );
};

export default EmployeeModal;