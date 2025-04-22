import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Map, X, PenTool as Tool, Users } from 'lucide-react';
import axios from 'axios';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import QuarterModal from './QuarterModal';

// Interfaces
interface Variety {
  id: number;
  name: string;
}

interface VarietyCuartel {
  id?: number;
  variedadId: number;
  name: string;
  superficie: number;
}

interface Employee {
  id: number;
  name: string;
  dni: string;
}

interface Quarter {
  id?: number;
  name: string;
  varieties: VarietyCuartel[];
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
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableVarieties, setAvailableVarieties] = useState<Variety[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeFarmId, setActiveFarmId] = useState<number>(1); // Valor predeterminado o desde contexto

  // Función para cargar cuarteles desde la API
  const fetchQuarters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<any[]>(`/api/cuarteles?fincaId=${activeFarmId}`);
      
      // Transformar datos de la API al formato del frontend
      const transformedQuarters: Quarter[] = response.data.map(q => ({
        id: q.id,
        name: q.nombre,
        system: q.sistema?.toLowerCase() as 'parral' | 'espaldero',
        managerId: q.encargadoId,
        managerName: q.encargadoNombre || '',
        hectares: q.variedades?.reduce((sum, v) => sum + (v.superficie || 0), 0) || 0,
        varieties: (q.variedades || []).map(v => ({
          variedadId: v.variedadId,
          name: v.variedadNombre || '',
          superficie: v.superficie
        }))
      }));
      
      setQuarters(transformedQuarters);
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
  }, [activeFarmId]);

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
        name: e.nombre,
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
        name: quarter.name || '',
        system: quarter.system || 'parral',
        managerId: quarter.managerId || 0,
        varieties: quarter.varieties || []
      };
      
      // Transformar el quarter del formato del frontend al formato de la API
      const apiQuarterData = {
        id: safeQuarter.id,
        nombre: safeQuarter.name,
        sistema: safeQuarter.system.charAt(0).toUpperCase() + safeQuarter.system.slice(1),
        encargadoId: safeQuarter.managerId,
        fincaId: activeFarmId || 1, // Usar 1 como valor predeterminado si no está definido
        variedades: safeQuarter.varieties.map(v => ({
          variedadId: v.variedadId,
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
      const savedQuarter: Quarter = {
        id: response.data.id,
        name: response.data.nombre,
        system: response.data.sistema?.toLowerCase() as 'parral' | 'espaldero' || 'parral',
        managerId: response.data.encargadoId,
        managerName: response.data.encargadoNombre || getManagerName(response.data.encargadoId),
        hectares: calculateHectares(response.data.variedades),
        varieties: (response.data.variedades || []).map(v => ({
          variedadId: v.variedadId,
          name: v.variedadNombre || getVarietyName(v.variedadId),
          superficie: v.superficie
        }))
      };
      
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
      console.error('Error al guardar cuartel:', err);
      
      // Mostrar notificación de error
      setToast({
        type: 'error',
        message: `Error al ${quarter.id ? 'actualizar' : 'crear'} el cuartel: ${err.response?.data?.message || err.message}`
      });
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

  // Funciones auxiliares
  const calculateHectares = (variedades) => {
    return variedades?.reduce((sum, v) => sum + (v.superficie || 0), 0) || 0;
  };

  const getVarietyName = (variedadId) => {
    const variety = availableVarieties.find(v => v.id === variedadId);
    return variety ? variety.name : `Variedad ${variedadId}`;
  };

  const getManagerName = (managerId) => {
    const manager = availableEmployees.find(e => e.id === managerId);
    return manager ? manager.name : `Encargado ${managerId}`;
  };

  const getSystemIcon = (system: Quarter['system']) => {
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
                  <tr key={quarter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Map className="h-5 w-5 text-gray-400 mr-2" />
                        {quarter.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSystemIcon(quarter.system)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quarter.managerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quarter.hectares} ha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            setSelectedQuarter(quarter);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuarter(quarter.id)}
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
          activeFarmId={activeFarmId}
        />
      )}
    </div>
  );
};

export default QuarterTable;