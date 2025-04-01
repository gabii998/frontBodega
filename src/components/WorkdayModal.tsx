import React from 'react';
import { X, Search } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  dni: string;
}

interface Task {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Workday {
  id?: number;
  date: string;
  hours: number;
  employeeId: number;
  employeeName: string;
  taskId: number;
  taskName: string;
  description: string;
}

interface WorkdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workday: Workday) => void;
  employees: Employee[];
  tasks: Task[];
}

const WorkdayModal = ({ isOpen, onClose, onSave, employees, tasks }: WorkdayModalProps) => {
  const [formData, setFormData] = React.useState<Workday>({
    date: new Date().toISOString().split('T')[0],
    hours: 8,
    employeeId: 0,
    employeeName: '',
    taskId: 0,
    taskName: '',
    description: ''
  });

  const [taskSearch, setTaskSearch] = React.useState('');
  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
    task.description.toLowerCase().includes(taskSearch.toLowerCase())
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
        
        <h2 className="text-xl font-semibold mb-4">Registrar Jornal</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jornales trabajados
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => {
                const select = e.target;
                setFormData({
                  ...formData,
                  employeeId: Number(select.value),
                  employeeName: select.options[select.selectedIndex].text
                });
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione un empleado</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarea
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Buscar tarea..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-2 max-h-40 overflow-y-auto">
              {filteredTasks.map(task => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      taskId: task.id,
                      taskName: task.name,
                      description: task.description
                    });
                    setTaskSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg ${
                    formData.taskId === task.id ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <div className="font-medium">{task.name}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </button>
              ))}
            </div>
          </div>

          {formData.taskId > 0 && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Tarea seleccionada:</div>
              <div className="text-gray-600">{formData.taskName}</div>
              <div className="text-sm text-gray-500">{formData.description}</div>
            </div>
          )}
          
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
              disabled={!formData.taskId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkdayModal;