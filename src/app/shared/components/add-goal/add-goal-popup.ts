import { Component, Inject, input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-add-income-category-popup',
  imports: [FormsModule, NgIf],
  templateUrl: './add-goal-popup.html',
  styleUrl: './add-goal-popup.css'
})
export class addGoalPopup {
  addClicked: boolean = false;
  model = {
    goal: 0
  };
  errorMessage: string = "";

  constructor(private dialogRef: MatDialogRef<addGoalPopup>, private dash: DashboardService) {}

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
      await this.dash.addGoal(this.model.goal);
      f.reset();
      this.errorMessage = "";
      this.animateAdd();
      this.dialogRef.close();
    } catch(err) {
      this.errorMessage = "This category already exist on expense";
    }
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.goal > 0;
  }
}