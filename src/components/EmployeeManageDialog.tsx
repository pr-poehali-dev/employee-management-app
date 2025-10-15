import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Employee } from '@/types';

interface EmployeeManageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'add' | 'edit' | 'delete';
  employeeForm: any;
  setEmployeeForm: (form: any) => void;
  onSave: () => void;
  selectedEmployees: number[];
  employees: Employee[];
}

export const EmployeeManageDialog = ({
  isOpen,
  onClose,
  action,
  employeeForm,
  setEmployeeForm,
  onSave,
  selectedEmployees,
  employees
}: EmployeeManageDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === 'add' ? 'Добавить сотрудника' : 
             action === 'edit' ? 'Редактировать сотрудника' : 
             'Удалить сотрудников'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {action === 'delete' ? (
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
                  placeholder="Введите отчество"
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
                  placeholder="Введите звание"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Служба</label>
                <Input
                  value={employeeForm.service}
                  onChange={(e) => setEmployeeForm({...employeeForm, service: e.target.value})}
                  placeholder="Введите службу"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Подразделение</label>
                <Input
                  value={employeeForm.department}
                  onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                  placeholder="Введите подразделение"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Адрес</label>
                <Input
                  value={employeeForm.address}
                  onChange={(e) => setEmployeeForm({...employeeForm, address: e.target.value})}
                  placeholder="Введите адрес"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Кабинет</label>
                <Input
                  value={employeeForm.office}
                  onChange={(e) => setEmployeeForm({...employeeForm, office: e.target.value})}
                  placeholder="Введите номер кабинета"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Телефон</label>
                <Input
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                  placeholder="Введите телефон"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Логин СУДИС</label>
                <Input
                  value={employeeForm.sudis_login}
                  onChange={(e) => setEmployeeForm({...employeeForm, sudis_login: e.target.value})}
                  placeholder="Введите логин"
                />
              </div>
            </>
          )}
          <Button onClick={onSave} className="w-full">
            {action === 'add' ? 'Добавить' : action === 'edit' ? 'Сохранить' : 'Удалить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
