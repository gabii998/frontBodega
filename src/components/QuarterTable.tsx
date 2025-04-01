import React from 'react';
import { Edit, Trash2, MapPin, Clock } from 'lucide-react';
import QuarterModal from './QuarterModal';
import QuarterWorkdays from './QuarterWorkdays';
import TableShimmer from './TableShimmer';

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

const QuarterTable = () => {
  const [quarters, setQuarters] = React.useState<Quarter[]>([
    {
      id: 1,
      name: 'Cuartel 1',
      varieties: [
        { id: 1, name: 'Malbec' },
        { id: 2, name: 'Cabernet Sauvignon' }
      ],
      managerId: 1,
      managerName: 'Juan Pérez',
      hectares: 5.5,
      system: 'parral'
    },
    {
      id: 2,
      name: 'Cuartel 2',
      varieties: [
        { id: 3, name: 'Chardonnay' }
      ],
      managerId: 2,
      managerName: 'María García',
      hectares: 3.2,
      system: 'espaldero'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedQuarter, setSelectedQuarter] = React.useState<Quarter | undefined>();
  const [viewingWorkdays, setViewingWorkdays] = React.useState<Quarter | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleOpenModal = (quarter?: Quarter) => {
    setSelectedQuarter(quarter);
    setIsModalOpen(true);
  };

  const handleSaveQuarter = (quarterData: Omit<Quarter, 'id'>) => {
    if (selectedQuarter) {
      setQuarters(quarters.map(q => 
        q.id === selectedQuarter.id 
          ? { ...q, ...quarterData, id: q.id }
          : q
      ));
    } else {
      const newQuarter = {
        ...quarterData,
        id: Math.max(...quarters.map(q => q.id)) + 1
      };
      setQuarters([...quarters, newQuarter]);
    }
  };

  const handleDeleteQuarter = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este cuartel?')) {
      setQuarters(quarters.filter(q => q.id !== id));
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Cuarteles</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MapPin className="h-5 w-5 mr-2" />
          Nuevo Cuartel
        </button>
      </div>

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
              {quarters.map((quarter) => (
                <tr key={quarter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{quarter.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{quarter.hectares}</td>
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
                      >
                        <Clock className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(quarter)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar cuartel"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuarter(quarter.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar cuartel"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
      />
    </div>
  );
};

export default QuarterTable;