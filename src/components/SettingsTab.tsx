import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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

  const fieldOptions: { value: FieldType; label: string; description: string }[] = [
    { value: 'full_name', label: 'ФИО полностью', description: 'Иванов Иван Иванович' },
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
    { value: 'office_and_phone', label: 'Кабинет и телефон', description: '101, +7 (495) 123-45-67' },
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
      fields: [],
      separator: ' '
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

  const toggleField = (mappingId: string, field: FieldType) => {
    setEditingTemplate(prev => ({
      ...prev,
      cellMappings: prev.cellMappings.map(m => {
        if (m.id !== mappingId) return m;
        const hasField = m.fields.includes(field);
        return {
          ...m,
          fields: hasField 
            ? m.fields.filter(f => f !== field)
            : [...m.fields, field]
        };
      })
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
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Ячейка Excel</Label>
                            <Input
                              placeholder="B15"
                              value={mapping.cell}
                              onChange={(e) => updateCellMapping(mapping.id, { cell: e.target.value })}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Разделитель</Label>
                            <Input
                              placeholder="пробел"
                              value={mapping.separator}
                              onChange={(e) => updateCellMapping(mapping.id, { separator: e.target.value })}
                              className="h-8"
                            />
                          </div>
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

                      <div>
                        <Label className="text-xs mb-2 block">Выберите поля для подстановки:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {fieldOptions.map((option) => (
                            <div key={option.value} className="flex items-start space-x-2">
                              <Checkbox
                                id={`${mapping.id}-${option.value}`}
                                checked={mapping.fields.includes(option.value)}
                                onCheckedChange={() => toggleField(mapping.id, option.value)}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`${mapping.id}-${option.value}`}
                                  className="text-xs font-medium cursor-pointer"
                                >
                                  {option.label}
                                </label>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {mapping.fields.length > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                          <span className="font-medium">Результат:</span>{' '}
                          <span className="text-gray-700">
                            {mapping.fields.map(f => fieldOptions.find(o => o.value === f)?.description).join(mapping.separator || ' ')}
                          </span>
                        </div>
                      )}
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
                  При выборе нескольких сотрудников каждый следующий будет в новой строке
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
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-green-100">
                        <Icon name="FileSpreadsheet" className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600">
                          {getRequestTypeLabel(template.requestType)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Стартовая строка: {template.startRow} • Ячеек: {template.cellMappings.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Удалить шаблон "${template.name}"?`)) {
                            onDeleteTemplate(template.id);
                          }
                        }}
                      >
                        <Icon name="Trash2" size={16} />
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
