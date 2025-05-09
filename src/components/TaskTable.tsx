import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ClipboardList, X, PenTool as Tool, Users } from 'lucide-react';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import axios from 'axios';
import Task from '../model/Task';
import ToastProps from '../model/ToastProps';
import { createPortal } from 'react-dom';

const TaskTable = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Cargar tareas desde el backend
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Task[]>('/api/tareas');
      setTasks(response.data);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError('No se pudieron cargar las tareas. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (task: Omit<Task, 'id'>) => {
    setIsLoading(true);
    try {
      // Transformar los datos para enviar al backend
      const apiData = {
        nombre: task.nombre,
        tipo: task.tipo
      };

      if (selectedTask) {
        // Actualizar tarea existente
        const response = await axios.put<Task>(`/api/tareas/${selectedTask.id}`, apiData);
        
        // Actualizar el estado con la respuesta
        const updatedTask = {
          id: response.data.id,
          nombre: response.data.nombre,
          tipo: response.data.tipo
        };
        
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
        
        setToast({
          type: 'success',
          message: 'Tarea actualizada correctamente'
        });
      } else {
        // Crear nueva tarea
        const response = await axios.post<Task>('/api/tareas', apiData);
        
        // Añadir la nueva tarea al estado
        const newTask = {
          id: response.data.id,
          nombre: response.data.nombre,
          tipo: response.data.tipo
        };
        
        setTasks([...tasks, newTask]);
        
        setToast({
          type: 'success',
          message: 'Tarea creada correctamente'
        });
      }
      
      setIsModalOpen(false);
      setSelectedTask(null);
      
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      setToast({
        type: 'error',
        message: 'Error al guardar la tarea'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      setIsLoading(true);
      try {
        await axios.delete(`/api/tareas/${id}`);
        
        // Eliminar la tarea del estado
        setTasks(tasks.filter(t => t.id !== id));
        
        setToast({
          type: 'success',
          message: 'Tarea eliminada correctamente'
        });
      } catch (err) {
        console.error('Error al eliminar tarea:', err);
        setToast({
          type: 'error',
          message: 'Error al eliminar la tarea'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getTypeIcon = (type: Task['tipo']) => {
    return type === 'Manual' ? (
      <Users className="h-5 w-5 text-indigo-500" />
    ) : (
      <Tool className="h-5 w-5 text-orange-500" />
    );
  };

  const getTypeLabel = (type: Task['tipo']) => {
    return type === 'Manual' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Manual
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Mecánica
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Tareas</h2>
        <button 
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Tarea
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchTasks}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading ? (
        <TableShimmer columns={[50, 20, 30]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No hay tareas registradas
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
                        {task.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(task.tipo)}
                        {getTypeLabel(task.tipo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            setSelectedTask(task);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
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

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          task={selectedTask || undefined}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  task?: Task;
  isLoading?: boolean;
}

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

export default TaskTable;