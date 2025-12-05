import { Component, Inject, input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-profile-popup',
  imports: [FormsModule],
  templateUrl: './add-income-popup.html',
  styleUrl: './add-income-popup.css'
})
export class EditProfilePopup {
  saveClicked: boolean = false;

  constructor(private dialogRef: MatDialogRef<EditProfilePopup>) {}

  animateSave() {
    this.saveClicked = true;
    setTimeout(() => this.saveClicked = false, 2000);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
