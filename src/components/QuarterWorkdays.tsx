// src/components/QuarterWorkdays.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, UserCheck, Check } from 'lucide-react';
import WorkdayModal from './WorkdayModal';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from './Toast';

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

interface VariedadOption {
  id: number;
  name: string;
}

interface Workday {
  id: number;
  date: string;
  hours: number;
  employeeId: number;
  employeeName: string;
  taskId: number;
  taskName: string;
  variedadId?: number;
  variedadName?: string;
  description?: string;
}

interface Quarter {
  id: number;
  name: string;
  superficie?: number;
  variedades?: VariedadOption[];
}

const QuarterWorkdays = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workdays, setWorkdays] = useState<Workday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // Cargar datos del cuartel
  useEffect(() => {
    const fetchQuarter = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/cuarteles/${id}`);
        
        // Transformar respuesta de la API al formato que necesitamos
        const quarterData: Quarter = {
          id: response.data.id,
          name: response.data.nombre,
          superficie: response.data.superficieTotal,
          variedades: (response.data.variedades || []).map((v: any) => ({
            id: v.id,
            name: v.nombre
          }))
        };
        
        setQuarter(quarterData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al cargar el cuartel:', err);
        setError('No se pudo cargar la información del cuartel');
        setIsLoading(false);
      }
    };

    // Cargar empleados
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/empleados');
        setEmployees(response.data.map((e: any) => ({
          id: e.id,
          name: e.nombre,
          dni: e.dni
        })));
      } catch (err) {
        console.error('Error al cargar empleados:', err);
      }
    };

    // Cargar tareas
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tareas');
        setTasks(response.data.map((t: any) => ({
          id: t.id,
          name: t.nombre,
          description: t.descripcion || '',
          category: t.tipo
        })));
      } catch (err) {
        console.error('Error al cargar tareas:', err);
      }
    };

    // Cargar jornales del cuartel
    const fetchWorkdays = async () => {
      try {
        // En una implementación real, cargaríamos los jornales desde la API
        // const response = await axios.get(`/api/jornales?cuartelId=${id}`);
        // setWorkdays(response.data.map((j: any) => ({
        //   id: j.id,
        //   date: j.fecha.substring(0, 10), // Formato YYYY-MM-DD
        //   hours: j.jornales * 8, // Convertir jornales a horas
        //   employeeId: j.empleadoId,
        //   employeeName: j.empleadoNombre,
        //   taskId: j.tareaId,
        //   taskName: j.tareaNombre,
        //   variedadId: j.variedadId,
        //   variedadName: j.variedadNombre,
        //   description: j.descripcion || ''
        // })));
        
        // Por ahora, usamos datos de ejemplo
        setWorkdays([
          // Datos de ejemplo para mostrar la tabla con datos
          {
            id: 1,
            date: '2025-05-05',
            hours: 8,
            employeeId: 1,
            employeeName: 'Juan Pérez',
            taskId: 1,
            taskName: 'Poda de formación',
            description: 'Poda inicial para dar forma a la planta'
          },
          {
            id: 2,
            date: '2025-05-06',
            hours: 6,
            employeeId: 2,
            employeeName: 'María García',
            taskId: 3,
            taskName: 'Cosecha manual',
            description: 'Recolección manual de uvas'
          }
        ]);
      } catch (err) {
        console.error('Error al cargar jornales:', err);
      }
    };

    if (id) {
      fetchQuarter();
      fetchEmployees();
      fetchTasks();
      fetchWorkdays();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/quarters');
  };

  const handleSaveWorkday = async (workdayData: Workday) => {
    try {
      // En una implementación real, enviaríamos los datos al backend
      // const response = await axios.post('/api/jornales', {
      //   fecha: workdayData.date,
      //   jornales: workdayData.hours / 8, // Convertir horas a jornales
      //   empleadoId: workdayData.employeeId,
      //   tareaId: workdayData.taskId,
      //   cuartelId: id,
      //   variedadId: workdayData.variedadId
      // });
      
      // Para este ejemplo, simulamos una respuesta exitosa
      const newWorkday = {
        ...workdayData,
        id: Math.max(0, ...workdays.map(w => w.id), 0) + 1
      };
      
      setWorkdays([...workdays, newWorkday]);
      setToast({
        type: 'success',
        message: 'Jornal registrado correctamente'
      });
    } catch (err) {
      console.error('Error al guardar el jornal:', err);
      setToast({
        type: 'error',
        message: 'Error al registrar el jornal'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Cargando...
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !quarter) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Error
          </h2>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'No se pudo encontrar el cuartel solicitado'}
        </div>
      </div>
    );
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
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Jornales - {quarter.name}
            </h2>
            {quarter.superficie && (
              <p className="text-sm text-gray-500">
                Superficie: {quarter.superficie} hectáreas
              </p>
            )}
          </div>
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
                {quarter.variedades && quarter.variedades.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variedad
                  </th>
                )}
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
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      {workday.employeeName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{workday.taskName}</div>
                      {workday.description && (
                        <div className="text-sm text-gray-500">{workday.description}</div>
                      )}
                    </div>
                  </td>
                  {quarter.variedades && quarter.variedades.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workday.variedadName || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {workday.hours} ({(workday.hours / 8).toFixed(1)})
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

      {/* Modal para añadir jornales */}
      {quarter && (
        <WorkdayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveWorkday}
          employees={employees}
          tasks={tasks}
          quarterId={quarter.id}
          quarterName={quarter.name}
          variedades={quarter.variedades}
        />
      )}
    </div>
  );
};

export default QuarterWorkdays;