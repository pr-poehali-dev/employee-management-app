-- Create requests table
CREATE TABLE IF NOT EXISTS t_p46137463_employee_management_.requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES t_p46137463_employee_management_.employees_mvd(id),
    request_type VARCHAR(100) NOT NULL,
    request_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_requests_employee_id ON t_p46137463_employee_management_.requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON t_p46137463_employee_management_.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON t_p46137463_employee_management_.requests(created_at);

-- Insert some test data
INSERT INTO t_p46137463_employee_management_.requests (employee_id, request_type, request_category, status, notes, created_at)
VALUES 
    (1, 'visp-create', 'visp', 'approved', 'Создание учетной записи ВИСП для нового сотрудника', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (2, 'ibd-r', 'systems', 'pending', 'Доступ к системе ИБД-Р', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (1, 'equipment-repair', 'equipment', 'completed', 'Ремонт рабочей станции', CURRENT_TIMESTAMP - INTERVAL '5 days');