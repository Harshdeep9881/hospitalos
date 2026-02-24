CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE doctors
  ADD COLUMN department_id INT NULL;

INSERT INTO departments (name)
SELECT DISTINCT TRIM(department)
FROM doctors
WHERE department IS NOT NULL
  AND TRIM(department) <> ""
  AND TRIM(department) NOT IN (SELECT name FROM departments);

UPDATE doctors d
JOIN departments dep ON dep.name = TRIM(d.department)
SET d.department_id = dep.id
WHERE d.department_id IS NULL;

ALTER TABLE doctors
  MODIFY department_id INT NOT NULL;

ALTER TABLE doctors
  ADD CONSTRAINT fk_doctors_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX idx_doctors_department_id ON doctors (department_id);
