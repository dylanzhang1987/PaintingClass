-- Seed default super admin user
-- Password 'admin123' hashed with bcrypt
INSERT INTO users (username, password, full_name, email, role, is_active)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'admin@paintingclass.com', 'super_admin', TRUE)
ON DUPLICATE KEY UPDATE username = username;
