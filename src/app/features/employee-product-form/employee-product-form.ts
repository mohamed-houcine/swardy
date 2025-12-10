import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-employee-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-product-form.html',
  styleUrls: ['./employee-product-form.css']
})
export class EmployeeProductFormComponent {


  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private dash: DashboardService) {}

  productId = '';
quantity = 1;
notes = '';
products: any[] = [];  // Liste des produits disponibles

async ngOnInit() {
  const { data } = await this.dash.supabase.client
    .from('product')
    .select('*');
  this.products = data || [];
}

async addTransaction() {
  try {
    await this.dash.addEmployeeTransaction({
      productId: this.productId,
      quantity: this.quantity,
      notes: this.notes
    });
    // reset form
    this.productId = '';
    this.quantity = 1;
    this.notes = '';
  } catch (err) {
    console.error(err);
  }
}

}
