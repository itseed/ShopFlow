-- Create a function to handle order refunds
CREATE OR REPLACE FUNCTION refund_order(
  order_id_param TEXT,
  refund_items_param JSONB,
  reason_param TEXT,
  notes_param TEXT,
  user_id_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_row orders%ROWTYPE;
  item_data JSONB;
  product_id_val UUID;
  quantity_val INT;
  unit_price_val NUMERIC;
  total_refund_amount NUMERIC := 0;
  payment_transaction_record payment_transactions%ROWTYPE;
BEGIN
  -- Update the order status to refunded
  UPDATE orders
  SET status = 'refunded', updated_at = NOW(), internal_notes = notes_param
  WHERE id = order_id_param
  RETURNING * INTO order_row;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Order not found');
  END IF;

  -- Loop through refund items and create stock movements
  FOR item_data IN SELECT * FROM jsonb_array_elements(refund_items_param)
  LOOP
    product_id_val := (item_data->>'product_id')::UUID;
    quantity_val := (item_data->>'quantity')::INT;
    unit_price_val := (item_data->>'unit_price')::NUMERIC;

    -- Create stock movement for returned item (increase stock)
    INSERT INTO stock_movements (
      product_id, movement_type, quantity_change, quantity_before, quantity_after, reason, created_by, reference_type, reference_id, reference_number, branch_id
    )
    VALUES (
      product_id_val, 'return', quantity_val, 
      (SELECT stock FROM products WHERE id = product_id_val), 
      (SELECT stock FROM products WHERE id = product_id_val) + quantity_val, 
      reason_param, user_id_param, 'order', order_id_param, order_row.order_number, order_row.branch_id
    );

    -- Update product stock
    UPDATE products
    SET stock = stock + quantity_val, updated_at = NOW()
    WHERE id = product_id_val;

    total_refund_amount := total_refund_amount + (quantity_val * unit_price_val);
  END LOOP;

  -- Create payment transaction for refund
  INSERT INTO payment_transactions (
    order_id, transaction_type, payment_method, amount, processed_by, notes
  )
  VALUES (
    order_id_param, 'refund', order_row.payment_method, total_refund_amount, user_id_param, notes_param
  )
  RETURNING * INTO payment_transaction_record;

  -- Return the updated order and the new payment transaction
  RETURN json_build_object('order', row_to_json(order_row), 'refund_transaction', row_to_json(payment_transaction_record));
END;
$$;

-- Grant execute permissions for the function
GRANT EXECUTE ON FUNCTION refund_order(TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_order(TEXT, JSONB, TEXT, TEXT, TEXT) TO service_role;