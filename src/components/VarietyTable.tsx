import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Leaf } from 'lucide-react';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import axios from 'axios';
import ToastProps from '../model/ToastProps';
import Variety from '../model/Variety';
import VarietyModal from './VarietyModal';

const VarietyTable = () => {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Cargar variedades desde el backend
  const fetchVarieties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<{id: number, nombre: string}[]>('/api/variedades');
      // Transformar la respuesta a nuestro modelo de frontend
      const mappedVarieties: Variety[] = response.data.map(item => ({
        id: item.id,
        name: item.nombre
      }));
      setVarieties(mappedVarieties);
    } catch (err) {
      console.error('Error al cargar variedades:', err);
      setError('No se pudieron cargar las variedades. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVarieties();
  }, []);

  const handleSaveVariety = async (varietyData: Variety) => {
    setIsLoading(true);
    try {
      if (selectedVariety?.id) {
        // Actualizar variedad existente
        const response = await axios.put<{id: number, nombre: string}>(`/api/variedades/${selectedVariety.id}`, {
          nombre: varietyData.name,
          id: selectedVariety.id
        });
        
        // Transformar la respuesta y actualizar el estado
        const updatedVariety: Variety = {
          id: response.data.id,
          name: response.data.nombre
        };
        
        setVarieties(varieties.map(v => 
          v.id === selectedVariety.id ? updatedVariety : v
        ));
        
        // Mostrar mensaje de éxito para actualización
        setToast({
          type: 'success',
          message: 'Variedad actualizada correctamente'
        });
      } else {
        // Crear nueva variedad
        const response = await axios.post<{id: number, nombre: string}>('/api/variedades', {
          nombre: varietyData.name
        });
        
        // Transformar la respuesta y actualizar el estado
        const newVariety: Variety = {
          id: response.data.id,
          name: response.data.nombre
        };
        
        setVarieties([...varieties, newVariety]);
        
        // Mostrar mensaje de éxito para creación
        setToast({
          type: 'success',
          message: 'Variedad creada correctamente'
        });
      }
      
      // Cerrar el modal si la operación fue exitosa
      setIsModalOpen(false);
      setSelectedVariety(null);
      
    } catch (error) {
      console.error('Error al guardar variedad:', error);
      // Mostrar mensaje de error
      setToast({
        type: 'error',
        message: 'Error al guardar la variedad'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariety = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta variedad?')) {
      setIsLoading(true);
      try {
        await axios.delete(`/api/variedades/${id}`);
        setVarieties(varieties.filter(v => v.id !== id));
        
        // Mostrar mensaje de éxito para eliminación
        setToast({
          type: 'success',
          message: 'Variedad eliminada correctamente'
        });
      } catch (err) {
        console.error('Error al eliminar variedad:', err);
        setToast({
          type: 'error',
          message: 'No se pudo eliminar la variedad. Es posible que esté siendo utilizada en uno o más cuarteles.'
        });
      } finally {
        setIsLoading(false);
      }
    }
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
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Variedades de Uva</h2>
        <button 
          onClick={() => {
            setSelectedVariety(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Variedad
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchVarieties}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading ? (
        <TableShimmer columns={[70, 30]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {varieties.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    No hay variedades registradas
                  </td>
                </tr>
              ) : (
                varieties.map((variety) => (
                  <tr key={variety.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Leaf className="h-5 w-5 text-green-500 mr-2" />
                        <span>{variety.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            setSelectedVariety(variety);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteVariety(variety.id)}
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
        <VarietyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVariety(null);
          }}
          onSave={handleSaveVariety}
          variety={selectedVariety}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default VarietyTable;