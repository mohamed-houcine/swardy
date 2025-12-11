import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-product-delete-popup',
  standalone: true,
  templateUrl: './income-product-delete-popup.html',
  styleUrls: ['./income-product-delete-popup.css']
})
export class IncomeProductDeletePopup {
  constructor(
    private dialogRef: MatDialogRef<IncomeProductDeletePopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  async confirmDelete(): Promise<void> {
    try {
      await this.dash.deleteIncomeProduct(this.data.id);

      console.log('Deleted income product with ID:', this.data.id);
      this.dialogRef.close('deleted'); // Return 'deleted' to refresh the table
    } catch (error) {
      console.error('Error deleting income product:', error);
    }
  }
}
