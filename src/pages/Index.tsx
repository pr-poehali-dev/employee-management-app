import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Employee, Request, Tab, API_URL, REQUESTS_API_URL } from '@/types';
import { Dashboard } from '@/components/Dashboard';
import EmployeesTab from '@/components/EmployeesTab';
import { RequestsTab } from '@/components/RequestsTab';
import { EmployeeManageDialog } from '@/components/EmployeeManageDialog';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [requestCategory, setRequestCategory] = useState<string>('visp');
  const [requestType, setRequestType] = useState<string>('visp-create');
  const [isManageEmployeeOpen, setIsManageEmployeeOpen] = useState(false);
  const [manageAction, setManageAction] = useState<'add' | 'edit' | 'delete'>('add');
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [employeeForm, setEmployeeForm] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    position: '',
    rank: '',
    service: '',
    department: '',
    address: '',
    office: '',
    phone: '',
    sudis_login: '',
    status: 'active'
  });

  useEffect(() => {
    loadEmployees();
    loadRequests();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=list`);
      const data = await response.json();
      if (data.employees) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await fetch(`${REQUESTS_API_URL}?action=list`);
      const data = await response.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.last_name} ${employee.first_name} ${employee.middle_name || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.sudis_login.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.service === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleEmployeeSelect = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const createRequest = async () => {
    try {
      const response = await fetch(REQUESTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          employee_ids: selectedEmployees,
          request_type: requestType,
          request_category: requestCategory,
          notes: ''
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Создано заявок: ${data.request_ids.length}`);
        setSelectedEmployees([]);
        await loadRequests();
      }
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      alert('Не удалось создать заявку');
    }
  };

  const handleManageEmployee = (action: 'add' | 'edit' | 'delete', employee?: any) => {
    setManageAction(action);
    if (action === 'edit' && employee) {
      setEditingEmployee(employee);
      setEmployeeForm({
        last_name: employee.last_name,
        first_name: employee.first_name,
        middle_name: employee.middle_name,
        position: employee.position,
        rank: employee.rank,
        service: employee.service,
        department: employee.department,
        address: employee.address,
        office: employee.office,
        phone: employee.phone,
        sudis_login: employee.sudis_login,
        status: employee.status
      });
    } else if (action === 'add') {
      setEmployeeForm({
        last_name: '',
        first_name: '',
        middle_name: '',
        position: '',
        rank: '',
        service: '',
        department: '',
        address: '',
        office: '',
        phone: '',
        sudis_login: '',
        status: 'active'
      });
    }
    setIsManageEmployeeOpen(true);
  };

  const saveEmployee = async () => {
    try {
      if (manageAction === 'add') {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            employee: {
              ...employeeForm,
              official_email: `${employeeForm.sudis_login}@mvd.ru`
            }
          })
        });
        const data = await response.json();
        if (data.success) {
          const fullName = `${employeeForm.last_name} ${employeeForm.first_name} ${employeeForm.middle_name}`;
          alert(`Добавлен новый сотрудник: ${fullName}\nСлужебная почта: ${employeeForm.sudis_login}@mvd.ru`);
          await loadEmployees();
        }
      } else if (manageAction === 'edit') {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id: editingEmployee.id,
            employee: {
              ...employeeForm,
              official_email: `${employeeForm.sudis_login}@mvd.ru`
            }
          })
        });
        const data = await response.json();
        if (data.success) {
          const fullName = `${employeeForm.last_name} ${employeeForm.first_name} ${employeeForm.middle_name}`;
          alert(`Данные сотрудника ${fullName} обновлены`);
          await loadEmployees();
        }
      } else if (manageAction === 'delete') {
        for (const employeeId of selectedEmployees) {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              id: employeeId
            })
          });
        }
        alert(`Удалено сотрудников: ${selectedEmployees.length}`);
        setSelectedEmployees([]);
        await loadEmployees();
      }
      setIsManageEmployeeOpen(false);
    } catch (error) {
      console.error('Ошибка операции с сотрудником:', error);
    }
  };

  const updateRequestStatus = async (requestGroupId: string, newStatus: string, outgoingNumber?: string, outgoingDate?: string) => {
    try {
      const response = await fetch(REQUESTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          request_group_id: requestGroupId,
          status: newStatus,
          outgoing_number: outgoingNumber,
          outgoing_date: outgoingDate
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadRequests();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Icon name="Users" className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">СПЛС</h1>
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
                  <Icon name={icon as any} size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            employees={employees} 
            requests={requests}
            requestsLoading={requestsLoading}
          />
        )}
        
        {activeTab === 'employees' && (
          <EmployeesTab
            employees={employees}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedEmployees={selectedEmployees}
            handleEmployeeSelect={handleEmployeeSelect}
            handleManageEmployee={handleManageEmployee}
            requestCategory={requestCategory}
            setRequestCategory={setRequestCategory}
            requestType={requestType}
            setRequestType={setRequestType}
            createRequest={createRequest}
            filteredEmployees={filteredEmployees}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsTab
            requests={requests}
            requestsLoading={requestsLoading}
            updateRequestStatus={updateRequestStatus}
          />
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12">
            <Icon name="Clock" size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">История в разработке</h2>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Icon name="Settings" size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">Настройки в разработке</h2>
          </div>
        )}
      </div>

      <EmployeeManageDialog
        isOpen={isManageEmployeeOpen}
        onClose={() => setIsManageEmployeeOpen(false)}
        action={manageAction}
        employeeForm={employeeForm}
        setEmployeeForm={setEmployeeForm}
        onSave={saveEmployee}
        selectedEmployees={selectedEmployees}
        employees={employees}
      />
    </div>
  );
};

export default Index;