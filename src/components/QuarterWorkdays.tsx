// src/components/QuarterWorkdays.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, UserCheck, Edit, Trash2 } from 'lucide-react';
import WorkdayModal from './WorkdayModal';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import Toast from './Toast';
import Workday from '../model/Workday';
import Quarter from '../model/Quarter';
import Employee from '../model/Employee';
import Task from '../model/Task';


const mapApiWorkday = (apiWorkday: Workday): Workday => {
  const fechaFormateada = apiWorkday.fecha ? apiWorkday.fecha.split('T')[0] : '';
  apiWorkday.fecha = fechaFormateada;
  return apiWorkday;
};

const QuarterWorkdays = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workdays, setWorkdays] = useState<Workday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkday, setSelectedWorkday] = useState<Workday | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Cargar datos del cuartel
  useEffect(() => {
    const fetchQuarter = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/cuarteles/${id}`);
        setQuarter(response.data);
        // También guardamos las variedades para usarlas después
      } catch (err) {
        console.error('Error al cargar el cuartel:', err);
        setError('No se pudo cargar la información del cuartel');
      }
    };

    // Cargar empleados
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/empleados');
        setEmployees(response.data);
      } catch (err) {
        console.error('Error al cargar empleados:', err);
      }
    };

    // Cargar tareas
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tareas');
        setTasks(response.data);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
      }
    };

    // Cargar jornales del cuartel
    const fetchWorkdays = async () => {
      try {
        // Filtramos por cuartel ID
        const response = await axios.get(`/api/jornales?cuartelId=${id}`);

        // Mapear la respuesta de la API al formato local
        const mappedWorkdays = response.data.map(mapApiWorkday);
        setWorkdays(mappedWorkdays);
      } catch (err) {
        console.error('Error al cargar jornales:', err);
        setError('No se pudieron cargar los jornales de este cuartel');
      } finally {
        setIsLoading(false);
      }
    };

    const loadData = async () => {
      if (id) {
        try {
          await Promise.all([
            fetchQuarter(),
            fetchEmployees(),
            fetchTasks()
          ]);
          await fetchWorkdays();
        } catch (error) {
          console.error("Error cargando datos:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [id]);

  const handleBack = () => {
    navigate('/quarters');
  };

  const handleEditWorkday = (workday: Workday) => {
    setSelectedWorkday(workday);
    setIsModalOpen(true);
  };

  const handleDeleteWorkday = async (workdayId: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este jornal?')) {
      try {
        await axios.delete(`/api/jornales/${workdayId}`);
        setWorkdays(workdays.filter(w => w.id !== workdayId));
        setToast({
          type: 'success',
          message: 'Jornal eliminado correctamente'
        });
      } catch (err) {
        console.error('Error al eliminar el jornal:', err);
        setToast({
          type: 'error',
          message: 'Error al eliminar el jornal'
        });
      }
    }
  };

  const handleSaveWorkday = async (workdayData: Workday) => {
    try {
      // Asegurarse de que la fecha se maneja correctamente (sin ajustes de zona horaria)
      const [year, month, day] = workdayData.fecha.split('-').map(Number);
      // Crear fecha UTC a las 12:00 para evitar problemas de cambio de día
      const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const fechaISO = fechaUTC.toISOString();

      // Preparar datos para la API en el formato correcto
      const apiData = {
        id: workdayData.id,
        fecha: fechaISO,
        jornales: workdayData.jornales,
        empleadoId: workdayData.empleadoId,
        tareaId: workdayData.tareaId,
        variedadId: workdayData.variedadId || null
      };

      let response: AxiosResponse<Workday>;

      if (workdayData.id) {
        response = await axios.put<Workday>(`/api/jornales/${workdayData.id}`, apiData);

        setWorkdays(workdays.map(w =>
          w.id === workdayData.id ? mapApiWorkday(response.data) : w
        ));

        setToast({
          type: 'success',
          message: 'Jornal actualizado correctamente'
        });
      } else {
        response = await axios.post('/api/jornales', apiData);

        setWorkdays([...workdays, mapApiWorkday(response.data)]);

        setToast({
          type: 'success',
          message: 'Jornal registrado correctamente'
        });
      }

      setIsModalOpen(false);
      setSelectedWorkday(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Error al guardar el jornal:', err);
        let errorMessage = 'Error al guardar el jornal';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        setToast({
          type: 'error',
          message: errorMessage
        });
      } else if(err instanceof Error) {
        setToast({
          type: 'error',
          message: err.message
        });
      } else {
        setToast({
          type: 'error',
          message: JSON.stringify(err)
        });
      
      }

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
              Jornales - {quarter.nombre}
            </h2>
            {quarter.superficieTotal && (
              <p className="text-sm text-gray-500">
                Superficie: {quarter.superficieTotal} hectáreas
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedWorkday(null);
            setIsModalOpen(true);
          }}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workdays.map((workday) => (
                <tr key={workday.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      // Mostrar solo la fecha, evitando cualquier conversión de zona horaria
                      // Dividir por 'T' para obtener solo la parte de fecha si es una fecha ISO
                      const fechaParte = workday.fecha.includes('T')
                        ? workday.fecha.split('T')[0]
                        : workday.fecha;

                      // Dividir la fecha en componentes
                      const [anio, mes, dia] = fechaParte.split('-');

                      // Formatear como DD/MM/YYYY
                      return `${dia}/${mes}/${anio}`;
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      {workday.empleadoNombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {workday.tareaNombre}
                  </td>
                  {quarter.variedades && quarter.variedades.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workday.variedadNombre || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {workday.jornales.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditWorkday(workday)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar jornal"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkday(workday.id!)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar jornal"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
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

      {/* Modal para añadir/editar jornales */}
      {isModalOpen && quarter && (
        <WorkdayModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWorkday(null);
          }}
          onSave={handleSaveWorkday}
          employees={employees}
          tasks={tasks}
          workday={selectedWorkday}
          quarterName={quarter.nombre}
          varieties={quarter.variedades ?? []}
        />
      )}
    </div>
  );
};

export default QuarterWorkdays;