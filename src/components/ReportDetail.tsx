import { useState, useEffect } from 'react';
import { Users, PenTool as Tool, ArrowLeft, BarChart, Edit, Download } from 'lucide-react';
import SummaryModal from './SummaryModal';
import axios from 'axios';
import GeneralSummary from '../model/GeneralSummary';
import ReportDetailProps from '../model/ReportDetailProps';
import DetalleVariedad from '../model/DetalleVariedad';
import CategorySummary from '../model/CategorySummary';
import TaskSummary from '../model/TaskSummary';
import SummaryFields from '../model/SummaryFields';
import ToastProps from '../model/ToastProps';
import Toast from './Toast';
import IndicadoresDto from '../model/IndicadoresDto';
import { generateReportPDF } from '../utils/pdfGenerator';

const ReportDetail = ({ report, onBack }: ReportDetailProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [generalSummary, setGeneralSummary] = useState<GeneralSummary>({
    jornalesTotales: report.totalWorkdays,
    structure: 0,
    productiveTotal: report.totalWorkdays,
    nonProductiveWorkdays: Math.round(report.totalWorkdays * 0.06), // Aproximadamente 6% no productivos
    totalPaidWorkdays: Math.round(report.totalWorkdays * 1.06), // Total + no productivos
    performance: report.performance,
    quintalPorJornal: 0
  });

  // Estado para almacenar los datos específicos de la variedad cuando corresponda
  const [detalleVariedad, setDetalleVariedad] = useState<DetalleVariedad | null>(null);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      generateReportPDF({
        report,
        detalleVariedad,
        generalSummary,
        manualSummary,
        mechanicalSummary
      });
      
      setToast({
        type: 'success',
        message: 'PDF generado correctamente'
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setToast({
        type: 'error',
        message: 'Error al generar el PDF'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const fetchIndicadores = async () => {
    if (!report.quarter.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Determinar el endpoint según si es cuartel o variedad
      const endpoint = report.esVariedad && report.variedadId
        ? `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/variedad/${report.variedadId}/indicadores`
        : `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/indicadores`;

      const response = await axios.get<IndicadoresDto>(endpoint);

      if (response.data) {
        setGeneralSummary({
          jornalesTotales: report.totalWorkdays,
          structure: response.data.estructura,
          productiveTotal: response.data.totalProductivo,
          nonProductiveWorkdays: response.data.jornalesNoProductivos,
          totalPaidWorkdays: response.data.jornalesPagados,
          performance: response.data.rendimiento,
          quintalPorJornal: response.data.quintalPorJornal
        });
      }
    } catch (err) {
      console.error('Error al cargar indicadores:', err);

      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Si no hay indicadores guardados, usar valores por defecto calculados
        const calculatedSummary = calculateDefaultIndicadores();
        setGeneralSummary(calculatedSummary);
      } else {
        setError('Error al cargar los indicadores');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDefaultIndicadores = (): GeneralSummary => {
    const totalJornales = report.totalWorkdays;
    const estructura = Math.round(totalJornales * 0.02); // Aproximadamente 2% para estructura
    const jornalesNoProductivos = Math.round(totalJornales * 0.06); // Aproximadamente 6% no productivos
    const jornalesPagados = totalJornales + jornalesNoProductivos + estructura;
    const productiveTotal = totalJornales;

    // Calcular quintales por jornal basándose en el rendimiento
    // Asumiendo que el rendimiento está en qq/ha y tenemos los jornales/ha
    const jornalesPorHectarea = report.superficie ? totalJornales / report.superficie : 0;
    const quintalPorJornal = jornalesPorHectarea > 0 ? report.performance / jornalesPorHectarea : 0;

    return {
      jornalesTotales: totalJornales,
      structure: estructura,
      productiveTotal: productiveTotal,
      nonProductiveWorkdays: jornalesNoProductivos,
      totalPaidWorkdays: jornalesPagados,
      performance: report.performance,
      quintalPorJornal: Number(quintalPorJornal.toFixed(2))
    };
  };

  // Obtener los datos detallados para una variedad específica
  const fetchDetalleVariedad = async () => {
    if (!report.esVariedad || !report.variedadId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usar el nuevo endpoint para obtener detalles completos
      const response = await axios.get<DetalleVariedad>(
        `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/variedad/${report.variedadId}/detalle`
      );
      setDetalleVariedad(response.data);
    } catch (err) {
      console.error('Error al cargar datos de variedad:', err);
      setError('No se pudieron cargar los datos detallados de la variedad');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos de la variedad al montar el componente si corresponde
  useEffect(() => {
    if (report.esVariedad && report.variedadId) {
      fetchDetalleVariedad();
    }
    fetchIndicadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  // Configuramos los datos de las tareas según si es un reporte general o de variedad
  const getTaskData = (): { manual: CategorySummary; mechanical: CategorySummary } => {
    // Si es una variedad específica y tenemos datos, usar esos datos
    if (report.esVariedad && detalleVariedad) {
      const superficie = detalleVariedad.superficie || 1;

      // Crear summaries para tareas manuales
      const manualTasks: TaskSummary[] = detalleVariedad.tareasManuales.map(tarea => ({
        taskId: tarea.idTarea,
        taskName: tarea.nombreTarea,
        totalHours: tarea.jornales * 8,
        workdaysPerHectare: tarea.jornales / superficie
      }));

      // Crear summaries para tareas mecánicas
      const mechanicalTasks: TaskSummary[] = detalleVariedad.tareasMecanicas.map(tarea => ({
        taskId: tarea.idTarea,
        taskName: tarea.nombreTarea,
        totalHours: tarea.jornales * 8,
        workdaysPerHectare: tarea.jornales / superficie
      }));

      return {
        manual: {
          totalHours: detalleVariedad.jornalesManuales * 8,
          workdaysPerHectare: detalleVariedad.jornalesManuales / superficie,
          tasks: manualTasks
        },
        mechanical: {
          totalHours: detalleVariedad.jornalesMecanicos * 8,
          workdaysPerHectare: detalleVariedad.jornalesMecanicos / superficie,
          tasks: mechanicalTasks
        }
      };
    }

    // Si es un reporte general o no tenemos datos específicos, usar los datos aproximados
    const superficie = report.quarter.superficieTotal || 1;

    return {
      manual: {
        totalHours: report.manualWorkdays * 8,
        workdaysPerHectare: report.manualWorkdays / superficie,
        tasks: [
          {
            taskId: 1,
            taskName: 'Poda de formación',
            totalHours: report.manualWorkdays * 4,
            workdaysPerHectare: (report.manualWorkdays / 2) / superficie
          },
          {
            taskId: 3,
            taskName: 'Cosecha manual',
            totalHours: report.manualWorkdays * 4,
            workdaysPerHectare: (report.manualWorkdays / 2) / superficie
          }
        ]
      },
      mechanical: {
        totalHours: report.mechanicalWorkdays * 8,
        workdaysPerHectare: report.mechanicalWorkdays / superficie,
        tasks: [
          {
            taskId: 2,
            taskName: 'Riego por goteo',
            totalHours: report.mechanicalWorkdays * 8,
            workdaysPerHectare: report.mechanicalWorkdays / superficie
          }
        ]
      }
    };
  };

  const taskData = getTaskData();
  const manualSummary: CategorySummary = taskData.manual;
  const mechanicalSummary: CategorySummary = taskData.mechanical;

  const handleSaveSummary = async (newSummary: GeneralSummary) => {
    setIsLoading(true);
    setError(null);

    try {
      // Determinar si es un reporte de cuartel o de variedad
      const endpoint = report.esVariedad && report.variedadId
        ? `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/variedad/${report.variedadId}/indicadores`
        : `/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/indicadores`;

      // Crear el objeto de datos que se enviará al backend
      const indicadoresData = {
        estructura: newSummary.structure,
        totalProductivo: newSummary.productiveTotal,
        jornalesNoProductivos: newSummary.nonProductiveWorkdays,
        jornalesPagados: newSummary.totalPaidWorkdays,
        rendimiento: newSummary.performance,
        quintalPorJornal: newSummary.quintalPorJornal
      };

      // Enviar los datos al backend
      const response = await axios.put(endpoint, indicadoresData);

      if (response.data) {
        // Actualizar el estado local con los nuevos datos
        setGeneralSummary(newSummary);

        // Mostrar mensaje de éxito
        setToast({
          type: 'success',
          message: 'Indicadores actualizados correctamente'
        });
      }
    } catch (err) {
      console.error('Error al guardar los indicadores:', err);

      // Manejar diferentes tipos de errores
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('No se encontró el reporte para actualizar');
        } else if (err.response?.status === 400) {
          setError('Datos inválidos. Por favor verifique los valores ingresados');
        } else {
          setError(err.response?.data?.message || 'Error al guardar los indicadores');
        }
      } else {
        setError('Error al conectar con el servidor');
      }

      setToast({
        type: 'error',
        message: 'Error al guardar los indicadores'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryTable = (type: 'manual' | 'mecanica', summary: CategorySummary) => {
    const icon = type === 'manual' ? (
      <Users className="h-5 w-5 text-indigo-500" />
    ) : (
      <Tool className="h-5 w-5 text-orange-500" />
    );

    const title = type === 'manual' ? 'Tareas Manuales' : 'Tareas Mecánicas';
    const colorClass = type === 'manual' ? 'bg-indigo-50' : 'bg-orange-50';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className={`flex items-center gap-2 p-4 border-b border-gray-200 ${colorClass}`}>
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {summary.tasks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay tareas registradas
            </div>
          ) : (
            summary.tasks.map(task => (
              <div key={task.taskId} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{task.taskName}</span>
                  <span className="text-sm text-gray-500">
                    {task.workdaysPerHectare.toFixed(2)} jornales/ha
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total jornales: {(task.totalHours / 8).toFixed(1)}</span>
                </div>
              </div>
            ))
          )}
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-900">Total Categoría</span>
              <span className="text-gray-900">
                {summary.workdaysPerHectare?.toFixed(2) || "0.00"} jornales/ha
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
              <span>Total jornales: {((summary.totalHours || 0) / 8).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralSummary = (summary: GeneralSummary) => {
    const summaryFields: SummaryFields[] = [
      { key: 'jornalesTotales', label: 'Total General', suffix: 'jornales' },
      ...(!report.esVariedad ? [
        { key: 'structure', label: 'Estructura', suffix: 'jornales' } as SummaryFields,
        { key: 'productiveTotal', label: 'Total Productivos', suffix: 'jornales' } as SummaryFields,
        { key: 'nonProductiveWorkdays', label: 'Jornales No Productivos', suffix: 'jornales' } as SummaryFields,
        { key: 'totalPaidWorkdays', label: 'Total Jornales Pagados', suffix: 'jornales' } as SummaryFields
      ] : []),
      { key: 'performance', label: 'Rendimiento', suffix: 'qq/ha' },
      { key: 'quintalPorJornal', label: 'Quintales por jornales', suffix: 'qq/Jor' }
    ];




    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Indicadores</h3>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {summaryFields.map(({ key, label, suffix }) => (
            <div key={key} className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{label}</span>
                <span className="text-gray-900">
                  {summary[key]} {suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {report.quarter.nombre}
            {report.esVariedad && report.variedadNombre && (
              <span className="text-lg font-normal ml-2">
                - {report.variedadNombre}
              </span>
            )}
          </h2>
          <p className="text-gray-500">
            Reporte del año {report.date}
          </p>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Exportar PDF
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Hectáreas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {report.esVariedad && detalleVariedad
                  ? detalleVariedad.superficie
                  : report.quarter.superficieTotal}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jornales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {report.esVariedad && detalleVariedad
                  ? detalleVariedad.jornalesTotales
                  : report.totalWorkdays}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {renderCategoryTable('manual', manualSummary)}
          {renderCategoryTable('mecanica', mechanicalSummary)}
          {renderGeneralSummary(generalSummary)}
        </div>
      </div>

      <SummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSummary}
        summary={generalSummary}
      />
    </div>
  );
};

export default ReportDetail;