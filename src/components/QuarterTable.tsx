import React, { useEffect, useState } from 'react';
import { Edit, Trash2, MapPin, Clock } from 'lucide-react';
import QuarterModal from './QuarterModal';
import QuarterWorkdays from './QuarterWorkdays';
import TableShimmer from './TableShimmer';
import axios from 'axios';
import Toast from './Toast';

// Interfaces para los datos de la API

interface ApiCuartelResponse {
  id: number;
  nombre: string;
  sistema: string;
  superficieTotal: number;
  encargadoNombre: string;
  variedades: ApiVariedadInfo[];
}

interface ApiVariedadInfo {
  id: number;
  nombre: string;
  superficie: number;
}

// Interfaces para los datos del frontend
interface GrapeVariety {
  id: number;
  name: string;
}

interface Quarter {
  id: number;
  name: string;
  varieties: GrapeVariety[];
  managerId: number;
  managerName: string;
  hectares: number;
  system: 'parral' | 'espaldero';
}

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

const QuarterTable = () => {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | undefined>();
  const [viewingWorkdays, setViewingWorkdays] = useState<Quarter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Función para transformar los datos de la API al formato del frontend
  const transformApiData = (apiData: ApiCuartelResponse[]): Quarter[] => {
    return apiData.map(cuartel => ({
      id: cuartel.id,
      name: cuartel.nombre,
      varieties: cuartel.variedades.map(v => ({ id: v.id, name: v.nombre })),
      managerId: 0, // Este valor no viene en la API, lo manejamos en el modal
      managerName: cuartel.encargadoNombre,
      hectares: cuartel.superficieTotal,
      system: cuartel.sistema.toLowerCase() as 'parral' | 'espaldero'
    }));
  };

  // Cargar cuarteles desde el backend
  const fetchQuarters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiCuartelResponse[]>('/api/cuarteles');
      setQuarters(transformApiData(response.data));
    } catch (err) {
      console.error('Error al cargar cuarteles:', err);
      setError('No se pudieron cargar los cuarteles. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuarters();
  }, []);

  const handleOpenModal = (quarter?: Quarter) => {
    setSelectedQuarter(quarter);
    setIsModalOpen(true);
  };

  // Guardar (crear o actualizar) un cuartel
  const handleSaveQuarter = async (quarterData: any) => {
    setIsLoading(true);
    try {
      // Transformar los datos para enviar al backend
      const apiData = {
        id: selectedQuarter?.id,
        nombre: quarterData.name,
        sistema: quarterData.system.charAt(0).toUpperCase() + quarterData.system.slice(1), // Parral o Espaldero
        fincaId: 1, // Asumimos que tienes una finca con id 1 o este valor viene de algún sitio
        encargadoId: quarterData.managerId,
        variedades: quarterData.varieties.map((v: any) => ({
          variedadId: v.id,
          superficie: v.superficie || 0 // Asumimos que cada variedad tiene una superficie
        }))
      };

      if (selectedQuarter) {
        // Actualizar cuartel existente
        const response = await axios.put<ApiCuartelResponse>(`/api/cuarteles/${selectedQuarter.id}`, apiData);
        
        // Actualizar el estado con los datos de respuesta
        setQuarters(prev => prev.map(q => 
          q.id === selectedQuarter.id ? transformApiData([response.data])[0] : q
        ));
        
        setToast({
          type: 'success',
          message: 'Cuartel actualizado correctamente'
        });
      } else {
        // Crear nuevo cuartel
        const response = await axios.post<ApiCuartelResponse>('/api/cuarteles', apiData);
        
        // Añadir el nuevo cuartel al estado
        setQuarters(prev => [...prev, transformApiData([response.data])[0]]);
        
        setToast({
          type: 'success',
          message: 'Cuartel creado correctamente'
        });
      }
      
      // Cerrar el modal después de guardar con éxito
      setIsModalOpen(false);
      setSelectedQuarter(undefined);
      
    } catch (err) {
      console.error('Error al guardar cuartel:', err);
      setToast({
        type: 'error',
        message: 'Error al guardar el cuartel'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un cuartel
  const handleDeleteQuarter = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este cuartel?')) {
      setIsLoading(true);
      try {
        await axios.delete(`/api/cuarteles/${id}`);
        
        // Eliminar del estado local
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

  if (viewingWorkdays) {
    return (
      <QuarterWorkdays
        quarter={viewingWorkdays}
        onBack={() => setViewingWorkdays(null)}
      />
    );
  }

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
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <MapPin className="h-5 w-5 mr-2" />
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
        <TableShimmer columns={[20, 15, 15, 20, 15, 15]} rows={3} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Superficie (ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sistema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variedades de Uva
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encargado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quarters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay cuarteles registrados
                  </td>
                </tr>
              ) : (
                quarters.map((quarter) => (
                  <tr key={quarter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{quarter.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{quarter.hectares.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quarter.system === 'parral' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {quarter.system.charAt(0).toUpperCase() + quarter.system.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {quarter.varieties.map((variety) => (
                          <span
                            key={variety.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {variety.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{quarter.managerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => setViewingWorkdays(quarter)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Ver jornales"
                          disabled={isLoading}
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(quarter)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar cuartel"
                          disabled={isLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuarter(quarter.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar cuartel"
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

      <QuarterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuarter(undefined);
        }}
        onSave={handleSaveQuarter}
        quarter={selectedQuarter}
        isLoading={isLoading}
      />
    </div>
  );
};

export default QuarterTable;