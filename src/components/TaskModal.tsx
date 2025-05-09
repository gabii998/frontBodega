import { useEffect, useState } from "react";
import Task from "../model/Task";
import TaskModalProps from "../model/TaskModalProps";
import { createPortal } from "react-dom";
import { Users, X ,PenTool as Tool } from "lucide-react";

const TaskModal = ({ isOpen, onClose, onSave, task, isLoading = false }: TaskModalProps) => {
    const [formData, setFormData] = useState<Omit<Task, 'id'>>({
      nombre: '',
      tipo: 'Manual'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
  
    useEffect(() => {
      if (task) {
        setFormData({
          nombre: task.nombre,
          tipo: task.tipo
        });
      } else {
        setFormData({
          nombre: '',
          tipo: 'Manual'
        });
      }
      setErrors({});
    }, [task, isOpen]);
  
    if (!isOpen) return null;
  
    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.nombre.trim()) {
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
  
    return createPortal(<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
          {task ? 'Editar Tarea' : 'Nueva Tarea'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
  
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Tarea
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'Manual' })}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  formData.tipo === 'Manual'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
                disabled={isLoading}
              >
                <Users className="h-5 w-5 mr-2" />
                Manual
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'Mercanica' })}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  formData.tipo === 'Mercanica'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
                disabled={isLoading}
              >
                <Tool className="h-5 w-5 mr-2" />
                Mecánica
              </button>
            </div>
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
    </div>,document.body);
  };

  export default TaskModal;