import ExcelJS from 'exceljs';
import { Employee, ExcelTemplate, FieldType } from '@/types';

const getFieldValue = (employee: Employee, field: FieldType): string => {
  switch (field) {
    case 'full_name':
      return `${employee.last_name} ${employee.first_name} ${employee.middle_name || ''}`.trim();
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
    case 'office_and_phone':
      return `${employee.office}, ${employee.phone}`;
    case 'sudis_login':
      return employee.sudis_login;
    case 'official_email':
      return employee.official_email;
    default:
      return '';
  }
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
    const currentRow = template.startRow + employeeIndex;

    template.cellMappings.forEach((mapping) => {
      if (!mapping.cell || mapping.fields.length === 0) return;

      const values = mapping.fields.map(field => getFieldValue(employee, field));
      const separator = mapping.separator || ' ';
      const cellValue = values.filter(v => v).join(separator);

      const cellAddress = mapping.cell.replace(/\d+/, currentRow.toString());
      worksheet.getCell(cellAddress).value = cellValue;
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
