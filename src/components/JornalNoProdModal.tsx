import { Calendar, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Employee } from "../model/Employee";
import JornalNoProductivo, { defaultJornalNp } from "../model/JornalNoProductivo";

const JornalNoProdModal = (
  {
    employees,
    jornal = null,
    handleClose,
    onSubmit
  }: { employees: Employee[], jornal: JornalNoProductivo | null, handleClose: () => void, onSubmit: (workday: JornalNoProductivo) => void }) => {
  const [formData, setFormData] = useState<JornalNoProductivo>(defaultJornalNp);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  useEffect(() => {
    if (jornal != null) {
      console.log(jornal)
      setFormData(jornal);
    }
  }, [jornal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    console.log(formData)

    if (!formData.fecha) {
      newErrors.date = 'La fecha es obligatoria';
    }

    if (!formData.jornales || formData.jornales <= 0) {
      newErrors.jornales = 'El número de jornales debe ser mayor a 0';
    }

    if (!formData.idEmpleado) {
      newErrors.employeeId = 'Debe seleccionar un empleado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {jornal ? 'Editar Jornal' : 'Registrar Jornal'}
        </h2>
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
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'
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
              min="0"
              step="0.1"
              value={formData.jornales}
              onChange={(e) => setFormData({ ...formData, jornales: parseFloat(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jornales ? 'border-red-500' : 'border-gray-300'
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
                value={formData.idEmpleado || ''}
                onChange={(e) => {
                  const select = e.target;
                  const value = select.value;
                  if (value) {
                    setFormData({
                      ...formData,
                      idEmpleado: Number(value),
                      nombreEmpleado: select.options[select.selectedIndex].text
                    });
                  } else {
                    setFormData({
                      ...formData,
                      idEmpleado: 0,
                      nombreEmpleado: ''
                    });
                  }
                }}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeId ? 'border-red-500' : 'border-gray-300'
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

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.idEmpleado || formData.jornales == 0}
            >
              {jornal ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body
  );
}

export default JornalNoProdModal;