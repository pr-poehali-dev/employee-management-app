import { Employee, FieldKey } from '@/types';

export const keyMapping: Record<FieldKey, keyof Employee> = {
  surname: 'last_name',
  name: 'first_name',
  patronymic: 'middle_name',
  position: 'position',
  rank: 'rank',
  service: 'service',
  department: 'department',
  address: 'address',
  office: 'office',
  phone: 'phone',
  sudis_login: 'sudis_login',
  email: 'official_email'
};

export const getFieldValue = (employee: Employee, key: FieldKey): string => {
  const field = keyMapping[key];
  const value = employee[field];
  return value ? String(value) : '';
};

export const parseAndReplaceKeys = (
  text: string,
  employee: Employee
): string => {
  if (!text) return '';

  const keyPattern = new RegExp(
    `#(${Object.keys(keyMapping).join('|')})`,
    'gi'
  );

  return text.replace(keyPattern, (match, key) => {
    const normalizedKey = key.toLowerCase() as FieldKey;
    return getFieldValue(employee, normalizedKey);
  });
};

export const containsKeys = (text: string): boolean => {
  if (!text) return false;
  
  const keyPattern = new RegExp(
    `#(${Object.keys(keyMapping).join('|')})`,
    'gi'
  );
  
  return keyPattern.test(text);
};

export const extractKeysFromText = (text: string): FieldKey[] => {
  if (!text) return [];
  
  const keys: FieldKey[] = [];
  const keyPattern = new RegExp(
    `#(${Object.keys(keyMapping).join('|')})`,
    'gi'
  );
  
  const matches = [...text.matchAll(keyPattern)];
  if (matches) {
    matches.forEach(match => {
      keys.push(match[1].toLowerCase() as FieldKey);
    });
  }
  
  return keys;
};