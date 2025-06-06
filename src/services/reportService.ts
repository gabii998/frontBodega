import axios from 'axios';
import IndicadoresDto from '../model/IndicadoresDto';
import DetalleVariedad from '../model/DetalleVariedad';
import { ReporteResponse } from '../model/ReporteCuartel';

export const reportService = {
  async getByYear(year: number, fincaId: number): Promise<ReporteResponse[]> {
    const response = await axios.get<ReporteResponse[]>(
      `/api/reportes/anio/${year}/finca/${fincaId}`
    );
    return response.data;
  },

  async getIndicadores(report: ReporteResponse,fincaId:number): Promise<IndicadoresDto> {
    const endpoint = `${this.getUrl(report,fincaId)}/indicadores`;
    const response = await axios.get<IndicadoresDto>(endpoint);
    return response.data;
  },

  async updateIndicadores(
    report: ReporteResponse,
    indicadores: IndicadoresDto,
    fincaId:number
  ): Promise<IndicadoresDto> {
    const url = `${this.getUrl(report,fincaId)}/indicadores`;
    const response = await axios.put<IndicadoresDto>(url, indicadores);
    return response.data;
  },

  async getVariedadDetalle(
    report: ReporteResponse,
    fincaId:number
  ): Promise<DetalleVariedad> {
    const endpoint = `${this.getUrl(report,fincaId)}/detalle`;
    const response = await axios.get<DetalleVariedad>(endpoint);
    return response.data;
  },
  getUrl(report:ReporteResponse,fincaId:number):string {
    switch (report.tipoReporte) {
      case 'GENERAL':
        return `/api/reportes/anio/${report.anio}/finca/${fincaId}`
      case 'VARIEDAD':
        return `/api/reportes/anio/${report.anio}/finca/${fincaId}/cuartel/${report.cuartel?.id}/variedad/${report.id}`
    
      case 'CUARTEL':
        return `/api/reportes/anio/${report.anio}/finca/${fincaId}/cuartel/${report.id}`
       
      case 'ESPALDERO':
        return `/api/reportes/anio/${report.anio}/finca/${fincaId}/espaldero`

      case 'PARRAL':
        return `/api/reportes/anio/${report.anio}/finca/${fincaId}/parral`
      default:
        return ''
    }
  }
};