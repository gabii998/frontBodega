import jsPDF from 'jspdf';
import DetalleVariedad from '../model/DetalleVariedad';
import IndicadoresDto from '../model/IndicadoresDto';
import { ReporteResponse } from '../model/ReporteCuartel';

interface GeneratePDFParams {
    report: ReporteResponse;
    detalleVariedad: DetalleVariedad | null;
    generalSummary: IndicadoresDto;
}

export const generateReportPDF = ({
    report,
    detalleVariedad,
    generalSummary
}: GeneratePDFParams): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    const lineHeight = 7;

    const addMultiAlignedText = (
        items: { text: string; align: 'left' | 'center' | 'right' }[],
        leftMargin: number = 20,
        rightMargin: number = 20,
        fontSize: number = 10
    ) => {
        doc.setFontSize(fontSize);
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - leftMargin - rightMargin;
        items.forEach(item => {
            const textWidth = doc.getTextWidth(item.text);
            let x: number;

            switch (item.align) {
                case 'left':
                    x = leftMargin;
                    break;
                case 'center':
                    x = leftMargin + (contentWidth / 2) - (textWidth / 2);
                    break;
                case 'right':
                    x = pageWidth - rightMargin - textWidth;
                    break;
            }

            doc.text(item.text, x, yPosition);
        });
        yPosition += lineHeight;
    };

    // Helper para añadir texto
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
            doc.setFont(undefined, 'bold');
        } else {
            doc.setFont(undefined, 'normal');
        }

        // Dividir texto largo en múltiples líneas
        const lines = doc.splitTextToSize(text, contentWidth);
        lines.forEach((line: string) => {
            if (yPosition > 270) { // Cerca del final de la página
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
        });
    };

    // Helper para añadir línea separadora
    const addSeparator = () => {
        yPosition += 5;
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
    };

    const superficie = report.esVariedad && detalleVariedad
        ? detalleVariedad.superficie
        : report.superficie;


    addText(`Cuartel: ${report.esVariedad ? report.cuartel?.nombre : report.nombre}`, 12, true);
    const nombreVariedad = report.esVariedad ? `Variedad: ${report.nombre}` : 'Resumen de cuartel';

    addMultiAlignedText([
        { text: nombreVariedad, align: 'left' },
        { text: `Superficie: ${superficie} hectáreas`, align: 'right' }
    ], margin, margin, 12);

    addMultiAlignedText([
        { text: `Año: ${report.anio}`, align: 'left' },
        { text: `${report.hileras ?? 0} hileras`, align: 'right' }
    ], margin, margin, 12);


    addSeparator();
    // Tareas Mecánicas
    if (detalleVariedad?.tareasMecanicas != null && detalleVariedad?.tareasMecanicas.length > 0) {
        addText('TAREAS MECÁNICAS', 14, true);

        doc.setFont(undefined, 'normal');
        detalleVariedad?.tareasMecanicas.forEach(task => {
            addMultiAlignedText([
                { text: `${task.nombreTarea}`, align: 'left' },
                { text: `${task.jornales}`, align: 'center' },
                { text: `${(task.jornales/(report.superficie ?? 1)).toFixed(2)}`, align: 'right' }
            ], margin, margin, 11);
            yPosition += 1;
        });

        doc.setFont(undefined, 'bold');
        addMultiAlignedText([
                { text: `Total Tareas Mecanicas`, align: 'left' },
                { text: `${detalleVariedad?.jornalesMecanicos.toFixed(2)}`, align: 'center' },
                { text: `${detalleVariedad.jornalesMecanicos?.toFixed(2) || '0.00'}`, align: 'right' }
            ], margin, margin, 11);
    }

    addSeparator();

    // Tareas Manuales
    if (detalleVariedad?.tareasManuales != null && detalleVariedad?.tareasManuales.length > 0) {
        addText('TAREAS MANUALES', 14, true);

        doc.setFont(undefined, 'normal');
        detalleVariedad?.tareasManuales.forEach(task => {
            addMultiAlignedText([
                { text: `${task.nombreTarea}`, align: 'left' },
                { text: `${task.jornales}`, align: 'center' },
                { text: `${(task.jornales/(report.superficie ?? 1)).toFixed(2)}`, align: 'right' }
            ], margin, margin, 11);
            yPosition += 1;
        });

        doc.setFont(undefined, 'bold');
        addMultiAlignedText([
                { text: `Total Tareas Manuales`, align: 'left' },
                { text: `${detalleVariedad?.jornalesManuales.toFixed(2)}`, align: 'center' },
                { text: `${detalleVariedad?.jornalesManuales.toFixed(2) || '0.00'}`, align: 'right' }
            ], margin, margin, 11);
    }
    

    // Indicadores
    addSeparator();

    addText(`Total General: ${detalleVariedad?.jornalesTotales} jornales`,11,true);

    // if (!report.esVariedad) {
    //     addText(`Estructura: ${generalSummary.structure} jornales`);
    //     addText(`Total Productivos: ${generalSummary.productiveTotal} jornales`);
    //     addText(`Jornales No Productivos: ${generalSummary.nonProductiveWorkdays} jornales`);
    //     addText(`Total Jornales Pagados: ${generalSummary.totalPaidWorkdays} jornales`);
    // }

    addText(`Rendimiento: ${generalSummary.rendimiento} qq/ha`,11,true);
    addText(`Quintales por Jornal: ${generalSummary.quintalPorJornal.toFixed(2)} qq/Jor`,11,true);

    // Pie de página
    yPosition = 270;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const fechaGeneracion = new Date().toLocaleDateString('es-AR');
    doc.text(`Generado el: ${fechaGeneracion}`, margin, yPosition);

    // Nombre del archivo
    const fileName = `reporte_${report.esVariedad ? report.cuartel?.nombre : report.nombre}_${report.anio}${report.esVariedad ? `_${report.nombre}` : ''}.pdf`;

    // Guardar el PDF
    doc.save(fileName);
};

// Función auxiliar para formatear tablas si la necesitas en el futuro
export const addTable = (
    doc: jsPDF,
    headers: string[],
    data: string[][],
    startY: number,
    options?: {
        cellWidth?: number;
        cellHeight?: number;
        fontSize?: number;
        headerBgColor?: { r: number; g: number; b: number };
    }
): number => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    const cellWidth = options?.cellWidth || contentWidth / headers.length;
    const cellHeight = options?.cellHeight || 10;
    const fontSize = options?.fontSize || 10;
    const headerBgColor = options?.headerBgColor || { r: 200, g: 200, b: 200 };

    let currentY = startY;

    doc.setFontSize(fontSize);

    // Headers
    doc.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
    headers.forEach((header, index) => {
        doc.rect(margin + (index * cellWidth), currentY, cellWidth, cellHeight, 'FD');
        doc.text(header, margin + (index * cellWidth) + 2, currentY + 7);
    });

    currentY += cellHeight;

    // Data rows
    data.forEach(row => {
        row.forEach((cell, index) => {
            doc.rect(margin + (index * cellWidth), currentY, cellWidth, cellHeight, 'D');
            doc.text(cell, margin + (index * cellWidth) + 2, currentY + 7);
        });
        currentY += cellHeight;
    });

    return currentY;
};