// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import DetalleVariedad from '../model/DetalleVariedad';
import GeneralSummary from '../model/GeneralSummary';
import CategorySummary from '../model/CategorySummary';
import Report from '../model/Report';

interface GeneratePDFParams {
    report: Report;
    detalleVariedad: DetalleVariedad | null;
    generalSummary: GeneralSummary;
    manualSummary: CategorySummary;
    mechanicalSummary: CategorySummary;
}

export const generateReportPDF = ({
    report,
    detalleVariedad,
    generalSummary,
    manualSummary,
    mechanicalSummary
}: GeneratePDFParams): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    const lineHeight = 7;
    const sectionSpacing = 10;

    // Helper para alinear texto a la derecha
    const addRightAlignedText = (
        doc: jsPDF,
        text: string,
        y: number,
        rightMargin: number = 20,
        fontSize: number = 10
    ) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        const pageWidth = doc.internal.pageSize.getWidth();
        const x = pageWidth - rightMargin - textWidth;
        doc.text(text, x, y);
    };

    // Helper para añadir texto con alineación justificada (izquierda y derecha)
    const addJustifiedText = (
        doc: jsPDF,
        leftText: string,
        rightText: string,
        y: number,
        leftMargin: number = 20,
        rightMargin: number = 20,
        fontSize: number = 10
    ) => {
        doc.setFontSize(fontSize);

        // Texto izquierdo
        doc.text(leftText, leftMargin, y);

        // Texto derecho
        const textWidth = doc.getTextWidth(rightText);
        const pageWidth = doc.internal.pageSize.getWidth();
        const x = pageWidth - rightMargin - textWidth;
        doc.text(rightText, x, y);
    };

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
        : report.quarter.superficieTotal;

    // Título del documento
    let nombreVariedad = '';

    addText(`Cuartel: ${report.quarter.nombre}`, 12, true);
    if (report.esVariedad && report.variedadNombre) {
        nombreVariedad = `Variedad: ${report.variedadNombre}`;
    } else {
        nombreVariedad = 'Resumen de cuartel';
    }

    addMultiAlignedText([
        { text: nombreVariedad, align: 'left' },
        { text: `Superficie: ${superficie} hectáreas`, align: 'right' }
    ], margin, margin, 12);

    addMultiAlignedText([
        { text: `Año: ${report.date}`, align: 'left' },
        { text: `${report.hileras ?? 0} hileras`, align: 'right' }
    ], margin, margin, 12);

    addSeparator();

    // Tareas Manuales
    if (manualSummary.tasks.length > 0) {
        addText('TAREAS MANUALES', 14, true);

        doc.setFont(undefined, 'normal');
        manualSummary.tasks.forEach(task => {
            addMultiAlignedText([
                { text: `${task.taskName}`, align: 'left' },
                { text: `${task.totalHours / 8}`, align: 'center' },
                { text: `${task.workdaysPerHectare.toFixed(2)}`, align: 'right' }
            ], margin, margin, 11);
            yPosition += 5;
        });

        doc.setFont(undefined, 'bold');
        addMultiAlignedText([
                { text: `Total Tareas Manuales`, align: 'left' },
                { text: `${(manualSummary.totalHours / 8).toFixed(1)}`, align: 'center' },
                { text: `${manualSummary.workdaysPerHectare?.toFixed(2) || '0.00'}`, align: 'right' }
            ], margin, margin, 11);
        yPosition += sectionSpacing;
    }
    addSeparator();
    // Tareas Mecánicas
    if (mechanicalSummary.tasks.length > 0) {
        addText('TAREAS MECÁNICAS', 14, true);

        doc.setFont(undefined, 'normal');
        mechanicalSummary.tasks.forEach(task => {
            addMultiAlignedText([
                { text: `${task.taskName}`, align: 'left' },
                { text: `${task.totalHours / 8}`, align: 'center' },
                { text: `${task.workdaysPerHectare.toFixed(2)}`, align: 'right' }
            ], margin, margin, 11);
            yPosition += 5;
        });

        doc.setFont(undefined, 'bold');
        addMultiAlignedText([
                { text: `Total Tareas Mecanicas`, align: 'left' },
                { text: `${((mechanicalSummary.totalHours / 8)).toFixed(1)}`, align: 'center' },
                { text: `${mechanicalSummary.workdaysPerHectare?.toFixed(2) || '0.00'}`, align: 'right' }
            ], margin, margin, 11);
        yPosition += sectionSpacing;
    }

    // Indicadores
    addSeparator();

    addText(`Total General: ${generalSummary.jornalesTotales} jornales`);

    if (!report.esVariedad) {
        addText(`Estructura: ${generalSummary.structure} jornales`);
        addText(`Total Productivos: ${generalSummary.productiveTotal} jornales`);
        addText(`Jornales No Productivos: ${generalSummary.nonProductiveWorkdays} jornales`);
        addText(`Total Jornales Pagados: ${generalSummary.totalPaidWorkdays} jornales`);
    }

    addText(`Rendimiento: ${generalSummary.performance} qq/ha`);
    addText(`Quintales por Jornal: ${generalSummary.quintalPorJornal} qq/Jor`);

    // Pie de página
    yPosition = 270;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const fechaGeneracion = new Date().toLocaleDateString('es-AR');
    doc.text(`Generado el: ${fechaGeneracion}`, margin, yPosition);

    // Nombre del archivo
    const fileName = `reporte_${report.quarter.nombre}_${report.date}${report.esVariedad ? `_${report.variedadNombre}` : ''}.pdf`;

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