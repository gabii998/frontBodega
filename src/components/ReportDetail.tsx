import React, { useState, useEffect } from 'react';
import { Users, PenTool as Tool, ArrowLeft, BarChart, Edit } from 'lucide-react';
import SummaryModal from './SummaryModal';
import axios from 'axios';
import GeneralSummary from '../model/GeneralSummary';
import ReportDetailProps from '../model/ReportDetailProps';
import DetalleVariedad from '../model/DetalleVariedad';
import CategorySummary from '../model/CategorySummary';

const ReportDetail = ({ report, onBack }: ReportDetailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generalSummary, setGeneralSummary] = useState<GeneralSummary>({
    structure: 120,
    productiveTotal: report.totalWorkdays,
    nonProductiveWorkdays: Math.round(report.totalWorkdays * 0.06), // Aproximadamente 6% no productivos
    totalPaidWorkdays: Math.round(report.totalWorkdays * 1.06), // Total + no productivos
    performance: report.performance
  });

  // Estado para almacenar los datos específicos de la variedad cuando corresponda
  const [detalleVariedad, setDetalleVariedad] = useState<DetalleVariedad | null>(null);

  // Obtener los datos detallados para una variedad específica
  const fetchDetalleVariedad = async () => {
    if (!report.esVariedad || !report.variedadId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<DetalleVariedad>(`/api/reportes/anio/${report.date}/cuartel/${report.quarter.id}/variedad/${report.variedadId}`);
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
    console.log(report)
    if (report.esVariedad) {
      fetchDetalleVariedad();
    }
  }, [report.esVariedad, report.variedadId, report.quarter.id, report.date]);

  // Configuramos los datos de las tareas según si es un reporte general o de variedad
  const getTaskData = () => {
    // Si es una variedad específica y tenemos datos, usar esos datos
    if (report.esVariedad && detalleVariedad) {
      // Aquí usaríamos los datos específicos de la variedad para crear los summaries
      return {
        manual: {
          totalHours: detalleVariedad.jornalesManuales * 8,
          workdaysPerHectare: detalleVariedad.jornalesManuales / report.superficie!,
          tasks: detalleVariedad.tareasManuales?.map(tarea => ({
            taskId: tarea.idTarea,
            taskName: tarea.nombreTarea,
            totalHours: tarea.jornales * 8,
            workdaysPerHectare: tarea.jornales / report.superficie!
          })) || []
        },
        mechanical: {
          totalHours: detalleVariedad.jornalesMecanicos * 8,
          workdaysPerHectare: detalleVariedad.jornalesMecanicos / report.superficie!,
          tasks: detalleVariedad.tareasMecanicas?.map(tarea => ({
            taskId: tarea.idTarea,
            taskName: tarea.nombreTarea,
            totalHours: tarea.jornales * 8,
            workdaysPerHectare: tarea.jornales / report.superficie!
          })) || []
        }
      };
    }

    // Si es un reporte general o no tenemos datos específicos, usar los datos aproximados
    return {
      manual: {
        totalHours: report.manualWorkdays * 8, // Convertimos jornales a horas
        workdaysPerHectare: report.manualWorkdays / report.quarter.hectares,
        tasks: [
          {
            taskId: 1,
            taskName: 'Poda de formación',
            totalHours: report.manualWorkdays * 4, // 50% de las horas manuales
            workdaysPerHectare: (report.manualWorkdays / 2) / report.quarter.hectares
          },
          {
            taskId: 3,
            taskName: 'Cosecha manual',
            totalHours: report.manualWorkdays * 4, // 50% de las horas manuales
            workdaysPerHectare: (report.manualWorkdays / 2) / report.quarter.hectares
          }
        ]
      },
      mechanical: {
        totalHours: report.mechanicalWorkdays * 8, // Convertimos jornales a horas
        workdaysPerHectare: report.mechanicalWorkdays / report.quarter.hectares,
        tasks: [
          {
            taskId: 2,
            taskName: 'Riego por goteo',
            totalHours: report.mechanicalWorkdays * 8, // 100% de las horas mecánicas
            workdaysPerHectare: report.mechanicalWorkdays / report.quarter.hectares
          }
        ]
      }
    };
  };

  const taskData = getTaskData();
  const manualSummary: CategorySummary = taskData.manual;
  const mechanicalSummary: CategorySummary = taskData.mechanical;

  const handleSaveSummary = (newSummary: GeneralSummary) => {
    setGeneralSummary(newSummary);
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
                    {(task?.workdaysPerHectare ?? 0).toFixed(2)} jornales/ha
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total horas: {task.totalHours}</span>
                  <span>Total jornales: {(task.totalHours / 8).toFixed(1)}</span>
                </div>
              </div>
            ))
          )}
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-900">Total Categoría</span>
              <span className="text-gray-900">
                {(summary?.workdaysPerHectare ?? 0.00).toFixed(2)} jornales/ha
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
              <span>Total horas: {summary.totalHours}</span>
              <span>Total jornales: {((summary.totalHours ?? 0) / 8).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralSummary = (summary: GeneralSummary) => {
    const summaryFields: { key: keyof GeneralSummary; label: string; suffix: string }[] = [
      { key: 'structure', label: 'Estructura', suffix: 'jornales' },
      { key: 'productiveTotal', label: 'Total Productivos', suffix: 'jornales' },
      { key: 'nonProductiveWorkdays', label: 'Jornales No Productivos', suffix: 'jornales' },
      { key: 'totalPaidWorkdays', label: 'Total Jornales Pagados', suffix: 'jornales' },
      { key: 'performance', label: 'Rendimiento', suffix: '%' }
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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

  if (isLoading) {
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
              Cargando...
            </h2>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
              Error
            </h2>
          </div>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchDetalleVariedad}
            className="ml-2 text-red-700 font-semibold hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Superficie a mostrar: si es variedad específica, usar la superficie de la variedad
  const superficieAMostrar = report.esVariedad && report.superficie 
    ? report.superficie 
    : report.quarter.hectares;

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
            {report.quarter.name}
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
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Hectáreas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {superficieAMostrar}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jornales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {report.totalWorkdays}
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