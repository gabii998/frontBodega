import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import TableShimmer from './TableShimmer';
import ReportDetail from './ReportDetail';
import Toast from './Toast';
import { useFarm } from '../context/FarmContext';
import ToastProps, { errorToast } from '../model/ToastProps';
import { reportService } from '../services/reportService';
import ReporteCuartel from '../model/ReporteCuartel';
import Title from '../common/Title';
import ErrorBanner from '../common/ErrorBanner';

const AnimatedVarietyRows = ({
  varieties,
  isExpanded,
  onVarietyClick
}: {
  varieties: ReporteCuartel[],
  isExpanded: boolean,
  onVarietyClick: (variety: ReporteCuartel) => void
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
          <div className="px-6 py-4 w-1/3">
            <div className="flex items-center">
              <div className="ml-9">
                <div className="font-medium text-gray-700">
                  • {variety.cuartelNombre}
                </div>
                <div className="text-sm text-gray-500 ml-2">{variety.superficie} hectáreas</div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 w-1/6">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span>{variety.fecha}</span>
            </div>
          </div>
          <div className="px-6 py-4 text-gray-700 w-1/6">
            <div>
              <div className="font-medium">{variety.jornalesTotales.toFixed(2)} jornales</div>
            </div>
          </div>
          <div className="px-6 py-4 w-1/6">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
              {variety.rendimiento} qq/Ha
            </span>
          </div>
          <div className="px-6 py-4 w-1/6">
            <button
              className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onVarietyClick(variety);
              }}
              title="Ver reporte de la variedad"
            >
              <FileText className="h-4 w-4 mr-1" />
              Ver Reporte
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ReportsTable = () => {
  const { activeFarm } = useFarm();
  const [selectedReport, setSelectedReport] = useState<ReporteCuartel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReporteCuartel[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [expandedQuartels, setExpandedQuartels] = useState<number[]>([]);
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5;
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(currentYear);

  useEffect(() => {
    if (activeFarm != null && activeFarm != undefined) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anioSeleccionado, activeFarm]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportService.getByYear(anioSeleccionado, activeFarm?.id ?? 0);
      setReports(response);
    } catch {
      setError('No se pudieron cargar los reportes. Intente nuevamente.');
      errorToast('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpansion = (cuartelId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (expandedQuartels.includes(cuartelId)) {
      setExpandedQuartels(expandedQuartels.filter(id => id !== cuartelId));
    } else {
      setExpandedQuartels([...expandedQuartels, cuartelId]);
    }
  };

  const isQuartelExpanded = (cuartelId: number) => {
    return expandedQuartels.includes(cuartelId);
  };

  const getVarieties = (cuartelId: number) => {
    return reports.filter(report => report.esVariedad && report.cuartelId === cuartelId);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Title title='Reportes'/>
        </div>
        <TableShimmer columns={[30, 20, 15, 15, 20]} rows={3} />
      </div>
    );
  }

  if (selectedReport) {
    return (
      <ReportDetail
        report={{
          id: selectedReport.id,
          quarter: {
            id: selectedReport.cuartelId,
            nombre: selectedReport.cuartelNombre,
            superficieTotal: selectedReport.superficie,
            variedades: [],
            hileras: selectedReport.hileras
          },
          date: selectedReport.fecha,
          totalHours: selectedReport.jornalesTotales * 8,
          totalWorkdays: selectedReport.jornalesTotales,
          manualWorkdays: selectedReport.jornalesTotales,
          mechanicalWorkdays: 0,
          performance: selectedReport.rendimiento,
         // variedadId: selectedReport.variedadId,
          //variedadNombre: selectedReport.variedadNombre,
          esVariedad: selectedReport.esVariedad,
          superficie: selectedReport.superficie,
          hileras: selectedReport.hileras
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

      <div className="content">
        <Title title='Reportes'/>
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
        <ErrorBanner error={error} retry={fetchReports} />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Encabezados de la tabla */}
            <div className="bg-gray-50 flex border-b border-gray-200">
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Cuartel / Variedad
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Fecha
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Jornales
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Rendimiento
              </div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
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
                        className={`hover:bg-gray-50 ${hasVarieties ? 'cursor-pointer' : ''} flex ${isExpanded ? 'border-b-0' : 'border-b border-gray-200'}`}
                        onClick={(e) => {
                          // Solo expandir/contraer si hacen clic en cualquier lugar excepto los botones
                          if (hasVarieties && (e.target as HTMLElement).closest('button') === null) {
                            toggleExpansion(cuartel.cuartelId, e);
                          }
                        }}
                      >
                        <div className="px-6 py-4 w-1/3">
                          <div className="flex items-center">
                            {hasVarieties && (
                              <div
                                className={`mr-2 text-gray-500 hover:text-gray-700 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                              >
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {cuartel.cuartelNombre}
                              </div>
                              <div className="text-sm text-gray-500">{cuartel.superficie} hectáreas</div>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 py-4 w-1/6">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{cuartel.fecha}</span>
                          </div>
                        </div>
                        <div className="px-6 py-4 w-1/6">
                          <div>
                            <div className="font-medium text-gray-900">{cuartel.jornalesTotales.toFixed(2)} jornales</div>
                          </div>
                        </div>
                        <div className="px-6 py-4 w-1/6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                            {cuartel.rendimiento} qq/Ha
                          </span>
                        </div>
                        <div className="px-6 py-4 w-1/6">
                          <div className="flex items-center space-x-3">
                            {/* Botón para ver el reporte del cuartel */}
                            <button
                              className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(cuartel);
                              }}
                              title="Ver reporte del cuartel"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Ver Reporte
                            </button>

                            {/* Botón para expandir/colapsar variedades */}
                            {hasVarieties && (
                              <button
                                className="flex items-center px-3 py-1.5 text-xs text-gray-700 rounded hover:bg-gray-50 transition-colors"
                                onClick={(e) => toggleExpansion(cuartel.cuartelId, e)}
                                title={isExpanded ? "Ocultar variedades" : "Mostrar variedades"}
                              >
                                {isExpanded ?
                                  <ChevronDown className="h-5 w-5 ml-1" /> :
                                  <ChevronRight className="h-5 w-5 ml-1" />
                                }
                              </button>
                            )}
                          </div>
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