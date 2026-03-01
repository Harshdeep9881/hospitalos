-- Add additional departments and set descriptions for all departments (existing + new)

INSERT INTO departments (name, description)
VALUES
  ('Cardiology', 'Diagnosis and treatment of heart and blood vessel conditions.'),
  ('Neurology', 'Care for disorders of the brain, spinal cord, and nervous system.'),
  ('Orthopedics', 'Treatment of bone, joint, ligament, tendon, and muscle conditions.'),
  ('Pediatrics', 'Medical care for infants, children, and adolescents.'),
  ('Dermatology', 'Diagnosis and treatment of skin, hair, and nail disorders.'),
  ('Gynecology', 'Comprehensive care for women''s reproductive health.'),
  ('Obstetrics', 'Pregnancy, childbirth, and postpartum maternal care.'),
  ('Oncology', 'Cancer screening, diagnosis, treatment, and follow-up.'),
  ('Radiology', 'Medical imaging services for diagnosis and treatment planning.'),
  ('Pathology', 'Laboratory diagnosis through tissue, blood, and body fluid analysis.'),
  ('ENT', 'Ear, nose, and throat specialty care.'),
  ('Ophthalmology', 'Eye health, vision care, and eye disease treatment.'),
  ('Psychiatry', 'Mental health evaluation, therapy, and medication management.'),
  ('Urology', 'Urinary tract and male reproductive system care.'),
  ('Nephrology', 'Kidney disease diagnosis and management.'),
  ('Gastroenterology', 'Digestive system and liver disorder management.'),
  ('Pulmonology', 'Respiratory and lung disease diagnosis and care.'),
  ('Endocrinology', 'Hormonal and metabolic disorder treatment, including diabetes care.'),
  ('Emergency Medicine', 'Immediate care for acute illness, trauma, and emergencies.'),
  ('Anesthesiology', 'Perioperative anesthesia, pain control, and critical support.'),
  ('General Surgery', 'Operative management for a wide range of surgical conditions.'),
  ('Physiotherapy', 'Rehabilitation and physical therapy for mobility and recovery.')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  updated_at = CURRENT_TIMESTAMP;

-- Ensure every existing department has a meaningful description
UPDATE departments
SET description = CASE LOWER(TRIM(name))
  WHEN 'cardiology' THEN 'Diagnosis and treatment of heart and blood vessel conditions.'
  WHEN 'neurology' THEN 'Care for disorders of the brain, spinal cord, and nervous system.'
  WHEN 'orthopedics' THEN 'Treatment of bone, joint, ligament, tendon, and muscle conditions.'
  WHEN 'pediatrics' THEN 'Medical care for infants, children, and adolescents.'
  WHEN 'dermatology' THEN 'Diagnosis and treatment of skin, hair, and nail disorders.'
  WHEN 'gynecology' THEN 'Comprehensive care for women''s reproductive health.'
  WHEN 'obstetrics' THEN 'Pregnancy, childbirth, and postpartum maternal care.'
  WHEN 'oncology' THEN 'Cancer screening, diagnosis, treatment, and follow-up.'
  WHEN 'radiology' THEN 'Medical imaging services for diagnosis and treatment planning.'
  WHEN 'pathology' THEN 'Laboratory diagnosis through tissue, blood, and body fluid analysis.'
  WHEN 'ent' THEN 'Ear, nose, and throat specialty care.'
  WHEN 'ophthalmology' THEN 'Eye health, vision care, and eye disease treatment.'
  WHEN 'psychiatry' THEN 'Mental health evaluation, therapy, and medication management.'
  WHEN 'urology' THEN 'Urinary tract and male reproductive system care.'
  WHEN 'nephrology' THEN 'Kidney disease diagnosis and management.'
  WHEN 'gastroenterology' THEN 'Digestive system and liver disorder management.'
  WHEN 'pulmonology' THEN 'Respiratory and lung disease diagnosis and care.'
  WHEN 'endocrinology' THEN 'Hormonal and metabolic disorder treatment, including diabetes care.'
  WHEN 'emergency medicine' THEN 'Immediate care for acute illness, trauma, and emergencies.'
  WHEN 'anesthesiology' THEN 'Perioperative anesthesia, pain control, and critical support.'
  WHEN 'general surgery' THEN 'Operative management for a wide range of surgical conditions.'
  WHEN 'physiotherapy' THEN 'Rehabilitation and physical therapy for mobility and recovery.'
  ELSE CONCAT(
    UPPER(LEFT(TRIM(name), 1)),
    SUBSTRING(TRIM(name), 2),
    ' department clinical services and patient care.'
  )
END,
updated_at = CURRENT_TIMESTAMP;
