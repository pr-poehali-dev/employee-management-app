-- Add request_group_id to track related requests created together
ALTER TABLE t_p46137463_employee_management_.requests 
ADD COLUMN request_group_id VARCHAR(100);

-- Create index for faster grouping queries
CREATE INDEX IF NOT EXISTS idx_requests_group_id ON t_p46137463_employee_management_.requests(request_group_id);

-- Update existing requests to have unique group IDs
UPDATE t_p46137463_employee_management_.requests 
SET request_group_id = 'group_' || id::text 
WHERE request_group_id IS NULL;