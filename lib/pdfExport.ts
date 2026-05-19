import { jsPDF } from 'jspdf';
import { GlucoseReading, InsulinDose } from './types';
import { formatDate, formatDateTime, formatTime } from './utils';

type PdfDocument = InstanceType<typeof jsPDF>;

const PDF_FONT_FILE = 'Amiri-Regular.ttf';
const PDF_FONT_FAMILY = 'Amiri';
const PDF_FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
let cachedFontBinary: string | null = null;

const PAGE = {
  marginX: 16,
  marginTop: 18,
  marginBottom: 18,
  lineHeight: 6,
};

function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function arrayBufferToBinaryString(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return binary;
}

async function ensurePdfFont(doc: PdfDocument) {
  if (!cachedFontBinary) {
    const response = await fetch(PDF_FONT_URL);
    if (!response.ok) {
      throw new Error(`Failed to load PDF font: ${response.status}`);
    }
    cachedFontBinary = arrayBufferToBinaryString(await response.arrayBuffer());
  }

  doc.addFileToVFS(PDF_FONT_FILE, cachedFontBinary);
  doc.addFont(PDF_FONT_FILE, PDF_FONT_FAMILY, 'normal', 'Identity-H');
  doc.setFont(PDF_FONT_FAMILY, 'normal');
}

function normalizePdfText(doc: PdfDocument, text: string) {
  return hasArabic(text) ? doc.processArabic(text) : text;
}

function getTextLines(doc: PdfDocument, text: string, width: number) {
  return doc.splitTextToSize(normalizePdfText(doc, text), width) as string[];
}

async function createDocument(title: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await ensurePdfFont(doc);
  let cursorY = PAGE.marginTop;

  doc.setFontSize(18);
  doc.setFont(PDF_FONT_FAMILY, 'normal');
  doc.text(normalizePdfText(doc, title), PAGE.marginX, cursorY);
  cursorY += 9;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(PAGE.marginX, cursorY, 210 - PAGE.marginX, cursorY);
  cursorY += 8;

  doc.setFontSize(10);
  doc.setFont(PDF_FONT_FAMILY, 'normal');

  return { doc, cursorY };
}

function ensureSpace(doc: PdfDocument, cursorY: number, requiredHeight = PAGE.lineHeight) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursorY + requiredHeight <= pageHeight - PAGE.marginBottom) {
    return cursorY;
  }

  doc.addPage();
  return PAGE.marginTop;
}

function writeLine(doc: PdfDocument, text: string, cursorY: number, options?: { indent?: number; bold?: boolean }) {
  const indent = options?.indent ?? 0;
  const width = doc.internal.pageSize.getWidth() - PAGE.marginX * 2 - indent;
  const lines = getTextLines(doc, text, width);
  let nextY = ensureSpace(doc, cursorY, lines.length * PAGE.lineHeight);

  doc.setFont(PDF_FONT_FAMILY, 'normal');
  doc.text(lines, PAGE.marginX + indent, nextY);
  return nextY + lines.length * PAGE.lineHeight;
}

function writeSectionTitle(doc: PdfDocument, title: string, cursorY: number) {
  let nextY = ensureSpace(doc, cursorY, 10);
  doc.setFont(PDF_FONT_FAMILY, 'normal');
  doc.setFontSize(12);
  doc.text(normalizePdfText(doc, title), PAGE.marginX, nextY);
  nextY += 2;
  doc.setDrawColor(203, 213, 225);
  doc.line(PAGE.marginX, nextY, 210 - PAGE.marginX, nextY);
  doc.setFontSize(10);
  return nextY + 5;
}

function saveDocument(doc: PdfDocument, filename: string) {
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

function writeTableHeader(doc: PdfDocument, cursorY: number, columns: { label: string; width: number }[]) {
  let nextY = ensureSpace(doc, cursorY, 10);
  let cursorX = PAGE.marginX;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setFont(PDF_FONT_FAMILY, 'normal');
  doc.rect(PAGE.marginX, nextY, columns.reduce((sum, column) => sum + column.width, 0), 8, 'FD');

  columns.forEach((column) => {
    doc.text(normalizePdfText(doc, column.label), cursorX + 2, nextY + 5.5);
    cursorX += column.width;
  });

  return nextY + 8;
}

function writeTableRow(doc: PdfDocument, cursorY: number, columns: { text: string; width: number }[]) {
  const linePadding = 2;
  const minRowHeight = 8;
  const columnLines = columns.map((column) => getTextLines(doc, column.text, column.width - 4));
  const maxLines = Math.max(...columnLines.map((lines) => Math.max(lines.length, 1)));
  const rowHeight = Math.max(minRowHeight, maxLines * PAGE.lineHeight + linePadding);
  let nextY = ensureSpace(doc, cursorY, rowHeight + 2);
  let cursorX = PAGE.marginX;

  if (nextY !== cursorY) {
    return { cursorY: nextY, pageBreak: true };
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFont(PDF_FONT_FAMILY, 'normal');

  columns.forEach((column, index) => {
    doc.rect(cursorX, nextY, column.width, rowHeight);
    const lines = columnLines[index];
    doc.text(lines, cursorX + 2, nextY + 5.5);
    cursorX += column.width;
  });

  return { cursorY: nextY + rowHeight, pageBreak: false };
}

function formatMealRelation(mealRelation: string) {
  return mealRelation.replaceAll('_', ' ');
}

function formatInsulinType(insulinType: string) {
  return insulinType.replaceAll('_', ' ');
}

function formatInsulinContext(doseContext?: string) {
  return (doseContext || 'random').replaceAll('_', ' ');
}

function groupReadingsByDay(readings: GlucoseReading[]) {
  return Object.entries(
    [...readings]
      .sort((left, right) => new Date(left.reading_time).getTime() - new Date(right.reading_time).getTime())
      .reduce<Record<string, GlucoseReading[]>>((groups, reading) => {
        const day = formatDate(reading.reading_time);
        if (!groups[day]) {
          groups[day] = [];
        }
        groups[day].push(reading);
        return groups;
      }, {})
  );
}

export async function generateGlucosePDF(readings: GlucoseReading[], filename = 'glucose-readings.pdf') {
  const { doc, cursorY: startY } = await createDocument('Blood Glucose Readings Report');
  const sortedReadings = [...readings].sort(
    (left, right) => new Date(left.reading_time).getTime() - new Date(right.reading_time).getTime()
  );
  const values = sortedReadings.map((reading) => reading.value);
  const average = values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  const minimum = values.length > 0 ? Math.min(...values) : 0;
  const maximum = values.length > 0 ? Math.max(...values) : 0;
  const groupedReadings = groupReadingsByDay(sortedReadings);

  let cursorY = startY;
  cursorY = writeLine(doc, `Generated: ${new Date().toLocaleString()}`, cursorY);
  cursorY = writeLine(doc, `Total readings: ${sortedReadings.length}`, cursorY);
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Summary', cursorY);
  cursorY = writeLine(doc, `Average: ${average} mg/dL`, cursorY);
  cursorY = writeLine(doc, `Minimum: ${minimum} mg/dL`, cursorY);
  cursorY = writeLine(doc, `Maximum: ${maximum} mg/dL`, cursorY);
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Detailed Readings', cursorY);
  if (sortedReadings.length === 0) {
    writeLine(doc, 'No glucose readings recorded.', cursorY);
  } else {
    const tableColumns = [
      { label: 'Time', width: 28 },
      { label: 'Value', width: 24 },
      { label: 'Status', width: 28 },
      { label: 'Meal', width: 54 },
      { label: 'Notes', width: 44 },
    ];

    groupedReadings.forEach(([day, dayReadings]) => {
      cursorY = writeLine(doc, day, cursorY, { bold: true });
      cursorY = writeTableHeader(doc, cursorY + 1, tableColumns);

      dayReadings.forEach((reading) => {
        const row = writeTableRow(doc, cursorY, [
          { text: formatTime(reading.reading_time), width: tableColumns[0].width },
          { text: `${reading.value} mg/dL`, width: tableColumns[1].width },
          { text: reading.status.toUpperCase(), width: tableColumns[2].width },
          { text: formatMealRelation(reading.meal_relation), width: tableColumns[3].width },
          { text: reading.notes.trim() || '-', width: tableColumns[4].width },
        ]);

        if (row.pageBreak) {
          cursorY = writeLine(doc, day, row.cursorY, { bold: true });
          cursorY = writeTableHeader(doc, cursorY + 1, tableColumns);
          const repeatedRow = writeTableRow(doc, cursorY, [
            { text: formatTime(reading.reading_time), width: tableColumns[0].width },
            { text: `${reading.value} mg/dL`, width: tableColumns[1].width },
            { text: reading.status.toUpperCase(), width: tableColumns[2].width },
            { text: formatMealRelation(reading.meal_relation), width: tableColumns[3].width },
            { text: reading.notes.trim() || '-', width: tableColumns[4].width },
          ]);
          cursorY = repeatedRow.cursorY;
        } else {
          cursorY = row.cursorY;
        }
      });

      cursorY += 4;
    });
  }

  saveDocument(doc, filename);
}

export async function generateInsulinPDF(doses: InsulinDose[], filename = 'insulin-doses.pdf') {
  const { doc, cursorY: startY } = await createDocument('Insulin Doses Report');
  const totalUnits = doses.reduce((sum, dose) => sum + dose.units, 0);
  const averageUnits = doses.length > 0 ? totalUnits / doses.length : 0;
  const rapidCount = doses.filter((dose) => dose.insulin_type === 'rapid_acting').length;
  const longCount = doses.filter((dose) => dose.insulin_type === 'long_acting').length;
  const mixedCount = doses.filter((dose) => dose.insulin_type === 'mixed').length;

  let cursorY = startY;
  cursorY = writeLine(doc, `Generated: ${new Date().toLocaleString()}`, cursorY);
  cursorY = writeLine(doc, `Total doses: ${doses.length}`, cursorY);
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Summary', cursorY);
  cursorY = writeLine(doc, `Total units: ${totalUnits.toFixed(2)}`, cursorY);
  cursorY = writeLine(doc, `Average per dose: ${averageUnits.toFixed(2)} units`, cursorY);
  cursorY = writeLine(doc, `Rapid acting doses: ${rapidCount}`, cursorY);
  cursorY = writeLine(doc, `Long acting doses: ${longCount}`, cursorY);
  cursorY = writeLine(doc, `Mixed doses: ${mixedCount}`, cursorY);
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Detailed Doses', cursorY);
  if (doses.length === 0) {
    writeLine(doc, 'No insulin doses recorded.', cursorY);
  } else {
    doses.forEach((dose, index) => {
      cursorY = writeLine(
        doc,
        `${index + 1}. ${dose.units.toFixed(2)} units of ${formatInsulinType(dose.insulin_type)}`,
        cursorY,
        { bold: true }
      );
      cursorY = writeLine(doc, `Context: ${formatInsulinContext(dose.dose_context)}`, cursorY, { indent: 4 });
      cursorY = writeLine(doc, `Time: ${formatDateTime(dose.dose_time)}`, cursorY, { indent: 4 });
      if (dose.notes.trim()) {
        cursorY = writeLine(doc, `Notes: ${dose.notes}`, cursorY, { indent: 4 });
      }
      cursorY += 2;
    });
  }

  saveDocument(doc, filename);
}

export async function generateComprehensiveReport(
  readings: GlucoseReading[],
  doses: InsulinDose[],
  filename = 'diabetes-report.pdf'
) {
  const { doc, cursorY: startY } = await createDocument('Diabetes Tracking Report');
  const timestamps = [
    ...readings.map((reading) => new Date(reading.reading_time).getTime()),
    ...doses.map((dose) => new Date(dose.dose_time).getTime()),
  ].filter((timestamp) => !Number.isNaN(timestamp));
  const reportPeriod =
    timestamps.length > 0
      ? `${new Date(Math.min(...timestamps)).toLocaleDateString()} - ${new Date(Math.max(...timestamps)).toLocaleDateString()}`
      : 'No data';

  const glucoseValues = readings.map((reading) => reading.value);
  const glucoseAverage =
    glucoseValues.length > 0 ? Math.round(glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length) : 0;
  const lowCount = readings.filter((reading) => reading.status === 'low').length;
  const normalCount = readings.filter((reading) => reading.status === 'normal').length;
  const highCount = readings.filter((reading) => reading.status === 'high').length;
  const groupedReadings = groupReadingsByDay(readings);

  const totalInsulinUnits = doses.reduce((sum, dose) => sum + dose.units, 0);
  const averageInsulinUnits = doses.length > 0 ? totalInsulinUnits / doses.length : 0;

  let cursorY = startY;
  cursorY = writeLine(doc, `Generated: ${new Date().toLocaleString()}`, cursorY);
  cursorY = writeLine(doc, `Report period: ${reportPeriod}`, cursorY);
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Blood Glucose Summary', cursorY);
  if (readings.length === 0) {
    cursorY = writeLine(doc, 'No glucose readings recorded.', cursorY);
  } else {
    cursorY = writeLine(doc, `Total readings: ${readings.length}`, cursorY);
    cursorY = writeLine(doc, `Average: ${glucoseAverage} mg/dL`, cursorY);
    cursorY = writeLine(doc, `Range: ${Math.min(...glucoseValues)} - ${Math.max(...glucoseValues)} mg/dL`, cursorY);
    cursorY = writeLine(doc, `Low readings: ${lowCount}`, cursorY);
    cursorY = writeLine(doc, `Normal readings: ${normalCount}`, cursorY);
    cursorY = writeLine(doc, `High readings: ${highCount}`, cursorY);
  }
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Insulin Summary', cursorY);
  if (doses.length === 0) {
    cursorY = writeLine(doc, 'No insulin doses recorded.', cursorY);
  } else {
    cursorY = writeLine(doc, `Total doses: ${doses.length}`, cursorY);
    cursorY = writeLine(doc, `Total units: ${totalInsulinUnits.toFixed(2)}`, cursorY);
    cursorY = writeLine(doc, `Average per dose: ${averageInsulinUnits.toFixed(2)} units`, cursorY);
    cursorY = writeLine(
      doc,
      `By type: rapid acting ${doses.filter((dose) => dose.insulin_type === 'rapid_acting').length}, long acting ${doses.filter((dose) => dose.insulin_type === 'long_acting').length}, mixed ${doses.filter((dose) => dose.insulin_type === 'mixed').length}`,
      cursorY
    );
  }
  cursorY += 2;

  cursorY = writeSectionTitle(doc, 'Glucose Readings by Day', cursorY);
  if (groupedReadings.length === 0) {
    cursorY = writeLine(doc, 'No glucose readings recorded.', cursorY);
  } else {
    const tableColumns = [
      { label: 'Time', width: 28 },
      { label: 'Value', width: 24 },
      { label: 'Status', width: 28 },
      { label: 'Meal', width: 54 },
      { label: 'Notes', width: 44 },
    ];

    groupedReadings.forEach(([day, dayReadings]) => {
      cursorY = writeLine(doc, day, cursorY, { bold: true });
      cursorY = writeTableHeader(doc, cursorY + 1, tableColumns);

      dayReadings.forEach((reading) => {
        const rowData = [
          { text: formatTime(reading.reading_time), width: tableColumns[0].width },
          { text: `${reading.value} mg/dL`, width: tableColumns[1].width },
          { text: reading.status.toUpperCase(), width: tableColumns[2].width },
          { text: formatMealRelation(reading.meal_relation), width: tableColumns[3].width },
          { text: reading.notes.trim() || '-', width: tableColumns[4].width },
        ];
        const row = writeTableRow(doc, cursorY, rowData);

        if (row.pageBreak) {
          cursorY = writeLine(doc, day, row.cursorY, { bold: true });
          cursorY = writeTableHeader(doc, cursorY + 1, tableColumns);
          cursorY = writeTableRow(doc, cursorY, rowData).cursorY;
        } else {
          cursorY = row.cursorY;
        }
      });

      cursorY += 4;
    });
  }

  cursorY = writeSectionTitle(doc, 'Recent Activity', cursorY);
  const recentReadings = [...readings]
    .sort((left, right) => new Date(right.reading_time).getTime() - new Date(left.reading_time).getTime())
    .slice(0, 5);
  const recentDoses = [...doses]
    .sort((left, right) => new Date(right.dose_time).getTime() - new Date(left.dose_time).getTime())
    .slice(0, 5);

  cursorY = writeLine(doc, 'Recent glucose readings:', cursorY, { bold: true });
  if (recentReadings.length === 0) {
    cursorY = writeLine(doc, 'No glucose readings recorded.', cursorY, { indent: 4 });
  } else {
    recentReadings.forEach((reading) => {
      cursorY = writeLine(
        doc,
        `${formatDateTime(reading.reading_time)} - ${reading.value} mg/dL (${reading.status})`,
        cursorY,
        { indent: 4 }
      );
    });
  }
  cursorY += 2;

  cursorY = writeLine(doc, 'Recent insulin doses:', cursorY, { bold: true });
  if (recentDoses.length === 0) {
    writeLine(doc, 'No insulin doses recorded.', cursorY, { indent: 4 });
  } else {
    recentDoses.forEach((dose) => {
      cursorY = writeLine(
        doc,
        `${formatDateTime(dose.dose_time)} - ${dose.units.toFixed(2)} units (${formatInsulinType(dose.insulin_type)}, ${formatInsulinContext(dose.dose_context)})`,
        cursorY,
        { indent: 4 }
      );
    });
  }

  saveDocument(doc, filename);
}
