# POS Settings System - Technical Specification

## 🎯 **Overview**

ระบบตั้งค่า POS แบบ Two-Level Architecture ที่แบ่งการจัดการออกเป็น:
1. **POS Settings** - การตั้งค่าเบื้องต้นที่พนักงานเข้าถึงได้
2. **CMS Branch Settings** - การตั้งค่าแบบครบวงจรที่ Admin จัดการจาก CMS

## 🏗️ **Architecture Design**

### **System Flow**
```
┌─────────────────┐
│   CMS Admin     │
│  (Central Hub)  │
└────────┬────────┘
         │ Configure
         │ Settings
         ▼
┌─────────────────┐
│ Branch Settings │ ─────┐
│    Database     │      │ Real-time
└─────────────────┘      │ Sync
         │               │
         │ Sync          │
         ▼               ▼
┌─────────────────┐  ┌─────────────────┐
│  POS Terminal 1 │  │  POS Terminal 2 │
│  (Read + Local) │  │  (Read + Local) │
└─────────────────┘  └─────────────────┘
```

## 📊 **Database Schema**

### **Table: branch_settings**
```sql
CREATE TABLE branch_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Business Information
  business_info JSONB DEFAULT '{
    "tax_id": "",
    "address": "",
    "phone": "",
    "email": ""
  }'::jsonb,
  
  -- Pricing Configuration
  pricing_config JSONB DEFAULT '{
    "tax_rate": 0.07,
    "price_includes_tax": true,
    "allow_discount": true,
    "max_discount_percent": 20,
    "rounding_method": "nearest_cent"
  }'::jsonb,
  
  -- Inventory Rules
  inventory_config JSONB DEFAULT '{
    "auto_deduct_stock": true,
    "allow_negative_stock": false,
    "low_stock_threshold": 10,
    "track_expiry": true,
    "require_batch_number": false
  }'::jsonb,
  
  -- Printer Configuration
  printer_config JSONB DEFAULT '{
    "default_printer": "",
    "paper_size": "80mm",
    "auto_print_receipt": true,
    "receipt_copies": 1,
    "print_logo": true
  }'::jsonb,
  
  -- Loyalty Program
  loyalty_config JSONB DEFAULT '{
    "enabled": true,
    "program_id": null,
    "auto_enroll_customers": true,
    "show_points_on_receipt": true
  }'::jsonb,
  
  -- Payment Configuration
  payment_config JSONB DEFAULT '{
    "default_method": "cash",
    "allow_mixed_payment": true,
    "allow_partial_payment": false,
    "require_customer_for_credit": true
  }'::jsonb,
  
  -- Permissions
  permissions JSONB DEFAULT '{
    "allow_refunds": true,
    "require_manager_approval": false,
    "allow_void_orders": true,
    "allow_edit_price": false,
    "max_discount_without_approval": 10
  }'::jsonb,
  
  -- POS Display Settings (synced to terminals)
  pos_display_settings JSONB DEFAULT '{
    "default_language": "th",
    "default_theme": "light",
    "default_font_size": "medium",
    "show_product_images": true,
    "grid_columns": 4
  }'::jsonb,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(branch_id)
);

-- Index for fast lookups
CREATE INDEX idx_branch_settings_branch_id ON branch_settings(branch_id);
CREATE INDEX idx_branch_settings_active ON branch_settings(is_active);

-- Trigger to update updated_at
CREATE TRIGGER update_branch_settings_updated_at
  BEFORE UPDATE ON branch_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### **Table: pos_local_settings** (LocalStorage in POS)
```typescript
// Stored in browser localStorage
interface POSLocalSettings {
  branchId: string;
  userId: string;
  
  // User Preferences (can be changed by cashier)
  preferences: {
    language: 'th' | 'en';
    fontSize: 'small' | 'medium' | 'large';
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    volume: number; // 0-100
  };
  
  // Printer Settings (can be changed by cashier)
  printer: {
    selectedPrinter: string;
    autoPrint: boolean;
    copies: number;
  };
  
  // Cashier Settings
  cashier: {
    requireLogin: boolean;
    autoLogoutMinutes: number;
    showCustomerLookup: boolean;
  };
  
  // Last Synced (from CMS)
  lastSyncedAt: string;
  syncedSettings: BranchSettings; // Read-only copy from CMS
}
```

## 🎨 **UI Components**

### **1. POS Settings Page**
```typescript
// apps/pos-frontend/pages/settings/index.tsx
import { useState, useEffect } from 'react';
import { Box, VStack, Heading, useToast } from '@chakra-ui/react';

interface POSSettingsPageProps {}

export default function POSSettingsPage() {
  const [localSettings, setLocalSettings] = useState<POSLocalSettings>();
  const [branchSettings, setBranchSettings] = useState<BranchSettings>();
  const toast = useToast();

  // Load local settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pos-settings');
    if (saved) {
      setLocalSettings(JSON.parse(saved));
    }
  }, []);

  // Load branch settings from API
  useEffect(() => {
    fetchBranchSettings();
  }, []);

  const handleSaveLocalSettings = (settings: Partial<POSLocalSettings>) => {
    const updated = { ...localSettings, ...settings };
    setLocalSettings(updated);
    localStorage.setItem('pos-settings', JSON.stringify(updated));
    toast({ title: 'บันทึกการตั้งค่าสำเร็จ', status: 'success' });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">⚙️ การตั้งค่า POS</Heading>
        
        {/* Display Preferences */}
        <DisplaySettings 
          value={localSettings?.preferences}
          onChange={(prefs) => handleSaveLocalSettings({ preferences: prefs })}
        />
        
        {/* Printer Settings */}
        <PrinterSettings
          value={localSettings?.printer}
          onChange={(printer) => handleSaveLocalSettings({ printer })}
        />
        
        {/* Cashier Settings */}
        <CashierSettings
          value={localSettings?.cashier}
          onChange={(cashier) => handleSaveLocalSettings({ cashier })}
        />
        
        {/* Branch Info (Read-only) */}
        <BranchInfoDisplay settings={branchSettings} />
      </VStack>
    </Box>
  );
}
```

### **2. CMS Branch Settings Page**
```typescript
// apps/cms-web/pages/settings/branches/[id].tsx
import { useState, useEffect } from 'react';
import { Box, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

interface BranchSettingsPageProps {
  branchId: string;
}

export default function BranchSettingsPage({ branchId }: BranchSettingsPageProps) {
  const [settings, setSettings] = useState<BranchSettings>();

  const handleSave = async (updatedSettings: Partial<BranchSettings>) => {
    await branchSettingsService.update(branchId, updatedSettings);
    // Settings will auto-sync to POS terminals via Realtime
  };

  return (
    <Box p={6}>
      <Tabs>
        <TabList>
          <Tab>ข้อมูลทั่วไป</Tab>
          <Tab>การคำนวณราคา</Tab>
          <Tab>การจัดการสต็อก</Tab>
          <Tab>เครื่องพิมพ์</Tab>
          <Tab>โปรแกรมสะสมแต้ม</Tab>
          <Tab>การชำระเงิน</Tab>
          <Tab>สิทธิ์การใช้งาน</Tab>
        </TabList>

        <TabPanels>
          <TabPanel><BusinessInfoSettings settings={settings} onSave={handleSave} /></TabPanel>
          <TabPanel><PricingSettings settings={settings} onSave={handleSave} /></TabPanel>
          <TabPanel><InventorySettings settings={settings} onSave={handleSave} /></TabPanel>
          <TabPanel><PrinterSettings settings={settings} onSave={handleSave} /></TabPanel>
          <TabPanel><LoyaltySettings settings={settings} onSave={handleSave} /></TabPanel>
          <TabPanel><PaymentSettings settings={settings} onSave={handleSave} /></TabPanel>
          <TabPanel><PermissionsSettings settings={settings} onSave={handleSave} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
```

## 🔧 **API Services**

### **Branch Settings Service**
```typescript
// packages/api/src/services/branchSettingsService.ts
import { supabase } from '../supabase';
import { BranchSettings } from '@shopflow/types';

class BranchSettingsService {
  private tableName = 'branch_settings';

  // Get settings for a specific branch
  async getByBranchId(branchId: string): Promise<ApiResponse<BranchSettings>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('branch_id', branchId)
        .single();

      if (error) throw error;

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update branch settings
  async update(
    branchId: string,
    settings: Partial<BranchSettings>
  ): Promise<ApiResponse<BranchSettings>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('branch_id', branchId)
        .select()
        .single();

      if (error) throw error;

      // Log the change for audit
      await this.logSettingsChange(branchId, settings);

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create default settings for new branch
  async createDefault(branchId: string): Promise<ApiResponse<BranchSettings>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          branch_id: branchId,
          // Default values will be applied by database
        })
        .select()
        .single();

      if (error) throw error;

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Subscribe to settings changes (for POS terminals)
  subscribeToChanges(
    branchId: string,
    callback: (settings: BranchSettings) => void
  ): () => void {
    const channel = supabase
      .channel(`branch-settings-${branchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: this.tableName,
          filter: `branch_id=eq.${branchId}`,
        },
        (payload) => {
          callback(payload.new as BranchSettings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  private async logSettingsChange(
    branchId: string,
    changes: Partial<BranchSettings>
  ): Promise<void> {
    await supabase.from('audit_logs').insert({
      action: 'UPDATE_BRANCH_SETTINGS',
      entity_type: 'branch_settings',
      entity_id: branchId,
      changes: changes,
      created_at: new Date().toISOString(),
    });
  }
}

export const branchSettingsService = new BranchSettingsService();
```

## 🔄 **Real-time Synchronization**

### **POS Settings Sync Hook**
```typescript
// apps/pos-frontend/hooks/useBranchSettings.ts
import { useState, useEffect } from 'react';
import { branchSettingsService } from '@shopflow/api';

export function useBranchSettings(branchId: string) {
  const [settings, setSettings] = useState<BranchSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!branchId) return;

    // Initial load
    loadSettings();

    // Subscribe to real-time updates
    const unsubscribe = branchSettingsService.subscribeToChanges(
      branchId,
      (updatedSettings) => {
        setSettings(updatedSettings);
        // Update local storage
        updateLocalStorageSettings(updatedSettings);
        showToast('การตั้งค่าได้รับการอัปเดตจาก CMS');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [branchId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await branchSettingsService.getByBranchId(branchId);
      if (response.success) {
        setSettings(response.data);
        updateLocalStorageSettings(response.data);
      } else {
        setError(new Error(response.error.message));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalStorageSettings = (settings: BranchSettings) => {
    const localSettings = JSON.parse(
      localStorage.getItem('pos-settings') || '{}'
    );
    localSettings.syncedSettings = settings;
    localSettings.lastSyncedAt = new Date().toISOString();
    localStorage.setItem('pos-settings', JSON.stringify(localSettings));
  };

  return { settings, isLoading, error, reload: loadSettings };
}
```

## 📋 **Settings Categories**

### **1. Display Preferences (POS Local)**
```typescript
interface DisplayPreferences {
  language: 'th' | 'en';              // ✅ POS can change
  fontSize: 'small' | 'medium' | 'large'; // ✅ POS can change
  theme: 'light' | 'dark';            // ✅ POS can change
  showProductImages: boolean;         // ⚙️ Synced from CMS (read-only)
  gridColumns: number;                // ⚙️ Synced from CMS (read-only)
}
```

### **2. Printer Settings (Mixed)**
```typescript
interface PrinterSettings {
  selectedPrinter: string;            // ✅ POS can change (local device)
  autoPrint: boolean;                 // ✅ POS can change
  copies: number;                     // ✅ POS can change
  defaultPrinter: string;             // ⚙️ CMS sets default
  paperSize: '80mm' | 'A4';          // ⚙️ CMS only
  printLogo: boolean;                 // ⚙️ CMS only
}
```

### **3. Business Settings (CMS Only)**
```typescript
interface BusinessSettings {
  taxRate: number;                    // ⚙️ CMS only
  priceIncludesTax: boolean;         // ⚙️ CMS only
  allowDiscount: boolean;            // ⚙️ CMS only
  maxDiscountPercent: number;        // ⚙️ CMS only
  autoDeductStock: boolean;          // ⚙️ CMS only
  allowNegativeStock: boolean;       // ⚙️ CMS only
}
```

## 🔒 **Security & Permissions**

### **Access Control**
```typescript
// RLS Policy for branch_settings
CREATE POLICY "Users can view their branch settings"
  ON branch_settings FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM user_branches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update branch settings"
  ON branch_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'branch_manager')
    )
  );
```

## 🎯 **Implementation Phases**

### **Phase 1: Database & API (Week 1-2)**
- ✅ Create `branch_settings` table
- ✅ Implement `branchSettingsService`
- ✅ Add RLS policies
- ✅ Create default settings function

### **Phase 2: CMS Settings Page (Week 3-4)**
- ✅ Create branch settings UI
- ✅ Implement all settings tabs
- ✅ Add validation and error handling
- ✅ Test settings updates

### **Phase 3: POS Settings Integration (Week 5-6)**
- ✅ Create POS settings page
- ✅ Implement local storage sync
- ✅ Add real-time updates
- ✅ Test synchronization

### **Phase 4: Testing & Documentation (Week 7-8)**
- ✅ End-to-end testing
- ✅ Performance testing
- ✅ User documentation
- ✅ Training materials

---

**This specification provides a complete blueprint for implementing a robust, user-friendly, and scalable POS settings system that balances simplicity with flexibility.**
