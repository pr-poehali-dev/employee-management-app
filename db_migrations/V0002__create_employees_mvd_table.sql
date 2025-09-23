-- Создание новой таблицы сотрудников с корректной структурой для МВД
CREATE TABLE employees_mvd (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    position VARCHAR(255) NOT NULL,
    rank VARCHAR(100),
    service VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    address TEXT,
    office VARCHAR(20),
    phone VARCHAR(20),
    sudis_login VARCHAR(100) UNIQUE NOT NULL,
    official_email VARCHAR(255) GENERATED ALWAYS AS (sudis_login || '@mvd.ru') STORED,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_employees_mvd_service ON employees_mvd(service);
CREATE INDEX idx_employees_mvd_department ON employees_mvd(department);
CREATE INDEX idx_employees_mvd_status ON employees_mvd(status);
CREATE INDEX idx_employees_mvd_sudis_login ON employees_mvd(sudis_login);
CREATE INDEX idx_employees_mvd_official_email ON employees_mvd(official_email);
CREATE INDEX idx_employees_mvd_last_name ON employees_mvd(last_name);

-- Добавление примеров сотрудников
INSERT INTO employees_mvd (last_name, first_name, middle_name, position, rank, service, department, address, office, phone, sudis_login, status) VALUES
('Петрова', 'Анна', 'Ивановна', 'Инженер-программист', 'лейтенант полиции', 'ИТС', 'ОИТ', 'г. Москва, ул. Петровка, 38', '301', '+7(495)123-45-67', 'petrova_ai', 'active'),
('Иванов', 'Михаил', 'Сергеевич', 'Старший инженер-программист', 'старший лейтенант полиции', 'ИТС', 'ОИТ', 'г. Москва, ул. Петровка, 38', '302', '+7(495)123-45-68', 'ivanov_ms', 'active'),
('Сидорова', 'Елена', 'Александровна', 'Специалист по кадрам', 'майор полиции', 'ОК', 'УК', 'г. Москва, ул. Петровка, 38', '201', '+7(495)123-45-69', 'sidorova_ea', 'inactive'),
('Козлов', 'Дмитрий', 'Петрович', 'Системный администратор', 'капитан полиции', 'ИТС', 'ОИТ', 'г. Москва, ул. Петровка, 38', '303', '+7(495)123-45-70', 'kozlov_dp', 'active'),
('Смирнова', 'Ольга', 'Викторовна', 'Начальник отдела', 'подполковник полиции', 'АХО', 'АХО', 'г. Москва, ул. Петровка, 38', '401', '+7(495)123-45-71', 'smirnova_ov', 'active'),
('Федоров', 'Александр', 'Николаевич', 'Дизайнер', 'прапорщик полиции', 'ИТС', 'ОИТ', 'г. Москва, ул. Петровка, 38', '304', '+7(495)123-45-72', 'fedorov_an', 'active');