import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Employee, requestTypes } from '@/types';

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
}

export const EmployeesTab = ({
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
  filteredEmployees
}: EmployeesTabProps) => {
  return (
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
};