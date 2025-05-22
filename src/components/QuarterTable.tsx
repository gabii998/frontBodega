import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import QuarterModal from './QuarterModal';
import { Quarter } from '../model/Quarter';
import Variety from '../model/Variety';
import { Employee } from '../model/Employee';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import { useFarm } from '../context/FarmContext';
import { varietyService } from '../services/VarietyService';
import { employeeService } from '../services/employeeService';
import { quarterService } from '../services/QuarterService';
import Table from '../common/Table';
import Title from '../common/Title';
import ErrorBanner from '../common/ErrorBanner';

const QuarterTable = () => {
  const navigate = useNavigate();
  const { activeFarm } = useFarm();
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableVarieties, setAvailableVarieties] = useState<Variety[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    fetchQuarters();
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFarm]);

  const fetchQuarters = async () => {
    if (!activeFarm) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await await quarterService.getAll(activeFarm.id);
      setQuarters(response);
    } catch {
      setError('No se pudieron cargar los cuarteles. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuarterClick = (quarterId: number | undefined) => {
    if (quarterId) {
      navigate(`/quarters/${quarterId}/workdays`);
    }
  };

  const fetchOptions = async () => {
    try {
      const varietiesResponse = await await varietyService.getAll();
      setAvailableVarieties(varietiesResponse);
      const employeesResponse = await employeeService.getAll();
      setAvailableEmployees(employeesResponse);
    } catch {
      errorToast('Error al cargar variedades o empleados');
    }
  };

  const handleSaveQuarter = async (quarter: Quarter) => {
    setIsLoading(true);
    try {
      let response: Quarter;
      if (quarter.id) {
        response = await quarterService.update(quarter);
        setQuarters(quarters.map(q => q.id === quarter.id ? response : q));
      } else {
        response = await quarterService.create(quarter);
        setQuarters([...quarters, response]);
      }
      setIsModalOpen(false);
      setSelectedQuarter(null);
      successToast(quarter.id ? 'Cuartel actualizado correctamente' : 'Cuartel creado correctamente')
    } catch {
      errorToast(`Error al ${quarter.id ? 'actualizar' : 'crear'} el cuartel.`)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuarter = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este cuartel?')) {
      setIsLoading(true);
      try {
        await quarterService.delete(id);
        setQuarters(quarters.filter(q => q.id !== id));
        successToast('Cuartel eliminado correctamente')
      } catch {
        errorToast('Error al eliminar el cuartel');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSystemIcon = (system: Quarter['sistema']) => {
    if (system === 'parral') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Parral</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Espaldero</span>;
    }
  };

  const tableContent = (quarter: Quarter) => {
    return [
      <div className="flex items-center">
        <Map className="h-5 w-5 text-gray-400 mr-2" />
        {quarter.nombre}
      </div>,
      getSystemIcon(quarter.sistema),
      quarter.encargadoNombre,
      `${quarter.superficieTotal} ha`,
      quarter.hileras,
      <div className="flex space-x-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedQuarter(quarter);
            setIsModalOpen(true);
          }}
          className="edit-button"
          disabled={isLoading}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteQuarter(quarter.id ?? -1)
          }}
          className="delete-button"
          disabled={isLoading}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    ];
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

      <div className="content">
        <Title title='Cuarteles'/>
        <button
          onClick={() => {
            setSelectedQuarter(null);
            setIsModalOpen(true);
          }}
          className="toolbar-button"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Cuartel
        </button>
      </div>

      {error && (
        <ErrorBanner error={error} retry={fetchQuarters} />
      )}

      {isLoading ? (
        <TableShimmer columns={[30, 20, 15, 20, 15]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            header={["Nombre", "Sistema", "Encargado", "Superficia (ha)", "Hileras", "Acciones"]}
            emptyMessage='No hay cuarteles registrados'
            data={quarters}
            rowClick={(q) => handleQuarterClick(q.id)}
            content={tableContent} />
        </div>
      )}

      {isModalOpen && (
        <QuarterModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedQuarter(null);
          }}
          onSave={handleSaveQuarter}
          quarter={selectedQuarter || undefined}
          isLoading={isLoading}
          availableVarieties={availableVarieties}
          availableEmployees={availableEmployees}
          activeFarmId={activeFarm?.id ?? -1}
        />
      )}
    </div>
  );
};

export default QuarterTable;