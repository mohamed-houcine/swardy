export interface ProductExpense {
  id: number;
  productName?: string;
  category: string;
  quantity?: number | null;
  amount: number;
  date: string;
  notes?: string;
  receipt?: string;
}