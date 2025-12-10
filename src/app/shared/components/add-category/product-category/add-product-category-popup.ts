import { Component, Inject, input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard.service';
import { Category } from '../../../model/category';

@Component({
  selector: 'app-add-income-category-popup',
  imports: [FormsModule, NgIf],
  templateUrl: './add-product-category-popup.html',
  styleUrl: './add-product-category-popup.css'
})
export class addProductCategoryPopup {
  addClicked: boolean = false;
  model: Category = {
    id: "",
    name: "",
    color: "#6558bf"
  };
  errorMessage: string = "";

  constructor(private dialogRef: MatDialogRef<addProductCategoryPopup>, private dash: DashboardService) {}

  animateAdd() {
    this.addClicked = true;
    setTimeout(() => this.addClicked = false, 700);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  async onSubmit(f: NgForm): Promise<void> {
    if (!this.checkValidity(f)) return;

    try {
      await this.dash.addCategory(this.model, 'product');
      f.reset({color: "#6558bf"});
      this.errorMessage = "";
      this.animateAdd();
    } catch(err) {
      this.errorMessage = "This category already exist on product";
    }
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.name != '';
  }
}