import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

// Mock data for MVD employees
const mockEmployees = [
  { 
    id: 1, 
    last_name: 'Петрова', 
    first_name: 'Анна', 
    middle_name: 'Ивановна',
    position: 'Инженер-программист', 
    rank: 'лейтенант полиции',
    service: 'ИТС', 
    department: 'ОИТ', 
    address: 'г. Москва, ул. Петровка, 38',
    office: '301',
    phone: '+7(495)123-45-67',
    sudis_login: 'petrova_ai',
    official_email: 'petrova_ai@mvd.ru',
    status: 'active'
  },
  { 
    id: 2, 
    last_name: 'Иванов', 
    first_name: 'Михаил', 
    middle_name: 'Сергеевич',
    position: 'Старший инженер-программист', 
    rank: 'старший лейтенант полиции',
    service: 'ИТС', 
    department: 'ОИТ', 
    address: 'г. Москва, ул. Петровка, 38',
    office: '302',
    phone: '+7(495)123-45-68',
    sudis_login: 'ivanov_ms',
    official_email: 'ivanov_ms@mvd.ru',
    status: 'active'
  },
  { 
    id: 3, 
    last_name: 'Сидорова', 
    first_name: 'Елена', 
    middle_name: 'Александровна',
    position: 'Специалист по кадрам', 
    rank: 'майор полиции',
    service: 'ОК', 
    department: 'УК', 
    address: 'г. Москва, ул. Петровка, 38',
    office: '201',
    phone: '+7(495)123-45-69',
    sudis_login: 'sidorova_ea',
    official_email: 'sidorova_ea@mvd.ru',
    status: 'inactive'
  },
  { 
    id: 4, 
    last_name: 'Козлов', 
    first_name: 'Дмитрий', 
    middle_name: 'Петрович',
    position: 'Системный администратор', 
    rank: 'капитан полиции',
    service: 'ИТС', 
    department: 'ОИТ', 
    address: 'г. Москва, ул. Петровка, 38',
    office: '303',
    phone: '+7(495)123-45-70',
    sudis_login: 'kozlov_dp',
    official_email: 'kozlov_dp@mvd.ru',
    status: 'active'
  },
  { 
    id: 5, 
    last_name: 'Смирнова', 
    first_name: 'Ольга', 
    middle_name: 'Викторовна',
    position: 'Начальник отдела', 
    rank: 'подполковник полиции',
    service: 'АХО', 
    department: 'АХО', 
    address: 'г. Москва, ул. Петровка, 38',
    office: '401',
    phone: '+7(495)123-45-71',
    sudis_login: 'smirnova_ov',
    official_email: 'smirnova_ov@mvd.ru',
    status: 'active'
  },
  { 
    id: 6, 
    last_name: 'Федоров', 
    first_name: 'Александр', 
    middle_name: 'Николаевич',
    position: 'Дизайнер', 
    rank: 'прапорщик полиции',
    service: 'ИТС', 
    department: 'ОИТ', 
    address: 'г. Москва, ул. Петровка, 38',
    office: '304',
    phone: '+7(495)123-45-72',
    sudis_login: 'fedorov_an',
    official_email: 'fedorov_an@mvd.ru',
    status: 'active'
  }
];

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

  const filteredEmployees = mockEmployees.filter(employee => {
    const fullName = `${employee.last_name} ${employee.first_name} ${employee.middle_name || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.sudis_login.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.service === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    totalEmployees: mockEmployees.length,
    activeEmployees: mockEmployees.filter(e => e.status === 'active').length,
    pendingRequests: mockRequests.filter(r => r.status === 'pending').length,
    departments: [...new Set(mockEmployees.map(e => e.service))].length
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

  const createRequest = () => {
    const employeeNames = selectedEmployees.map(id => 
      mockEmployees.find(e => e.id === id)?.name
    ).join(', ');
    
    const typeLabel = getRequestTypeLabel(requestType);
    alert(`Заявка на "${typeLabel}" для: ${employeeNames}`);
    setSelectedEmployees([]);
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

  const saveEmployee = () => {
    if (manageAction === 'add') {
      const fullName = `${employeeForm.last_name} ${employeeForm.first_name} ${employeeForm.middle_name}`;
      const officialEmail = `${employeeForm.sudis_login}@mvd.ru`;
      alert(`Добавлен новый сотрудник: ${fullName}\nСлужебная почта: ${officialEmail}`);
    } else if (manageAction === 'edit') {
      const fullName = `${editingEmployee.last_name} ${editingEmployee.first_name} ${editingEmployee.middle_name}`;
      alert(`Данные сотрудника ${fullName} обновлены`);
    } else if (manageAction === 'delete') {
      const employeeNames = selectedEmployees.map(id => {
        const emp = mockEmployees.find(e => e.id === id);
        return emp ? `${emp.last_name} ${emp.first_name}` : '';
      }).join(', ');
      alert(`Удалены сотрудники: ${employeeNames}`);
      setSelectedEmployees([]);
    }
    setIsManageEmployeeOpen(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление сотрудниками</h1>
        <p className="text-gray-600">Обзор системы и основные метрики</p>
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
            {mockRequests.slice(0, 3).map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{request.employee}</p>
                  <p className="text-sm text-gray-600">{getRequestTypeLabel(request.type)} • {request.department}</p>
                </div>
                <Badge variant={request.status === 'pending' ? 'default' : request.status === 'approved' ? 'default' : 'destructive'}>
                  {request.status === 'pending' ? 'Ожидает' : request.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение по отделам</h3>
          <div className="space-y-3">
            {[...new Set(mockEmployees.map(e => e.service))].map(service => {
              const count = mockEmployees.filter(e => e.service === service).length;
              const percentage = (count / mockEmployees.length) * 100;
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
              <Button variant="outline" onClick={() => handleManageEmployee('add')}>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Управление сотрудниками
              </Button>
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
                          const employee = mockEmployees.find(e => e.id === id);
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
                      const employee = mockEmployees.find(e => e.id === id);
                      return <div key={id} className="py-1">{employee?.name}</div>;
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
      </Card>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Заявки</h1>
        <p className="text-gray-600">Управление заявками на создание и удаление учетных записей</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {mockRequests.map(request => (
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
                  <h3 className="font-semibold">{request.employee}</h3>
                  <p className="text-sm text-gray-600">
                    {getRequestTypeLabel(request.type)} • {request.department}
                  </p>
                  <p className="text-xs text-gray-500">{request.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={
                  request.status === 'pending' ? 'default' : 
                  request.status === 'approved' ? 'default' : 'destructive'
                }>
                  {request.status === 'pending' ? 'Ожидает' : 
                   request.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                </Badge>
                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                      <Icon name="Check" size={16} />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
              <h1 className="text-xl font-bold text-gray-900">Employee Manager</h1>
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