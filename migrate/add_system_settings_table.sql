-- Add system_settings table for ShopFlow CMS
-- This table stores system configuration settings

-- Create the system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Add update timestamp trigger
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_system_settings_updated_at();

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system settings
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default system settings
INSERT INTO system_settings (category, key, value, description) VALUES
('general', 'company_name', 'ShopFlow POS', 'Company name'),
('general', 'tax_id', '0-1234-56789-01-2', 'Tax identification number'),
('general', 'email', 'contact@shopflow.com', 'Contact email'),
('general', 'phone', '02-123-4567', 'Contact phone'),
('general', 'address', '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110', 'Company address'),
('general', 'currency', 'THB', 'Default currency'),
('general', 'timezone', 'Asia/Bangkok', 'Default timezone'),
('general', 'date_format', 'DD/MM/YYYY', 'Date format'),
('general', 'language', 'th', 'Default language'),
('general', 'development_mode', 'false', 'Development mode enabled'),
('general', 'auto_logging', 'true', 'Automatic logging enabled'),
('general', 'auto_backup', 'true', 'Automatic backup enabled'),
('general', 'email_notifications', 'true', 'Email notifications enabled'),
('general', 'schema_version', '1.0', 'Database schema version')
ON CONFLICT (category, key) DO NOTHING;

COMMENT ON TABLE system_settings IS 'System configuration settings';
COMMENT ON COLUMN system_settings.category IS 'Setting category (e.g., general, system, security)';
COMMENT ON COLUMN system_settings.key IS 'Setting key name';
COMMENT ON COLUMN system_settings.value IS 'Setting value';