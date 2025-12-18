import { useQuery } from "@tanstack/react-query";
import { reportService } from "@shopflow/api/services/reportService";
import { QUERY_KEYS } from "./queryKeys";

// Stock Movement Hooks
export function useStockMovements(productId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_MOVEMENTS, productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = await reportService.inventory.movements({ productId });
      return response || [];
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
}
