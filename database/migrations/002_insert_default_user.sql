-- Insert default super admin user
INSERT INTO users (username, password, full_name, email, role, is_active)
VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'System Administrator',
  'admin@paintingclass.com',
  'super_admin',
  1
) ON DUPLICATE KEY UPDATE username=username;
