import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { ExcelTemplate, requestTypes } from '@/types';
import { keyMapping } from '@/utils/templateParser';

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
    fileType: 'excel'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.name.endsWith('.docx') || file.name.endsWith('.doc') ? 'word' : 'excel';
      setEditingTemplate(prev => ({ ...prev, file, fileType }));
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.requestType) {
      alert('Заполните название и выберите тип заявки');
      return;
    }

    if (!editingTemplate.file) {
      alert('Загрузите файл шаблона');
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
      fileType: 'excel'
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

  const availableKeys = Object.entries(keyMapping).map(([key, field]) => ({
    key,
    field,
    label: {
      surname: 'Фамилия',
      name: 'Имя',
      patronymic: 'Отчество',
      position: 'Должность',
      rank: 'Звание',
      service: 'Служба',
      department: 'Отдел',
      address: 'Адрес',
      office: 'Кабинет',
      phone: 'Телефон',
      sudis_login: 'Логин СУДИС',
      email: 'Email'
    }[key] || key
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
        <p className="text-gray-600">Управление шаблонами Excel и Word заявок</p>
      </div>

      {isEditing ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTemplate.id ? 'Редактирование шаблона' : 'Новый шаблон'}
          </h2>
          
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Icon name="Info" size={16} className="text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Как использовать:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>В ячейках Excel или таблицах Word напишите ключи: <code className="bg-blue-100 px-1 rounded">surname</code>, <code className="bg-blue-100 px-1 rounded">name</code></li>
                  <li>Можно комбинировать: <code className="bg-blue-100 px-1 rounded">surname, name</code> или <code className="bg-blue-100 px-1 rounded">surname name</code></li>
                  <li>Разделители (запятые, пробелы и т.д.) сохраняются автоматически</li>
                  <li>Текст без ключей копируется для каждого сотрудника без изменений</li>
                </ol>
              </AlertDescription>
            </Alert>

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
              <Label htmlFor="template-file">Файл шаблона</Label>
              <Input
                id="template-file"
                type="file"
                accept=".xlsx,.xls,.docx,.doc"
                onChange={handleFileUpload}
              />
              {editingTemplate.file && (
                <p className="text-sm text-gray-600 mt-1">
                  Загружен: {editingTemplate.file.name} ({editingTemplate.fileType === 'word' ? 'Word' : 'Excel'})
                </p>
              )}
            </div>

            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Доступные ключи</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableKeys.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <code className="bg-white px-2 py-1 rounded border text-xs font-mono">
                      {key}
                    </code>
                    <span className="text-gray-600">— {label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSaveTemplate}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  resetEditingTemplate();
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Шаблоны заявок</h2>
            <Button onClick={() => setIsEditing(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Новый шаблон
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.length === 0 ? (
              <Card className="p-8 col-span-2 text-center">
                <Icon name="FileSpreadsheet" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Нет сохраненных шаблонов</p>
                <Button onClick={() => setIsEditing(true)}>
                  Создать первый шаблон
                </Button>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getRequestTypeLabel(template.requestType)}
                      </p>
                      {template.file && (
                        <p className="text-xs text-gray-500 mt-1">
                          {template.file.name}
                        </p>
                      )}
                    </div>
                    <Icon 
                      name={template.fileType === 'word' ? 'FileText' : 'FileSpreadsheet'} 
                      size={24} 
                      className="text-gray-400" 
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1"
                    >
                      <Icon name="Edit" size={14} className="mr-1" />
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Удалить шаблон "${template.name}"?`)) {
                          onDeleteTemplate(template.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
