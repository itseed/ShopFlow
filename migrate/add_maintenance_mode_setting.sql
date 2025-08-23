-- Add maintenance mode setting to system_settings table

INSERT INTO system_settings (category, key, value, description) VALUES
('system', 'maintenance_mode', 'false', 'Maintenance mode status')
ON CONFLICT (category, key) DO NOTHING;

COMMENT ON COLUMN system_settings.category IS 'Setting category (e.g., general, system, security)';