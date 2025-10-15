'''
Business: Управление заявками на сотрудников (создание, получение списка, обновление статуса)
Args: event с httpMethod, queryStringParameters, body
Returns: HTTP response с данными заявок
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'list')
            
            if action == 'list':
                status_filter = params.get('status')
                
                query = '''
                    SELECT 
                        r.id, 
                        r.request_type, 
                        r.request_category, 
                        r.status, 
                        r.notes,
                        r.created_at,
                        r.updated_at,
                        r.approved_at,
                        r.request_group_id,
                        e.id as employee_id,
                        e.last_name,
                        e.first_name,
                        e.middle_name,
                        e.position,
                        e.rank,
                        e.service,
                        e.department
                    FROM t_p46137463_employee_management_.requests r
                    JOIN t_p46137463_employee_management_.employees_mvd e ON r.employee_id = e.id
                '''
                
                if status_filter:
                    query += f" WHERE r.status = '{status_filter}'"
                
                query += ' ORDER BY r.created_at DESC'
                
                cursor.execute(query)
                requests = cursor.fetchall()
                
                grouped_requests = {}
                for req in requests:
                    group_id = req['request_group_id']
                    if group_id not in grouped_requests:
                        grouped_requests[group_id] = {
                            'id': req['id'],
                            'request_group_id': group_id,
                            'request_type': req['request_type'],
                            'request_category': req['request_category'],
                            'status': req['status'],
                            'notes': req['notes'],
                            'created_at': req['created_at'].isoformat() if req['created_at'] else None,
                            'updated_at': req['updated_at'].isoformat() if req['updated_at'] else None,
                            'approved_at': req['approved_at'].isoformat() if req['approved_at'] else None,
                            'employees': []
                        }
                    
                    grouped_requests[group_id]['employees'].append({
                        'id': req['employee_id'],
                        'last_name': req['last_name'],
                        'first_name': req['first_name'],
                        'middle_name': req['middle_name'],
                        'position': req['position'],
                        'rank': req['rank'],
                        'service': req['service'],
                        'department': req['department']
                    })
                
                requests_list = list(grouped_requests.values())
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'requests': requests_list
                    }, ensure_ascii=False)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create':
                employee_ids = body_data.get('employee_ids', [])
                request_type = body_data.get('request_type')
                request_category = body_data.get('request_category')
                notes = body_data.get('notes', '')
                
                group_id = f'group_{uuid.uuid4().hex[:12]}'
                
                created_ids = []
                for employee_id in employee_ids:
                    cursor.execute('''
                        INSERT INTO t_p46137463_employee_management_.requests 
                        (employee_id, request_type, request_category, notes, status, request_group_id)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (employee_id, request_type, request_category, notes, 'pending', group_id))
                    
                    new_id = cursor.fetchone()['id']
                    created_ids.append(new_id)
                
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message': f'Создано заявок: {len(created_ids)}',
                        'request_ids': created_ids
                    }, ensure_ascii=False)
                }
            
            elif action == 'update_status':
                request_group_id = body_data.get('request_group_id')
                new_status = body_data.get('status')
                
                cursor.execute('''
                    UPDATE t_p46137463_employee_management_.requests 
                    SET status=%s, updated_at=CURRENT_TIMESTAMP
                    WHERE request_group_id=%s
                ''', (new_status, request_group_id))
                
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Статус заявки обновлен'
                    }, ensure_ascii=False)
                }
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'})
        }
        
    except Exception as e:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        raise e