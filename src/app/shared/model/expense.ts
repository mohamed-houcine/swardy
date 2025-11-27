export interface Expense {
  id: string;
  amount: number;
  date: string;         
  notes?: string;
  receipt?: string;
  userId: string;
  categoryId: string;
  productId?: string;
}
