import React, { createContext, useContext, useEffect, useState } from "react";
import {
  SalesCart,
  SalesCartItem,
  SalesProduct,
  SalesTransaction,
  SalesPayment,
  SalesContextType,
} from "@shopflow/types";
import { useAuth } from "./AuthContext";
import {
  createEmptyCart,
  calculateCartTotals,
  getStoredCart,
  setStoredCart,
  clearStoredCart,
  generateTransactionNumber,
  generateReceiptNumber,
  processPayment,
} from "../lib/sales";

const SalesContext = createContext<SalesContextType | null>(null);

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};

interface SalesProviderProps {
  children: React.ReactNode;
}

export const SalesProvider = ({ children }: SalesProviderProps) => {
  const [cart, setCart] = useState<SalesCart>(createEmptyCart);
  const [currentTransaction, setCurrentTransaction] =
    useState<SalesTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Load cart from storage on mount
  useEffect(() => {
    const storedCart = getStoredCart();
    if (storedCart) {
      setCart(storedCart);
    }
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (cart.items.length > 0) {
      setStoredCart(cart);
    } else {
      clearStoredCart();
    }
  }, [cart]);

  const addToCart = (product: SalesProduct, quantity: number = 1) => {
    if (quantity <= 0) return;

    setError(null);

    // ถ้าเป็นสินค้าที่มี variant (ชื่อมี () หรือ product.hasVariants)
    const isVariant = product.hasVariants || /\(.+\)/.test(product.name);
    let existingItemIndex = -1;
    if (isVariant) {
      // เช็คทั้ง id และชื่อ (ชื่อจะมี combination)
      existingItemIndex = cart.items.findIndex(
        (item) => item.product.id === product.id && item.product.name === product.name
      );
    } else {
      // สินค้าทั่วไป เช็คแค่ id
      existingItemIndex = cart.items.findIndex(
        (item) => item.product.id === product.id
      );
    }

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };

      const updatedCart = calculateCartTotals({
        ...cart,
        items: updatedItems,
      });

      setCart(updatedCart);
    } else {
      // Add new item to cart
      const newItem: SalesCartItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product,
        quantity,
        unitPrice: product.price,
        discountAmount: 0,
        discountPercentage: 0,
        taxAmount: 0,
        subtotal: 0,
        total: 0,
      };

      const updatedCart = calculateCartTotals({
        ...cart,
        items: [...cart.items, newItem],
      });

      setCart(updatedCart);
    }
  };

  const updateCartItem = (itemId: string, updates: Partial<SalesCartItem>) => {
    setError(null);

    const updatedItems = cart.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const updatedCart = calculateCartTotals({
      ...cart,
      items: updatedItems,
    });

    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    setError(null);

    const updatedItems = cart.items.filter((item) => item.id !== itemId);

    const updatedCart = calculateCartTotals({
      ...cart,
      items: updatedItems,
    });

    setCart(updatedCart);
  };

  const clearCart = () => {
    setError(null);
    setCart(createEmptyCart());
    clearStoredCart();
  };

  const applyDiscount = (
    itemId: string,
    discount: number,
    isPercentage: boolean
  ) => {
    setError(null);

    const updatedItems = cart.items.map((item) => {
      if (item.id === itemId) {
        if (isPercentage) {
          return {
            ...item,
            discountPercentage: Math.max(0, Math.min(100, discount)),
            discountAmount: 0,
          };
        } else {
          return {
            ...item,
            discountAmount: Math.max(0, Math.min(item.subtotal, discount)),
            discountPercentage: 0,
          };
        }
      }
      return item;
    });

    const updatedCart = calculateCartTotals({
      ...cart,
      items: updatedItems,
    });

    setCart(updatedCart);
  };

  const handleProcessPayment = async (
    payment: Omit<SalesPayment, "id" | "createdAt">
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const processedPayment = await processPayment(payment);

      if (processedPayment.status === "completed") {
        // For demo purposes, we'll store the payment info
        // In a real app, this would be sent to the backend
        return true;
      } else {
        setError("Payment failed. Please try again.");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment processing failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeTransaction = async (
    customer?: SalesTransaction["customer"]
  ): Promise<SalesTransaction | null> => {
    if (!session?.user || !session?.branch) {
      setError("User session not found");
      return null;
    }

    if (cart.items.length === 0) {
      setError("Cart is empty");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction: SalesTransaction = {
        id: `transaction_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        transactionNumber: generateTransactionNumber(),
        cart: { ...cart },
        payments: [], // Would be populated from payment processing
        customer,
        cashier: {
          id: session.user.id,
          name: `${session.user.firstName} ${session.user.lastName}`,
          username: session.user.username,
        },
        branch: {
          id: session.branch.id,
          name: session.branch.name,
        },
        status: "completed",
        receipt: {
          printed: false,
          emailSent: false,
          receiptNumber: generateReceiptNumber(),
        },
        createdAt: new Date(),
        completedAt: new Date(),
      };

      setCurrentTransaction(transaction);

      // Clear cart after successful transaction
      clearCart();

      return transaction;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTransaction = () => {
    setCurrentTransaction(null);
    setError(null);
  };

  const value: SalesContextType = {
    cart,
    currentTransaction,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyDiscount,
    processPayment: handleProcessPayment,
    completeTransaction,
    cancelTransaction,
    isLoading,
    error,
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
};
