import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/7bc58754-feed-404f-8d54-83526deaa4b7';
const REQUESTS_API_URL = 'https://functions.poehali.dev/3e113ae9-a20c-4ea9-8c52-d142fe1b2c59';

interface Employee {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  position: string;
  rank: string;
  service: string;
  department: string;
  address: string;
  office: string;
  phone: string;
  sudis_login: string;
  official_email: string;
  status: string;
}

interface Request {
  id: number;
  request_type: string;
  request_category: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  employee: {
    id: number;
    last_name: string;
    first_name: string;
    middle_name?: string;
    position: string;
    rank: string;
    service: string;
    department: string;
  };
}

// Request types configuration
const requestTypes = {
  'visp': {
    label: 'ВИСП',
    icon: 'User',
    subtypes: [
      { value: 'visp-create', label: 'Создание УЗ' },
      { value: 'visp-modify', label: 'Изменение УЗ' },
      { value: 'visp-edit', label: 'Редактирование УЗ' }
    ]
  },
  'systems': {
    label: 'Информационные системы',
    icon: 'Server',
    subtypes: [
      { value: 'ibd-r', label: 'ИБД-Р' },
      { value: 'ibd-f', label: 'ИБД-Ф' },
      { value: 'soop', label: 'СООП' },
      { value: 'eir-rmu', label: 'ЕИР РМУ' },
      { value: 'fis', label: 'ФИС' },
      { value: 'gasps', label: 'ГАСПС' }
    ]
  },
  'equipment': {
    label: 'Техника',
    icon: 'Monitor',
    subtypes: [
      { value: 'equipment-writeoff', label: 'Списание' },
      { value: 'equipment-repair', label: 'Ремонт' }
    ]
  }
};

// Mock data for requests
const mockRequests = [
  { id: 1, type: 'visp-create', employee: 'Новый сотрудник', department: 'IT', status: 'pending', date: '2024-01-15' },
  { id: 2, type: 'visp-edit', employee: 'Иван Петров', department: 'HR', status: 'approved', date: '2024-01-14' },
  { id: 3, type: 'ibd-r', employee: 'Мария Кузнецова', department: 'Marketing', status: 'rejected', date: '2024-01-13' },
  { id: 4, type: 'equipment-repair', employee: 'Техника #1234', department: 'IT', status: 'pending', date: '2024-01-12' }
];

type Tab = 'dashboard' | 'employees' | 'requests' | 'history' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [requestCategory, setRequestCategory] = useState<string>('visp');
  const [requestType, setRequestType] = useState<string>('visp-create');
  const [isManageEmployeeOpen, setIsManageEmployeeOpen] = useState(false);
  const [manageAction, setManageAction] = useState<'add' | 'edit' | 'delete'>('add');
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [employeeForm, setEmployeeForm] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    position: '',
    rank: '',
    service: '',
    department: '',
    address: '',
    office: '',
    phone: '',
    sudis_login: '',
    status: 'active'
  });

  useEffect(() => {
    loadEmployees();
    loadRequests();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=list`);
      const data = await response.json();
      if (data.employees) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await fetch(`${REQUESTS_API_URL}?action=list`);
      const data = await response.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.last_name} ${employee.first_name} ${employee.middle_name || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.sudis_login.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.service === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    departments: [...new Set(employees.map(e => e.service))].length
  };

  const handleEmployeeSelect = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const getRequestTypeLabel = (type: string) => {
    for (const category of Object.values(requestTypes)) {
      const subtype = category.subtypes.find(st => st.value === type);
      if (subtype) return subtype.label;
    }
    return type;
  };

  const createRequest = async () => {
    try {
      const response = await fetch(REQUESTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          employee_ids: selectedEmployees,
          request_type: requestType,
          request_category: requestCategory,
          notes: ''
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Создано заявок: ${data.request_ids.length}`);
        setSelectedEmployees([]);
        await loadRequests();
      }
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      alert('Не удалось создать заявку');
    }
  };

  const handleManageEmployee = (action: 'add' | 'edit' | 'delete', employee?: any) => {
    setManageAction(action);
    if (action === 'edit' && employee) {
      setEditingEmployee(employee);
      setEmployeeForm({
        last_name: employee.last_name,
        first_name: employee.first_name,
        middle_name: employee.middle_name,
        position: employee.position,
        rank: employee.rank,
        service: employee.service,
        department: employee.department,
        address: employee.address,
        office: employee.office,
        phone: employee.phone,
        sudis_login: employee.sudis_login,
        status: employee.status
      });
    } else if (action === 'add') {
      setEmployeeForm({
        last_name: '',
        first_name: '',
        middle_name: '',
        position: '',
        rank: '',
        service: '',
        department: '',
        address: '',
        office: '',
        phone: '',
        sudis_login: '',
        status: 'active'
      });
    }
    setIsManageEmployeeOpen(true);
  };

  const saveEmployee = async () => {
    try {
      if (manageAction === 'add') {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            employee: {
              ...employeeForm,
              official_email: `${employeeForm.sudis_login}@mvd.ru`
            }
          })
        });
        const data = await response.json();
        if (data.success) {
          const fullName = `${employeeForm.last_name} ${employeeForm.first_name} ${employeeForm.middle_name}`;
          alert(`Добавлен новый сотрудник: ${fullName}\nСлужебная почта: ${employeeForm.sudis_login}@mvd.ru`);
          await loadEmployees();
        }
      } else if (manageAction === 'edit') {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id: editingEmployee.id,
            employee: {
              ...employeeForm,
              official_email: `${employeeForm.sudis_login}@mvd.ru`
            }
          })
        });
        const data = await response.json();
        if (data.success) {
          const fullName = `${employeeForm.last_name} ${employeeForm.first_name} ${employeeForm.middle_name}`;
          alert(`Данные сотрудника ${fullName} обновлены`);
          await loadEmployees();
        }
      } else if (manageAction === 'delete') {
        for (const id of selectedEmployees) {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
          });
        }
        const employeeNames = selectedEmployees.map(id => {
          const emp = employees.find(e => e.id === id);
          return emp ? `${emp.last_name} ${emp.first_name}` : '';
        }).join(', ');
        alert(`Удалены сотрудники: ${employeeNames}`);
        setSelectedEmployees([]);
        await loadEmployees();
      }
      setIsManageEmployeeOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Произошла ошибка при сохранении данных');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление сотрудниками</h1>
        <p className="text-gray-600 text-right">Когда-нибудь мы сделаем здесь что-то нужное. Реально нужное. 
