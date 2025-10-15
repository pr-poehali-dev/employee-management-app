export interface Employee {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  position: string;
  rank: string;
  service: string;
  department: string;
  address: string;
  office: string;
  phone: string;
  sudis_login: string;
  official_email: string;
  status: string;
}

export interface Request {
  id: number;
  request_group_id: string;
  request_type: string;
  request_category: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  employees: {
    id: number;
    last_name: string;
    first_name: string;
    middle_name?: string;
    position: string;
    rank: string;
    service: string;
    department: string;
  }[];
}

export type Tab = 'dashboard' | 'employees' | 'requests' | 'history' | 'settings';

export const requestTypes = {
  'visp': {
    label: 'ВИСП',
    icon: 'User',
    subtypes: [
      { value: 'visp-create', label: 'Создание УЗ' },
      { value: 'visp-modify', label: 'Изменение УЗ' },
      { value: 'visp-edit', label: 'Редактирование УЗ' }
    ]
  },
  'systems': {
    label: 'Информационные системы',
    icon: 'Server',
    subtypes: [
      { value: 'ibd-r', label: 'ИБД-Р' },
      { value: 'ibd-f', label: 'ИБД-Ф' },
      { value: 'soop', label: 'СООП' },
      { value: 'eir-rmu', label: 'ЕИР РМУ' },
      { value: 'fis', label: 'ФИС' },
      { value: 'gasps', label: 'ГАСПС' }
    ]
  },
  'equipment': {
    label: 'Техника',
    icon: 'Monitor',
    subtypes: [
      { value: 'equipment-writeoff', label: 'Списание' },
      { value: 'equipment-repair', label: 'Ремонт' }
    ]
  }
};

export const API_URL = 'https://functions.poehali.dev/7bc58754-feed-404f-8d54-83526deaa4b7';
export const REQUESTS_API_URL = 'https://functions.poehali.dev/3e113ae9-a20c-4ea9-8c52-d142fe1b2c59';
