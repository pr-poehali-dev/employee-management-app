import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Employee, ExcelTemplate, REQUESTS_API_URL } from '@/types';
import { generateExcelFromTemplate, downloadExcelFile } from '@/utils/excelGenerator';

interface CreateRequestWithTemplateDialogProps {
  selectedEmployees: number[];
  employees: Employee[];
  templates: ExcelTemplate[];
  onRequestCreated: () => void;
}

export function CreateRequestWithTemplateDialog({
  selectedEmployees,
  employees,
  templates,
  onRequestCreated
}: CreateRequestWithTemplateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateRequest = async () => {
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
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(REQUESTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          employee_ids: selectedEmployees,
          request_type: template.requestType,
          request_category: getRequestCategory(template.requestType),
          notes: `Сформировано по шаблону: ${template.name}`
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Не удалось создать заявку в базе');
      }

      const blob = await generateExcelFromTemplate(template, selectedEmployeesList);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${template.name}_${timestamp}.xlsx`;
      downloadExcelFile(blob, filename);

      alert(`Заявка создана! Сформировано документов: ${selectedEmployeesList.length}`);
      
      setIsOpen(false);
      setSelectedTemplate('');
      onRequestCreated();
      
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      alert('Ошибка при создании заявки');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRequestCategory = (requestType: string): string => {
    if (requestType.startsWith('visp')) return 'visp';
    if (requestType.startsWith('equipment')) return 'equipment';
    return 'systems';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedEmployees.length === 0 || templates.length === 0}>
          <Icon name="FilePlus" size={18} className="mr-2" />
          Сформировать заявку
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
          <Button 
            onClick={handleCreateRequest} 
            className="w-full" 
            disabled={!selectedTemplate || isProcessing}
          >
            {isProcessing ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Формирование...
              </>
            ) : (
              <>
                <Icon name="Download" size={16} className="mr-2" />
                Сформировать и скачать
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
