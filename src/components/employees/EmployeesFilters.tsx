import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export function EmployeesFilters({
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter
}: EmployeesFiltersProps) {
  return (
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
  );
}
