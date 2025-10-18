-- Create a function to update stock and create a stock movement in a single transaction
CREATE OR REPLACE FUNCTION update_stock(
  product_id_param TEXT,
  quantity_change_param INT,
  movement_type_param TEXT,
  reason_param TEXT,
  user_id_param TEXT,
  reference_id_param TEXT DEFAULT NULL,
  reference_number_param TEXT DEFAULT NULL,
  branch_id_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock_val INT;
  new_stock_val INT;
  product_row products%ROWTYPE;
  movement_record stock_movements%ROWTYPE;
BEGIN
  -- Get the current stock and product details
  SELECT * INTO product_row FROM products WHERE id = product_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Product not found');
  END IF;

  current_stock_val := product_row.stock;
  new_stock_val := current_stock_val + quantity_change_param;

  -- Check for negative stock if not allowed
  IF new_stock_val < 0 THEN
    RETURN json_build_object('error', 'Stock quantity cannot be negative');
  END IF;

  -- Update the product's stock
  UPDATE products
  SET stock = new_stock_val, updated_at = NOW()
  WHERE id = product_id_param
  RETURNING * INTO product_row;

  -- Create the stock movement record
  INSERT INTO stock_movements (
    product_id, movement_type, quantity_change, quantity_before, quantity_after, reason, created_by, reference_id, reference_number, branch_id
  )
  VALUES (
    product_id_param, movement_type_param, quantity_change_param, current_stock_val, new_stock_val, reason_param, user_id_param, reference_id_param, reference_number_param, branch_id_param
  )
  RETURNING * INTO movement_record;

  -- Return the updated product and the new stock movement
  RETURN json_build_object('product', row_to_json(product_row), 'movement', row_to_json(movement_record));
END;
$$;

-- Grant execute permissions for the function
GRANT EXECUTE ON FUNCTION update_stock(TEXT, INT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_stock(TEXT, INT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
