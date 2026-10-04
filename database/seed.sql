-- Seed data for AI Contract Risk Analyzer

-- 1. Default Organization
INSERT INTO organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corporation')
ON CONFLICT (id) DO NOTHING;

-- 2. Default Users (Passwords hashed: Admin@123 -> $2a$10$vI8aWBmW3fID65FiW5e.1.y6Kz1p7B5m3F/bN1d7W8aX9y0Z1A2b3)
-- Sample hashed values for testing:
-- Password: "Password123!" -> bcrypt: "$2b$10$Ep3BmgJd1aA/.X4W9dYVd.m7Y4g0Z0m0A2/9F6a1b2c3d4e5f6g7h"
INSERT INTO users (id, organization_id, name, email, password_hash, role, language_preference)
VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@acme.com', '$2b$10$Ep3BmgJd1aA/.X4W9dYVd.m7Y4g0Z0m0A2/9F6a1b2c3d4e5f6g7h', 'ADMIN', 'en'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Legal Reviewer', 'reviewer@acme.com', '$2b$10$Ep3BmgJd1aA/.X4W9dYVd.m7Y4g0Z0m0A2/9F6a1b2c3d4e5f6g7h', 'REVIEWER', 'en'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Standard User', 'user@acme.com', '$2b$10$Ep3BmgJd1aA/.X4W9dYVd.m7Y4g0Z0m0A2/9F6a1b2c3d4e5f6g7h', 'USER', 'en')
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Audit Log
INSERT INTO audit_logs (id, organization_id, user_id, action, resource_type, resource_id, details)
VALUES (
    '00000000-0000-0000-0000-000000000901',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'SYSTEM_INIT',
    'ORGANIZATION',
    '00000000-0000-0000-0000-000000000001',
    '{"message": "System initialized with default organization and seed admin account"}'
) ON CONFLICT (id) DO NOTHING;
