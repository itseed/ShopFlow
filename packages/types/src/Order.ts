import { Product } from './Product';

export interface Order {
  id: string;
  items: Product[];
  total: number;
}
