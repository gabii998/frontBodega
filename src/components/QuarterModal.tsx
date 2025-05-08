import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, MapPin } from 'lucide-react';
import axios from 'axios';
import QuarterModalProps from '../model/QuarterModalProps';
import Quarter from '../model/Quarter';
import { useFarm } from '../context/FarmContext';

const QuarterModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  quarter, 
  isLoading = false,
  availableVarieties,
  availableEmployees}: QuarterModalProps) => {
  const { activeFarm } = useFarm();
  const [formData, setFormData] = useState<Quarter>({
    nombre: '',
    variedades: [],
    managerId: 0,
    encargadoNombre: '',
    superficieTotal: 0,
    sistema: 'parral'
  });

  const [loadingOptions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewVarietyForm, setShowNewVarietyForm] = useState(false);
  const [newVarietyName, setNewVarietyName] = useState('');
  const [addingVariety, setAddingVariety] = useState(false);

  // Inicializar el formulario con los datos del cuartel si está editando
  useEffect(() => {
    if (quarter) {
      setFormData(quarter);
    } else {
      // Reiniciar el formulario para un nuevo cuartel
      setFormData({
        nombre: '',
        variedades: [],
        managerId: 0,
        encargadoNombre: '',
        superficieTotal: 0,
        sistema: 'parral'
      });
    }
    setErrors({});
    setShowNewVarietyForm(false);
    setNewVarietyName('');
  }, [quarter, isOpen]);

  if (!isOpen) return null;

  const handleAddVariety = (variedadId: number) => {
    // Verificar que la variedad no esté ya seleccionada
    const existingVariety = formData.variedades.find(v => v.id === variedadId);
    if (existingVariety) {
      setErrors({
        ...errors,
        addVariety: 'Esta variedad ya está agregada al cuartel'
      });
      return;
    }
    
    const variety = availableVarieties.find(v => v.id === variedadId);
    if (variety) {
      setFormData({
        ...formData,
        variedades: [...formData.variedades, { 
          id: variety.id, 
          nombre: variety.name, 
          superficie: 0 
        }]
      });
      setErrors({
        ...errors,
        addVariety: ''
      });
    }
  };

  const handleRemoveVariety = (variedadId: number) => {
    setFormData({
      ...formData,
      variedades: formData.variedades.filter(v => v.id !== variedadId)
    });
  };

  const handleVarietyChange = (id: number, superficie: number) => {
    setFormData({
      ...formData,
      variedades: formData.variedades.map(v => 
        v.id === id ? { ...v, superficie } : v
      )
    });
  };

  const handleEmployeeChange = (employeeId: number) => {
    const selectedEmployee = availableEmployees.find(e => e.id === employeeId);
    
    setFormData({
      ...formData,
      managerId: employeeId,
      encargadoNombre: selectedEmployee ? selectedEmployee.nombre : ''
    });
  };

  const handleCreateNewVariety = async () => {
    if (!newVarietyName.trim()) {
      setErrors({
        ...errors,
        newVariety: 'El nombre de la variedad es obligatorio'
      });
      return;
    }

    setAddingVariety(true);
    try {
      // Crear nueva variedad en el backend
      const response = await axios.post('/api/variedades', {
        nombre: newVarietyName
      });

      // Obtener la variedad creada
      const newVariety = {
        id: response.data.id,
        name: response.data.nombre
      };

      // Agregar la nueva variedad al formulario
      setFormData({
        ...formData,
        variedades: [...formData.variedades, { 
          id: newVariety.id, 
          nombre: newVariety.name, 
          superficie: 0 
        }]
      });

      // Limpiar el formulario de nueva variedad
      setNewVarietyName('');
      setShowNewVarietyForm(false);
      setErrors({
        ...errors,
        newVariety: ''
      });

    } catch (err) {
      console.error('Error al crear nueva variedad:', err);
      setErrors({
        ...errors,
        newVariety: 'Error al crear la variedad'
      });
    } finally {
      setAddingVariety(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (formData.managerId === 0) {
      newErrors.managerId = 'Debe seleccionar un encargado';
    }
    
    if (formData.variedades.length === 0) {
      newErrors.varieties = 'Debe agregar al menos una variedad';
    } else {
      // Verificar que todas las variedades tengan superficie mayor a 0
      const invalidVariety = formData.variedades.find(v => !v.superficie || v.superficie <= 0);
      if (invalidVariety) {
        newErrors.varieties = 'Todas las variedades deben tener una superficie mayor a 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Calcular la superficie total de todas las variedades
  const calculateTotalArea = () => {
    return formData.variedades.reduce((sum, v) => sum + (v.superficie || 0), 0);
  };

  // Obtener variedades no utilizadas
  const getUnusedVarieties = () => {
    const usedIds = new Set(formData.variedades.map(v => v.id));
    return availableVarieties.filter(v => !usedIds.has(v.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading || loadingOptions}
          type="button"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">
          {quarter ? 'Editar Cuartel' : 'Nuevo Cuartel'}
        </h2>

        {/* Mostrar la finca activa */}
        {activeFarm && (
          <div className="flex items-center mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
            <MapPin className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">Finca: {activeFarm.nombre}</span>
          </div>
        )}
        
        {loadingOptions ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Cargando opciones...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cuartel
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sistema de Conducción
                </label>
                <select
                  value={formData.sistema ?? ""}
                  onChange={(e) => setFormData({ ...formData, sistema: e.target.value as 'parral' | 'espaldero' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="parral">Parral</option>
                  <option value="espaldero">Espaldero</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encargado
                </label>
                <select
                  value={formData.managerId ?? 0}
                  onChange={(e) => handleEmployeeChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.managerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value={0}>Seleccione un encargado</option>
                  {availableEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nombre} ({employee.dni})
                    </option>
                  ))}
                </select>
                {errors.managerId && (
                  <p className="mt-1 text-sm text-red-500">{errors.managerId}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superficie Total (ha)
                </label>
                <input
                  type="number"
                  value={calculateTotalArea()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  disabled={true}
                />
                <p className="mt-1 text-xs text-gray-500">
                  La superficie total se calcula automáticamente
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Variedades de Uva y Superficie
                </label>
              </div>
              
              {errors.varieties && (
                <p className="mt-1 text-sm text-red-500 mb-2">{errors.varieties}</p>
              )}
              
              {/* Lista de variedades seleccionadas */}
              <div className="bg-white rounded-lg border border-gray-200 mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variedad
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
                    {formData.variedades.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          No hay variedades agregadas
                        </td>
                      </tr>
                    ) : (
                      formData.variedades.map((variety) => (
                        <tr key={variety.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {variety.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={variety.superficie || ''}
                              onChange={(e) => handleVarietyChange(variety.id ?? -1, Number(e.target.value))}
                              placeholder="Superficie (ha)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              step="0.01"
                              min="0"
                              disabled={isLoading}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariety(variety.id ?? -1)}
                              className="text-red-600 hover:text-red-800"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Agregar variedades existentes */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Agregar variedad existente</h3>
                  <button
                    type="button"
                    onClick={() => setShowNewVarietyForm(!showNewVarietyForm)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Crear nueva variedad
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getUnusedVarieties().length === 0 ? (
                    <p className="text-sm text-gray-500">Todas las variedades ya están agregadas</p>
                  ) : (
                    getUnusedVarieties().map(variedad => (
                      <button
                        key={variedad.id}
                        type="button"
                        onClick={() => handleAddVariety(variedad.id)}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                        disabled={isLoading}
                      >
                        {variedad.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Crear nueva variedad - se muestra solo cuando showNewVarietyForm es true */}
              {showNewVarietyForm && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Crear nueva variedad</h3>
                  <div className="flex items-center">
                    <div className="flex-1 mr-2">
                      <input
                        type="text"
                        value={newVarietyName}
                        onChange={(e) => setNewVarietyName(e.target.value)}
                        placeholder="Nombre de la nueva variedad"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.newVariety ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={addingVariety}
                      />
                      {errors.newVariety && (
                        <p className="mt-1 text-sm text-red-500">{errors.newVariety}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleCreateNewVariety}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                        disabled={addingVariety || !newVarietyName.trim()}
                      >
                        {addingVariety ? 'Creando...' : 'Crear y Agregar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewVarietyForm(false);
                          setNewVarietyName('');
                          setErrors({...errors, newVariety: ''});
                        }}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300"
                        disabled={addingVariety}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuarterModal;