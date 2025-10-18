import { productService } from '../../services/productService';
import { supabase } from '../../supabase';

jest.mock('../../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn(),
  },
}));

describe('ProductService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLowStock', () => {
    it('should call the low_stock_products view', async () => {
      const mockData = [{ id: '1', name: 'Low Stock Product', stock: 1, min_stock: 5 }];
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      }));

      const response = await productService.getLowStock();

      expect(supabase.from).toHaveBeenCalledWith('low_stock_products');
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });
  });
});
