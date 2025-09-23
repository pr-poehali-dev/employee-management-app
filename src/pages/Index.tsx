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

// Mock data for employees
const mockEmployees = [
  { id: 1, name: 'Анна Петрова', position: 'Frontend Developer', department: 'IT', status: 'active', email: 'anna@company.com' },
  { id: 2, name: 'Михаил Иванов', position: 'Backend Developer', department: 'IT', status: 'active', email: 'mikhail@company.com' },
  { id: 3, name: 'Елена Сидорова', position: 'HR Manager', department: 'HR', status: 'inactive', email: 'elena@company.com' },
  { id: 4, name: 'Дмитрий Козлов', position: 'DevOps Engineer', department: 'IT', status: 'active', email: 'dmitry@company.com' },
  { id: 5, name: 'Ольга Смирнова', position: 'Product Manager', department: 'Product', status: 'active', email: 'olga@company.com' },
  { id: 6, name: 'Александр Федоров', position: 'UX Designer', department: 'Design', status: 'active', email: 'alex@company.com' }
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

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    totalEmployees: mockEmployees.length,
    activeEmployees: mockEmployees.filter(e => e.status === 'active').length,
    pendingRequests: mockRequests.filter(r => r.status === 'pending').length,
    departments: [...new Set(mockEmployees.map(e => e.department))].length
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
              <p className="text-sm font-medium text-gray-600">Отделы</p>
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
            {[...new Set(mockEmployees.map(e => e.department))].map(dept => {
              const count = mockEmployees.filter(e => e.department === dept).length;
              const percentage = (count / mockEmployees.length) * 100;
              return (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{dept}</span>
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

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Поиск по имени или должности..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Отдел" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все отделы</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
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
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedEmployees.includes(employee.id) ? 'ring-2 ring-primary bg-blue-50' : ''
              }`}
              onClick={() => handleEmployeeSelect(employee.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                {selectedEmployees.includes(employee.id) && (
                  <Icon name="Check" className="text-primary" size={20} />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Отдел:</span>
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
                  <span>{employee.email}</span>
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