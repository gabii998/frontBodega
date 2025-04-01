import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface GrapeVariety {
  id: number;
  name: string;
}

interface Quarter {
  id?: number;
  name: string;
  varieties: GrapeVariety[];
  managerId: number;
  managerName: string;
  hectares: number;
  system: 'parral' | 'espaldero';
}

interface QuarterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quarter: Omit<Quarter, 'id'>) => void;
  quarter?: Quarter;
}

const QuarterModal = ({ isOpen, onClose, onSave, quarter }: QuarterModalProps) => {
  const [formData, setFormData] = React.useState<Omit<Quarter, 'id'>>({
    name: '',
    varieties: [],
    managerId: 0,
    managerName: '',
    hectares: 0,
    system: 'parral'
  });
  const [newVariety, setNewVariety] = React.useState('');

  React.useEffect(() => {
    if (quarter) {
      setFormData({
        name: quarter.name,
        varieties: [...quarter.varieties],
        managerId: quarter.managerId,
        managerName: quarter.managerName,
        hectares: quarter.hectares,
        system: quarter.system
      });
    } else {
      setFormData({
        name: '',
        varieties: [],
        managerId: 0,
        managerName: '',
        hectares: 0,
        system: 'parral'
      });
    }
  }, [quarter]);

  if (!isOpen) return null;

  const handleAddVariety = () => {
    if (newVariety.trim()) {
      setFormData({
        ...formData,
        varieties: [
          ...formData.varieties,
          {
            id: Math.max(0, ...formData.varieties.map(v => v.id)) + 1,
            name: newVariety.trim()
          }
        ]
      });
      setNewVariety('');
    }
  };

  const handleRemoveVariety = (id: number) => {
    setFormData({
      ...formData,
      varieties: formData.varieties.filter(v => v.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">
          {quarter ? 'Editar Cuartel' : 'Nuevo Cuartel'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cuartel
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Superficie (hectáreas)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.hectares}
              onChange={(e) => setFormData({ ...formData, hectares: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sistema
            </label>
            <select
              value={formData.system}
              onChange={(e) => setFormData({ ...formData, system: e.target.value as 'parral' | 'espaldero' })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="parral">Parral</option>
              <option value="espaldero">Espaldero</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encargado
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => {
                const select = e.target;
                setFormData({
                  ...formData,
                  managerId: Number(select.value),
                  managerName: select.options[select.selectedIndex].text
                });
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione un encargado</option>
              <option value="1">Juan Pérez</option>
              <option value="2">María García</option>
              <option value="3">Carlos López</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variedades de Uva
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newVariety}
                onChange={(e) => setNewVariety(e.target.value)}
                placeholder="Nueva variedad..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddVariety}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.varieties.map((variety) => (
                <div
                  key={variety.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span>{variety.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariety(variety.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuarterModal;