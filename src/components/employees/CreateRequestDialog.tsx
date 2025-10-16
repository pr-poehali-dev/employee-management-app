import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Employee, requestTypes } from '@/types';

interface CreateRequestDialogProps {
  selectedEmployees: number[];
  employees: Employee[];
  requestCategory: string;
  requestType: string;
  onCategoryChange: (category: string) => void;
  onTypeChange: (type: string) => void;
  onCreateRequest: () => void;
}

export function CreateRequestDialog({
  selectedEmployees,
  employees,
  requestCategory,
  requestType,
  onCategoryChange,
  onTypeChange,
  onCreateRequest
}: CreateRequestDialogProps) {
  return (
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
              onCategoryChange(value);
              const firstSubtype = requestTypes[value as keyof typeof requestTypes].subtypes[0];
              onTypeChange(firstSubtype.value);
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
            <Select value={requestType} onValueChange={onTypeChange}>
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
          <Button onClick={onCreateRequest} className="w-full" disabled={selectedEmployees.length === 0}>
            Создать заявку
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
