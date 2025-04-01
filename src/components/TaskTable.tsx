import React from 'react';
import { Plus, Edit, Trash2, ClipboardList, X, PenTool as Tool, Users } from 'lucide-react';
import TableShimmer from './TableShimmer';

interface Task {
  id: number;
  name: string;
  type: 'manual' | 'mecanica';
}

const TaskTable = () => {
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, name: 'Poda de formación', type: 'manual' },
    { id: 2, name: 'Riego por goteo', type: 'mecanica' },
    { id: 3, name: 'Cosecha manual', type: 'manual' }
  ]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSaveTask = (task: Omit<Task, 'id'>) => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...task, id: t.id } : t));
    } else {
      const newTask = {
        ...task,
        id: Math.max(0, ...tasks.map(t => t.id)) + 1
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    return type === 'manual' ? (
      <Users className="h-5 w-5 text-indigo-500" />
    ) : (
      <Tool className="h-5 w-5 text-orange-500" />
    );
  };

  const getTypeLabel = (type: Task['type']) => {
    return type === 'manual' ? (
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Tareas</h2>
        <button 
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Tarea
        </button>
      </div>

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
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
                      {task.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(task.type)}
                      {getTypeLabel(task.type)}
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
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
}

const TaskModal = ({ isOpen, onClose, onSave, task }: TaskModalProps) => {
  const [formData, setFormData] = React.useState<Omit<Task, 'id'>>({
    name: task?.name || '',
    type: task?.type || 'manual'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Tarea
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'manual' })}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'manual'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                Manual
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'mecanica' })}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'mecanica'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
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
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskTable;