import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ClipboardList, PenTool as Tool, Users } from 'lucide-react';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import Task from '../model/Task';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import TaskModal from './TaskModal';
import { taskService } from '../services/TaskService';

const TaskTable = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await taskService.getAll();
      setTasks(response);
    } catch {
      setError('No se pudieron cargar las tareas. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTask = async (task: Omit<Task, 'id'>) => {
    setIsLoading(true);
    try {
      if (selectedTask) {
        const response = await taskService.update(selectedTask.id, task);
        setTasks(tasks.map(t => t.id === selectedTask.id ? response : t));
        successToast('Tarea actualizada correctamente');
      } else {
        const response = await taskService.create(task);
        setTasks([...tasks, response]);
        successToast('Tarea creada correctamente');
      }
      setIsModalOpen(false);
      setSelectedTask(null);

    } catch {
      errorToast('Error al guardar la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      setIsLoading(true);
      try {
        await taskService.delete(id);
        setTasks(tasks.filter(t => t.id !== id));
        successToast('Tarea eliminada correctamente');
      } catch {
        errorToast('Error al eliminar la tarea');
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

export default TaskTable;