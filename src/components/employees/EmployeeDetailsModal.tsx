import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Employee, Request, REQUESTS_API_URL, requestTypes } from '@/types';

interface EmployeeDetailsModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeDetailsModal({ employee, isOpen, onClose }: EmployeeDetailsModalProps) {
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
