import { ExcelTemplate, CellMapping } from '@/types';

interface StoredTemplate extends Omit<ExcelTemplate, 'file'> {
  fileData?: string;
  fileName?: string;
}

const migrateOldCellMapping = (mapping: any): CellMapping => {
  if (mapping.fieldType && mapping.employeeFields) {
    return mapping as CellMapping;
  }

  if (mapping.fieldType && mapping.employeeField) {
    return {
      id: mapping.id,
      cell: mapping.cell,
      fieldType: 'employee',
      employeeFields: [mapping.employeeField]
    };
  }

  if (mapping.fields && Array.isArray(mapping.fields)) {
    return {
      id: mapping.id,
      cell: mapping.cell,
      fieldType: 'employee',
      employeeFields: mapping.fields
    };
  }

  return {
    id: mapping.id || `mapping_${Date.now()}`,
    cell: mapping.cell || '',
    fieldType: 'employee',
    employeeFields: ['last_name']
  };
};

export const saveTemplateToStorage = async (template: ExcelTemplate): Promise<void> => {
  const templates = getTemplatesFromStorage();
  
  const storedTemplate: StoredTemplate = {
    id: template.id,
    name: template.name,
    requestType: template.requestType,
    cellMappings: template.cellMappings,
    startRow: template.startRow
  };

  if (template.file) {
    const arrayBuffer = await template.file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    storedTemplate.fileData = base64;
    storedTemplate.fileName = template.file.name;
  }

  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = storedTemplate;
  } else {
    templates.push(storedTemplate);
  }

  localStorage.setItem('excelTemplates', JSON.stringify(templates));
};

export const getTemplatesFromStorage = (): StoredTemplate[] => {
  const data = localStorage.getItem('excelTemplates');
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const loadTemplatesFromStorage = async (): Promise<ExcelTemplate[]> => {
  const storedTemplates = getTemplatesFromStorage();
  
  return Promise.all(storedTemplates.map(async (stored) => {
    let file: File | null = null;
    
    if (stored.fileData && stored.fileName) {
      const binaryString = atob(stored.fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      file = new File([blob], stored.fileName, { type: blob.type });
    }

    const migratedMappings = stored.cellMappings.map(migrateOldCellMapping);

    return {
      id: stored.id,
      name: stored.name,
      requestType: stored.requestType,
      cellMappings: migratedMappings,
      startRow: stored.startRow,
      file
    };
  }));
};

export const deleteTemplateFromStorage = (templateId: string): void => {
  const templates = getTemplatesFromStorage();
  const updated = templates.filter(t => t.id !== templateId);
  localStorage.setItem('excelTemplates', JSON.stringify(updated));
};