import React from 'react';
import { Users, PenTool as Tool, ArrowLeft, BarChart, ChevronRight, Calendar } from 'lucide-react';
import TableShimmer from './TableShimmer';
import ReportDetail from './ReportDetail';

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

const ReportsTable = () => {
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reports, setReports] = React.useState<Report[]>([
    {
      id: 1,
      quarter: { id: 1, name: 'Cuartel Norte', hectares: 5.5 },
      date: '2024-03-15',
      totalHours: 450,
      totalWorkdays: 56,
      manualWorkdays: 38,
      mechanicalWorkdays: 18,
      performance: 85
    },
    {
      id: 2,
      quarter: { id: 2, name: 'Cuartel Sur', hectares: 3.2 },
      date: '2024-03-15',
      totalHours: 320,
      totalWorkdays: 40,
      manualWorkdays: 25,
      mechanicalWorkdays: 15,
      performance: 82
    }
  ]);

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
    return (
      <ReportDetail
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reportes</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuartel
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
            {reports.map((report) => (
              <tr 
                key={report.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">{report.quarter.name}</div>
                      <div className="text-sm text-gray-500">{report.quarter.hectares} hectáreas</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{report.totalWorkdays} jornales</div>
                    <div className="text-sm text-gray-500">
                      {report.manualWorkdays} manuales, {report.mechanicalWorkdays} mecánicos
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.performance >= 85 
                      ? 'bg-green-100 text-green-800'
                      : report.performance >= 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {report.performance}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTable;