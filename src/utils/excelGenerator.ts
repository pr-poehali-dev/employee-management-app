import ExcelJS from 'exceljs';
import { Employee, ExcelTemplate } from '@/types';
import { parseAndReplaceKeys, containsKeys } from './templateParser';

export const generateExcelFromTemplate = async (
  template: ExcelTemplate,
  employees: Employee[]
): Promise<Blob> => {
  const workbook = new ExcelJS.Workbook();

  if (template.file) {
    const arrayBuffer = await template.file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
  } else {
    throw new Error('Файл шаблона не найден');
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Лист Excel не найден');
  }

  const templateRows: Array<{
    rowIndex: number;
    cells: Array<{
      col: string;
      colNumber: number;
      value: any;
      style: any;
      border: any;
    }>;
    height: number | undefined;
  }> = [];

  let startRow = 0;
  worksheet.eachRow((row, rowIndex) => {
    const rowData: (typeof templateRows)[0] = {
      rowIndex,
      cells: [],
      height: row.height
    };

    let hasKeys = false;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const cellValue = cell.value?.toString() || '';
      
      if (containsKeys(cellValue)) {
        hasKeys = true;
        if (startRow === 0) {
          startRow = rowIndex;
        }
      }

      rowData.cells.push({
        col: ExcelJS.getExcelColumnName(colNumber),
        colNumber,
        value: cellValue,
        style: { ...cell.style },
        border: cell.border ? { ...cell.border } : undefined
      });
    });

    if (hasKeys) {
      templateRows.push(rowData);
    }
  });

  if (templateRows.length === 0 || startRow === 0) {
    throw new Error('В шаблоне не найдены ключи для подстановки данных');
  }

  const rowsToInsert = (employees.length - 1) * templateRows.length;
  
  if (rowsToInsert > 0) {
    const insertPosition = startRow + templateRows.length;
    for (let i = 0; i < rowsToInsert; i++) {
      worksheet.insertRow(insertPosition);
    }
  }

  employees.forEach((employee, employeeIndex) => {
    templateRows.forEach((templateRow, templateRowIndex) => {
      const currentRowIndex = startRow + (employeeIndex * templateRows.length) + templateRowIndex;
      const currentRow = worksheet.getRow(currentRowIndex);

      currentRow.height = templateRow.height;

      templateRow.cells.forEach((cellData) => {
        const cell = currentRow.getCell(cellData.colNumber);
        
        cell.style = cellData.style;
        cell.border = cellData.border;

        if (cellData.value && containsKeys(cellData.value)) {
          cell.value = parseAndReplaceKeys(cellData.value, employee);
        } else {
          cell.value = cellData.value;
        }
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
};

export const downloadExcelFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

ExcelJS.getExcelColumnName = function(colNumber: number): string {
  let columnName = '';
  while (colNumber > 0) {
    const remainder = (colNumber - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    colNumber = Math.floor((colNumber - 1) / 26);
  }
  return columnName;
};
