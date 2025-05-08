import { useState, useEffect } from 'react';
import { BarChart, Calendar, ChevronRight } from 'lucide-react';
import TableShimmer from './TableShimmer';
import ReportDetail from './ReportDetail';
import axios from 'axios';
import Toast from './Toast';
import ReporteVista from '../model/ReporteVista';
import ReporteCuartel from '../model/ReporteCuartel';

const ReportsTable = () => {
  const [selectedReport, setSelectedReport] = useState<ReporteVista | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReporteVista[]>([]);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  
  // Configuración del selector de años
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5; // 5 años atrás
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(currentYear);

  // Función para cargar reportes desde el backend
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ReporteCuartel[]>(`/api/reportes/anio/${anioSeleccionado}`);
      
      // Transformar los datos para incluir tanto cuarteles como variedades
      const transformedReports: ReporteVista[] = [];
      
      response.data.forEach((reporte) => {
        // Añadir el cuartel general
        transformedReports.push({
          id: reporte.cuartelId * 1000, // ID único para el cuartel
          cuartelId: reporte.cuartelId,
          cuartelNombre: reporte.cuartelNombre,
          fecha: reporte.fecha,
          totalHoras: reporte.jornalesTotales * 8, // Asumiendo 8 horas por jornal
          totalJornales: reporte.jornalesTotales,
          rendimiento: reporte.rendimiento,
          superficie: reporte.superficie,
          esVariedad: false
        });
        
        // Añadir cada variedad como un elemento separado
        reporte.variedades.forEach((variedad, index) => {
          transformedReports.push({
            id: reporte.cuartelId * 1000 + index + 1, // ID único para cada variedad
            cuartelId: reporte.cuartelId,
            cuartelNombre: reporte.cuartelNombre,
            fecha: reporte.fecha,
            totalHoras: variedad.jornales * 8, // Asumiendo 8 horas por jornal
            totalJornales: variedad.jornales,
            rendimiento: variedad.rendimiento,
            superficie: variedad.superficie,
            variedadId: variedad.variedadId,
            variedadNombre: variedad.variedadNombre,
            esVariedad: true
          });
        });
      });
      
      setReports(transformedReports);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('No se pudieron cargar los reportes. Intente nuevamente.');
      setToast({
        type: 'error',
        message: 'Error al cargar los reportes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar reportes al montar el componente o cambiar el año
  useEffect(() => {
    fetchReports();
  }, [anioSeleccionado]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Reportes</h2>
        </div>
        <TableShimmer columns={[30, 20, 15, 15, 20]} rows={3} />
      </div>
    );
  }

  if (selectedReport) {
    // Para reportes de variedad, usamos la superficie de la variedad
    // Para reportes de cuartel completo, usamos la superficie total del cuartel
    const superficie = selectedReport.superficie;
      
    // Cálculo aproximado de la división entre tareas manuales/mecánicas
    // Esto podría ser reemplazado por datos reales del backend si están disponibles
    const totalJornales = selectedReport.totalJornales;
    const manualWorkdays = selectedReport.esVariedad
      ? Math.round(totalJornales * 0.65)  // Para variedades, aprox. 65% manual
      : Math.round(totalJornales * 0.7);  // Para cuarteles, aprox. 70% manual
      
    const mechanicalWorkdays = totalJornales - manualWorkdays;
    
    return (
      <ReportDetail
        report={{
          id: selectedReport.id,
          quarter: {
            id: selectedReport.cuartelId,
            nombre: selectedReport.cuartelNombre,
            superficieTotal: superficie,
            variedades: []
          },
          date: selectedReport.fecha,
          totalHours: selectedReport.totalHoras,
          totalWorkdays: totalJornales,
          manualWorkdays: manualWorkdays,
          mechanicalWorkdays: mechanicalWorkdays,
          performance: selectedReport.rendimiento,
          variedadId: selectedReport.variedadId,
          variedadNombre: selectedReport.variedadNombre,
          esVariedad: selectedReport.esVariedad,
          superficie: selectedReport.superficie
        }}
        onBack={() => setSelectedReport(null)}
      />
    );
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
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Reportes</h2>
        
        <div className="flex items-center">
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Generar opciones desde startYear hasta el año actual */}
            {Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
              const year = startYear + index;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            }).reverse()} {/* Invertimos para mostrar más recientes primero */}
          </select>
          
          <button
            onClick={fetchReports}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchReports}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuartel / Variedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jornales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rendimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay reportes disponibles para el año seleccionado
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr 
                  key={report.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    report.esVariedad ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {report.esVariedad ? (
                            <div className="flex items-center">
                              <span className="ml-4">• {report.variedadNombre}</span>
                            </div>
                          ) : (
                            report.cuartelNombre
                          )}
                        </div>
                        {!report.esVariedad && (
                          <div className="text-sm text-gray-500">{report.superficie} hectáreas</div>
                        )}
                        {report.esVariedad && (
                          <div className="text-sm text-gray-500 ml-6">{report.superficie} hectáreas</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{report.fecha}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{report.totalJornales.toFixed(1)} jornales</div>
                      <div className="text-sm text-gray-500">
                        {report.esVariedad 
                          ? `${(report.totalJornales / report.superficie).toFixed(2)} jornales/ha`
                          : `${report.totalHoras.toFixed(1)} horas`
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.rendimiento >= 85 
                        ? 'bg-green-100 text-green-800'
                        : report.rendimiento >= 70
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.rendimiento}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTable;