// src/components/QuarterWorkdays.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, UserCheck, Edit, Trash2 } from 'lucide-react';
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

interface Variedad {
  id: number;
  name: string;
}

interface Workday {
  id?: number;
  date: string;
  jornales: number;
  employeeId: number;
  employeeName: string;
  taskId: number;
  taskName: string;
  variedadId?: number;
  variedadName?: string;
}

interface Quarter {
  id: number;
  name: string;
  superficie?: number;
  variedades?: Variedad[];
}

const mapApiWorkday = (apiWorkday: any): Workday => {
  // Imprimir la fecha exacta que viene del backend para depuración
  console.log('Fecha original del backend:', apiWorkday.fecha);

  // Obtener solo la parte de la fecha (YYYY-MM-DD) sin manipular la zona horaria
  let fechaFormateada = apiWorkday.fecha ? apiWorkday.fecha.split('T')[0] : '';
  console.log('Fecha formateada para el frontend:', fechaFormateada);

  // Construir el objeto workday
  const workday: Workday = {
    id: apiWorkday.id,
    date: fechaFormateada,
    jornales: apiWorkday.jornales || 0,
    employeeId: apiWorkday.empleadoId || 0,
    employeeName: apiWorkday.empleadoNombre || '',
    taskId: apiWorkday.tareaId || 0,
    taskName: apiWorkday.tareaNombre || ''
  };

  // Añadir campos opcionales
  if (apiWorkday.variedadId) {
    workday.variedadId = apiWorkday.variedadId;
  }

  if (apiWorkday.variedadNombre) {
    workday.variedadName = apiWorkday.variedadNombre;
  }

  return workday;
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
  const [varieties, setVarieties] = useState<Variedad[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Cargar datos del cuartel
  useEffect(() => {
    const fetchQuarter = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/cuarteles/${id}`);

        // Transformar respuesta de la API al formato local
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
        // También guardamos las variedades para usarlas después
        if (response.data.variedades) {
          setVarieties(response.data.variedades.map((v: any) => ({
            id: v.id,
            name: v.nombre
          })));
        }
      } catch (err) {
        console.error('Error al cargar el cuartel:', err);
        setError('No se pudo cargar la información del cuartel');
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
          description: '',
          category: t.tipo
        })));
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
      const [year, month, day] = workdayData.date.split('-').map(Number);
      // Crear fecha UTC a las 12:00 para evitar problemas de cambio de día
      const fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const fechaISO = fechaUTC.toISOString();

      // Preparar datos para la API en el formato correcto
      const apiData = {
        id: workdayData.id,
        fecha: fechaISO,
        jornales: workdayData.jornales,
        empleadoId: workdayData.employeeId,
        tareaId: workdayData.taskId,
        variedadId: workdayData.variedadId || null
      };

      console.log('Enviando fecha al servidor:', workdayData.date, '->', fechaISO);

      let response;

      if (workdayData.id) {
        response = await axios.put(`/api/jornales/${workdayData.id}`, apiData);

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
      console.error('Error al guardar el jornal:', err);

      let errorMessage = 'Error al guardar el jornal';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      setToast({
        type: 'error',
        message: errorMessage
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
                      const fechaParte = workday.date.includes('T')
                        ? workday.date.split('T')[0]
                        : workday.date;

                      // Dividir la fecha en componentes
                      const [anio, mes, dia] = fechaParte.split('-');

                      // Formatear como DD/MM/YYYY
                      return `${dia}/${mes}/${anio}`;
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      {workday.employeeName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {workday.taskName}
                  </td>
                  {quarter.variedades && quarter.variedades.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workday.variedadName || '-'}
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
          quarterId={quarter.id}
          quarterName={quarter.name}
          varieties={quarter.variedades}
        />
      )}
    </div>
  );
};

export default QuarterWorkdays;