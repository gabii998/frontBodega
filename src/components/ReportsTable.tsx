import { useState, useEffect, useRef } from 'react';
import { BarChart, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import TableShimmer from './TableShimmer';
import ReportDetail from './ReportDetail';
import axios from 'axios';
import Toast from './Toast';
import ReporteVista from '../model/ReporteVista';
import ReporteCuartel from '../model/ReporteCuartel';
import { useFarm } from '../context/FarmContext';

// Componente para las filas de variedades animadas
const AnimatedVarietyRows = ({ 
  varieties, 
  isExpanded, 
  onVarietyClick 
}: { 
  varieties: ReporteVista[], 
  isExpanded: boolean,
  onVarietyClick: (variety: ReporteVista) => void 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(0);
  
  useEffect(() => {
    if (isExpanded) {
      const contentHeight = containerRef.current?.scrollHeight;
      setHeight(contentHeight);
    } else {
      setHeight(0);
    }
  }, [isExpanded, varieties.length]);

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out w-full"
      style={{ 
        maxHeight: isExpanded ? `${height}px` : '0px',
        opacity: isExpanded ? 1 : 0 
      }}
    >
      {varieties.map((variety) => (
        <div 
          key={variety.id} 
          className="bg-gray-50 hover:bg-gray-100 cursor-pointer flex w-full border-b border-gray-100 last:border-b-0"
          onClick={() => onVarietyClick(variety)}
        >
          <div className="px-6 py-4 w-2/5">
            <div className="flex items-center">
              <div className="ml-9">
                <div className="font-medium text-gray-700">
                  • {variety.variedadNombre}
                </div>
                <div className="text-sm text-gray-500 ml-2">{variety.superficie} hectáreas</div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 w-1/5">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span>{variety.fecha}</span>
            </div>
          </div>
          <div className="px-6 py-4 text-gray-700 w-1/5">
            <div>
              <div className="font-medium">{variety.totalJornales.toFixed(1)} jornales</div>
              <div className="text-sm text-gray-500">
                {(variety.totalJornales / variety.superficie).toFixed(2)} jornales/ha
              </div>
            </div>
          </div>
          <div className="px-6 py-4 w-1/5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              variety.rendimiento >= 85 
                ? 'bg-green-100 text-green-800'
                : variety.rendimiento >= 70
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {variety.rendimiento}%
            </span>
          </div>
          <div className="px-6 py-4">
            <button 
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                onVarietyClick(variety);
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ReportsTable = () => {
  const { activeFarm } = useFarm();
  const [selectedReport, setSelectedReport] = useState<ReporteVista | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReporteVista[]>([]);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  // Estado para rastrear qué cuarteles están expandidos
  const [expandedQuartels, setExpandedQuartels] = useState<number[]>([]);
  
  // Configuración del selector de años
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5; // 5 años atrás
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(currentYear);

  // Función para cargar reportes desde el backend
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ReporteCuartel[]>(`/api/reportes/anio/${anioSeleccionado}/finca/${activeFarm?.id}`);
      
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
    if(activeFarm != null && activeFarm != undefined) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anioSeleccionado,activeFarm]);

  // Función para alternar la expansión de un cuartel
  const toggleExpansion = (cuartelId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague al tr
    
    if (expandedQuartels.includes(cuartelId)) {
      // Si ya está expandido, lo colapsamos
      setExpandedQuartels(expandedQuartels.filter(id => id !== cuartelId));
    } else {
      // Si no está expandido, lo expandimos
      setExpandedQuartels([...expandedQuartels, cuartelId]);
    }
  };

  // Verificar si un cuartel está expandido
  const isQuartelExpanded = (cuartelId: number) => {
    return expandedQuartels.includes(cuartelId);
  };

  // Obtener las variedades de un cuartel específico
  const getVarieties = (cuartelId: number) => {
    return reports.filter(report => report.esVariedad && report.cuartelId === cuartelId);
  };

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
    // Mostrar vista detallada solo para variedades
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

  // Filtrar solo los cuarteles (reportes que no son variedades)
  const cuarteles = reports.filter(report => !report.esVariedad);

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
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Encabezados de la tabla */}
            <div className="bg-gray-50 flex border-b border-gray-200">
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Cuartel / Variedad
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Fecha
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Jornales
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Rendimiento
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </div>
            </div>
            
            {/* Cuerpo de la tabla */}
            <div className="bg-white divide-y divide-gray-200">
              {cuarteles.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  No hay reportes disponibles para el año seleccionado
                </div>
              ) : (
                // Iteramos solo por los cuarteles, no las variedades
                cuarteles.map((cuartel) => {
                  const varieties = getVarieties(cuartel.cuartelId);
                  const hasVarieties = varieties.length > 0;
                  const isExpanded = isQuartelExpanded(cuartel.cuartelId);
                  
                  return (
                    <div key={cuartel.id}>
                      {/* Fila del cuartel */}
                      <div 
                        className={`hover:bg-gray-50 cursor-pointer flex ${isExpanded ? 'border-b-0' : 'border-b border-gray-200'}`}
                        onClick={(e) => toggleExpansion(cuartel.cuartelId, e)}
                      >
                        <div className="px-6 py-4 w-2/5">
                          <div className="flex items-center">
                            {hasVarieties && (
                              <div 
                                className={`mr-2 text-gray-500 hover:text-gray-700 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                              >
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            )}
                            <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {cuartel.cuartelNombre}
                              </div>
                              <div className="text-sm text-gray-500">{cuartel.superficie} hectáreas</div>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 py-4 w-1/5">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{cuartel.fecha}</span>
                          </div>
                        </div>
                        <div className="px-6 py-4 w-1/5">
                          <div>
                            <div className="font-medium text-gray-900">{cuartel.totalJornales.toFixed(1)} jornales</div>
                            <div className="text-sm text-gray-500">{cuartel.totalHoras.toFixed(1)} horas</div>
                          </div>
                        </div>
                        <div className="px-6 py-4 w-1/5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cuartel.rendimiento >= 85 
                              ? 'bg-green-100 text-green-800'
                              : cuartel.rendimiento >= 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cuartel.rendimiento}%
                          </span>
                        </div>
                        <div className="px-6 py-4">
                          {hasVarieties && (
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => toggleExpansion(cuartel.cuartelId, e)}
                            >
                              {isExpanded ? 
                                <ChevronDown className="h-5 w-5 transition-transform duration-300 transform" /> : 
                                <ChevronRight className="h-5 w-5 transition-transform duration-300 transform" />
                              }
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Filas de variedades con animación de expansión/colapso */}
                      {hasVarieties && (
                        <div className={isExpanded ? 'border-b border-gray-200' : ''}>
                          <AnimatedVarietyRows 
                            varieties={varieties} 
                            isExpanded={isExpanded}
                            onVarietyClick={setSelectedReport}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTable;