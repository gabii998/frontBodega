import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Map } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import QuarterModal from './QuarterModal';
import Quarter from '../model/Quarter';
import Variety from '../model/Variety';
import Employee from '../model/Employee';
import ToastProps from '../model/ToastProps';
import { useFarm } from '../context/FarmContext';

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

  // Función para cargar cuarteles desde la API
  const fetchQuarters = async () => {
    if (!activeFarm) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Quarter[]>(`/api/cuarteles?fincaId=${activeFarm.id}`);
      setQuarters(response.data);
    } catch (err) {
      console.error('Error al cargar cuarteles:', err);
      setError('No se pudieron cargar los cuarteles. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchQuarters();
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFarm]);


  const handleQuarterClick = (quarterId: number | undefined) => {
    if (quarterId) {
      navigate(`/quarters/${quarterId}/workdays`);
    }
  };

  // Cargar variedades y empleados
  const fetchOptions = async () => {
    try {
      // Cargar variedades
      const varietiesResponse = await axios.get<{ id: number, nombre: string }[]>('/api/variedades');
      const mappedVarieties = varietiesResponse.data.map(v => ({
        id: v.id,
        name: v.nombre
      }));
      setAvailableVarieties(mappedVarieties);

      // Cargar empleados
      const employeesResponse = await axios.get<{ id: number, nombre: string, dni: string }[]>('/api/empleados');
      const mappedEmployees = employeesResponse.data.map(e => ({
        id: e.id,
        nombre: e.nombre,
        dni: e.dni
      }));
      setAvailableEmployees(mappedEmployees);
    } catch (err) {
      console.error('Error al cargar opciones:', err);
      setToast({
        type: 'error',
        message: 'Error al cargar variedades o empleados'
      });
    }
  };

  // Función para guardar un cuartel (crear o actualizar)
  const handleSaveQuarter = async (quarter: Quarter) => {
    console.log('Quarter recibido:', quarter);
    
    setIsLoading(true);
    try {
      // Asegurarse de que todos los campos tengan valores predeterminados
      const safeQuarter = {
        ...quarter,
        nombre: quarter.nombre || '',
        sistema: quarter.sistema || 'parral',
        managerId: quarter.managerId || 0,
        variedades: quarter.variedades || []
      };
      
      // Transformar el quarter del formato del frontend al formato de la API
      const apiQuarterData = {
        id: safeQuarter.id,
        nombre: safeQuarter.nombre,
        sistema: safeQuarter.sistema.charAt(0).toUpperCase() + safeQuarter.sistema.slice(1),
        encargadoId: safeQuarter.managerId,
        fincaId: activeFarm?.id || 1, // Usar 1 como valor predeterminado si no está definido
        variedades: safeQuarter.variedades.map(v => ({
          variedadId: v.id,
          superficie: v.superficie
        }))
      };
      
      console.log('Datos a enviar a la API:', apiQuarterData);
      
      let response;
      if (quarter.id) {
        // Actualizar cuartel existente
        response = await axios.put(`/api/cuarteles/${quarter.id}`, apiQuarterData);
      } else {
        // Crear nuevo cuartel
        response = await axios.post('/api/cuarteles', apiQuarterData);
      }
      
      // Transformar la respuesta del formato API al formato frontend
      const savedQuarter: Quarter = response.data;
      
      // Actualizar la lista de cuarteles
      if (quarter.id) {
        setQuarters(quarters.map(q => q.id === quarter.id ? savedQuarter : q));
      } else {
        setQuarters([...quarters, savedQuarter]);
      }
      
      // Cerrar el modal
      setIsModalOpen(false);
      setSelectedQuarter(null);
      
      // Mostrar notificación de éxito
      setToast({
        type: 'success',
        message: quarter.id ? 'Cuartel actualizado correctamente' : 'Cuartel creado correctamente'
      });
      
    } catch (err) {
      if(axios.isAxiosError(err)) {
        // Mostrar notificación de error
      setToast({
        type: 'error',
        message: `Error al ${quarter.id ? 'actualizar' : 'crear'} el cuartel: ${err.response?.data?.message || err.message}`
      });
      } else if (err instanceof Error) {
        setToast({
          type: 'error',
          message: err.message
        });
      } else {
        setToast({
          type: 'error',
          message: `Ha ocurrido un error`
        });
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar un cuartel
  const handleDeleteQuarter = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este cuartel?')) {
      setIsLoading(true);
      try {
        await axios.delete(`/api/cuarteles/${id}`);
        
        // Eliminar el cuartel del estado
        setQuarters(quarters.filter(q => q.id !== id));
        
        setToast({
          type: 'success',
          message: 'Cuartel eliminado correctamente'
        });
      } catch (err) {
        console.error('Error al eliminar cuartel:', err);
        setToast({
          type: 'error',
          message: 'Error al eliminar el cuartel'
        });
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