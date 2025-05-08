import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Variety from '../model/Variety';

interface VarietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variety: Variety) => void;
  variety: Variety | null;
  isLoading?: boolean;
}

const VarietyModal = ({
  isOpen,
  onClose,
  onSave,
  variety,
  isLoading = false
}: VarietyModalProps) => {
  const [formData, setFormData] = useState<Variety>({
    id: 0,
    name: ''
  });
  const [errors, setErrors] = useState<{name?: string}>({});

  // Inicializar el formulario con los datos de la variedad cuando se está editando
  useEffect(() => {
    if (variety) {
      setFormData({
        id: variety.id,
        name: variety.name
      });
    } else {
      setFormData({
        id: 0,
        name: ''
      });
    }
    // Limpiar errores
    setErrors({});
  }, [variety, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {name?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
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
          {variety ? 'Editar Variedad' : 'Nueva Variedad'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Variedad
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              placeholder="Ej: Malbec, Cabernet Sauvignon, etc."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
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

export default VarietyModal;