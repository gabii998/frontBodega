import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ClipboardList, PenTool as Tool, Users } from 'lucide-react';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import Task from '../model/Task';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import TaskModal from './TaskModal';
import { taskService } from '../services/TaskService';
import Table from '../common/Table';
import Title from '../common/Title';
import ErrorBanner from '../common/ErrorBanner';

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

  const tableContentBody = (task: Task) => {
    return [
      <div className="flex items-center">
        <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
        {task.nombre}
      </div>,
      <div className="flex items-center space-x-2">
        {getTypeIcon(task.tipo)}
        {getTypeLabel(task.tipo)}
      </div>,
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setSelectedTask(task);
            setIsModalOpen(true);
          }}
          className="edit-button"
          disabled={isLoading}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDeleteTask(task.id)}
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

      <div className="flex justify-between items-center mb-6">
        <Title title='Tareas'/>
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="toolbar-button"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Tarea
        </button>
      </div>

      {error && (
        <ErrorBanner error={error} retry={fetchTasks} />
      )}

      {isLoading ? (
        <TableShimmer columns={[50, 20, 30]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            header={["Nombre", "Tipo", "Acciones"]}
            emptyMessage='No hay tareas registradas'
            data={tasks}
            content={tableContentBody}
          />
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