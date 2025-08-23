import { useState, useEffect, useCallback } from "react";
import {
  systemService,
  SystemStatus,
  DatabaseInfo,
  SystemSettings,
} from "../services/systemService";

export function useSystemStatus(autoRefresh = true, refreshInterval = 30000) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newStatus = await systemService.getSystemStatus();
      setStatus(newStatus);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check system status"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    if (autoRefresh) {
      const interval = setInterval(checkStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [checkStatus, autoRefresh, refreshInterval]);

  return {
    status,
    loading,
    error,
    refresh: checkStatus,
  };
}

export function useDatabaseInfo() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await systemService.getDatabaseInfo();
      setDbInfo(info);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch database info"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return {
    dbInfo,
    loading,
    error,
    refresh: fetchInfo,
  };
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const systemSettings = await systemService.getSystemSettings();
      setSettings(systemSettings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch system settings"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (updatedSettings: Partial<SystemSettings>) => {
      try {
        setSaving(true);
        setError(null);

        const result = await systemService.updateSystemSettings(
          updatedSettings
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        // Update local state
        setSettings((prev) => (prev ? { ...prev, ...updatedSettings } : null));

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update settings";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const setMaintenanceMode = useCallback(async (enabled: boolean) => {
    try {
      setSaving(true);
      setError(null);

      const result = await systemService.setMaintenanceMode(enabled);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update local state
      setSettings((prev) =>
        prev ? { ...prev, maintenanceMode: enabled } : null
      );

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update maintenance mode";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    updateSettings,
    setMaintenanceMode,
    refresh: fetchSettings,
  };
}

export function useConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    try {
      setTesting(true);
      setError(null);
      setResult(null);

      const testResult = await systemService.testConnection();
      setResult(testResult);

      if (!testResult.success) {
        setError(testResult.error || "Connection test failed");
      }

      return testResult;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection test failed";
      setError(errorMessage);
      return { success: false, error: errorMessage, details: null };
    } finally {
      setTesting(false);
    }
  }, []);

  return {
    testing,
    result,
    error,
    testConnection,
  };
}
