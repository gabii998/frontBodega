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

  async getIndicadores(report:ReporteResponse): Promise<IndicadoresDto> {
    const endpoint = report.tipoReporte === 'GENERAL' ? `/api/reportes/anio/${report.anio}/indicadores`:
    (report.tipoReporte === 'VARIEDAD'
      ? `/api/reportes/anio/${report.anio}/cuartel/${report.cuartel?.id}/variedad/${report.id}/indicadores`
      : `/api/reportes/anio/${report.anio}/cuartel/${report.id}/indicadores`);
    
    const response = await axios.get<IndicadoresDto>(endpoint);
    return response.data;
  },

  async updateIndicadores(
    report:ReporteResponse,
    indicadores: IndicadoresDto,
  ): Promise<IndicadoresDto> {
    const endpoint = report.id
      ? `/api/reportes/anio/${report.anio}/cuartel/${report.cuartel?.id}/variedad/${report.id}/indicadores`
      : `/api/reportes/anio/${report.anio}/cuartel/${report.cuartel?.id}/indicadores`;
    
    const response = await axios.put<IndicadoresDto>(endpoint, indicadores);
    return response.data;
  },

  async getVariedadDetalle(
    report:ReporteResponse
  ): Promise<DetalleVariedad> {
    const endpoint = report.tipoReporte === 'GENERAL' ? `/api/reportes/anio/${report.anio}/detalle` : 
    (report.tipoReporte === 'VARIEDAD'
    ? `/api/reportes/anio/${report.anio}/cuartel/${report.cuartel?.id}/variedad/${report.id}/detalle`
    : `/api/reportes/anio/${report.anio}/cuartel/${report.id}/detalle`)
    const response = await axios.get<DetalleVariedad>(endpoint);
    return response.data;
  }
};