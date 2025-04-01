import React from 'react';
import { ArrowLeft, Plus, Clock } from 'lucide-react';
import WorkdayModal from './WorkdayModal';

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
  id: number;
  date: string;
  hours: number;
  employeeId: number;
  employeeName: string;
  taskId: number;
  taskName: string;
  description: string;
}

interface Quarter {
  id: number;
  name: string;
}

interface QuarterWorkdaysProps {
  quarter: Quarter;
  onBack: () => void;
}

const QuarterWorkdays = ({ quarter, onBack }: QuarterWorkdaysProps) => {
  const [workdays, setWorkdays] = React.useState<Workday[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Simulamos una lista de empleados (en producción vendría de la base de datos)
  const employees: Employee[] = [
    { id: 1, name: 'Juan Pérez', dni: '12345678' },
    { id: 2, name: 'María García', dni: '87654321' },
    { id: 3, name: 'Carlos López', dni: '45678912' },
  ];

  // Simulamos una lista de tareas (en producción vendría de la base de datos)
  const tasks: Task[] = [
    { 
      id: 1, 
      name: 'Poda de formación',
      description: 'Poda inicial para dar forma a la planta',
      category: 'poda'
    },
    { 
      id: 2, 
      name: 'Riego por goteo',
      description: 'Mantenimiento del sistema de riego',
      category: 'riego'
    },
    { 
      id: 3, 
      name: 'Cosecha manual',
      description: 'Recolección manual de uvas',
      category: 'cosecha'
    }
  ];

  const handleSaveWorkday = (workdayData: Workday) => {
    const newWorkday = {
      ...workdayData,
      id: Math.max(0, ...workdays.map(w => w.id)) + 1
    };
    setWorkdays([...workdays, newWorkday]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Jornales - {quarter.name}
          </h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Jornal
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {workdays.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarea
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jornales
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workdays.map((workday) => (
                <tr key={workday.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(workday.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {workday.employeeName}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{workday.taskName}</div>
                      <div className="text-sm text-gray-500">{workday.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {workday.hours}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay jornales registrados</p>
            <p className="text-gray-400 text-sm">
              Haga clic en "Nuevo Jornal" para comenzar
            </p>
          </div>
        )}
      </div>

      <WorkdayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkday}
        employees={employees}
        tasks={tasks}
      />
    </div>
  );
};

export default QuarterWorkdays;