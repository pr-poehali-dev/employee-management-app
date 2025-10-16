import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { ExcelTemplate, requestTypes } from '@/types';

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
    mapping: {},
    startRow: 15
  });

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

    const template: ExcelTemplate = {
      ...editingTemplate,
      id: editingTemplate.id || `template_${Date.now()}`
    };

    onSaveTemplate(template);
    setIsEditing(false);
    setEditingTemplate({
      id: '',
      name: '',
      requestType: 'eir-rmu',
      file: null,
      mapping: {},
      startRow: 15
    });
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
              <h3 className="font-semibold mb-3">Маппинг данных в ячейки</h3>
              <p className="text-sm text-gray-600 mb-4">
                Укажите, в какие ячейки Excel нужно подставлять данные сотрудника
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cell-fullname">ФИО (например: B15)</Label>
                  <Input
                    id="cell-fullname"
                    placeholder="B15"
                    value={editingTemplate.mapping.fullName || ''}
                    onChange={(e) => setEditingTemplate(prev => ({
                      ...prev,
                      mapping: { ...prev.mapping, fullName: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="cell-position">Должность (например: C15)</Label>
                  <Input
                    id="cell-position"
                    placeholder="C15"
                    value={editingTemplate.mapping.position || ''}
                    onChange={(e) => setEditingTemplate(prev => ({
                      ...prev,
                      mapping: { ...prev.mapping, position: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="cell-department">Подразделение (например: D15)</Label>
                  <Input
                    id="cell-department"
                    placeholder="D15"
                    value={editingTemplate.mapping.department || ''}
                    onChange={(e) => setEditingTemplate(prev => ({
                      ...prev,
                      mapping: { ...prev.mapping, department: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="cell-address">Адрес (например: E15)</Label>
                  <Input
                    id="cell-address"
                    placeholder="E15"
                    value={editingTemplate.mapping.address || ''}
                    onChange={(e) => setEditingTemplate(prev => ({
                      ...prev,
                      mapping: { ...prev.mapping, address: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="cell-office">Кабинет и телефон (например: F15)</Label>
                  <Input
                    id="cell-office"
                    placeholder="F15"
                    value={editingTemplate.mapping.office || ''}
                    onChange={(e) => setEditingTemplate(prev => ({
                      ...prev,
                      mapping: { ...prev.mapping, office: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="cell-sudis">Логин СУДИС (например: G15)</Label>
                  <Input
                    id="cell-sudis"
                    placeholder="G15"
                    value={editingTemplate.mapping.sudisLogin || ''}
                    onChange={(e) => setEditingTemplate(prev => ({
                      ...prev,
                      mapping: { ...prev.mapping, sudisLogin: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="mt-4">
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  При добавлении нескольких сотрудников, каждый будет размещен в новой строке начиная с этой
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
                setEditingTemplate({
                  id: '',
                  name: '',
                  requestType: 'eir-rmu',
                  file: null,
                  mapping: {},
                  startRow: 15
                });
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
                          Стартовая строка: {template.startRow} • Полей маппинга: {Object.keys(template.mapping).filter(k => template.mapping[k as keyof typeof template.mapping]).length}
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
