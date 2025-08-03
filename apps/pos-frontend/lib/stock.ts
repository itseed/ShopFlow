import { Product } from "@shopflow/types";

// Stock Status Types
export type StockStatus = "healthy" | "low" | "critical" | "out";
export type AlertLevel = "info" | "warning" | "error" | "critical";

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: "low_stock" | "out_of_stock" | "critical_stock" | "reorder_point" | "expiring_soon";
  level: AlertLevel;
  message: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment" | "transfer" | "damage" | "expired";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  note?: string;
  userId: string;
  userName: string;
  createdAt: Date;
  reference?: string; // Order ID, Transfer ID, etc.
}

export interface StockSummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  criticalStockItems: number;
  movementsToday: number;
  alertsCount: number;
  reorderRequired: number;
}

export interface ReorderSuggestion {
  product: Product;
  suggestedQuantity: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
  daysUntilStockOut: number;
  averageDailySales: number;
}

// Stock Status Calculator
export class StockCalculator {
  static getStockStatus(product: Product): StockStatus {
    const { stockQuantity, minStockLevel } = product;
    
    if (stockQuantity === 0) return "out";
    if (stockQuantity <= minStockLevel * 0.5) return "critical";
    if (stockQuantity <= minStockLevel) return "low";
    return "healthy";
  }

  static getStockPercentage(product: Product): number {
    return product.maxStockLevel > 0 
      ? Math.min((product.stockQuantity / product.maxStockLevel) * 100, 100)
      : 0;
  }

  static getDaysUntilStockOut(product: Product, averageDailySales: number = 1): number {
    return averageDailySales > 0 ? Math.floor(product.stockQuantity / averageDailySales) : 0;
  }

  static getReorderQuantity(product: Product, leadTimeDays: number = 7, averageDailySales: number = 1): number {
    const safetyStock = product.minStockLevel;
    const leadTimeStock = averageDailySales * leadTimeDays;
    const currentStock = product.stockQuantity;
    const targetStock = Math.min(product.maxStockLevel, safetyStock + leadTimeStock);
    
    return Math.max(0, targetStock - currentStock);
  }

  static getStockValue(products: Product[]): number {
    return products.reduce((total, product) => 
      total + (product.stockQuantity * product.cost), 0
    );
  }

  static getStockTurnover(product: Product, salesLastPeriod: number, periodDays: number = 30): number {
    const averageStock = (product.stockQuantity + product.minStockLevel) / 2;
    return averageStock > 0 ? (salesLastPeriod / averageStock) * (365 / periodDays) : 0;
  }
}

