import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import EmployeeModalProps from '../model/EmployeeModalProps';
import {createEmployee, Employee} from '../model/Employee';

const EmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  employee,
  isLoading = false
}: EmployeeModalProps) => {
  const [formData, setFormData] = useState<Employee>(createEmployee);
  const [validationErrors, setValidationErrors] = useState(createEmployee);
  const [serverError, setServerError] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState("modalIn");

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setFormData(employee);
      } else {
        setFormData(createEmployee);
      }
      setValidationErrors(createEmployee);
      setServerError(null);
      setAnimationClass("modalIn");
      document.body.style.overflow = 'hidden';
    }

    return () => {
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
      document.body.style.overflow = 'auto';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
        style={{ opacity: animationClass === "modalOut" ? 0 : 1, transition: "opacity 0.3s" }}
      ></div>
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

          <form onSubmit={(e) => handleSubmit(e)}>
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
                className="gray-button transition-colors hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="save-button transition-colors"
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
    document.body
  );
};

export default EmployeeModal;