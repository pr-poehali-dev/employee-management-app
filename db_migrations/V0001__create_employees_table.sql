-- Создание таблицы сотрудников
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);

-- Добавление примеров сотрудников
INSERT INTO employees (name, position, department, email, status) VALUES
('Анна Петрова', 'Frontend Developer', 'IT', 'anna@company.com', 'active'),
('Михаил Иванов', 'Backend Developer', 'IT', 'mikhail@company.com', 'active'),
('Елена Сидорова', 'HR Manager', 'HR', 'elena@company.com', 'inactive'),
('Дмитрий Козлов', 'DevOps Engineer', 'IT', 'dmitry@company.com', 'active'),
('Ольга Смирнова', 'Product Manager', 'Product', 'olga@company.com', 'active'),
('Александр Федоров', 'UX Designer', 'Design', 'alex@company.com', 'active');