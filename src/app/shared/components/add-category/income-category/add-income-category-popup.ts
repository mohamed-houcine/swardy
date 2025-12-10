import { Component, Inject, input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard.service';
import { Category } from '../../../model/category';

@Component({
  selector: 'app-add-income-category-popup',
  imports: [FormsModule, NgIf],
  templateUrl: './add-income-category-popup.html',
  styleUrl: './add-income-category-popup.css'
})
export class addIncomeCategoryPopup {
  addClicked: boolean = false;
  model: Category = {
    id: "",
    name: "",
    color: "#6558bf"
  };
  errorMessage: string = "";

  constructor(private dialogRef: MatDialogRef<addIncomeCategoryPopup>, private dash: DashboardService) {}

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
      await this.dash.addCategory(this.model, 'income');
      f.reset({color: "#6558bf"});
      this.errorMessage = "";
      this.animateAdd();
    } catch(err) {
      this.errorMessage = "This category already exist on income";
    }
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.name != '';
  }
}