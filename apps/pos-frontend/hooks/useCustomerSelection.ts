import { useState, useCallback } from "react";
import { Customer } from "@shopflow/types";

interface UseCustomerSelectionOptions {
  allowMultiple?: boolean;
  onCustomerSelect?: (customer: Customer | Customer[]) => void;
}

interface UseCustomerSelectionReturn {
  selectedCustomers: Customer[];
  selectedCustomer: Customer | null;
  isSelecting: boolean;
  selectCustomer: (customer: Customer) => void;
  selectCustomers: (customers: Customer[]) => void;
  clearSelection: () => void;
  toggleSelection: (customer: Customer) => void;
  isCustomerSelected: (customer: Customer) => boolean;
  startSelection: () => void;
  finishSelection: () => void;
  cancelSelection: () => void;
}

export const useCustomerSelection = (
  options: UseCustomerSelectionOptions = {}
): UseCustomerSelectionReturn => {
  const { allowMultiple = false, onCustomerSelect } = options;

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const selectedCustomer =
    selectedCustomers.length > 0 ? selectedCustomers[0] : null;

  const selectCustomer = useCallback(
    (customer: Customer) => {
      setSelectedCustomers([customer]);
      if (onCustomerSelect && !allowMultiple) {
        onCustomerSelect(customer);
      }
    },
    [onCustomerSelect, allowMultiple]
  );

  const selectCustomers = useCallback(
    (customers: Customer[]) => {
      setSelectedCustomers(customers);
      if (onCustomerSelect) {
        onCustomerSelect(allowMultiple ? customers : customers[0]);
      }
    },
    [onCustomerSelect, allowMultiple]
  );

  const clearSelection = useCallback(() => {
    setSelectedCustomers([]);
  }, []);

  const toggleSelection = useCallback(
    (customer: Customer) => {
      setSelectedCustomers((prev) => {
        const isSelected = prev.some((c) => c.id === customer.id);

        if (allowMultiple) {
          if (isSelected) {
            return prev.filter((c) => c.id !== customer.id);
          } else {
            return [...prev, customer];
          }
        } else {
          return isSelected ? [] : [customer];
        }
      });
    },
    [allowMultiple]
  );

  const isCustomerSelected = useCallback(
    (customer: Customer) => {
      return selectedCustomers.some((c) => c.id === customer.id);
    },
    [selectedCustomers]
  );

  const startSelection = useCallback(() => {
    setIsSelecting(true);
  }, []);

  const finishSelection = useCallback(() => {
    setIsSelecting(false);
    if (onCustomerSelect) {
      if (allowMultiple) {
        onCustomerSelect(selectedCustomers);
      } else if (selectedCustomer) {
        onCustomerSelect(selectedCustomer);
      }
    }
  }, [onCustomerSelect, allowMultiple, selectedCustomers, selectedCustomer]);

  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectedCustomers([]);
  }, []);

  return {
    selectedCustomers,
    selectedCustomer,
    isSelecting,
    selectCustomer,
    selectCustomers,
    clearSelection,
    toggleSelection,
    isCustomerSelected,
    startSelection,
    finishSelection,
    cancelSelection,
  };
};

export default useCustomerSelection;
