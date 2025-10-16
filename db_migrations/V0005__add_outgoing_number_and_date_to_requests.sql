-- Добавление полей для исходящего номера и даты в таблицу requests
ALTER TABLE requests 
ADD COLUMN outgoing_number VARCHAR(50),
ADD COLUMN outgoing_date DATE;