import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Leaf } from 'lucide-react';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import Variety from '../model/Variety';
import VarietyModal from './VarietyModal';
import { varietyService } from '../services/VarietyService';

const VarietyTable = () => {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    fetchVarieties();
  }, []);

  const fetchVarieties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await varietyService.getAll();
      setVarieties(response);
    } catch {
      setError('No se pudieron cargar las variedades. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVariety = async (varietyData: Variety) => {
    setIsLoading(true);
    try {
      if (selectedVariety?.id) {
        const response = await varietyService.update(selectedVariety.id,varietyData.nombre)
        setVarieties(varieties.map(v => 
          v.id === selectedVariety.id ? response : v
        ));
        successToast('Variedad actualizada correctamente');
      } else {
        // Crear nueva variedad
        const response = await varietyService.create(varietyData.nombre);
        setVarieties([...varieties, response]);
        successToast('Variedad creada correctamente');
      }
      setIsModalOpen(false);
      setSelectedVariety(null);
      
    } catch {
      errorToast('Error al guardar la variedad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariety = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta variedad?')) {
      setIsLoading(true);
      try {
        await varietyService.delete(id);
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
                        <span>{variety.nombre}</span>
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