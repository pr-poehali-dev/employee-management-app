import ExcelJS from 'exceljs';
import { Employee, ExcelTemplate, FieldType } from '@/types';

const getFieldValue = (employee: Employee, field: FieldType): string => {
  switch (field) {
    case 'last_name':
      return employee.last_name;
    case 'first_name':
      return employee.first_name;
    case 'middle_name':
      return employee.middle_name || '';
    case 'position':
      return employee.position;
    case 'rank':
      return employee.rank;
    case 'service':
      return employee.service;
    case 'department':
      return employee.department;
    case 'address':
      return employee.address;
    case 'office':
      return employee.office;
    case 'phone':
      return employee.phone;
    case 'sudis_login':
      return employee.sudis_login;
    case 'official_email':
      return employee.official_email;
    default:
      return '';
  }
};

const parseCellAddress = (cell: string): { col: string; row: number } => {
  const match = cell.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell address: ${cell}`);
  return { col: match[1], row: parseInt(match[2]) };
};

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

  employees.forEach((employee, employeeIndex) => {
    if (employeeIndex > 0) {
      worksheet.insertRow(template.startRow + employeeIndex);
      
      const sourceRow = worksheet.getRow(template.startRow + employeeIndex - 1);
      const targetRow = worksheet.getRow(template.startRow + employeeIndex);
      
      sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const targetCell = targetRow.getCell(colNumber);
        targetCell.style = { ...cell.style };
        targetCell.border = cell.border ? { ...cell.border } : undefined;
      });
      
      targetRow.height = sourceRow.height;
    }

    const currentRow = template.startRow + employeeIndex;

    template.cellMappings.forEach((mapping) => {
      if (!mapping.cell) return;

      const { col } = parseCellAddress(mapping.cell);
      const cellAddress = `${col}${currentRow}`;
      const cell = worksheet.getCell(cellAddress);

      if (mapping.fieldType === 'custom' && mapping.customText) {
        cell.value = mapping.customText;
      } else if (mapping.fieldType === 'employee' && mapping.employeeFields) {
        const values = mapping.employeeFields
          .map(field => getFieldValue(employee, field))
          .filter(val => val.trim() !== '');
        cell.value = values.join(' ');
      }
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