// Stock Alerts Manager
export class StockAlertsManager {
  static generateAlerts(products: Product[]): StockAlert[] {
    const alerts: StockAlert[] = [];

    products.forEach(product => {
      const status = StockCalculator.getStockStatus(product);
      const alertId = `alert_${product.id}_${Date.now()}`;

      switch (status) {
        case "out":
          alerts.push({
            id: alertId,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            type: "out_of_stock",
            level: "critical",
            message: `${product.name} หมดสต็อก - ต้องเติมทันที`,
            currentStock: product.stockQuantity,
            minStockLevel: product.minStockLevel,
            maxStockLevel: product.maxStockLevel,
            createdAt: new Date(),
            acknowledged: false,
          });
          break;

        case "critical":
          alerts.push({
            id: alertId,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            type: "critical_stock",
            level: "error",
            message: `${product.name} สต็อกวิกฤต (${product.stockQuantity} เหลือ) - เติมด่วน`,
            currentStock: product.stockQuantity,
            minStockLevel: product.minStockLevel,
            maxStockLevel: product.maxStockLevel,
            createdAt: new Date(),
            acknowledged: false,
          });
          break;

        case "low":
          alerts.push({
            id: alertId,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            type: "low_stock",
            level: "warning",
            message: `${product.name} สต็อกต่ำ (${product.stockQuantity} เหลือ) - ควรเติมสต็อก`,
            currentStock: product.stockQuantity,
            minStockLevel: product.minStockLevel,
            maxStockLevel: product.maxStockLevel,
            createdAt: new Date(),
            acknowledged: false,
          });
          break;
      }

      // Check for reorder point
      if (product.stockQuantity <= product.minStockLevel && product.stockQuantity > 0) {
        alerts.push({
          id: `reorder_${product.id}_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          type: "reorder_point",
          level: "warning",
          message: `${product.name} ถึงจุดสั่งซื้อ - ควรสั่งซื้อเพิ่ม`,
          currentStock: product.stockQuantity,
          minStockLevel: product.minStockLevel,
          maxStockLevel: product.maxStockLevel,
          createdAt: new Date(),
          acknowledged: false,
        });
      }
    });

    return alerts;
  }

  static filterAlerts(
    alerts: StockAlert[], 
    filters: {
      level?: AlertLevel;
      type?: StockAlert["type"];
      acknowledged?: boolean;
      productId?: string;
    }
  ): StockAlert[] {
    return alerts.filter(alert => {
      if (filters.level && alert.level !== filters.level) return false;
      if (filters.type && alert.type !== filters.type) return false;
      if (filters.acknowledged !== undefined && alert.acknowledged !== filters.acknowledged) return false;
      if (filters.productId && alert.productId !== filters.productId) return false;
      return true;
    });
  }

  static acknowledgeAlert(alert: StockAlert, userId: string, userName: string): StockAlert {
    return {
      ...alert,
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    };
  }

  static getAlertSeverityScore(alert: StockAlert): number {
    const levelScore = {
      critical: 4,
      error: 3,
      warning: 2,
      info: 1,
    };

    const typeScore = {
      out_of_stock: 4,
      critical_stock: 3,
      low_stock: 2,
      reorder_point: 2,
      expiring_soon: 1,
    };

    return levelScore[alert.level] * typeScore[alert.type];
  }
}

// Stock Movement Tracker
export class StockMovementTracker {
  static createMovement(
    product: Product,
    type: StockMovement["type"],
    quantity: number,
    newStock: number,
    reason: string,
    userId: string,
    userName: string,
    note?: string,
    reference?: string
  ): StockMovement {
    return {
      id: `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      type,
      quantity,
      previousStock: product.stockQuantity,
      newStock,
      reason,
      note,
      userId,
      userName,
      createdAt: new Date(),
      reference,
    };
  }

  static getMovementsByProduct(movements: StockMovement[], productId: string): StockMovement[] {
    return movements
      .filter(movement => movement.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static getMovementsByDateRange(
    movements: StockMovement[], 
    startDate: Date, 
    endDate: Date
  ): StockMovement[] {
    return movements.filter(movement => 
      movement.createdAt >= startDate && movement.createdAt <= endDate
    );
  }

  static calculateNetMovement(movements: StockMovement[]): number {
    return movements.reduce((total, movement) => {
      switch (movement.type) {
        case "in":
        case "adjustment":
          return total + movement.quantity;
        case "out":
        case "damage":
        case "expired":
          return total - movement.quantity;
        case "transfer":
          // Transfer could be in or out depending on context
          return total + movement.quantity;
        default:
          return total;
      }
    }, 0);
  }
}

// Reorder Suggestions Generator
export class ReorderSuggestionsGenerator {
  static generateSuggestions(
    products: Product[],
    salesData: Record<string, number> = {}, // productId -> daily sales average
    leadTimeDays: number = 7
  ): ReorderSuggestion[] {
    const suggestions: ReorderSuggestion[] = [];

    products.forEach(product => {
      const averageDailySales = salesData[product.id] || 1;
      const daysUntilStockOut = StockCalculator.getDaysUntilStockOut(product, averageDailySales);
      const suggestedQuantity = StockCalculator.getReorderQuantity(product, leadTimeDays, averageDailySales);

      if (suggestedQuantity > 0) {
        let urgencyLevel: ReorderSuggestion["urgencyLevel"] = "low";
        
        if (product.stockQuantity === 0) urgencyLevel = "critical";
        else if (daysUntilStockOut <= 3) urgencyLevel = "high";
        else if (daysUntilStockOut <= 7) urgencyLevel = "medium";

        suggestions.push({
          product,
          suggestedQuantity,
          urgencyLevel,
          estimatedCost: suggestedQuantity * product.cost,
          daysUntilStockOut,
          averageDailySales,
        });
      }
    });

    // Sort by urgency and days until stock out
    return suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
      
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.daysUntilStockOut - b.daysUntilStockOut;
    });
  }

  static groupSuggestionsByUrgency(suggestions: ReorderSuggestion[]): Record<ReorderSuggestion["urgencyLevel"], ReorderSuggestion[]> {
    return suggestions.reduce((groups, suggestion) => {
      const urgency = suggestion.urgencyLevel;
      if (!groups[urgency]) groups[urgency] = [];
      groups[urgency].push(suggestion);
      return groups;
    }, {} as Record<ReorderSuggestion["urgencyLevel"], ReorderSuggestion[]>);
  }

  static calculateTotalReorderCost(suggestions: ReorderSuggestion[]): number {
    return suggestions.reduce((total, suggestion) => total + suggestion.estimatedCost, 0);
  }
}

// Stock Summary Generator
export class StockSummaryGenerator {
  static generateSummary(
    products: Product[],
    movements: StockMovement[] = [],
    alerts: StockAlert[] = []
  ): StockSummary {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayMovements = movements.filter(movement => 
      movement.createdAt >= todayStart
    );

    const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

    return {
      totalProducts: products.length,
      totalValue: StockCalculator.getStockValue(products),
      lowStockItems: products.filter(p => StockCalculator.getStockStatus(p) === "low").length,
      outOfStockItems: products.filter(p => StockCalculator.getStockStatus(p) === "out").length,
      criticalStockItems: products.filter(p => StockCalculator.getStockStatus(p) === "critical").length,
      movementsToday: todayMovements.length,
      alertsCount: unacknowledgedAlerts.length,
      reorderRequired: products.filter(p => p.stockQuantity <= p.minStockLevel).length,
    };
  }
}

// Export utility functions
export const stockUtils = {
  getStockStatus: StockCalculator.getStockStatus,
  getStockPercentage: StockCalculator.getStockPercentage,
  getDaysUntilStockOut: StockCalculator.getDaysUntilStockOut,
  getReorderQuantity: StockCalculator.getReorderQuantity,
  getStockValue: StockCalculator.getStockValue,
  generateAlerts: StockAlertsManager.generateAlerts,
  filterAlerts: StockAlertsManager.filterAlerts,
  acknowledgeAlert: StockAlertsManager.acknowledgeAlert,
  createMovement: StockMovementTracker.createMovement,
  generateReorderSuggestions: ReorderSuggestionsGenerator.generateSuggestions,
  generateStockSummary: StockSummaryGenerator.generateSummary,
};