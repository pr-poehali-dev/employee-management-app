import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Employee, ExcelTemplate } from '@/types';
import { EmployeeDetailsModal } from './employees/EmployeeDetailsModal';
import { EmployeeCard } from './employees/EmployeeCard';
import { CreateRequestDialog } from './employees/CreateRequestDialog';
import { GenerateExcelDialog } from './employees/GenerateExcelDialog';
import { EmployeesFilters } from './employees/EmployeesFilters';

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
  handleManageEmployee: (action: 'add' | 'edit' | 'delete', employee?: Employee) => void;
  requestCategory: string;
  setRequestCategory: (category: string) => void;
  requestType: string;
  setRequestType: (type: string) => void;
  createRequest: () => void;
  filteredEmployees: Employee[];
  templates: ExcelTemplate[];
}

export default function EmployeesTab({
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
  filteredEmployees,
  templates
}: EmployeesTabProps) {
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<Employee | null>(null);
  
  return (
    <>
      <EmployeeDetailsModal 
        employee={selectedEmployeeForDetails!} 
        isOpen={!!selectedEmployeeForDetails} 
        onClose={() => setSelectedEmployeeForDetails(null)}
      />
      
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
            
            <GenerateExcelDialog
              selectedEmployees={selectedEmployees}
              employees={employees}
              templates={templates}
            />
            
            <CreateRequestDialog
              selectedEmployees={selectedEmployees}
              employees={employees}
              requestCategory={requestCategory}
              requestType={requestType}
              onCategoryChange={setRequestCategory}
              onTypeChange={setRequestType}
              onCreateRequest={createRequest}
            />
          </div>
        </div>

        <Card className="p-6">
          <EmployeesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

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
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  isSelected={selectedEmployees.includes(employee.id)}
                  onSelect={handleEmployeeSelect}
                  onEdit={(emp) => handleManageEmployee('edit', emp)}
                  onViewDetails={setSelectedEmployeeForDetails}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
