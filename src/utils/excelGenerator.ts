import ExcelJS from 'exceljs';
import { Employee, ExcelTemplate } from '@/types';

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

  employees.forEach((employee, index) => {
    const currentRow = template.startRow + index;

    if (template.mapping.fullName) {
      const fullName = `${employee.last_name} ${employee.first_name} ${employee.middle_name || ''}`.trim();
      worksheet.getCell(template.mapping.fullName.replace(/\d+/, currentRow.toString())).value = fullName;
    }

    if (template.mapping.position) {
      worksheet.getCell(template.mapping.position.replace(/\d+/, currentRow.toString())).value = employee.position;
    }

    if (template.mapping.department) {
      worksheet.getCell(template.mapping.department.replace(/\d+/, currentRow.toString())).value = employee.department;
    }

    if (template.mapping.address) {
      worksheet.getCell(template.mapping.address.replace(/\d+/, currentRow.toString())).value = employee.address;
    }

    if (template.mapping.office) {
      const officePhone = `${employee.office}, ${employee.phone}`;
      worksheet.getCell(template.mapping.office.replace(/\d+/, currentRow.toString())).value = officePhone;
    }

    if (template.mapping.sudisLogin) {
      worksheet.getCell(template.mapping.sudisLogin.replace(/\d+/, currentRow.toString())).value = employee.sudis_login;
    }
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
