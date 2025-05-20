import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import QuarterModal from './QuarterModal';
import {Quarter} from '../model/Quarter';
import Variety from '../model/Variety';
import {Employee} from '../model/Employee';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import { useFarm } from '../context/FarmContext';
import { varietyService } from '../services/VarietyService';
import { employeeService } from '../services/employeeService';
import { quarterService } from '../services/QuarterService';

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
      let response:Quarter;
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

  // Función para eliminar un cuartel
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

  return (
    <div className="p-6">
      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Cuarteles</h2>
        <button 
          onClick={() => {
            setSelectedQuarter(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Cuartel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchQuarters}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading ? (
        <TableShimmer columns={[30, 20, 15, 20, 15]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sistema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encargado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Superficie (ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hileras
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quarters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay cuarteles registrados
                  </td>
                </tr>
              ) : (
                quarters.map((quarter) => (
                  <tr key={quarter.id} className="hover:bg-gray-50" onClick={() => handleQuarterClick(quarter.id ?? -1)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Map className="h-5 w-5 text-gray-400 mr-2" />
                        {quarter.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSystemIcon(quarter.sistema)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quarter.encargadoNombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quarter.superficieTotal} ha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quarter.hileras}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuarter(quarter);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuarter(quarter.id ?? -1)
                          }}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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