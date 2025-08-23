import { useState, useEffect, useCallback } from "react";
import {
  securityService,
  SecurityLog,
  ApiKey,
} from "../services/securityService";

export function useSecurityLogs(limit: number = 50) {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await securityService.getSecurityLogs(limit);
      setLogs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch security logs"
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  };
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await securityService.getApiKeys();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(
    async (
      apiKey: Omit<ApiKey, "id" | "created_at" | "usage_count" | "last_used">
    ) => {
      try {
        setCreating(true);
        setError(null);
        const data = await securityService.createApiKey(apiKey);

        if (data) {
          setApiKeys((prev) => [data, ...prev]);
          return { success: true, data };
        } else {
          throw new Error("Failed to create API key");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create API key";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setCreating(false);
      }
    },
    []
  );

  const updateApiKey = useCallback(
    async (id: string, updates: Partial<ApiKey>) => {
      try {
        setUpdating(true);
        setError(null);
        const success = await securityService.updateApiKey(id, updates);

        if (success) {
          setApiKeys((prev) =>
            prev.map((key) => (key.id === id ? { ...key, ...updates } : key))
          );
          return { success: true };
        } else {
          throw new Error("Failed to update API key");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update API key";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  const deleteApiKey = useCallback(async (id: string) => {
    try {
      setDeleting(true);
      setError(null);
      const success = await securityService.deleteApiKey(id);

      if (success) {
        setApiKeys((prev) => prev.filter((key) => key.id !== id));
        return { success: true };
      } else {
        throw new Error("Failed to delete API key");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete API key";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setDeleting(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  return {
    apiKeys,
    loading,
    error,
    creating,
    updating,
    deleting,
    refresh: fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  };
}
