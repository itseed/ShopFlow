import React from 'react';
import { Product } from '@shopflow/types';

export interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  loading?: boolean;
  error?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  loading = false,
  error,
}) => {
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!products.length) {
    return <div className="p-4">No products found.</div>;
  }

  return (
    <table className="min-w-full border border-gray-200 text-sm">
      <thead>
        <tr className="bg-gray-50 text-left">
          <th className="border-b px-4 py-2">ID</th>
          <th className="border-b px-4 py-2">Name</th>
          <th className="border-b px-4 py-2">Price</th>
          {(onEdit || onDelete) && (
            <th className="border-b px-4 py-2 text-right">Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="odd:bg-white even:bg-gray-50">
            <td className="border-b px-4 py-2">{product.id}</td>
            <td className="border-b px-4 py-2">{product.name}</td>
            <td className="border-b px-4 py-2">{product.price}</td>
            {(onEdit || onDelete) && (
              <td className="border-b px-4 py-2 text-right space-x-2">
                {onEdit && (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => onDelete(product)}
                  >
                    Delete
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

