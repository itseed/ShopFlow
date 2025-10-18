import { useQuery } from "@tanstack/react-query";
import { stockMovementService } from "@shopflow/api";
import { QUERY_KEYS } from "./queryKeys";

// Stock Movement Hooks
export function useStockMovements(productId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_MOVEMENTS, productId],
    queryFn: async () => {
      if (!productId) return [];

      const response = await stockMovementService.getProductStockMovements(
        productId
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch stock movements");
      }
      return response.data || [];
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
