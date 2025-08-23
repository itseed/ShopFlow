-- Create a view for low stock products
-- This view handles the stock <= min_stock comparison at the database level

CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.*,
  c.id as category_id,
  c.name as category_name,
  c.description as category_description
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= COALESCE(p.min_stock, 5) OR p.stock = 0;

-- Grant permissions for the view
GRANT SELECT ON low_stock_products TO anon;
GRANT SELECT ON low_stock_products TO authenticated;
GRANT SELECT ON low_stock_products TO service_role;

-- Create a function to get low stock products count
CREATE OR REPLACE FUNCTION get_low_stock_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM low_stock_products;
$$;

-- Grant execute permissions for the function
GRANT EXECUTE ON FUNCTION get_low_stock_count() TO anon;
GRANT EXECUTE ON FUNCTION get_low_stock_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_count() TO service_role;