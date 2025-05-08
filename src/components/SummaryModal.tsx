import React from 'react';
import { X } from 'lucide-react';
import GeneralSummary from '../model/GeneralSummary';
import SummaryModalProps from '../model/SummaryModalProps';


const SummaryModal = ({ isOpen, onClose, onSave, summary }: SummaryModalProps) => {
  const [formData, setFormData] = React.useState<GeneralSummary>(summary);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const fields: { key: keyof GeneralSummary; label: string; suffix: string }[] = [
    { key: 'structure', label: 'Estructura', suffix: 'jornales' },
    { key: 'productiveTotal', label: 'Total Productivos', suffix: 'jornales' },
    { key: 'nonProductiveWorkdays', label: 'Jornales No Productivos', suffix: 'jornales' },
    { key: 'totalPaidWorkdays', label: 'Total Jornales Pagados', suffix: 'jornales' },
    { key: 'performance', label: 'Rendimiento', suffix: '%' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Editar Indicadores</h2>
        
        <form onSubmit={handleSubmit}>
          {fields.map(({ key, label, suffix }) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                  required
                  min={0}
                  step={key === 'performance' ? '0.1' : '1'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {suffix}
                </span>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end space-x-3 mt-6">
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

export default SummaryModal;