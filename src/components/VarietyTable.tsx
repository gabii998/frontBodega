import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Leaf } from 'lucide-react';
import TableShimmer from './TableShimmer';
import Toast from './Toast';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import Variety from '../model/Variety';
import VarietyModal from './VarietyModal';
import { varietyService } from '../services/VarietyService';
import Table from '../common/Table';
import Title from '../common/Title';
import ErrorBanner from '../common/ErrorBanner';

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
        const response = await varietyService.update(selectedVariety.id, varietyData.nombre)
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

  const tableContentBody = (variety: Variety,) => {
    return [
      <div className="flex items-center">
        <Leaf className="h-5 w-5 text-green-500 mr-2" />
        <span>{variety.nombre}</span>
      </div>,
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setSelectedVariety(variety);
            setIsModalOpen(true);
          }}
          className="edit-button"
          disabled={isLoading}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDeleteVariety(variety.id)}
          className="delete-button"
          disabled={isLoading}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    ];
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

      <div className="content">
        <Title title='Variedades de Uva'/>
        <button
          onClick={() => {
            setSelectedVariety(null);
            setIsModalOpen(true);
          }}
          className="toolbar-button"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Variedad
        </button>
      </div>

      {error && (
        <ErrorBanner error={error} retry={fetchVarieties} />
      )}

      {isLoading ? (
        <TableShimmer columns={[70, 30]} rows={4} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            header={["Nombre", "Acciones"]}
            emptyMessage='No hay variedades registradas'
            data={varieties}
            content={tableContentBody}
          />
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