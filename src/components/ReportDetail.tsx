import React from 'react';
import { Users, PenTool as Tool, ArrowLeft, BarChart, Edit } from 'lucide-react';
import SummaryModal from './SummaryModal';

interface Quarter {
  id: number;
  name: string;
  hectares: number;
}

interface Report {
  id: number;
  quarter: Quarter;
  date: string;
  totalHours: number;
  totalWorkdays: number;
  manualWorkdays: number;
  mechanicalWorkdays: number;
  performance: number;
}

interface TaskSummary {
  taskId: number;
  taskName: string;
  totalHours: number;
  workdaysPerHectare: number;
}

interface CategorySummary {
  totalHours: number;
  workdaysPerHectare: number;
  tasks: TaskSummary[];
}

interface GeneralSummary {
  structure: number;
  productiveTotal: number;
  nonProductiveWorkdays: number;
  totalPaidWorkdays: number;
  performance: number;
}

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
}

const ReportDetail = ({ report, onBack }: ReportDetailProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [generalSummary, setGeneralSummary] = React.useState<GeneralSummary>({
    structure: 120,
    productiveTotal: 450,
    nonProductiveWorkdays: 30,
    totalPaidWorkdays: 480,
    performance: report.performance
  });

  const manualSummary: CategorySummary = {
    totalHours: 300,
    workdaysPerHectare: 30,
    tasks: [
      {
        taskId: 1,
        taskName: 'Poda de formación',
        totalHours: 150,
        workdaysPerHectare: 15
      },
      {
        taskId: 3,
        taskName: 'Cosecha manual',
        totalHours: 150,
        workdaysPerHectare: 15
      }
    ]
  };

  const mechanicalSummary: CategorySummary = {
    totalHours: 150,
    workdaysPerHectare: 15,
    tasks: [
      {
        taskId: 2,
        taskName: 'Riego por goteo',
        totalHours: 150,
        workdaysPerHectare: 15
      }
    ]
  };

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
          {summary.tasks.map(task => (
            <div key={task.taskId} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{task.taskName}</span>
                <span className="text-sm text-gray-500">
                  {task.workdaysPerHectare.toFixed(2)} jornales/ha
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total horas: {task.totalHours}</span>
                <span>Total jornales: {(task.totalHours / 8).toFixed(1)}</span>
              </div>
            </div>
          ))}
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-900">Total Categoría</span>
              <span className="text-gray-900">
                {summary.workdaysPerHectare.toFixed(2)} jornales/ha
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
              <span>Total horas: {summary.totalHours}</span>
              <span>Total jornales: {(summary.totalHours / 8).toFixed(1)}</span>
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
          </h2>
          <p className="text-gray-500">
            Reporte del {new Date(report.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Hectáreas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {report.quarter.hectares}
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