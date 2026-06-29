import { useState, useEffect } from 'react';
import { fmtNum } from '../utils/format';
import { Users, PenTool as Tool, ArrowLeft, BarChart, Edit, Download } from 'lucide-react';
import SummaryModal from './SummaryModal';
import ReportDetailProps from '../model/ReportDetailProps';
import DetalleVariedad from '../model/DetalleVariedad';
import ToastProps, { errorToast, successToast } from '../model/ToastProps';
import Toast from './Toast';
import { generateReportPDF } from '../utils/pdfGenerator';
import { reportService } from '../services/reportService';
import IndicadoresDto, { createIndicadores } from '../model/IndicadoresDto';
import TareaJornal from '../model/TareaJornal';
import { useFarm } from '../context/FarmContext';
import TableShimmer from './TableShimmer';

const ReportDetail = ({ report, onBack }: ReportDetailProps) => {
  const { activeFarm } = useFarm();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generalSummary, setGeneralSummary] = useState<IndicadoresDto>(createIndicadores);
  const [detalleVariedad, setDetalleVariedad] = useState<DetalleVariedad | null>(null);

  useEffect(() => {
    fetchDetalleVariedad();
    fetchIndicadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      generateReportPDF({
        report,
        detalleVariedad,
        generalSummary
      });
      setToast(successToast('PDF generado correctamente'));
    } catch {
      setToast(errorToast('Error al generar el PDF'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const fetchIndicadores = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getIndicadores(report,activeFarm?.id ?? -1);
      setGeneralSummary(response);
    } catch {
      setToast(errorToast('Error al cargar los indicadores'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetalleVariedad = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getVariedadDetalle(report,activeFarm?.id ?? -1);
      setDetalleVariedad(response);
    } catch {
      setToast(errorToast('No se pudieron cargar los datos detallados de la variedad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = async (newSummary: IndicadoresDto) => {
    setIsLoading(true);
    try {
      await reportService.updateIndicadores(report,newSummary,activeFarm?.id ?? -1);
      await fetchIndicadores();
      setToast(successToast('Indicadores actualizados correctamente'));
    } catch {
      setToast(errorToast('Error al guardar los indicadores'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryTable = (type: 'manual' | 'mecanica', summary: TareaJornal[] | null) => {
    const icon = type === 'manual' ? (
      <Users className="h-5 w-5 text-indigo-500" />
    ) : (
      <Tool className="h-5 w-5 text-orange-500" />
    );

    const title = type === 'manual' ? 'Tareas Manuales' : 'Tareas Mecánicas';
    const colorClass = type === 'manual' ? 'bg-indigo-50' : 'bg-orange-50';
    const totalTareas = (type === 'manual' ? detalleVariedad?.jornalesManuales : detalleVariedad?.jornalesMecanicos) ?? 0;
    const superficie = detalleVariedad?.superficie ?? 1;
    const totalPorHectarea = totalTareas / superficie;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className={`flex items-center gap-2 p-4 border-b border-gray-200 ${colorClass}`}>
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {summary == null || summary.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay tareas registradas
            </div>
          ) : (
            summary.map(task => (
              <div key={task.idTarea} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 w-1/3">{task.nombreTarea}</span>
                  <span className="text-sm text-gray-500 w-1/3 text-center block">
                    {fmtNum(task.jornales)} Jornales
                  </span>
                  <span className="text-sm text-gray-500 w-1/3 text-right block">
                    {fmtNum(task.jornales / superficie)} jornales/ha
                  </span>
                </div>

              </div>
            ))
          )}
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-900">Total Categoría</span>
              <span className="text-gray-900">
                {fmtNum(totalTareas)} Jornales
              </span>
              <span className="text-gray-900">
                {fmtNum(totalPorHectarea)} jornales/ha
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralSummary = (summary: IndicadoresDto) => {
    const jornalesProductivos = detalleVariedad?.jornalesTotales ?? 0;
    const totalProductivo = jornalesProductivos + summary.estructura;
    const jornalesPagados = totalProductivo + summary.jornalesNoProductivos;
    const superficie = detalleVariedad?.superficie ?? 1;

    const renderPerHaRow = (label: string, value: number) => (
      <div className="p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 w-1/3">{label}</span>
          <span className="text-gray-900 w-1/3 text-center block">
            {fmtNum(value)} jornales
          </span>
          <span className="text-gray-900 w-1/3 text-end block">
            {fmtNum(value / superficie)} jornales/ha
          </span>
        </div>
      </div>
    );

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
            className="edit-button"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {renderPerHaRow('Total General', jornalesProductivos)}
          {report.tipoReporte === 'GENERAL' && renderPerHaRow('Estructura', summary.estructura)}
          {report.tipoReporte === 'GENERAL' && renderPerHaRow('Total Productivo', totalProductivo)}
          {report.tipoReporte === 'GENERAL' && renderPerHaRow('Jornales No Productivos', summary.jornalesNoProductivos)}
          {report.tipoReporte === 'GENERAL' && renderPerHaRow('Jornal Pagado', jornalesPagados)}
          <div className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 w-1/3">Rendimiento</span>
              <span className="text-gray-900 w-2/3 text-end block">
                {fmtNum(summary.rendimiento)} qq/ha
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 w-1/3">Quintales por jornales</span>
              <span className="text-gray-900 w-2/3 text-end block">
                {fmtNum(summary.quintalPorJornal)} qq/Jor
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {report.nombre}
              {report.tipoReporte === 'VARIEDAD' && ' - '}
              {report.cuartel?.nombre}
            </h2>
            <p className="text-gray-500">Temporada {report.anio} - {parseInt(report.anio) + 1}</p>
          </div>
        </div>
        <div className="space-y-4">
          <TableShimmer columns={[50, 50]} rows={2} />
          <TableShimmer columns={[40, 30, 30]} rows={4} />
          <TableShimmer columns={[40, 30, 30]} rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <span className='flex w-1/2'>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {report.nombre}
              {report.tipoReporte == 'VARIEDAD' && ' - '}
              {report.cuartel?.nombre} 
            </h2>
            <p className="text-gray-500">
              Temporada {report.anio} - {parseInt(report.anio) + 1}
            </p>
          </div>
        </span>

        <span className='w-1/2 content-end inline-flex justify-end'>
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
        </span>


      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Hectáreas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {fmtNum(detalleVariedad?.superficie ?? 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Total Jornales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {fmtNum(
                  (detalleVariedad?.jornalesTotales ?? 0) +
                  (report.tipoReporte === 'GENERAL' ? generalSummary.estructura + generalSummary.jornalesNoProductivos : 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {renderCategoryTable('mecanica', detalleVariedad?.tareasMecanicas ?? [])}
          {renderCategoryTable('manual', detalleVariedad?.tareasManuales ?? [])}
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