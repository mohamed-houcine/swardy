export enum ScanType {
  BARCODE = 'barcode',
  MANUAL = 'manual'
}
export enum IncomeType{
  SOURCE='source',
  PRODUCT='product'
}

export interface IncomeModel {
  id: string;
  name:string;
  amount: number;
  quantity?: number | null;
  date: string;             
  scan_type?: ScanType;
  notes?: string;
  productId?: string;       
  employeeName?: string; 
  paymentMethod?: string;
  type:IncomeType;          
}
