import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-product-details-popup',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './income-product-details-popup.html',
  styleUrls: ['./income-product-details-popup.css'],
})
export class IncomeProductDetailsPopup {
  isEditMode: boolean = false;
  saveClicked: boolean = false;
  errorMessage: string = "";
  categories: any[] = [];
  products: any[] = [];

  model: any = {
    id: '',
    product: '',
    category: '',
    amount: 0,
    date: '',
    notes: '',
    paymentMethod: ''
  };

  constructor(
    private dialogRef: MatDialogRef<IncomeProductDetailsPopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {
    this.model = { ...data.rowData };
    this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.dash.fetchCategoriesByType('product');

    // Preselect the category id
    const matchedCat = this.categories.find(c => c.name === this.model.category);
    if (matchedCat) {
      this.model.category = matchedCat.id;
    }

    // Load products for that category
    if (this.model.category) {
      await this.onCategoryChange(this.model.category);
    }
  }

  async onCategoryChange(categoryId: string) {
    this.products = await this.dash.fetchProductsByCategory(categoryId);

    // Preselect product if it matches model.product
    const matchedProduct = this.products.find(p => p.name === this.model.product);
    if (matchedProduct) {
      this.model.product = matchedProduct.id;
    }
    else {
      this.model.product = '';
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.model = { ...this.data.rowData };
      // After categories load, match the model's category name to its id
      const matched = this.categories.find(
        c => c.name === this.model.category
      );

      // Set the model value to the category id so the <select> preselects
      if (matched) {
        this.model.category = matched.id;
      }
      const matchedProduct = this.products.find(p => p.name === this.model.product);
      if (matchedProduct) {
        this.model.product = matchedProduct.id;
      }
      else {
        this.model.product = '';
      }
      this.errorMessage = "";
    }
  }

  async onSubmit(f: NgForm) {
    if (!this.checkValidity(f)) return;

    try {
      await this.dash.updateIncomeProduct(this.model);
      this.animateSave();

      // Update category and product names for display
      const categoryName = this.categories.find(c => c.id === this.model.category)?.name || 'Uncategorized';
      const productName = this.products.find(p => p.id === this.model.product)?.name || 'Unknown';

      this.dialogRef.close({
        updatedRow: { ...this.model, category: categoryName, product: productName }
      });
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to update income product';
    }
  }

  animateSave() {
    this.saveClicked = true;
    setTimeout(() => (this.saveClicked = false), 700);
  }

  checkValidity(f: NgForm) {
    return (
      f.valid &&
      this.model.amount > 0 &&
      this.model.product &&
      this.model.category &&
      this.model.date
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }
}