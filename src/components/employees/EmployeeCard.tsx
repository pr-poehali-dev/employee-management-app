import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Employee } from '@/types';

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (employee: Employee) => void;
  onViewDetails: (employee: Employee) => void;
}

export function EmployeeCard({ employee, isSelected, onSelect, onEdit, onViewDetails }: EmployeeCardProps) {
  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md group ${
        isSelected ? 'ring-2 ring-primary bg-blue-50' : 
        employee.status === 'inactive' ? 'bg-red-50' : ''
      }`}
      onClick={() => onSelect(employee.id)}
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
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(employee);
            }}
          >
            <Icon name="Eye" size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(employee);
            }}
          >
            <Icon name="Edit" size={16} />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <Icon name="Building" size={14} className="mr-1" />
            {employee.service}
          </span>
          <span className="flex items-center">
            <Icon name="MapPin" size={14} className="mr-1" />
            {employee.office}
          </span>
        </div>
        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
          {employee.status === 'active' ? 'Активен' : 'Уволен'}
        </Badge>
      </div>
    </Card>
  );
}
