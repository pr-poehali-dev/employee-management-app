import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Employee, requestTypes, Request, REQUESTS_API_URL, ExcelTemplate } from '@/types';
import { useState, useEffect } from 'react';
import { generateExcelFromTemplate, downloadExcelFile } from '@/utils/excelGenerator';

interface EmployeesTabProps {
  employees: Employee[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  selectedEmployees: number[];
  handleEmployeeSelect: (id: number) => void;
  handleManageEmployee: (action: 'add' | 'edit' | 'delete', employee?: any) => void;
  requestCategory: string;
  setRequestCategory: (category: string) => void;
  requestType: string;
  setRequestType: (type: string) => void;
  createRequest: () => void;
  filteredEmployees: Employee[];
  templates: ExcelTemplate[];
}

interface EmployeeDetailsModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

function EmployeeDetailsModal({ employee, isOpen, onClose }: EmployeeDetailsModalProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      fetchEmployeeRequests();
    }
  }, [isOpen, employee]);

  const fetchEmployeeRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch(REQUESTS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const requestsArray = data.requests || data;
      const employeeRequests = Array.isArray(requestsArray) 
        ? requestsArray.filter((req: Request) => 
            req.employees && Array.isArray(req.employees) && 
            req.employees.some(emp => emp.id === employee.id)
          )
        : [];
      
      setRequests(employeeRequests);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидание';
      case 'approved': return 'Исполнено';
      case 'completed': return 'Выполнено';
      case 'rejected': return 'Не исполнено';
      default: return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = requestTypes[category as keyof typeof requestTypes];
    return categoryData ? categoryData.label : category;
  };

  const getTypeLabel = (type: string) => {
    for (const category of Object.values(requestTypes)) {
      const subtype = category.subtypes.find(st => st.value === type);
      if (subtype) return subtype.label;
    }
    return type;
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" aria-describedby="employee-details-description">
        <DialogHeader>
          <DialogTitle>Информация о сотруднике</DialogTitle>
        </DialogHeader>
        <p id="employee-details-description" className="sr-only">
          Подробная информация о сотруднике и история его заявок
        </p>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {employee.last_name[0]}{employee.first_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.last_name} {employee.first_name} {employee.middle_name}
              </h2>
              <p className="text-lg text-gray-700">{employee.position}</p>
              <p className="text-sm text-gray-600">{employee.rank}</p>
            </div>
            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
              {employee.status === 'active' ? 'Действующий' : 'Уволен'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Служба</p>
              <p className="text-base text-gray-900">{employee.service}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Подразделение</p>
              <p className="text-base text-gray-900">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Адрес</p>
              <p className="text-base text-gray-900">{employee.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Кабинет</p>
              <p className="text-base text-gray-900">{employee.office}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Телефон</p>
              <p className="text-base text-gray-900">{employee.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-base text-gray-900">{employee.official_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Логин СУДИС</p>
              <p className="text-base text-gray-900">{employee.sudis_login}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">История заявок</h3>
            {loadingRequests ? (
              <p className="text-gray-600">Загрузка заявок...</p>
            ) : requests.length === 0 ? (
              <p className="text-gray-600">Заявки на этого сотрудника не найдены</p>
            ) : (
              <div className="space-y-3">
                {requests.map(request => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{getCategoryLabel(request.request_category)}</Badge>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{getTypeLabel(request.request_type)}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Создано: {new Date(request.created_at).toLocaleString('ru-RU')}</p>
                      {request.approved_at && (
                        <p>Согласовано: {new Date(request.approved_at).toLocaleString('ru-RU')}</p>
                      )}
                      {request.status === 'approved' && request.completed_at && (
                        <p>Исполнено: {new Date(request.completed_at).toLocaleString('ru-RU')}</p>
                      )}
                      {request.outgoing_number && request.outgoing_date && (
                        <p className="font-medium text-gray-700">
                          №{request.outgoing_number} от {new Date(request.outgoing_date).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-2">{request.notes}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeesTab({
  employees,
  loading,
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  selectedEmployees,
  handleEmployeeSelect,
  handleManageEmployee,
  requestCategory,
  setRequestCategory,
  requestType,
  setRequestType,
  createRequest,
  filteredEmployees,
  templates
}: EmployeesTabProps) {
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<Employee | null>(null);
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
    <>
      <EmployeeDetailsModal 
        employee={selectedEmployeeForDetails!} 
        isOpen={!!selectedEmployeeForDetails} 
        onClose={() => setSelectedEmployeeForDetails(null)}
      />
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">База сотрудников</h1>
          <p className="text-gray-600">Управление учетными записями сотрудников</p>
        </div>
        <div className="flex space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => handleManageEmployee('add')}>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Добавить сотрудника
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button 
            variant="outline" 
            onClick={() => handleManageEmployee('delete')}
            disabled={selectedEmployees.length === 0}
          >
            <Icon name="Trash2" size={18} className="mr-2" />
            Удалить сотрудников
          </Button>
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
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={selectedEmployees.length === 0}>
                <Icon name="FilePlus" size={18} className="mr-2" />
                Создать заявку
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Создание заявки</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Категория</label>
                  <Select value={requestCategory} onValueChange={(value) => {
                    setRequestCategory(value);
                    const firstSubtype = requestTypes[value as keyof typeof requestTypes].subtypes[0];
                    setRequestType(firstSubtype.value);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(requestTypes).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Тип заявки</label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes[requestCategory as keyof typeof requestTypes].subtypes.map((subtype) => (
                        <SelectItem key={subtype.value} value={subtype.value}>
                          {subtype.label}
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
                    {selectedEmployees.length === 0 ? (
                      <p className="text-gray-500">Выберите сотрудников в списке</p>
                    ) : (
                      selectedEmployees.map(id => {
                        const employee = employees.find(e => e.id === id);
                        return employee ? (
                          <div key={id} className="py-1">
                            {employee.last_name} {employee.first_name}
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
                <Button onClick={createRequest} className="w-full" disabled={selectedEmployees.length === 0}>
                  Создать заявку
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Поиск по ФИО, должности или логину СУДИС..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Служба" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все службы</SelectItem>
              <SelectItem value="ИТС">ИТС</SelectItem>
              <SelectItem value="ОК">ОК</SelectItem>
              <SelectItem value="АХО">АХО</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Действующие</SelectItem>
              <SelectItem value="inactive">Уволенные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Загрузка сотрудников...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Сотрудники не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(employee => (
            <Card 
              key={employee.id} 
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md group ${
                selectedEmployees.includes(employee.id) ? 'ring-2 ring-primary bg-blue-50' : 
                employee.status === 'inactive' ? 'bg-red-50' : ''
              }`}
              onClick={() => handleEmployeeSelect(employee.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {employee.last_name[0]}{employee.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.last_name} {employee.first_name} {employee.middle_name}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    <p className="text-xs text-gray-500">{employee.rank}</p>
                  </div>
                </div>
                {selectedEmployees.includes(employee.id) && (
                  <Icon name="Check" className="text-primary" size={20} />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Служба:</span>
                  <Badge variant="outline">{employee.service}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Подразделение:</span>
                  <Badge variant="outline">{employee.department}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status === 'active' ? 'Действующий' : 'Уволен'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="Mail" size={14} />
                  <span>{employee.official_email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="Phone" size={14} />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="MapPin" size={14} />
                  <span>Каб. {employee.office}</span>
                </div>
                <div className="flex space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployeeForDetails(employee);
                    }}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Icon name="Eye" size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManageEmployee('edit', employee);
                    }}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Icon name="Edit" size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManageEmployee('delete');
                    }}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
    </>
  );
}