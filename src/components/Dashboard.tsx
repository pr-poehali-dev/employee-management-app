import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Employee, Request, requestTypes } from '@/types';

interface DashboardProps {
  employees: Employee[];
  requests: Request[];
  requestsLoading: boolean;
}

const getRequestTypeLabel = (type: string) => {
  for (const category of Object.values(requestTypes)) {
    const subtype = category.subtypes.find(st => st.value === type);
    if (subtype) return subtype.label;
  }
  return type;
};

export const Dashboard = ({ employees, requests, requestsLoading }: DashboardProps) => {
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    departments: [...new Set(employees.map(e => e.service))].length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Обзор системы управления сотрудниками</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего сотрудников</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icon name="Users" className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icon name="CheckCircle" className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Заявок на рассмотрении</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icon name="Clock" className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Отделов</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.departments}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
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
                <div key={request.request_group_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {request.employees.length === 1 ? (
                        `${request.employees[0].last_name} ${request.employees[0].first_name} ${request.employees[0].middle_name || ''}`
                      ) : (
                        `${request.employees.length} сотрудников`
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getRequestTypeLabel(request.request_type)}
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
};
