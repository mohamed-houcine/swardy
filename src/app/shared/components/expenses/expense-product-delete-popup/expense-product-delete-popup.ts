import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-product-delete-popup',
  standalone: true,
  templateUrl: './expense-product-delete-popup.html',
  styleUrls: ['./expense-product-delete-popup.css']
})
export class ExpenseProductDeletePopup {
  constructor(
    private dialogRef: MatDialogRef<ExpenseProductDeletePopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  async confirmDelete(): Promise<void> {
    try {
      await this.dash.deleteExpenseProduct(this.data.id, this.data.rowData.receipt);

      console.log('Deleted income product with ID:', this.data.id);
      this.dialogRef.close('deleted'); // Return 'deleted' to refresh the table
    } catch (error) {
      console.error('Error deleting income product:', error);
    }
  }
}