А пока тут будет бесполезная информация. Так как изначально это задумывалась для ГРЛС. 
Бум дыц.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего сотрудников</p>
              <p className="text-3xl font-bold text-primary">{stats.totalEmployees}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Icon name="Users" className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активные</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeEmployees}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Icon name="UserCheck" className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ожидающие заявки</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Icon name="Clock" className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Службы</p>
              <p className="text-3xl font-bold text-purple-600">{stats.departments}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Icon name="Building" className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Последние заявки</h3>
          <div className="space-y-4">
            {requestsLoading ? (
              <p className="text-gray-500 text-sm">Загрузка заявок...</p>
            ) : requests.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет заявок</p>
            ) : (
              requests.slice(0, 3).map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {request.employee.last_name} {request.employee.first_name} {request.employee.middle_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getRequestTypeLabel(request.request_type)} • {request.employee.service}
                    </p>
                  </div>
                  <Badge variant={
                    request.status === 'pending' ? 'default' : 
                    request.status === 'approved' ? 'default' : 
                    request.status === 'completed' ? 'secondary' : 'destructive'
                  }>
                    {request.status === 'pending' ? 'Ожидает' : 
                     request.status === 'approved' ? 'Одобрено' : 
                     request.status === 'completed' ? 'Выполнено' : 'Отклонено'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение по отделам</h3>
          <div className="space-y-3">
            {[...new Set(employees.map(e => e.service))].map(service => {
              const count = employees.filter(e => e.service === service).length;
              const percentage = (count / employees.length) * 100;
              return (
                <div key={service}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{service}</span>
                    <span className="text-gray-600">{count} чел.</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">База сотрудников</h1>
          <p className="text-gray-600">Управление учетными записями сотрудников</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isManageEmployeeOpen} onOpenChange={setIsManageEmployeeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => handleManageEmployee('add')}>⚙️Добавление сотрудника</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {manageAction === 'add' ? 'Добавить сотрудника' : 
                   manageAction === 'edit' ? 'Редактировать сотрудника' : 
                   'Удалить сотрудников'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {manageAction === 'delete' ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Вы действительно хотите удалить выбранных сотрудников?
                    </p>
                    <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm bg-gray-50">
                      {selectedEmployees.length === 0 ? (
                        <p className="text-gray-500">Выберите сотрудников для удаления</p>
                      ) : (
                        selectedEmployees.map(id => {
                          const employee = employees.find(e => e.id === id);
                          return employee ? (
                            <div key={id} className="py-1">
                              {employee.last_name} {employee.first_name} {employee.middle_name}
                            </div>
                          ) : null;
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Фамилия</label>
                      <Input
                        value={employeeForm.last_name}
                        onChange={(e) => setEmployeeForm({...employeeForm, last_name: e.target.value})}
                        placeholder="Введите фамилию"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Имя</label>
                      <Input
                        value={employeeForm.first_name}
                        onChange={(e) => setEmployeeForm({...employeeForm, first_name: e.target.value})}
                        placeholder="Введите имя"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Отчество</label>
                      <Input
                        value={employeeForm.middle_name}
                        onChange={(e) => setEmployeeForm({...employeeForm, middle_name: e.target.value})}
                        placeholder="Введите отчество (необязательно)"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Должность</label>
                      <Input
                        value={employeeForm.position}
                        onChange={(e) => setEmployeeForm({...employeeForm, position: e.target.value})}
                        placeholder="Введите должность"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Звание</label>
                      <Input
                        value={employeeForm.rank}
                        onChange={(e) => setEmployeeForm({...employeeForm, rank: e.target.value})}
                        placeholder="напр. лейтенант полиции"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Служба</label>
                      <Select value={employeeForm.service} onValueChange={(value) => setEmployeeForm({...employeeForm, service: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите службу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ИТС">ИТС</SelectItem>
                          <SelectItem value="ОК">ОК</SelectItem>
                          <SelectItem value="АХО">АХО</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Подразделение</label>
                      <Input
                        value={employeeForm.department}
                        onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                        placeholder="напр. ОИТ, УК, АХО"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Логин СУДИС</label>
                      <Input
                        value={employeeForm.sudis_login}
                        onChange={(e) => setEmployeeForm({...employeeForm, sudis_login: e.target.value})}
                        placeholder="напр. petrov_iv"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Служебная почта: {employeeForm.sudis_login}@mvd.ru
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Кабинет</label>
                      <Input
                        value={employeeForm.office}
                        onChange={(e) => setEmployeeForm({...employeeForm, office: e.target.value})}
                        placeholder="напр. 301"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Служебный телефон</label>
                      <Input
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                        placeholder="+7(495)123-45-67"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Адрес</label>
                      <Input
                        value={employeeForm.address}
                        onChange={(e) => setEmployeeForm({...employeeForm, address: e.target.value})}
                        placeholder="напр. г. Москва, ул. Петровка, 38"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Статус</label>
                      <Select value={employeeForm.status} onValueChange={(value) => setEmployeeForm({...employeeForm, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Активен</SelectItem>
                          <SelectItem value="inactive">Неактивен</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="flex space-x-2">
                  <Button 
                    onClick={saveEmployee} 
                    className="flex-1"
                    disabled={manageAction === 'delete' && selectedEmployees.length === 0}
                  >
                    {manageAction === 'add' ? 'Добавить' : 
                     manageAction === 'edit' ? 'Сохранить' : 'Удалить'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsManageEmployeeOpen(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Icon name="Plus" size={16} className="mr-2" />
                Создать заявку
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Создание заявки</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Категория заявки</label>
                <Select value={requestCategory} onValueChange={(value: string) => {
                  setRequestCategory(value);
                  const firstSubtype = requestTypes[value as keyof typeof requestTypes]?.subtypes[0];
                  if (firstSubtype) setRequestType(firstSubtype.value);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(requestTypes).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <Icon name={category.icon as any} size={16} />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Тип заявки</label>
                <Select value={requestType} onValueChange={(value: string) => setRequestType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes[requestCategory as keyof typeof requestTypes]?.subtypes.map((subtype) => (
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
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
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
                selectedEmployees.includes(employee.id) ? 'ring-2 ring-primary bg-blue-50' : ''
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
                    {employee.status === 'active' ? 'Активен' : 'Неактивен'}
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
                      setSelectedEmployees([employee.id]);
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
  );

  const updateRequestStatus = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(REQUESTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          id: requestId,
          status: newStatus
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadRequests();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const renderRequests = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Заявки</h1>
        <p className="text-gray-600">Управление заявками на создание и удаление учетных записей</p>
      </div>

      <Card className="p-6">
        {requestsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Загрузка заявок...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Заявок пока нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Icon 
                      name="FileText" 
                      className="text-blue-600" 
                      size={20} 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {request.employee.last_name} {request.employee.first_name} {request.employee.middle_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getRequestTypeLabel(request.request_type)} • {request.employee.service}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {request.notes && (
                      <p className="text-xs text-gray-600 mt-1">{request.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={
                    request.status === 'pending' ? 'default' : 
                    request.status === 'approved' ? 'default' : 
                    request.status === 'completed' ? 'secondary' : 'destructive'
                  }>
                    {request.status === 'pending' ? 'Ожидает' : 
                     request.status === 'approved' ? 'Одобрено' : 
                     request.status === 'completed' ? 'Выполнено' : 'Отклонено'}
                  </Badge>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                      >
                        <Icon name="Check" size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Icon name="Users" className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">СПЛС</h1>
            </div>
            <nav className="flex space-x-8">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
                { key: 'employees', label: 'Сотрудники', icon: 'Users' },
                { key: 'requests', label: 'Заявки', icon: 'FileText' },
                { key: 'history', label: 'История', icon: 'Clock' },
                { key: 'settings', label: 'Настройки', icon: 'Settings' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as Tab)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === key
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon name={icon as any} size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'history' && (
          <div className="text-center py-12">
            <Icon name="Clock" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">История операций</h3>
            <p className="text-gray-600">Раздел в разработке</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Icon name="Settings" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Настройки системы</h3>
            <p className="text-gray-600">Раздел в разработке</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;