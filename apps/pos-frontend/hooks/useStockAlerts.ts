import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@chakra-ui/react";
import { Product } from "@shopflow/types";
import { 
  StockAlert, 
  StockAlertsManager, 
  AlertLevel,
  stockUtils
} from "../lib/stock";

interface UseStockAlertsOptions {
  products: Product[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
  maxAlerts?: number;
}

interface UseStockAlertsReturn {
  alerts: StockAlert[];
  unacknowledgedAlerts: StockAlert[];
  criticalAlerts: StockAlert[];
  alertsCount: number;
  isLoading: boolean;
  refreshAlerts: () => void;
  acknowledgeAlert: (alertId: string, userId: string, userName: string) => void;
  acknowledgeAllAlerts: (userId: string, userName: string) => void;
  dismissAlert: (alertId: string) => void;
  getAlertsByLevel: (level: AlertLevel) => StockAlert[];
  getAlertsByProduct: (productId: string) => StockAlert[];
  filterAlerts: (filters: {
    level?: AlertLevel;
    type?: StockAlert["type"];
    acknowledged?: boolean;
  }) => StockAlert[];
}

export const useStockAlerts = (options: UseStockAlertsOptions): UseStockAlertsReturn => {
  const {
    products,
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
    enableNotifications = true,
    maxAlerts = 100,
  } = options;

  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const toast = useToast();

  // Generate alerts from products
  const generateAlerts = useCallback(() => {
    setIsLoading(true);
    try {
      const newAlerts = StockAlertsManager.generateAlerts(products);
      
      // Limit the number of alerts
      const limitedAlerts = newAlerts
        .sort((a, b) => StockAlertsManager.getAlertSeverityScore(b) - StockAlertsManager.getAlertSeverityScore(a))
        .slice(0, maxAlerts);

      setAlerts(prevAlerts => {
        // Merge with existing acknowledged alerts
        const acknowledgedAlerts = prevAlerts.filter(alert => alert.acknowledged);
        const mergedAlerts = [...acknowledgedAlerts, ...limitedAlerts];
        
        // Remove duplicates based on product ID
        const uniqueAlerts = mergedAlerts.reduce((acc, alert) => {
          const existingIndex = acc.findIndex(a => 
            a.productId === alert.productId && 
            a.type === alert.type
          );
          
          if (existingIndex >= 0) {
            // Keep the newer alert or the acknowledged one
            if (alert.acknowledged || acc[existingIndex].createdAt < alert.createdAt) {
              acc[existingIndex] = alert;
            }
          } else {
            acc.push(alert);
          }
          
          return acc;
        }, [] as StockAlert[]);

        return uniqueAlerts;
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error generating stock alerts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [products, maxAlerts]);

  // Show toast notifications for new critical alerts
  const showNotifications = useCallback((newAlerts: StockAlert[], prevAlerts: StockAlert[]) => {
    if (!enableNotifications) return;

    const newCriticalAlerts = newAlerts.filter(alert => 
      alert.level === "critical" && 
      !alert.acknowledged &&
      !prevAlerts.some(prev => prev.id === alert.id)
    );

    newCriticalAlerts.forEach(alert => {
      toast({
        title: "แจ้งเตือนสต็อกวิกฤต!",
        description: alert.message,
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    });

    const newWarningAlerts = newAlerts.filter(alert => 
      alert.level === "warning" && 
      !alert.acknowledged &&
      !prevAlerts.some(prev => prev.id === alert.id)
    );

    if (newWarningAlerts.length > 0) {
      toast({
        title: `แจ้งเตือนสต็อกต่ำ`,
        description: `มีสินค้า ${newWarningAlerts.length} รายการที่สต็อกต่ำ`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [enableNotifications, toast]);

  // Refresh alerts
  const refreshAlerts = useCallback(() => {
    generateAlerts();
  }, [generateAlerts]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string, userId: string, userName: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? StockAlertsManager.acknowledgeAlert(alert, userId, userName)
          : alert
      )
    );
  }, []);

  // Acknowledge all alerts
  const acknowledgeAllAlerts = useCallback((userId: string, userName: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        !alert.acknowledged 
          ? StockAlertsManager.acknowledgeAlert(alert, userId, userName)
          : alert
      )
    );
  }, []);

  // Dismiss an alert (remove from list)
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  }, []);

  // Filter alerts by level
  const getAlertsByLevel = useCallback((level: AlertLevel) => {
    return StockAlertsManager.filterAlerts(alerts, { level });
  }, [alerts]);

  // Filter alerts by product
  const getAlertsByProduct = useCallback((productId: string) => {
    return StockAlertsManager.filterAlerts(alerts, { productId });
  }, [alerts]);

  // Filter alerts with custom filters
  const filterAlerts = useCallback((filters: {
    level?: AlertLevel;
    type?: StockAlert["type"];
    acknowledged?: boolean;
  }) => {
    return StockAlertsManager.filterAlerts(alerts, filters);
  }, [alerts]);

  // Computed values
  const unacknowledgedAlerts = useMemo(() => 
    alerts.filter(alert => !alert.acknowledged), 
    [alerts]
  );

  const criticalAlerts = useMemo(() => 
    alerts.filter(alert => alert.level === "critical" && !alert.acknowledged), 
    [alerts]
  );

  const alertsCount = useMemo(() => unacknowledgedAlerts.length, [unacknowledgedAlerts]);

  // Initial load
  useEffect(() => {
    generateAlerts();
  }, [generateAlerts]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const prevAlerts = alerts;
      generateAlerts();
      
      // Check for new alerts after a short delay
      setTimeout(() => {
        setAlerts(currentAlerts => {
          showNotifications(currentAlerts, prevAlerts);
          return currentAlerts;
        });
      }, 1000);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, generateAlerts, alerts, showNotifications]);

  // Listen for product changes
  useEffect(() => {
    generateAlerts();
  }, [products, generateAlerts]);

  return {
    alerts,
    unacknowledgedAlerts,
    criticalAlerts,
    alertsCount,
    isLoading,
    refreshAlerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    dismissAlert,
    getAlertsByLevel,
    getAlertsByProduct,
    filterAlerts,
  };
};

// Hook for stock movements tracking
interface UseStockMovementsOptions {
  productId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const useStockMovements = (options: UseStockMovementsOptions = {}) => {
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMovement = useCallback((movement: any) => {
    setMovements(prev => [movement, ...prev]);
  }, []);

  const getMovementsByProduct = useCallback((productId: string) => {
    return movements.filter(movement => movement.productId === productId);
  }, [movements]);

  const getMovementsByDateRange = useCallback((start: Date, end: Date) => {
    return movements.filter(movement => 
      movement.createdAt >= start && movement.createdAt <= end
    );
  }, [movements]);

  return {
    movements,
    isLoading,
    addMovement,
    getMovementsByProduct,
    getMovementsByDateRange,
  };
};

// Hook for reorder suggestions
export const useReorderSuggestions = (products: Product[], salesData: Record<string, number> = {}) => {
  const suggestions = useMemo(() => {
    return stockUtils.generateReorderSuggestions(products, salesData);
  }, [products, salesData]);

  const criticalSuggestions = useMemo(() => 
    suggestions.filter(s => s.urgencyLevel === "critical"),
    [suggestions]
  );

  const highPrioritySuggestions = useMemo(() => 
    suggestions.filter(s => s.urgencyLevel === "high"),
    [suggestions]
  );

  const totalReorderCost = useMemo(() => 
    suggestions.reduce((total, suggestion) => total + suggestion.estimatedCost, 0),
    [suggestions]
  );

  return {
    suggestions,
    criticalSuggestions,
    highPrioritySuggestions,
    totalReorderCost,
  };
};