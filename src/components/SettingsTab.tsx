import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { ExcelTemplate, requestTypes, FieldType, CellMapping } from '@/types';

interface SettingsTabProps {
  templates: ExcelTemplate[];
  onSaveTemplate: (template: ExcelTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const SettingsTab = ({ templates, onSaveTemplate, onDeleteTemplate }: SettingsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExcelTemplate>({
    id: '',
    name: '',
    requestType: 'eir-rmu',
    file: null,
    cellMappings: [],
    startRow: 15
  });

  const employeeFieldOptions: { value: FieldType; label: string; description: string }[] = [
    { value: 'last_name', label: 'Фамилия', description: 'Иванов' },
    { value: 'first_name', label: 'Имя', description: 'Иван' },
    { value: 'middle_name', label: 'Отчество', description: 'Иванович' },
    { value: 'position', label: 'Должность', description: 'Инженер-программист' },
    { value: 'rank', label: 'Звание', description: 'лейтенант полиции' },
    { value: 'service', label: 'Служба', description: 'ИТС' },
    { value: 'department', label: 'Отдел', description: 'ОИТ' },
    { value: 'address', label: 'Адрес', description: 'г. Москва, ул. Ленина, д. 1' },
    { value: 'office', label: 'Кабинет', description: '101' },
    { value: 'phone', label: 'Телефон', description: '+7 (495) 123-45-67' },
    { value: 'sudis_login', label: 'Логин СУДИС', description: 'ivanov_ii' },
    { value: 'official_email', label: 'Служебная почта', description: 'ivanov_ii@mvd.ru' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditingTemplate(prev => ({ ...prev, file }));
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.requestType) {
      alert('Заполните название и выберите тип заявки');
      return;
    }

    if (editingTemplate.cellMappings.length === 0) {
      alert('Добавьте хотя бы одну ячейку для маппинга');
      return;
    }

    const template: ExcelTemplate = {
      ...editingTemplate,
      id: editingTemplate.id || `template_${Date.now()}`
    };

    onSaveTemplate(template);
    setIsEditing(false);
    resetEditingTemplate();
  };

  const resetEditingTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      requestType: 'eir-rmu',
      file: null,
      cellMappings: [],
      startRow: 15
    });
  };

  const addCellMapping = () => {
    const newMapping: CellMapping = {
      id: `mapping_${Date.now()}`,
      cell: '',
      fieldType: 'employee',
      employeeFields: ['last_name']
    };
    setEditingTemplate(prev => ({
      ...prev,
      cellMappings: [...prev.cellMappings, newMapping]
    }));
  };

  const removeCellMapping = (mappingId: string) => {
    setEditingTemplate(prev => ({
      ...prev,
      cellMappings: prev.cellMappings.filter(m => m.id !== mappingId)
    }));
  };

  const updateCellMapping = (mappingId: string, updates: Partial<CellMapping>) => {
    setEditingTemplate(prev => ({
      ...prev,
      cellMappings: prev.cellMappings.map(m => 
        m.id === mappingId ? { ...m, ...updates } : m
      )
    }));
  };

  const handleEditTemplate = (template: ExcelTemplate) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const getRequestTypeLabel = (type: string) => {
    for (const category of Object.values(requestTypes)) {
      const subtype = category.subtypes.find(st => st.value === type);
      if (subtype) return subtype.label;
    }
    return type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
        <p className="text-gray-600">Управление шаблонами Excel-заявок</p>
      </div>

      {isEditing ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTemplate.id ? 'Редактирование шаблона' : 'Новый шаблон'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Название шаблона</Label>
              <Input
                id="template-name"
                placeholder="Например: Заявка ЕИР РМУ"
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="request-type">Тип заявки</Label>
              <Select 
                value={editingTemplate.requestType}
                onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, requestType: value }))}
              >
                <SelectTrigger id="request-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(requestTypes).map(category => 
                    category.subtypes.map(subtype => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        {subtype.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template-file">Файл шаблона (Excel)</Label>
              <Input
                id="template-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
              {editingTemplate.file && (
                <p className="text-sm text-gray-600 mt-1">
                  Загружен: {editingTemplate.file.name}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">Маппинг данных в ячейки</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Настройте, какие данные в какие ячейки подставлять
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={addCellMapping}>
                  <Icon name="Plus" size={14} className="mr-1" />
                  Добавить ячейку
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {editingTemplate.cellMappings.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Icon name="Table" size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Нажмите "Добавить ячейку" для настройки</p>
                  </div>
                ) : (
                  editingTemplate.cellMappings.map((mapping) => (
                    <Card key={mapping.id} className="p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Label className="text-xs">Ячейка Excel</Label>
                          <Input
                            placeholder="B15"
                            value={mapping.cell}
                            onChange={(e) => updateCellMapping(mapping.id, { cell: e.target.value })}
                            className="h-8 w-32"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCellMapping(mapping.id)}
                          className="ml-2"
                        >
                          <Icon name="Trash2" size={14} className="text-red-600" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <RadioGroup
                          value={mapping.fieldType}
                          onValueChange={(value: 'employee' | 'custom') => 
                            updateCellMapping(mapping.id, { 
                              fieldType: value,
                              employeeFields: value === 'employee' ? ['last_name'] : undefined,
                              customText: value === 'custom' ? '' : undefined
                            })
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="employee" id={`${mapping.id}-employee`} />
                            <Label htmlFor={`${mapping.id}-employee`} className="cursor-pointer">
                              Данные сотрудника
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id={`${mapping.id}-custom`} />
                            <Label htmlFor={`${mapping.id}-custom`} className="cursor-pointer">
                              Свой текст
                            </Label>
                          </div>
                        </RadioGroup>

                        {mapping.fieldType === 'employee' ? (
                          <div>
                            <Label className="text-xs mb-2 block">Поля сотрудника (можно выбрать несколько):</Label>
                            <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                              {employeeFieldOptions.map((option) => {
                                const isSelected = mapping.employeeFields?.includes(option.value) || false;
                                return (
                                  <div key={option.value} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`${mapping.id}-${option.value}`}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const currentFields = mapping.employeeFields || [];
                                        const newFields = e.target.checked
                                          ? [...currentFields, option.value]
                                          : currentFields.filter(f => f !== option.value);
                                        updateCellMapping(mapping.id, { employeeFields: newFields });
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor={`${mapping.id}-${option.value}`} className="cursor-pointer text-sm flex-1">
                                      <span className="font-medium">{option.label}</span>
                                      <span className="text-gray-500 ml-2 text-xs">({option.description})</span>
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                            {mapping.employeeFields && mapping.employeeFields.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Выбрано полей: {mapping.employeeFields.length}. Данные будут объединены через пробел.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Label className="text-xs mb-2 block">Текст для подстановки:</Label>
                            <Textarea
                              placeholder="Введите текст, который будет у каждого сотрудника"
                              value={mapping.customText || ''}
                              onChange={(e) => updateCellMapping(mapping.id, { customText: e.target.value })}
                              className="h-20 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Этот текст будет одинаковый для всех выбранных сотрудников
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Label htmlFor="start-row">Стартовая строка для данных</Label>
                <Input
                  id="start-row"
                  type="number"
                  placeholder="15"
                  value={editingTemplate.startRow}
                  onChange={(e) => setEditingTemplate(prev => ({
                    ...prev,
                    startRow: parseInt(e.target.value) || 15
                  }))}
                  className="w-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  При выборе нескольких сотрудников будет создана новая строка для каждого
                </p>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSaveTemplate}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                resetEditingTemplate();
              }}>
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div>
            <Button onClick={() => setIsEditing(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить шаблон
            </Button>
          </div>

          <Card className="p-6">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileSpreadsheet" size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Шаблоны не добавлены</p>
                <p className="text-sm text-gray-400 mt-1">
                  Добавьте первый шаблон Excel-заявки
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Тип: {getRequestTypeLabel(template.requestType)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Файл: {template.file?.name || 'не загружен'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ячеек: {template.cellMappings.length}, Стартовая строка: {template.startRow}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          if (confirm('Удалить шаблон?')) {
                            onDeleteTemplate(template.id);
                          }
                        }}
                      >
                        <Icon name="Trash2" size={14} className="mr-1 text-red-600" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};