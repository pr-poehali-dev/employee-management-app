import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Employee, ExcelTemplate } from '@/types';
import { generateExcelFromTemplate, downloadExcelFile } from '@/utils/excelGenerator';

interface GenerateExcelDialogProps {
  selectedEmployees: number[];
  employees: Employee[];
  templates: ExcelTemplate[];
}

export function GenerateExcelDialog({
  selectedEmployees,
  employees,
  templates
}: GenerateExcelDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleGenerateExcel = async () => {
    if (!selectedTemplate) {
      alert('Выберите шаблон заявки');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      alert('Шаблон не найден');
      return;
    }

    if (!template.file) {
      alert('Файл шаблона не загружен');
      return;
    }

    const selectedEmployeesList = employees.filter(emp => selectedEmployees.includes(emp.id));
    
    try {
      const blob = await generateExcelFromTemplate(template, selectedEmployeesList);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${template.name}_${timestamp}.xlsx`;
      downloadExcelFile(blob, filename);
    } catch (error) {
      console.error('Ошибка генерации файла:', error);
      alert('Ошибка при генерации файла');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedEmployees.length === 0 || templates.length === 0}>
          <Icon name="FileSpreadsheet" size={18} className="mr-2" />
          Сформировать Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Формирование заявки</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Шаблон заявки</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите шаблон" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Выбранные сотрудники ({selectedEmployees.length})
            </label>
            <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm bg-gray-50">
              {selectedEmployees.map(id => {
                const employee = employees.find(e => e.id === id);
                return employee ? (
                  <div key={id} className="py-1">
                    {employee.last_name} {employee.first_name}
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <Button onClick={handleGenerateExcel} className="w-full" disabled={!selectedTemplate}>
            <Icon name="Download" size={16} className="mr-2" />
            Скачать заявку
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
