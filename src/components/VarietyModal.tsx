import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Variety, { createVariety } from '../model/Variety';
import { createPortal } from 'react-dom';

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
  const [formData, setFormData] = useState<Variety>(createVariety);
  const [errors, setErrors] = useState<{name?: string}>({});
  const [animationClass, setAnimationClass] = useState("modalIn");

  useEffect(() => {
    if (isOpen) {
      if (variety) {
        setFormData(variety);
      } else {
        setFormData(createVariety);
      }
      setErrors({});
      setAnimationClass("modalIn");
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Restaurar desplazamiento cuando se desmonta el componente
      document.body.style.overflow = 'auto';
    };
  }, [variety, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {name?: string} = {};
    
    if (!formData.nombre.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      {/* Overlay de fondo - cubrir toda la pantalla */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
        onClick={handleClose}
        style={{ opacity: animationClass === "modalOut" ? 0 : 1, transition: "opacity 0.3s" }}
      ></div>
      
      {/* Contenedor del modal */}
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
            {variety ? 'Editar Variedad' : 'Nueva Variedad'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Variedad
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
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

export default VarietyModal;