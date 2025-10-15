import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления сотрудниками МВД с подключением к PostgreSQL
    Args: event - объект события с httpMethod, body, queryStringParameters
          context - контекст выполнения
    Returns: HTTP ответ с данными сотрудников из БД
    '''
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise ValueError('DATABASE_URL not configured')
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', 'list')
        
        if method == 'GET' and action == 'list':
            cursor.execute('SELECT * FROM employees_mvd ORDER BY id')
            employees = cursor.fetchall()
            
            employees_list = []
            for emp in employees:
                employees_list.append({
                    'id': emp['id'],
                    'last_name': emp['last_name'],
                    'first_name': emp['first_name'],
                    'middle_name': emp['middle_name'],
                    'position': emp['position'],
                    'rank': emp['rank'],
                    'service': emp['service'],
                    'department': emp['department'],
                    'address': emp['address'],
                    'office': emp['office'],
                    'phone': emp['phone'],
                    'sudis_login': emp['sudis_login'],
                    'official_email': emp['official_email'],
                    'status': emp['status']
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'employees': employees_list
                }, ensure_ascii=False)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create':
                employee = body_data.get('employee', {})
                cursor.execute('''
                    INSERT INTO employees_mvd 
                    (last_name, first_name, middle_name, position, rank, service, 
                     department, address, office, phone, sudis_login, official_email, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    employee.get('last_name'),
                    employee.get('first_name'),
                    employee.get('middle_name'),
                    employee.get('position'),
                    employee.get('rank'),
                    employee.get('service'),
                    employee.get('department'),
                    employee.get('address'),
                    employee.get('office'),
                    employee.get('phone'),
                    employee.get('sudis_login'),
                    employee.get('official_email'),
                    employee.get('status', 'active')
                ))
                new_id = cursor.fetchone()['id']
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'id': new_id
                    }, ensure_ascii=False)
                }
            
            elif action == 'update':
                employee_id = body_data.get('id')
                employee = body_data.get('employee', {})
                cursor.execute('''
                    UPDATE employees_mvd 
                    SET last_name=%s, first_name=%s, middle_name=%s, position=%s, 
                        rank=%s, service=%s, department=%s, address=%s, office=%s, 
                        phone=%s, sudis_login=%s, official_email=%s, status=%s,
                        updated_at=CURRENT_TIMESTAMP
                    WHERE id=%s
                ''', (
                    employee.get('last_name'),
                    employee.get('first_name'),
                    employee.get('middle_name'),
                    employee.get('position'),
                    employee.get('rank'),
                    employee.get('service'),
                    employee.get('department'),
                    employee.get('address'),
                    employee.get('office'),
                    employee.get('phone'),
                    employee.get('sudis_login'),
                    employee.get('official_email'),
                    employee.get('status'),
                    employee_id
                ))
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True
                    }, ensure_ascii=False)
                }
            
            elif action == 'delete':
                employee_id = body_data.get('id')
                cursor.execute('DELETE FROM employees_mvd WHERE id=%s', (employee_id,))
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True
                    }, ensure_ascii=False)
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': False,
                'error': 'Invalid action'
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }, ensure_ascii=False)
        }
