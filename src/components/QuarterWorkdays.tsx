import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, UserCheck, Edit, Trash2 } from 'lucide-react';
import WorkdayModal from './WorkdayModal';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from './Toast';
import Workday from '../model/Workday';
import { Quarter } from '../model/Quarter';
import { Employee } from '../model/Employee';
import Task from '../model/Task';
import { quarterService } from '../services/QuarterService';
import { employeeService } from '../services/employeeService';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import { taskService } from '../services/TaskService';
import { workdayService } from '../services/WorkdayService';
import Title from '../common/Title';

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
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuarter = async () => {
    try {
      setIsLoading(true);
      const response = await quarterService.get(id ?? '');
      setQuarter(response);
    } catch {
      setError('No se pudo cargar la información del cuartel');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response);
    } catch {
      setToast(errorToast('Error al obtener los empleados.'));
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskService.getAll();
      setTasks(response);
    } catch {
      setToast(errorToast('Error al cargar tareas.'));
    }
  };

  const fetchWorkdays = async () => {
    try {
      const response = await workdayService.getByQuarter(id ?? '');
      setWorkdays(response);
    } catch {
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
        await workdayService.delete(workdayId);
        setWorkdays(workdays.filter(w => w.id !== workdayId));
        setToast(successToast('Jornal eliminado correctamente'));
      } catch {
        setToast(errorToast('Error al eliminar el jornal'));
      }
    }
  };

  const handleSaveWorkday = async (workdayData: Workday) => {
    try {
      let response: Workday;
      if (workdayData.id) {
        response = await workdayService.update(workdayData);
        setWorkdays(workdays.map(w =>
          w.id === workdayData.id ? mapApiWorkday(response) : w
        ));
        setToast(successToast('Jornal actualizado correctamente'));
      } else {
        response = await workdayService.create(workdayData);
        setWorkdays([...workdays, mapApiWorkday(response)]);
        setToast(successToast('Jornal registrado correctamente'));
      }
      setIsModalOpen(false);
      setSelectedWorkday(null);
    } catch {
      setToast(errorToast('Error al guardar el jornal'));
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
          <Title title='Cargando...'/>
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
          <Title title='Error'/>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'No se pudo encontrar el cuartel solicitado'}
        </div>
      </div>
    );
  }

  const getTitle = () => {
    return `Jornales - ${quarter.nombre}`
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
            <Title title={getTitle()}/>
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
          className="toolbar-button"
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
                      const fechaParte = workday.fecha.includes('T')
                        ? workday.fecha.split('T')[0]
                        : workday.fecha;
                      const [anio, mes, dia] = fechaParte.split('-');
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
                      {workday.jornales.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditWorkday(workday)}
                        className="edit-button"
                        title="Editar jornal"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkday(workday.id!)}
                        className="delete-button"
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
          quarterId={quarter.id ?? 0}
          quarterName={quarter.nombre}
          varieties={quarter.variedades ?? []}
        />
      )}
    </div>
  );
};

export default QuarterWorkdays;