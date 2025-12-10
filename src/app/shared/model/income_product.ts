export interface IncomeProduct {
  id: string;
  product: string;
  category: string;
  amount: number;
  quantity: number | null;
  date: string;             
  scan_type: "barcode" | "manual";
  notes?: string;
  employeeName: string; 
  paymentMethod: string;
}