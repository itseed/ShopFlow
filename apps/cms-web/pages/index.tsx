import React from 'react';
import { ProductTable } from '@ui/ProductTable';
import { Product } from '@types/Product';

const sampleProducts: Product[] = [
  { id: '1', name: 'Product A', price: 10 },
  { id: '2', name: 'Product B', price: 20 },
];

const HomePage: React.FC = () => {
  const handleEdit = (product: Product) => {
    console.log('Edit', product);
  };

  const handleDelete = (product: Product) => {
    console.log('Delete', product);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Products</h1>
      <ProductTable
        products={sampleProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default HomePage;
