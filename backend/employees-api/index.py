import json

def handler(event, context):
    '''
    Business: Тестовый API для сотрудников
    Args: event - объект события, context - контекст
    Returns: HTTP ответ
    '''
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'message': 'API работает',
            'employees': [
                {
                    'id': 1,
                    'last_name': 'Петрова',
                    'first_name': 'Анна',
                    'position': 'Инженер-программист'
                }
            ]
        }, ensure_ascii=False)
    }