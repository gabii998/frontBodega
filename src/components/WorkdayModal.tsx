import React, { useState, useEffect } from 'react';
import { X, Calendar, User, ClipboardList, Droplet, XCircle } from 'lucide-react';
import {defaultWorkday, Workday} from '../model/Workday';
import WorkdayModalProps from '../model/WorkdayModalProps';
import { createPortal } from 'react-dom';

const WorkdayModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  workday,
  employees, 
  tasks,
  quarterName,
  quarterId,
  varieties = []
}: WorkdayModalProps) => {
  const [formData, setFormData] = useState<Workday>(defaultWorkday());
  const [taskSearch, setTaskSearch] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showTaskList, setShowTaskList] = useState(false); // Estado para controlar la visibilidad de la lista de tareas
  
  // Filtrar tareas basado en búsqueda
  const filteredTasks = tasks.filter(task => 
    task.nombre.toLowerCase().includes(taskSearch.toLowerCase()) ||
    (task.nombre && task.nombre.toLowerCase().includes(taskSearch.toLowerCase()))
  );

  // Inicializar el formulario con los datos del jornal cuando se está editando
  useEffect(() => {
    if (workday) {
      setFormData(workday);
      // Actualizar el campo de búsqueda de tareas cuando se edita
      const selectedTask = tasks.find(t => t.id === workday.tareaId);
      if (selectedTask) {
        setTaskSearch(selectedTask.nombre);
      }
      
      // No mostrar la lista de tareas al editar inicialmente
      setShowTaskList(false);
    } else {
      // Valores por defecto para un nuevo jornal
      setFormData(defaultWorkday());
      setTaskSearch('');
      setShowTaskList(true); // Mostrar la lista de tareas para un nuevo jornal
    }
  }, [workday, tasks]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.fecha) {
      newErrors.date = 'La fecha es obligatoria';
    }
    
    if (!formData.jornales || formData.jornales <= 0) {
      newErrors.jornales = 'El número de jornales debe ser mayor a 0';
    }
    
    if (!formData.empleadoId) {
      newErrors.employeeId = 'Debe seleccionar un empleado';
    }
    
    if (!formData.tareaId) {
      newErrors.taskId = 'Debe seleccionar una tarea';
    }
    
    // La variedad puede ser opcional dependiendo del contexto
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar los datos del empleado y tarea para mostrarlos en la tabla
      const employee = employees.find(e => e.id === formData.empleadoId);
      const task = tasks.find(t => t.id === formData.tareaId);
      let variedad;
      
      if (formData.variedadId && varieties) {
        variedad = varieties.find(v => v.idVariedad === formData.variedadId);
      }
      
      const workdayToSave: Workday = {
        ...formData,
        empleadoNombre: employee ? employee.nombre : formData.empleadoNombre,
        tareaNombre: task ? task.nombre : formData.tareaNombre,
        variedadNombre: variedad ? variedad.nombre : formData.variedadNombre,
        cuartelId: quarterId,
      };
      
      onSave(workdayToSave);
    }
  };

  // Función para eliminar la tarea seleccionada
  const handleClearTask = () => {
    setFormData({
      ...formData,
      tareaId: 0,
      tareaNombre: ''
    });
    setTaskSearch('');
    setShowTaskList(true);
  };

  // Manejar clic en el campo de búsqueda de tareas
  const handleTaskSearchClick = () => {
    setShowTaskList(true);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">
          {workday ? 'Editar Jornal' : 'Registrar Jornal'}
        </h2>
        <p className="text-gray-500 mb-4">
          Cuartel: {quarterName}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jornales trabajados
            </label>
            <input
              type="number"
              min="0.1"
              step="0.01"
              value={formData.jornales}
              onChange={(e) => setFormData({ ...formData, jornales: parseFloat(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.jornales ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.jornales && (
              <p className="mt-1 text-sm text-red-500">{errors.jornales}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.empleadoId || ''}
                onChange={(e) => {
                  const select = e.target;
                  const value = select.value;
                  if (value) {
                    setFormData({
                      ...formData,
                      empleadoId: Number(value),
                      empleadoNombre: select.options[select.selectedIndex].text
                    });
                  } else {
                    setFormData({
                      ...formData,
                      empleadoId: 0,
                      empleadoNombre: ''
                    });
                  }
                }}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccione un empleado</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.nombre}
                  </option>
                ))}
              </select>
            </div>
            {errors.employeeId && (
              <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
            )}
          </div>

          {/* Selección de variedad */}
          {varieties && varieties.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variedad de Uva
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Droplet className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  value={formData.variedadId !== undefined ? formData.variedadId : ''}
                  onChange={(e) => {
                    const select = e.target;
                    const value = select.value;
                    if (value) {
                      setFormData({
                        ...formData,
                        variedadId: Number(value),
                        variedadNombre: select.options[select.selectedIndex].text
                      });
                    } else {
                      setFormData({
                        ...formData,
                        variedadId: undefined,
                        variedadNombre: undefined
                      });
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione una variedad</option>
                  {varieties.map(variedad => (
                    <option key={variedad.idVariedad} value={variedad.idVariedad}>
                      {variedad.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Seleccione la variedad de uva específica para este jornal.
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarea
            </label>
            
            {/* Si hay una tarea seleccionada, mostrar la información con opción para eliminarla */}
            {formData.tareaId > 0 ? (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-700">Tarea seleccionada:</div>
                    <div className="text-gray-600">{formData.tareaNombre}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleClearTask}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Eliminar tarea seleccionada"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ) : (
              /* Si no hay tarea seleccionada, mostrar el buscador y la lista */
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClipboardList className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    onClick={handleTaskSearchClick}
                    placeholder="Buscar tarea..."
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {showTaskList && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map(task => (
                        <button
                          type="button"
                          key={task.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              tareaId: task.id,
                              tareaNombre: task.nombre
                            });
                            setTaskSearch(task.nombre);
                            setShowTaskList(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{task.nombre}</div>
                          {task.nombre && (
                            <div className="text-sm text-gray-500">{task.nombre}</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500 text-center">
                        No se encontraron tareas
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {errors.taskId && (
              <p className="mt-1 text-sm text-red-500">{errors.taskId}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.tareaId || !formData.empleadoId}
            >
              {workday ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>,document.body
  );
};

export default WorkdayModal;