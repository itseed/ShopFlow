-- Create a function to update order payment status and create a payment transaction in a single transaction
CREATE OR REPLACE FUNCTION update_order_payment_status(
  order_id_param TEXT,
  payment_status_param TEXT,
  payment_method_param TEXT,
  amount_param NUMERIC,
  user_id_param TEXT,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_row orders%ROWTYPE;
  transaction_record payment_transactions%ROWTYPE;
BEGIN
  -- Update the order's payment status
  UPDATE orders
  SET payment_status = payment_status_param, updated_at = NOW(), internal_notes = notes_param
  WHERE id = order_id_param
  RETURNING * INTO order_row;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Order not found');
  END IF;

  -- Create the payment transaction record
  INSERT INTO payment_transactions (
    order_id, transaction_type, payment_method, amount, processed_by, notes
  )
  VALUES (
    order_id_param, 'payment', payment_method_param, amount_param, user_id_param, notes_param
  )
  RETURNING * INTO transaction_record;

  -- Return the updated order and the new payment transaction
  RETURN json_build_object('order', row_to_json(order_row), 'transaction', row_to_json(transaction_record));
END;
$$;

-- Grant execute permissions for the function
GRANT EXECUTE ON FUNCTION update_order_payment_status(TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_payment_status(TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT) TO service_role;
