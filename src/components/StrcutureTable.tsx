import { ArrowLeft, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Title from "../common/Title";
import Toast from "./Toast";
import Table from "../common/Table";
import Workday from "../model/Workday";
import ToastProps, { errorToast, successToast } from "../model/ToastProps";
import { workdayService } from "../services/WorkdayService";
import { useFarm } from "../context/FarmContext";
import StructureWorkdayModal from "./StructureWorkdayModal";
import Task from "../model/Task";
import { Employee } from "../model/Employee";
import { employeeService } from "../services/employeeService";
import { taskService } from "../services/TaskService";
import { useNavigate } from "react-router-dom";

const StructureTable = () => {
    const navigate = useNavigate();
    const { activeFarm } = useFarm();
    const [workdays, setWorkdays] = useState<Workday[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedWorkday, setSelectedWorkday] = useState<Workday | null>(null);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFarm])

    const loadData = async () => {
        try {
            await Promise.all([
                fetchEmployees(),
                fetchTasks()
            ]);
            await fetchWorkdays();
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWorkdays = async () => {
        try {
            const response = await workdayService.getStructureByYear(activeFarm?.id ?? 0);
            setWorkdays(response);
        } catch {
            setError('No se pudieron cargar los jornales de este cuartel');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await employeeService.getAll(activeFarm?.id ?? 0);
            setEmployees(response);
        } catch {
            setError('No se pudieron cargar los empleados');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await taskService.getAll();
            setTasks(response);
        } catch {
            setError('No se pudieron cargar los empleados');
        } finally {
            setIsLoading(false);
        }
    };

    const onAddWorkday = () => {
        setSelectedWorkday(null);
        setIsModalOpen(true);
    }

    const handleBack = () => {
        navigate('/quarters');
    }

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

    const tableBody = (w: Workday) => {
        return [
            <div>{w.fecha}</div>,
            <div className="text-center">{w.empleadoNombre}</div>,
            <div className="justify-center text-center">{w.tareaNombre}</div>,
            <div className="justify-center text-center">
                <span className="inline-flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {w.jornales.toFixed(2)}
                </span>
                </div>,
            <div className="flex space-x-2 justify-end">
                <button
                    onClick={() => handleEditWorkday(w)}
                    className="edit-button"
                    title="Editar jornal">
                    <Edit className="h-5 w-5" />
                </button>
                <button
                    onClick={() => handleDeleteWorkday(w.id!)}
                    className="delete-button"
                    title="Eliminar jornal">
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        ];
    }

    const emptyMessage = () => {
        return (<div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay jornales registrados</p>
            <p className="text-gray-400 text-sm">
                Haga clic en "Nuevo Jornal" para comenzar
            </p>
        </div>)
    }

    const handleSaveWorkday = async (workdayData: Workday) => {
        try {
            let response: Workday;
            if (workdayData.id) {
                response = await workdayService.update(workdayData);
                setWorkdays(workdays.map(w =>
                    w.id === workdayData.id ? response : w
                ));
                setToast(successToast('Jornal actualizado correctamente'));
            } else {
                response = await workdayService.create(workdayData);
                setWorkdays([...workdays, response]);
                setToast(successToast('Jornal registrado correctamente'));
            }
            setIsModalOpen(false);
            setSelectedWorkday(null);
        } catch {
            setToast(errorToast('Error al guardar el jornal'));
        }

    }

    if (isLoading) {
        return <Loading handleBack={handleBack} />
    }

    if (error) {
        return <ErrorMessage error={error} handleBack={handleBack} />
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

            <StructureTableTitle handleBack={handleBack} onAddWorkday={onAddWorkday} />

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table
                    header={["Fecha", "Empleado", "Tarea", "Jornales","Acciones"]}
                    emptyMessage={emptyMessage}
                    data={workdays}
                    content={tableBody} />
            </div>
            {isModalOpen && (
                <StructureWorkdayModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedWorkday(null);
                    }}
                    onSave={handleSaveWorkday}
                    employees={employees}
                    tasks={tasks}
                    workday={selectedWorkday}
                />
            )}
        </div>
    );

}

const StructureTableTitle = ({ handleBack, onAddWorkday }: { handleBack: () => void, onAddWorkday: () => void }) => {
    return (<div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800"
            >
                <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
                <Title title="Estructura general" />
                {/* {quarter.superficieTotal && (
                            <p className="text-sm text-gray-500">
                                Superficie: {quarter.superficieTotal} hectáreas
                            </p>
                        )} */}
            </div>
        </div>
        <button
            onClick={() => onAddWorkday()}
            className="toolbar-button"
        >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Jornal
        </button>
    </div>)
}

const Loading = ({ handleBack }: { handleBack: () => void }) => {
    return (
        <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <Title title='Cargando...' />
            </div>
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );
}

const ErrorMessage = ({ error, handleBack }: { error: string, handleBack: () => void }) => {
    return (
        <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <Title title='Error' />
            </div>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        </div>
    );
}
export default StructureTable;