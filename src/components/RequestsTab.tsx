import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Request, requestTypes } from '@/types';

interface RequestsTabProps {
  requests: Request[];
  requestsLoading: boolean;
  updateRequestStatus: (groupId: string, status: string, outgoingNumber?: string) => void;
}

const getRequestTypeLabel = (type: string) => {
  for (const category of Object.values(requestTypes)) {
    const subtype = category.subtypes.find(st => st.value === type);
    if (subtype) return subtype.label;
  }
  return type;
};

export const RequestsTab = ({ requests, requestsLoading, updateRequestStatus }: RequestsTabProps) => {
  const [isOutgoingNumberDialogOpen, setIsOutgoingNumberDialogOpen] = useState(false);
  const [outgoingNumber, setOutgoingNumber] = useState('');
  const [outgoingDate, setOutgoingDate] = useState('');
  const [selectedRequestGroupId, setSelectedRequestGroupId] = useState<string | null>(null);

  const handleCompleteRequest = () => {
    if (selectedRequestGroupId && outgoingNumber.trim() && outgoingDate.trim()) {
      const fullOutgoingInfo = `№${outgoingNumber} от ${outgoingDate}`;
      updateRequestStatus(selectedRequestGroupId, 'approved', fullOutgoingInfo);
      setIsOutgoingNumberDialogOpen(false);
      setOutgoingNumber('');
      setOutgoingDate('');
      setSelectedRequestGroupId(null);
    }
  };

  const openOutgoingNumberDialog = (groupId: string) => {
    setSelectedRequestGroupId(groupId);
    setIsOutgoingNumberDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOutgoingNumberDialogOpen} onOpenChange={setIsOutgoingNumberDialogOpen}>
        <DialogContent aria-describedby="outgoing-number-description">
          <DialogHeader>
            <DialogTitle>Исполнение заявки</DialogTitle>
          </DialogHeader>
          <p id="outgoing-number-description" className="sr-only">
            Введите исходящий номер для исполнения заявки
          </p>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outgoing-number">Исходящий номер и дата</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">№</span>
                <Input
                  id="outgoing-number"
                  placeholder="Номер"
                  value={outgoingNumber}
                  onChange={(e) => setOutgoingNumber(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium">от</span>
                <Input
                  type="date"
                  value={outgoingDate}
                  onChange={(e) => setOutgoingDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOutgoingNumberDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCompleteRequest} disabled={!outgoingNumber.trim() || !outgoingDate.trim()}>
              Исполнить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              <div key={request.request_group_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
                      {request.employees.length === 1 ? (
                        `${request.employees[0].last_name} ${request.employees[0].first_name} ${request.employees[0].middle_name || ''}`
                      ) : (
                        request.employees.map(emp => `${emp.last_name} ${emp.first_name[0]}.`).join(', ')
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getRequestTypeLabel(request.request_type)}
                      {request.employees.length > 1 && ` • ${request.employees.length} сотрудников`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Создано: {new Date(request.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {request.outgoing_number && request.outgoing_date && (
                      <p className="text-xs font-medium text-gray-700 mt-1">
                        №{request.outgoing_number} от {new Date(request.outgoing_date).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </p>
                    )}
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
                     request.status === 'approved' ? 'Исполнено' : 
                     request.status === 'completed' ? 'Выполнено' : 'Не исполнено'}
                  </Badge>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => openOutgoingNumberDialog(request.request_group_id)}
                      >
                        <Icon name="Check" size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => updateRequestStatus(request.request_group_id, 'rejected')}
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
    </>
  );
};