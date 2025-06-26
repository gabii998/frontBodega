import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, MapPin } from 'lucide-react';
import QuarterModalProps from '../model/QuarterModalProps';
import { createQuarterBase, Quarter } from '../model/Quarter';
import { useFarm } from '../context/FarmContext';
import { createPortal } from 'react-dom';
import { varietyService } from '../services/VarietyService';
import Table from '../common/Table';
import VarietyCuartel from '../model/VarietyCuartel';

const QuarterModal = ({
  isOpen,
  onClose,
  onSave,
  quarter,
  isLoading = false,
  setAvailableVarieties,
  availableVarieties,
  availableEmployees }: QuarterModalProps) => {
  const { activeFarm } = useFarm();
  const [formData, setFormData] = useState<Quarter>(createQuarterBase);
  const [loadingOptions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewVarietyForm, setShowNewVarietyForm] = useState(false);
  const [newVarietyName, setNewVarietyName] = useState('');
  const [addingVariety, setAddingVariety] = useState(false);
  const [animationClass, setAnimationClass] = useState("modalIn");

  useEffect(() => {
    if (isOpen) {
      if (quarter) {
        setFormData(quarter);
      } else {
        setFormData(createQuarterBase);
      }
      setErrors({});
      setShowNewVarietyForm(false);
      setNewVarietyName('');
      setAnimationClass("modalIn");
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [quarter, isOpen]);

  if (!isOpen) return null;

  const handleAddVariety = (variedadId: number) => {
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
          idVariedad: variety.id,
          nombre: variety.nombre,
          superficie: 0,
          hileras: 0
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
      variedades: formData.variedades.filter(v => v.idVariedad !== variedadId)
    });
  };

  const handleVarietyChange = (id: number, superficie: number) => {
    setFormData({
      ...formData,
      variedades: formData.variedades.map(v =>
        v.idVariedad === id ? { ...v, superficie } : v
      )
    });
  };

  const handleHilerasChange = (id: number, hileras: number) => {
    setFormData({
      ...formData,
      variedades: formData.variedades.map(v =>
        v.idVariedad === id ? { ...v, hileras } : v
      )
    });
  };

  const handleEmployeeChange = (employeeId: number) => {
    const selectedEmployee = availableEmployees.find(e => e.id === employeeId);

    setFormData({
      ...formData,
      encargadoId: employeeId,
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
      const response = await varietyService.create(newVarietyName);
      setFormData({
        ...formData,
        variedades: [...formData.variedades, {nombre:response.nombre,idVariedad:response.id}]
      });
      setAvailableVarieties([...availableVarieties,response])
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

    if (formData.encargadoId === 0) {
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

  const handleClose = () => {
    setAnimationClass("modalOut");
  };

  const handleAnimationEnd = () => {
    if (animationClass === "modalOut") {
      onClose();
      document.body.style.overflow = 'auto';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const calculateTotalArea = () => {
    return formData.variedades.reduce((sum, v) => sum + (v.superficie || 0), 0);
  };

  const getUnusedVarieties = () => {
    const usedIds = new Set(formData.variedades.map(v => v.idVariedad));
    return availableVarieties.filter(v => !usedIds.has(v.id));
  };

  const tableBody = (variety:VarietyCuartel,) => {
    return [
      variety.nombre,
      <input
          type="number"
          value={variety.superficie || ''}
          onChange={(e) => handleVarietyChange(variety.idVariedad ?? -1, Number(e.target.value))}
          placeholder="Superficie (ha)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          step="0.01"
          min="0"
          disabled={isLoading}
        />,
        <input
          type="number"
          value={variety.hileras || ''}
          onChange={(e) => handleHilerasChange(variety.idVariedad ?? -1, Number(e.target.value))}
          placeholder="Hileras"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          step="1"
          min="1"
          disabled={isLoading}
        />,
        <button
          type="button"
          onClick={() => handleRemoveVariety(variety.idVariedad ?? -1)}
          className="delete-button"
          disabled={isLoading}
        >
          <Trash2 className="h-5 w-5" />
        </button>
    ]
  }

  return createPortal(
    <div className="modal-overlay">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
        style={{ opacity: animationClass === "modalOut" ? 0 : 1, transition: "opacity 0.3s" }}
      ></div>

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`bg-white rounded-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto shadow-xl ${animationClass}`}
          onClick={(e) => e.stopPropagation()}
          onAnimationEnd={handleAnimationEnd}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading || loadingOptions}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-xl font-semibold mb-4">
            {quarter ? 'Editar Cuartel' : 'Nuevo Cuartel'}
          </h2>

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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
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
                    onChange={(e) => setFormData({ ...formData, sistema: e.target.value as 'Parral' | 'Espaldero' | 'Olivo' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value="Parral">Parral</option>
                    <option value="Espaldero">Espaldero</option>
                    <option value="Olivo">Olivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encargado
                  </label>
                  <select
                    value={formData.encargadoId ?? 0}
                    onChange={(e) => handleEmployeeChange(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.managerId ? 'border-red-500' : 'border-gray-300'
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
                <div className="bg-white rounded-lg border border-gray-200 mb-4">
                  <Table
                    header={["Variedad", "Superficie (ha)", "Hileras", "Acciones"]}
                    data={formData.variedades}
                    emptyMessage={() => 'No hay variedades agregadas'}
                    content={(variety,) => tableBody(variety)}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Agregar variedad existente</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewVarietyForm(!showNewVarietyForm)}
                      className="text-sm edit-button flex items-center"
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
                          {variedad.nombre}
                        </button>
                      ))
                    )}
                  </div>
                </div>

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
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.newVariety ? 'border-red-500' : 'border-gray-300'
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
                            setErrors({ ...errors, newVariety: '' });
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
                  onClick={handleClose}
                  className="gray-button"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuarterModal;