export interface NormalExpense {
  id: number;
  name?: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  receipt?: string;
}